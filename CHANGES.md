# Better YouTube Extension - Cross-Browser Support

## Changes Made for Firefox Compatibility

### Version Bump: 0.1.1 → 0.1.2

### Author Information Added
- **Author:** Dan Goosewin
- **Email:** dan@goosewin.com
- **Website:** https://goosewin.com
- **Extension ID:** better-youtube@goosewin.com

### Files Modified

1. **manifest.json** (root)
   - Updated version to 0.1.2
   - Added `author` field
   - Added `homepage_url` field
   - Added `browser_specific_settings.gecko.id` for Firefox
   - Added `browser-polyfill.js` to content scripts

2. **popup.html**
   - Included browser-polyfill.js

3. **popup.js**
   - Added header comment with author info

4. **content-script.js**
   - Added header comment with author info

5. **build.cjs** (new)
   - Created build script for both browsers
   - Generates browser-specific manifests
   - Includes all metadata and version info

6. **browser-polyfill.js** (new)
   - Added webextension-polyfill for cross-browser API compatibility

7. **package.json**
   - Updated version to 0.1.2
   - Added author, homepage, license, repository info
   - Added build scripts for both browsers
   - Added test scripts for both Chrome and Firefox

8. **README.md**
   - Completely rewritten with dual browser instructions
   - Added Firefox installation steps
   - Added build instructions for both browsers
   - Added troubleshooting section
   - Added browser support table
   - Added testing documentation

9. **Test Files** (new)
   - `tests/ext-9.firefox.test.mjs` - Firefox version of ext-9 test
   - `tests/ext-10.firefox.test.mjs` - Firefox version of ext-10 test
   - `tests/ext-11.firefox.test.mjs` - Firefox version of ext-11 test

### Build System

The extension now supports building for both browsers:

```bash
# Build for both browsers
npm run build

# Build and package for Chrome
npm run build:chrome

# Build and package for Firefox
npm run build:firefox
```

### Testing System

Tests now run on both Chrome and Firefox using Playwright:

```bash
# Run all tests (Chrome + Firefox)
npm test

# Run only Chrome tests
npm run test:chrome

# Run only Firefox tests
npm run test:firefox

# Run specific tests
npm run test:ext-9:chrome
npm run test:ext-9:firefox
npm run test:ext-10:chrome
npm run test:ext-10:firefox
npm run test:ext-11:chrome
npm run test:ext-11:firefox
```

### Browser-Specific Differences

**Chrome:**
- Uses `host_permissions` for YouTube URL patterns
- Standard Manifest V3 format
- Extension URLs use `chrome-extension://`

**Firefox:**
- Also uses `host_permissions` for YouTube URL patterns (MV3 format)
- Requires `browser_specific_settings.gecko.id`
- Same extension ID for consistency
- Extension URLs use `moz-extension://`

**Note:** Firefox Manifest V3 uses the same `host_permissions` key as Chrome, unlike MV2 which put hosts in the `permissions` array. The build script now generates correct manifests for both browsers.

### Testing

All tests verify:
- Shorts are hidden on homepage
- Shorts are hidden in search results
- Shorts are hidden in subscriptions feed
- Toggle functionality works correctly
- Settings persist across browser restarts

The browser-polyfill ensures API compatibility across both Chrome and Firefox.

### Distribution

**Chrome Web Store:**
- Use `dist/better-youtube-chrome.zip`
- Submit to https://chrome.google.com/webstore/devconsole

**Firefox Add-ons:**
- Use `dist/better-youtube-firefox.zip`
- Submit to https://addons.mozilla.org/developers/addon/submit/

### Notes

- The source files in the root directory work for both browsers during development
- The build script generates browser-specific packages in `dist/`
- browser-polyfill.js provides consistent `browser.*` API across both browsers
- All storage operations use the polyfill for cross-browser compatibility
- Tests must be run after building (`npm run build`)
