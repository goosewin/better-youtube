## Overview

Better YouTube is a Chrome extension that hides unwanted YouTube UI elements. This update adds a user option to hide the topic tabs row on the YouTube homepage, aimed at users who want a cleaner Home feed. The setting is optional, persistent, and uses existing minimal permissions.

## Problem Statement

- Users find the topic tabs row at the top of the YouTube Home page distracting or redundant.
- The extension currently focuses on hiding Shorts only and does not let users control the Home topic tabs row.

## Solution

Add a second, independent toggle to control hiding the Home topic tabs row. Store the preference in chrome.storage.sync and apply a hide/show rule from the content script on the Home page.

---

## Functional Requirements

### FR-1: Home Topic Tabs Toggle

Provide a user-facing toggle in the popup to hide or show the topic tabs row on the YouTube Home page. The setting must persist across sessions.

### FR-2: Live Application

When the toggle changes, the content script must hide or reveal the topic tabs row without requiring a page reload.

---

## Non-Functional Requirements

### NFR-1: Performance

- UI changes should be applied without blocking the main thread or causing noticeable layout jank.

### NFR-2: Reliability

- If storage is unavailable, default to showing the topic tabs row to avoid unintended hiding.

---

## Implementation Tasks

### Task BT-1

- **ID** BT-1
- **Context Bundle** `content-script.js`
- **DoD** Add selectors and logic to hide or show the Home topic tabs row based on a new storage key and live updates.
- **Checklist**
  * Home topic tabs row is hidden only when the new setting is enabled.
  * Changes apply on initial load and after dynamic content updates.
- **Dependencies** None
- [x] BT-1 Add Home tabs hide logic in content script

### Task BT-2

- **ID** BT-2
- **Context Bundle** `popup.html`
- **DoD** Add a new toggle row for the Home topic tabs setting with clear label text.
- **Checklist**
  * Toggle is visible and aligned with existing UI.
  * Label text clearly indicates it controls Home topic tabs.
- **Dependencies** None
- [ ] BT-2 Add popup toggle for Home tabs

### Task BT-3

- **ID** BT-3
- **Context Bundle** `popup.js`
- **DoD** Persist the new setting in chrome.storage.sync and keep the toggle state in sync with storage updates.
- **Checklist**
  * Toggle initializes to the stored value with a sensible default.
  * Storage change events update the toggle without reload.
- **Dependencies** BT-2
- [ ] BT-3 Wire popup toggle to storage key

---

## Success Criteria

- Users can enable or disable hiding of the Home topic tabs row from the popup.
- The preference persists across browser restarts and syncs via chrome.storage.sync.
- The topic tabs row visibility updates in real time on the Home page.

---

## Sources

- https://nodejs.org/docs/latest/api/
- https://docs.npmjs.com/
