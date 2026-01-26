import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const EXTENSION_ROOT = process.cwd();
const USER_DATA_DIR = path.join(EXTENSION_ROOT, ".tmp-playwright-profile-ext-9");

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

const evaluateShortsHiding = () => {
  if (!window.BetterYouTubeSelectors) {
    return {
      error: "BetterYouTubeSelectors is not available on the page.",
    };
  }

  const selectorGroups = [
    window.BetterYouTubeSelectors.homepage,
    window.BetterYouTubeSelectors.navigation,
  ];
  const selectors = selectorGroups
    .flatMap((group) => Object.values(group))
    .flat();

  const matches = collectMatches(selectors);
  const visible = matches.filter((match) => !match.hidden);

  return {
    totalMatches: matches.length,
    visibleMatches: visible.length,
  };
};

const run = async () => {
  ensureUserDataDir();

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

    const results = await activePage.evaluate(evaluateShortsHiding);

    if (results?.error) {
      throw new Error(results.error);
    }

    if (results.visibleMatches > 0) {
      throw new Error(
        `Found ${results.visibleMatches} visible Shorts elements on homepage.`
      );
    }

    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors detected on YouTube: ${consoleErrors.join(" | ")}`
      );
    }

    if (results.totalMatches === 0) {
      console.warn(
        "No Shorts-related elements matched; check YouTube UI or logged-out homepage."
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
