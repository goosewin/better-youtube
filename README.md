# Better YouTube

A cross-browser extension to hide YouTube Shorts and extend playback speed controls.

## Table of Contents

- [Features](#features)
- [Browser Support](#browser-support)
- [Installation](#installation)
  - [Chrome Web Store](#chrome-web-store)
  - [Firefox Add-ons](#firefox-add-ons)
  - [Manual Installation](#manual-installation)
- [Usage](#usage)
- [Development](#development)
- [Building](#building)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Hide YouTube Shorts** across the entire site (homepage, subscriptions, search results)
- **Hide unwanted sections:** Explore, More from YouTube, Breaking News, Playables, Movies, and Home topic tabs
- **Extended playback speed controls** (0.1x to 5x) with a custom UI
- **All features are toggleable** via the extension popup
- **Cross-browser support** for Chrome and Firefox

## Browser Support

| Browser | Status | Installation |
|---------|--------|--------------|
| Chrome | ✅ Supported | [Chrome Web Store](#chrome-web-store) or [Manual](#manual-installation) |
| Firefox | ✅ Supported | [Firefox Add-ons](#firefox-add-ons) or [Manual](#manual-installation) |
| Edge | ✅ Supported | Use Chrome build |
| Safari | ❌ Not supported | - |

## Installation

### Chrome Web Store

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/better-youtube/nllhjoojnmeecenjlehclocedimdalao):

1. Click the link above
2. Click "Add to Chrome"
3. Pin the extension for easy access

### Firefox Add-ons

Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/better_youtube/):

1. Click the link above
2. Click "Add to Firefox"
3. Allow the extension to run on YouTube

### Manual Installation

For development or testing the latest version:

#### Chrome / Edge

1. Clone or download this repository:
   ```bash
   git clone https://github.com/goosewin/better-youtube.git
   cd better-youtube
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Open Chrome and navigate to `chrome://extensions/`

4. Enable "Developer mode" (toggle in top-right corner)

5. Click "Load unpacked" and select the `dist/chrome` folder

6. The extension icon should appear in your toolbar

#### Firefox

1. Clone or download this repository (same as above)

2. Build the extension:
   ```bash
   npm run build
   ```

3. Open Firefox and navigate to `about:debugging`

4. Click "This Firefox" (or "This Nightly" etc.)

5. Click "Load Temporary Add-on..."

6. Navigate to the `dist/firefox` folder and select `manifest.json`

7. The extension will be loaded temporarily (will persist until browser restart)

**For permanent installation in Firefox:**
- Build the package: `npm run build:firefox`
- Install the generated `dist/better-youtube-firefox.zip` file

## Usage

1. Navigate to [YouTube](https://www.youtube.com)
2. Click the Better YouTube extension icon in your browser toolbar
3. Use the toggles to control which features are enabled:
   - **Shorts filter** - Hide all Shorts content
   - **Hide Explore** - Remove the Explore section from sidebar
   - **Hide More from YouTube** - Remove "More from YouTube" sections
   - **Hide Breaking News** - Remove Breaking News sections
   - **Hide Playables** - Remove YouTube Playables sections
   - **Hide Movies** - Remove Movies sections
   - **Hide Home topic tabs** - Remove topic filter tabs on homepage
   - **Playback speed controls** - Add 0.1x-5x speed slider to video player

4. Playback speed controls appear in the video player when enabled

## Development

### Prerequisites

- Node.js 16+ and npm
- Chrome or Firefox browser

### Setup

```bash
# Clone the repository
git clone https://github.com/goosewin/better-youtube.git
cd better-youtube

# Install dependencies
npm install
```

### Running Tests

Tests use [Playwright](https://playwright.dev/) to verify functionality on both Chrome and Firefox.

**Important:** Build the extension first before running tests:
```bash
npm run build
```

**Run all tests (both browsers):**
```bash
npm test
```

**Run tests for specific browser:**
```bash
# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox
```

**Run specific test:**
```bash
# Chrome tests
npm run test:ext-9:chrome   # Homepage Shorts hiding
npm run test:ext-10:chrome  # Search and subscriptions
npm run test:ext-11:chrome  # Toggle functionality

# Firefox tests
npm run test:ext-9:firefox   # Homepage Shorts hiding
npm run test:ext-10:firefox  # Search and subscriptions
npm run test:ext-11:firefox  # Toggle functionality
```

**Test descriptions:**
- **ext-9**: Verifies Shorts are hidden on YouTube homepage
- **ext-10**: Verifies Shorts are hidden in search results and subscriptions feed
- **ext-11**: Verifies toggle functionality works and settings persist

### Project Structure

```
better-youtube/
├── manifest.json           # Source manifest (Chrome format)
├── content-script.js       # Main content script for YouTube
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── browser-polyfill.js    # Cross-browser API compatibility
├── build.cjs              # Build script for both browsers
├── dist/                  # Build output (generated)
│   ├── chrome/           # Chrome-ready extension
│   └── firefox/          # Firefox-ready extension
├── icons/                 # Extension icons
└── tests/                 # Integration tests
```

## Building

### Build for Both Browsers

```bash
npm run build
```

This creates:
- `dist/chrome/` - Ready to load in Chrome/Edge
- `dist/firefox/` - Ready to load in Firefox

### Build and Package for Distribution

**Chrome:**
```bash
npm run build:chrome
```
Creates `dist/better-youtube-chrome.zip` for Chrome Web Store submission.

**Firefox:**
```bash
npm run build:firefox
```
Creates `dist/better-youtube-firefox.zip` for Firefox Add-ons submission.

### Cross-Browser Compatibility

This extension uses:
- **Manifest V3** - Supported by both Chrome and Firefox
- **webextension-polyfill** - Provides consistent `browser.*` API across browsers
- **Build script** - Generates browser-specific manifests automatically

Key differences handled by the build:
- Chrome uses `host_permissions` for URL patterns
- Firefox includes hosts in `permissions` array
- Firefox requires `browser_specific_settings.gecko.id`

## Troubleshooting

### Extension not working

1. Refresh the YouTube page after installing
2. Check that the extension has permission to run on youtube.com
3. Try disabling and re-enabling the extension

### "This content isn't available" error

If you use an adblocker, videos might fail to load with "This content isn't available, try again later." 

**Solutions:**
- Reload the page
- Temporarily disable your adblocker on YouTube
- Whitelist YouTube in your adblocker

### Firefox: Extension disappears after restart

When loading as a "Temporary Add-on", the extension only lasts until Firefox restarts. For permanent installation:

1. Build the package: `npm run build:firefox`
2. Submit to [Firefox Add-ons](https://addons.mozilla.org/developers/addon/submit/) or
3. Use `about:addons` → "Install from File" (requires signed extension)

### Speed controls not appearing

1. Ensure "Playback speed controls" is enabled in the popup
2. Refresh the YouTube page
3. Start playing a video (controls appear on the player)

### Settings not persisting

The extension uses browser sync storage. Check that:
- You're signed into your browser
- Sync is enabled for extensions/add-ons

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clear, focused commits
4. **Test** your changes in both Chrome and Firefox
5. **Update** documentation if needed
6. **Submit a pull request**

### Reporting Issues

When reporting bugs, please include:
- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## License

MIT License

Copyright (c) 2024 Dan Goosewin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**Website:** [goosewin.com](https://goosewin.com)  
**Contact:** dan@goosewin.com  
**Repository:** [github.com/goosewin/better-youtube](https://github.com/goosewin/better-youtube)
