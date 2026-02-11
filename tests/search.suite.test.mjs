import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const PROJECT_ROOT = process.cwd();
const DIST_CHROME = path.join(PROJECT_ROOT, "dist/chrome");
const DIST_FIREFOX = path.join(PROJECT_ROOT, "dist/firefox");

const readFile = (filePath) => fs.readFileSync(filePath, "utf8");

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertFileExists = (filePath) => {
  assert(fs.existsSync(filePath), `Expected file to exist: ${filePath}`);
};

const run = () => {
  // 1) Build dist/chrome + dist/firefox
  execFileSync(process.execPath, [path.join(PROJECT_ROOT, "build.cjs")], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });

  // 2) Firefox/Chrome packaging smoke checks (ensures the fix is present in dist outputs)
  const chromeContentScript = path.join(DIST_CHROME, "content-script.js");
  const firefoxContentScript = path.join(DIST_FIREFOX, "content-script.js");
  const firefoxManifest = path.join(DIST_FIREFOX, "manifest.json");

  assertFileExists(chromeContentScript);
  assertFileExists(firefoxContentScript);
  assertFileExists(firefoxManifest);

  const forbiddenSelector = 'ytd-item-section-renderer:has(a[href^="/shorts/"])';
  const chromeText = readFile(chromeContentScript);
  const firefoxText = readFile(firefoxContentScript);

  assert(
    !chromeText.includes(forbiddenSelector),
    `Forbidden selector present in dist/chrome content script: ${forbiddenSelector}`
  );
  assert(
    !firefoxText.includes(forbiddenSelector),
    `Forbidden selector present in dist/firefox content script: ${forbiddenSelector}`
  );

  // 3) Runtime check in Chromium against the built extension.
  execFileSync(
    process.execPath,
    [path.join(PROJECT_ROOT, "tests/ext-10.integration.test.mjs")],
    {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        EXTENSION_PATH: DIST_CHROME,
      },
    }
  );
};

try {
  run();
} catch (error) {
  console.error(error?.message || error);
  process.exitCode = 1;
}

