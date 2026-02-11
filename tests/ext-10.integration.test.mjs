import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const PROJECT_ROOT = process.cwd();
// Allow running tests against the built extension (dist/chrome) instead of source.
const EXTENSION_ROOT = process.env.EXTENSION_PATH || PROJECT_ROOT;
const USER_DATA_DIR = path.join(PROJECT_ROOT, ".tmp-playwright-profile-ext-10");

const shouldIgnoreConsoleError = (text) =>
  text.includes("Failed to load resource") && text.includes("403");

const resetUserDataDir = () => {
  fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
};

const maybeHandleYouTubeConsent = async (page) => {
  const isConsentUrl = (url) =>
    /(^|\\.)consent\\.youtube\\.com\\b/i.test(url) ||
    /(^|\\.)consent\\.google\\.com\\b/i.test(url);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!isConsentUrl(page.url())) {
      return;
    }

    const buttonNames = [/accept all/i, /i agree/i, /^agree$/i, /^accept$/i];
    let clicked = false;

    // Consent UIs are often embedded; try all frames.
    for (const frame of page.frames()) {
      for (const name of buttonNames) {
        try {
          await frame.getByRole("button", { name }).first().click({
            timeout: 1500,
          });
          clicked = true;
          break;
        } catch (error) {
          // Try the next selector/frame.
        }
      }
      if (clicked) {
        break;
      }
    }

    if (clicked) {
      // Either navigates automatically or updates the DOM.
      try {
        await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
      } catch (error) {
        // Keep looping.
      }
      await page.waitForTimeout(1000);
      continue;
    }

    // If we couldn't click anything, don't spin forever.
    await page.waitForTimeout(1000);
  }
};

const getExtensionId = () =>
  window.BetterYouTubeExtensionId ||
  document.documentElement?.getAttribute("data-better-youtube-extension-id") ||
  null;

const setToggleState = async (popupPage, enabled) => {
  await popupPage.waitForSelector("#shorts-toggle", { state: "attached" });
  await popupPage.evaluate((nextValue) => {
    const toggle = document.querySelector("#shorts-toggle");
    if (!toggle) {
      return;
    }
    if (toggle.checked !== nextValue) {
      toggle.checked = nextValue;
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, enabled);
};

const assertToggleState = async (popupPage, expected) => {
  await popupPage.waitForSelector("#shorts-toggle", { state: "attached" });
  const checked = await popupPage.isChecked("#shorts-toggle");
  if (checked !== expected) {
    throw new Error(
      `Popup toggle expected ${expected ? "enabled" : "disabled"} state but got ${
        checked ? "enabled" : "disabled"
      }.`
    );
  }
};

const evaluateShortsHiding = (groupKeys) => {
  const selectorsAttribute = "data-better-youtube-shorts-selectors";
  const resolveSelectors = () => {
    if (window.BetterYouTubeSelectors) {
      return window.BetterYouTubeSelectors;
    }
    const raw = document.documentElement?.getAttribute(selectorsAttribute);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  };

  const selectorsSource = resolveSelectors();
  if (!selectorsSource) {
    return {
      error: "BetterYouTube selectors are not available on the page.",
    };
  }

  const collectMatches = (selectors) => {
    const matches = [];
    selectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((element) => {
          const hidden =
            element.getAttribute("data-better-youtube-hidden") === "true" ||
            getComputedStyle(element).display === "none";
          matches.push({ selector, hidden });
        });
      } catch (error) {
        return;
      }
    });
    return matches;
  };

  const selectorGroups = groupKeys
    .map((key) => selectorsSource[key])
    .filter(Boolean);
  const selectors = selectorGroups.flatMap((group) => Object.values(group)).flat();

  const matches = collectMatches(selectors);
  const visible = matches.filter((match) => !match.hidden);

  return {
    totalMatches: matches.length,
    visibleMatches: visible.length,
  };
};

const evaluateSubscriptionsSignInPrompt = () => {
  const browse = document.querySelector(
    "ytd-browse[page-subtype='subscriptions']"
  );
  if (!browse) {
    return false;
  }

  const prompt = browse.querySelector(
    "ytd-guide-signin-promo-renderer, ytd-button-renderer a[href^='https://accounts.google.com']"
  );
  if (prompt) {
    return true;
  }

  const text = (browse.textContent || "").toLowerCase();
  return text.includes("sign in");
};

const assertContentScriptIsPresent = async (page) => {
  await page.waitForFunction(
    () => {
      const id =
        window.BetterYouTubeExtensionId ||
        document.documentElement?.getAttribute(
          "data-better-youtube-extension-id"
        );
      const selectors =
        window.BetterYouTubeSelectors ||
        document.documentElement?.getAttribute(
          "data-better-youtube-shorts-selectors"
        );
      return Boolean(id) && Boolean(selectors);
    },
    null,
    { timeout: 60000 }
  );
};

const waitForShortsSettingToBeEnabled = async (page) => {
  await page.waitForFunction(
    () =>
      document.documentElement?.getAttribute(
        "data-better-youtube-shorts-enabled"
      ) === "true",
    null,
    { timeout: 30000 }
  );
};

const waitForSearchResultsToRender = async (page) => {
  await page.waitForFunction(
    () => {
      const isVisible = (element) => {
        if (!element) {
          return false;
        }
        const style = getComputedStyle(element);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        ) {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const searchRoot = document.querySelector(
        "ytd-two-column-search-results-renderer"
      );
      if (!isVisible(searchRoot)) {
        return false;
      }

      const videos = Array.from(
        document.querySelectorAll("ytd-video-renderer")
      ).filter(isVisible);
      return videos.length > 0;
    },
    null,
    { timeout: 15000 }
  );
};

const assertHideShortsIsWorking = async (page) => {
  // Deterministic proof that the extension is enabled and actively hiding Shorts:
  // add synthetic Shorts nodes that match our selectors and wait for them to be hidden.
  await page.evaluate(() => {
    const existing = document.getElementById("better-youtube-test-container");
    if (existing) {
      existing.remove();
    }

    const container = document.createElement("div");
    container.id = "better-youtube-test-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "2147483647";
    container.style.background = "rgba(255, 255, 0, 0.05)";

    const shelf = document.createElement("ytd-reel-shelf-renderer");
    shelf.id = "better-youtube-synthetic-shorts-shelf";
    shelf.textContent = "synthetic shorts shelf";

    const shortsViewModel = document.createElement("ytm-shorts-lockup-view-model-v2");
    shortsViewModel.id = "better-youtube-synthetic-shorts-view-model";
    shortsViewModel.textContent = "synthetic shorts view model";

    const control = document.createElement("div");
    control.id = "better-youtube-synthetic-control";
    control.textContent = "synthetic control";

    container.append(shelf, shortsViewModel, control);
    document.body.appendChild(container);
  });

  // Nudge the extension's SPA hooks; this also clears its internal navigation guard.
  await page.evaluate(() => {
    window.dispatchEvent(new Event("yt-navigate-finish"));
  });

  const waitHidden = async (id) =>
    page.waitForFunction(
      (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) {
          return false;
        }
        return (
          element.getAttribute("data-better-youtube-hidden") === "true" ||
          getComputedStyle(element).display === "none"
        );
      },
      id,
      { timeout: 10000 }
    );

  const didAutoHide = await Promise.all([
    waitHidden("better-youtube-synthetic-shorts-shelf").then(
      () => true,
      () => false
    ),
    waitHidden("better-youtube-synthetic-shorts-view-model").then(
      () => true,
      () => false
    ),
  ]);

  if (!didAutoHide.every(Boolean)) {
    const debug = await page.evaluate(() => {
      let hasSupport = null;
      try {
        const probe = document.createElement("div");
        probe.id = "better-youtube-has-probe";
        const span = document.createElement("span");
        probe.appendChild(span);
        document.body.appendChild(probe);
        hasSupport = document.querySelectorAll(
          "#better-youtube-has-probe:has(span)"
        ).length;
        probe.remove();
      } catch (error) {
        hasSupport = "error";
      }

      const computeHidden = (id) => {
        const element = document.getElementById(id);
        if (!element) {
          return { exists: false, hidden: null };
        }
        const hidden =
          element.getAttribute("data-better-youtube-hidden") === "true" ||
          getComputedStyle(element).display === "none";
        return { exists: true, hidden };
      };

      const shelfState = computeHidden("better-youtube-synthetic-shorts-shelf");
      const viewModelState = computeHidden(
        "better-youtube-synthetic-shorts-view-model"
      );

      return {
        url: location.href,
        observerEnabled:
          document.documentElement?.getAttribute(
            "data-better-youtube-observer-enabled"
          ) || null,
        shortsEnabled:
          document.documentElement?.getAttribute(
            "data-better-youtube-shorts-enabled"
          ) || null,
        hasSupport,
        shelfState,
        viewModelState,
      };
    });

    throw new Error(
      `Synthetic Shorts node was not auto-hidden. debug=${JSON.stringify(debug)}`
    );
  }

  const controlHidden = await page.evaluate(() => {
    const control = document.getElementById("better-youtube-synthetic-control");
    if (!control) {
      return null;
    }
    return (
      control.getAttribute("data-better-youtube-hidden") === "true" ||
      getComputedStyle(control).display === "none"
    );
  });
  if (controlHidden) {
    throw new Error("Synthetic control element was unexpectedly hidden.");
  }
};

const evaluateVisibleNonShortSearchResults = () => {
  const isVisible = (element) => {
    if (!element) {
      return false;
    }
    const style = getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const candidates = Array.from(document.querySelectorAll("ytd-video-renderer"))
    .filter(isVisible)
    .filter((renderer) => {
      const link = renderer.querySelector("a#video-title-link, a#video-title");
      const href = link?.getAttribute("href") || "";
      return href.startsWith("/watch");
    });

  return { visibleNonShortCount: candidates.length };
};

const evaluateSearchShortsCandidates = () => {
  const isVisible = (element) => {
    if (!element) {
      return false;
    }
    const style = getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const root =
    document.querySelector("ytd-two-column-search-results-renderer") || document;

  const shortsViewModels = Array.from(
    root.querySelectorAll(
      "ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2"
    )
  );
  const shortsViewModelsVisible = shortsViewModels.filter(isVisible).length;

  const shortsAnchors = Array.from(root.querySelectorAll('a[href^="/shorts/"]'));
  const shortsAnchorsVisible = shortsAnchors.filter(isVisible).length;

  return {
    shortsViewModelsTotal: shortsViewModels.length,
    shortsViewModelsVisible,
    shortsAnchorsTotal: shortsAnchors.length,
    shortsAnchorsVisible,
  };
};

const assertSearchResultsVisible = (results, contextLabel) => {
  const count = results?.visibleNonShortCount ?? 0;
  if (count <= 0) {
    throw new Error(
      `Expected visible non-Shorts search results in ${contextLabel}, but found ${count}.`
    );
  }
};

const assertSearchShortsHidden = (results, contextLabel) => {
  if (!results) {
    throw new Error(`Missing Shorts candidate evaluation for ${contextLabel}.`);
  }
  const total =
    (results.shortsViewModelsTotal ?? 0) + (results.shortsAnchorsTotal ?? 0);
  if (total <= 0) {
    return false;
  }
  if ((results.shortsViewModelsVisible ?? 0) > 0) {
    throw new Error(
      `Found ${results.shortsViewModelsVisible} visible Shorts view-model elements in ${contextLabel}.`
    );
  }
  if ((results.shortsAnchorsVisible ?? 0) > 0) {
    throw new Error(
      `Found ${results.shortsAnchorsVisible} visible /shorts/ anchors in ${contextLabel}.`
    );
  }
  return true;
};

const scrollForMoreResults = async (page, iterations = 3) => {
  for (let index = 0; index < iterations; index += 1) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2);
    });
    await page.waitForTimeout(2500);
  }
};

const assertNoVisibleShorts = (results, contextLabel) => {
  if (results?.error) {
    throw new Error(results.error);
  }

  if (results.visibleMatches > 0) {
    throw new Error(
      `Found ${results.visibleMatches} visible Shorts elements in ${contextLabel}.`
    );
  }

  if (results.totalMatches === 0) {
    console.warn(
      `No Shorts-related elements matched in ${contextLabel}; check YouTube UI or sign-in state.`
    );
  }
};

const run = async () => {
  resetUserDataDir();

  const consoleErrors = [];
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_ROOT}`,
      `--load-extension=${EXTENSION_ROOT}`,
    ],
  });

  try {
    const [page] = context.pages();
    const activePage = page ?? (await context.newPage());

    activePage.on("console", (message) => {
      if (message.type() !== "error") {
        return;
      }
      const text = message.text();
      if (shouldIgnoreConsoleError(text)) {
        return;
      }
      consoleErrors.push(text);
    });

    activePage.on("pageerror", (error) => {
      consoleErrors.push(String(error));
    });

    await activePage.goto("https://www.youtube.com/results?search_query=mrbeast&hl=en&gl=US", {
      waitUntil: "domcontentloaded",
    });
    await activePage.waitForTimeout(6000);
    await maybeHandleYouTubeConsent(activePage);
    if (!activePage.url().startsWith("https://www.youtube.com/")) {
      await activePage.goto(
        "https://www.youtube.com/results?search_query=mrbeast&hl=en&gl=US",
        { waitUntil: "domcontentloaded" }
      );
      await activePage.waitForTimeout(3000);
    }
    await assertContentScriptIsPresent(activePage);

    const extensionId = await activePage.evaluate(getExtensionId);
    if (!extensionId) {
      throw new Error("Unable to resolve extension ID for popup.");
    }
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });

    // Force a storage change event even if the default is already enabled.
    await setToggleState(popupPage, false);
    await assertToggleState(popupPage, false);
    await setToggleState(popupPage, true);
    await assertToggleState(popupPage, true);
    await popupPage.close();

    await waitForSearchResultsToRender(activePage);
    // Give YouTube's SPA navigation a moment to settle so the extension's
    // navigation guard does not suppress hiding.
    await activePage.waitForTimeout(1000);
    await waitForShortsSettingToBeEnabled(activePage);

    // Proof that the toggle is on and the content script is actually hiding Shorts.
    await assertHideShortsIsWorking(activePage);

    assertSearchResultsVisible(
      await activePage.evaluate(evaluateVisibleNonShortSearchResults),
      "search results initial load"
    );
    {
      const stats = await activePage.evaluate(evaluateSearchShortsCandidates);
      const verified = assertSearchShortsHidden(stats, "search results initial load");
      if (!verified) {
        console.warn(
          "No Shorts candidates detected in initial search results; skipping real-DOM Shorts verification."
        );
      }
    }

    const searchResults = await activePage.evaluate(evaluateShortsHiding, [
      "search",
    ]);
    assertNoVisibleShorts(searchResults, "search results");

    await scrollForMoreResults(activePage);
    assertSearchResultsVisible(
      await activePage.evaluate(evaluateVisibleNonShortSearchResults),
      "search results after scrolling"
    );
    {
      const stats = await activePage.evaluate(evaluateSearchShortsCandidates);
      const verified = assertSearchShortsHidden(stats, "search results after scrolling");
      if (!verified) {
        console.warn(
          "No Shorts candidates detected after scrolling; skipping real-DOM Shorts verification."
        );
      }
    }
    const searchAfterScroll = await activePage.evaluate(evaluateShortsHiding, [
      "search",
    ]);
    assertNoVisibleShorts(searchAfterScroll, "search results after scrolling");

    await activePage.goto("https://www.youtube.com/feed/subscriptions", {
      waitUntil: "domcontentloaded",
    });
    await activePage.waitForTimeout(6000);

    const signInPrompt = await activePage.evaluate(
      evaluateSubscriptionsSignInPrompt
    );
    const subscriptionResults = await activePage.evaluate(evaluateShortsHiding, [
      "subscriptions",
    ]);
    assertNoVisibleShorts(subscriptionResults, "subscriptions feed");

    if (signInPrompt) {
      console.warn(
        "Subscriptions feed requires sign-in; skipping scroll validation for additional results."
      );
    } else {
      await scrollForMoreResults(activePage);
      const subscriptionsAfterScroll = await activePage.evaluate(
        evaluateShortsHiding,
        ["subscriptions"]
      );
      assertNoVisibleShorts(
        subscriptionsAfterScroll,
        "subscriptions feed after scrolling"
      );
    }

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors detected on YouTube: ${consoleErrors.join(" | ")}`
      );
    }
  } finally {
    await context.close();
  }
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
