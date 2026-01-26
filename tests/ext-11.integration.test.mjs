import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const EXTENSION_ROOT = process.cwd();
const USER_DATA_DIR = path.join(EXTENSION_ROOT, ".tmp-playwright-profile-ext-11");

const ensureUserDataDir = () => {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
};

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

const evaluateShortsVisibility = () => {
  if (!window.BetterYouTubeSelectors) {
    return {
      error: "BetterYouTubeSelectors is not available on the page.",
    };
  }

  const selectors = Object.values(window.BetterYouTubeSelectors)
    .flatMap((group) => Object.values(group))
    .flat();
  const matches = collectMatches(selectors);
  const visibleMatches = matches.filter((match) => !match.hidden).length;
  const hiddenMatches = matches.filter((match) => match.hidden).length;

  return {
    totalMatches: matches.length,
    visibleMatches,
    hiddenMatches,
  };
};

const getExtensionId = () => window.BetterYouTubeExtensionId;

const setToggleState = async (popupPage, enabled) => {
  await popupPage.waitForSelector("#shorts-toggle");
  const currentState = await popupPage.isChecked("#shorts-toggle");
  if (currentState !== enabled) {
    await popupPage.click("#shorts-toggle");
  }
};

const assertToggleState = async (popupPage, expected) => {
  await popupPage.waitForSelector("#shorts-toggle");
  const checked = await popupPage.isChecked("#shorts-toggle");
  if (checked !== expected) {
    throw new Error(
      `Popup toggle expected ${expected ? "enabled" : "disabled"} state but got ${
        checked ? "enabled" : "disabled"
      }.`
    );
  }
};

const waitForVisibilityChange = async (page, previous) => {
  if (!previous || previous.totalMatches === 0) {
    return;
  }
  await page.waitForFunction(
    (baseline) => {
      if (!window.BetterYouTubeSelectors) {
        return false;
      }
      const selectors = Object.values(window.BetterYouTubeSelectors)
        .flatMap((group) => Object.values(group))
        .flat();
      const matches = [];
      selectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((element) => {
            const hidden =
              element.getAttribute("data-better-youtube-hidden") === "true" ||
              getComputedStyle(element).display === "none";
            matches.push({ hidden });
          });
        } catch (error) {
          return;
        }
      });
      const visibleMatches = matches.filter((match) => !match.hidden).length;
      const hiddenMatches = matches.filter((match) => match.hidden).length;
      return (
        visibleMatches !== baseline.visibleMatches ||
        hiddenMatches !== baseline.hiddenMatches
      );
    },
    previous,
    { timeout: 5000 }
  );
};

const assertDisabledState = (before, after) => {
  if (after?.error) {
    throw new Error(after.error);
  }

  if (!before || before.totalMatches === 0 || after.totalMatches === 0) {
    console.warn(
      "No Shorts-related elements matched; skipping disable-state visibility assertion."
    );
    return;
  }

  const becameVisible = after.visibleMatches > before.visibleMatches;
  const hiddenReduced = after.hiddenMatches < before.hiddenMatches;
  if (!becameVisible && !hiddenReduced) {
    throw new Error("Disabling toggle did not reveal any Shorts elements.");
  }
};

const assertEnabledState = (after) => {
  if (after?.error) {
    throw new Error(after.error);
  }

  if (after.totalMatches === 0) {
    console.warn(
      "No Shorts-related elements matched; skipping enabled-state visibility assertion."
    );
    return;
  }

  if (after.visibleMatches > 0) {
    throw new Error(
      `Found ${after.visibleMatches} visible Shorts elements after enabling toggle.`
    );
  }
};

const launchContext = async () => {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_ROOT}`,
      `--load-extension=${EXTENSION_ROOT}`,
    ],
  });
  const [page] = context.pages();
  const activePage = page ?? (await context.newPage());
  return { context, activePage };
};

const run = async () => {
  ensureUserDataDir();

  const consoleErrors = [];
  let context;
  let activePage;

  try {
    ({ context, activePage } = await launchContext());

    activePage.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    activePage.on("pageerror", (error) => {
      consoleErrors.push(String(error));
    });

    await activePage.goto("https://www.youtube.com/", {
      waitUntil: "domcontentloaded",
    });
    await activePage.waitForTimeout(6000);
    await activePage.waitForFunction(() => window.BetterYouTubeExtensionId);

    const extensionId = await activePage.evaluate(getExtensionId);
    if (!extensionId) {
      throw new Error("Unable to resolve extension ID for popup.");
    }

    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    const popupPage = await context.newPage();
    await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded" });

    await setToggleState(popupPage, true);
    await assertToggleState(popupPage, true);

    const initialVisibility = await activePage.evaluate(evaluateShortsVisibility);
    if (initialVisibility?.error) {
      throw new Error(initialVisibility.error);
    }

    await setToggleState(popupPage, false);
    await waitForVisibilityChange(activePage, initialVisibility);
    const disabledVisibility = await activePage.evaluate(
      evaluateShortsVisibility
    );
    assertDisabledState(initialVisibility, disabledVisibility);

    await setToggleState(popupPage, true);
    await waitForVisibilityChange(activePage, disabledVisibility);
    const enabledVisibility = await activePage.evaluate(evaluateShortsVisibility);
    assertEnabledState(enabledVisibility);

    await popupPage.close();
    const reopenedPopup = await context.newPage();
    await reopenedPopup.goto(popupUrl, { waitUntil: "domcontentloaded" });
    await assertToggleState(reopenedPopup, true);
    await reopenedPopup.close();

    await context.close();
    ({ context, activePage } = await launchContext());
    await activePage.goto("https://www.youtube.com/", {
      waitUntil: "domcontentloaded",
    });
    await activePage.waitForTimeout(6000);
    await activePage.waitForFunction(() => window.BetterYouTubeExtensionId);
    const restartExtensionId = await activePage.evaluate(getExtensionId);
    if (!restartExtensionId) {
      throw new Error("Unable to resolve extension ID after restart.");
    }
    const restartPopup = await context.newPage();
    await restartPopup.goto(
      `chrome-extension://${restartExtensionId}/popup.html`,
      { waitUntil: "domcontentloaded" }
    );
    await assertToggleState(restartPopup, true);
    await restartPopup.close();

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors detected on YouTube: ${consoleErrors.join(" | ")}`
      );
    }
  } finally {
    if (context) {
      await context.close();
    }
  }
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
