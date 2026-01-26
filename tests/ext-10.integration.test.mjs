import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const EXTENSION_ROOT = process.cwd();
const USER_DATA_DIR = path.join(EXTENSION_ROOT, ".tmp-playwright-profile-ext-10");

const shouldIgnoreConsoleError = (text) =>
  text.includes("Failed to load resource") && text.includes("403");

const resetUserDataDir = () => {
  fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
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

    await activePage.goto("https://www.youtube.com/results?search_query=music", {
      waitUntil: "domcontentloaded",
    });
    await activePage.waitForTimeout(6000);

    const searchResults = await activePage.evaluate(evaluateShortsHiding, [
      "search",
    ]);
    assertNoVisibleShorts(searchResults, "search results");

    await scrollForMoreResults(activePage);
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
