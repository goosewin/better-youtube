## Overview

Add a user-controlled, persistent option to hide the Explore section in the YouTube UI for Better YouTube users who want a cleaner navigation experience without changing permissions or breaking existing Shorts filtering.

## Problem Statement

- Users want to hide the Explore section but have no control today.
- The extension only manages Shorts visibility, so users must manually ignore Explore or rely on ad-hoc page changes.

## Solution

Extend the existing extension settings and content script to add a new toggle that hides or reveals the Explore section. Persist the toggle in sync storage and react to DOM updates without adding permissions.

---

## Functional Requirements

### FR-1: Explore Hide Toggle

Provide a popup toggle that enables or disables hiding the Explore section, persisted across sessions.

### FR-2: Live UI Updates

When the Explore toggle changes, apply or remove the UI hiding behavior without requiring a page reload.

---

## Non-Functional Requirements

### NFR-1: Performance

- Use existing mutation observer patterns to avoid excessive DOM scans.

### NFR-2: Reliability

- Default behavior must not break existing Shorts filtering or other UI elements.

---

## Implementation Tasks

### Task EX-1

- **ID** EX-1
- **Context Bundle** `content-script.js`
- **DoD** Explore section selectors are added and hide/reveal logic integrates with the current observer flow.
- **Checklist**
  * Selector set targets Explore section reliably in navigation.
  * Hide and reveal paths mirror existing Shorts behavior and respect enable state.
- **Dependencies** None
- [x] EX-1 Add Explore selectors and hide/reveal logic in content script

### Task EX-2

- **ID** EX-2
- **Context Bundle** `popup.html`, `popup.js`
- **DoD** Popup includes a new Explore toggle wired to storage with default on behavior.
- **Checklist**
  * Toggle label and input are added to the UI with consistent styling.
  * Popup storage handling reads and writes the Explore state correctly.
- **Dependencies** EX-1
- [ ] EX-2 Add Explore toggle UI and storage wiring in popup

### Task EX-3

- **ID** EX-3
- **Context Bundle** `content-script.js`, `popup.js`
- **DoD** Storage key and change listeners are aligned so Explore updates apply immediately.
- **Checklist**
  * Content script listens to storage changes for the Explore key.
  * Popup uses the same storage key name and default value policy.
- **Dependencies** EX-2
- [ ] EX-3 Align storage key and live update handling for Explore

---

## Success Criteria

- Users can toggle Explore visibility in the popup and the state persists across sessions.
- Explore section hides or reveals within one mutation cycle without page reload.
- No new permissions are added and Shorts filtering remains unchanged.

---

## Sources

- https://nodejs.org/docs/latest/api/
- https://docs.npmjs.com/
