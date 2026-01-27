# Better YouTube

## Table of contents

- [Why](#why)
- [What it does](#what-it-does)
- [Install](#install)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why

I hate Shorts and want YouTube to feel like long-form YouTube again. This
extension hides the sections I never use and makes playback speed control
actually useful.

## What it does

- Hides Shorts across the site
- Hides Explore, More from YouTube, Breaking News, Movies, and Home topic tabs
- Adds extended playback speed controls (0.1x to 5x)
- All features are toggleable in the popup

## Install

1. Download or clone this repo to your computer.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on Developer mode (top right).
4. Click "Load unpacked" and select the `better-youtube` folder.
5. Pin the extension so the toggle menu is easy to reach.

## Usage

1. Open YouTube.
2. Click the Better YouTube extension icon.
3. Toggle what you want to hide.
4. Playback speed controls appear in the player when enabled.

## Troubleshooting

- If you use an adblocker, videos might fail to load with "This content isn't
  available, try again later." Reload the page or disable adblock.

## Development

```bash
npm install
```

Run the integration tests:

```bash
npm run test:ext-9
npm run test:ext-10
node tests/ext-11.integration.test.mjs
```

## Contributing

Issues and pull requests are welcome. Keep changes focused and include any
relevant test updates.

## License

MIT (c) Dan Goosewin
