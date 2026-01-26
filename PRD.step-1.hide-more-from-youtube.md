## Overview

Add a persistent, optional toggle in the extension popup to hide "More from YouTube" sections across YouTube pages, targeting users who want cleaner recommendations without breaking page functionality or increasing permissions.

## Problem Statement

- Users want to remove "More from YouTube" sections but have no control today.
- Existing extension only targets Shorts, so there is no UI or storage for this separate preference.

## Solution

Extend the content script to detect and hide "More from YouTube" sections when a new stored toggle is enabled, and add a second toggle in the popup to control the behavior. Persist the preference in storage and listen for changes to update the page in real time.

---

## Functional Requirements

### FR-1: Core Feature

When the "Hide More from YouTube" toggle is enabled, the content script hides relevant "More from YouTube" sections on YouTube pages and continues to apply the rule on dynamic updates.

### FR-2: Secondary Feature

A new toggle appears in the popup UI to control the feature, persists via `chrome.storage.sync`, and updates the content script immediately on change.

---

## Non-Functional Requirements

### NFR-1: Performance

- DOM updates are batched similarly to the existing observer flow, avoiding repeated synchronous scans.

### NFR-2: Reliability

- If storage is unavailable, default to enabled behavior consistent with current extension patterns.

---

## Implementation Tasks

### Task BYT-1

- **ID** BYT-1
- **Context Bundle** `content-script.js`
- **DoD** Add selectors and enable/disable logic to hide and reveal "More from YouTube" sections based on a new storage key and live storage updates.
- **Checklist**
  * Selectors are centralized alongside existing ones and used in hide/reveal routines.
  * Storage change listener updates the new behavior without reload.
- **Dependencies** None
- [x] BYT-1 Implement content script support for hiding "More from YouTube"

### Task BYT-2

- **ID** BYT-2
- **Context Bundle** `popup.html`
- **DoD** Add a second toggle row and label in the popup UI for the new feature, matching existing design.
- **Checklist**
  * Toggle has a unique input id for script access.
  * Label text reflects "More from YouTube" behavior.
- **Dependencies** BYT-1
- [ ] BYT-2 Add popup toggle for "More from YouTube"

### Task BYT-3

- **ID** BYT-3
- **Context Bundle** `popup.js`
- **DoD** Implement storage sync load/save for the new toggle and keep it in sync with storage changes.
- **Checklist**
  * New storage key is read with a default and updates the UI.
  * Change handler persists the toggle state to storage.
- **Dependencies** BYT-2
- [ ] BYT-3 Wire popup toggle to storage

---

## Success Criteria

- Users can toggle hiding of "More from YouTube" sections from the popup and the choice persists across sessions.
- Toggling updates the page without reload and does not affect Shorts behavior.
- No additional permissions are introduced.

---

## Sources

- https://nodejs.org/docs/latest/api/
- https://docs.npmjs.com/
