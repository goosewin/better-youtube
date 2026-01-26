## Overview

Build a Better YouTube extension enhancement that adds in-player extended playback speed controls (0.1x to 5x) via injected UI, aimed at viewers who want finer control than the native player offers.

## Problem Statement

- YouTube's native playback speed options are limited in granularity and range.
- Users who need very slow or very fast playback must rely on external tools or cannot achieve desired speeds.

## Solution

Inject a lightweight playback speed control panel into the YouTube player UI using the existing content script, providing a slider plus step buttons that set `video.playbackRate` from 0.1x to 5x and optionally persist the last selected speed.

---

## Functional Requirements

### FR-1: Core Feature

Provide an injected control panel in the YouTube player that includes a slider and step buttons to set playback speed from 0.1x to 5x in 0.1x increments.

### FR-2: Secondary Feature

Persist the user's last selected speed in extension storage and restore it on new video loads within YouTube.

---

## Non-Functional Requirements

### NFR-1: Performance

- UI injection and playback rate updates should occur without noticeable delays on player load.

### NFR-2: Reliability

- Controls must remain functional across SPA navigation and dynamic player reloads.

---

## Implementation Tasks

### Task EXT-1

- **ID** EXT-1
- **Context Bundle** `content-script.js`
- **DoD** Player detection and injection hooks are added to initialize the speed control UI when a video player appears or changes.
- **Checklist**
  * Detect the YouTube player and primary `video` element reliably.
  * Re-inject or reconcile UI on SPA navigation or player refresh.
- **Dependencies** None
- [x] EXT-1 Add player detection and injection lifecycle

### Task EXT-2

- **ID** EXT-2
- **Context Bundle** `content-script.js`
- **DoD** Speed control UI (slider + step buttons) is injected and correctly updates `video.playbackRate` from 0.1x to 5x.
- **Checklist**
  * Slider reflects current playback speed and supports 0.1x steps.
  * Buttons step the speed up or down within bounds.
- **Dependencies** EXT-1
- [x] EXT-2 Implement injected speed controls

### Task EXT-3

- **ID** EXT-3
- **Context Bundle** `content-script.js`
- **DoD** Selected playback speed is saved and restored via extension storage when available.
- **Checklist**
  * Persist speed in `chrome.storage.sync` with a new key.
  * Apply saved speed when a new video loads.
- **Dependencies** EXT-2
- [x] EXT-3 Persist and restore playback speed

### Task EXT-4

- **ID** EXT-4
- **Context Bundle** `popup.html`, `popup.js`
- **DoD** Popup communicates the new capability and optional setting (if needed) without breaking existing Shorts toggle behavior.
- **Checklist**
  * Update copy to mention extended speed controls.
  * Keep existing toggle logic intact.
- **Dependencies** None
- [ ] EXT-4 Update popup messaging for new feature

---

## Success Criteria

- Users can set playback speeds between 0.1x and 5x directly in the player UI.
- Speed selection persists across video changes within YouTube.
- Controls remain available and functional after SPA navigation.

---

## Sources

- https://nodejs.org/docs/latest/api/
- https://docs.npmjs.com/
