## Overview

Better YouTube is a Chrome extension that hides Shorts across youtube.com. The goal is to investigate intermittent YouTube load errors that appear when the extension is enabled and add a safe fallback or user guidance without adding new permissions. Intended users are people who use the extension to declutter YouTube and need reliable page loads.

## Problem Statement

- Users sometimes see a YouTube load error when the extension is enabled.
- The extension currently hides elements aggressively on mutation, which may interact poorly with YouTube error states or initial page hydration.
- There is no user-facing guidance or quick recovery path when YouTube errors appear.

## Solution

Add error-aware guardrails in the content script to pause or back off when YouTube shows a load error, and surface clear guidance in the popup to help users recover without adding permissions. Keep behavior opt-in via the existing toggle and storage key.

---

## Functional Requirements

### FR-1: Error-Aware Shorts Hiding

When a YouTube load error page is detected, the extension stops hiding Shorts and disables mutation observation until the page recovers, preventing further interference.

### FR-2: User Guidance and Recovery

The popup surfaces a brief, actionable recovery message and allows the user to disable the filter to restore normal YouTube behavior, using the existing toggle and storage key.

---

## Non-Functional Requirements

### NFR-1: Performance

- The error detection checks should be lightweight and run at most once per mutation cycle.

### NFR-2: Reliability

- The extension should not throw or block YouTube rendering if selectors are invalid or missing.

---

## Implementation Tasks

### Task PRD-1

- **ID** PRD-1
- **Context Bundle** `content-script.js`
- **DoD** Detect YouTube load error state and suspend hiding/observer when present, resuming when cleared, without new permissions.
- **Checklist**
  * Error detection is based on DOM signals in `content-script.js`.
  * Observer and hiding are disabled on error state and restored on recovery.
- **Dependencies** None
- [x] PRD-1 Add error-state guardrails in content script

### Task PRD-2

- **ID** PRD-2
- **Context Bundle** `popup.html`, `popup.js`
- **DoD** Add a brief guidance message in the popup that explains how to recover from YouTube load errors using the existing toggle.
- **Checklist**
  * Popup includes a short, clear recovery hint.
  * Guidance does not add permissions or require new APIs.
- **Dependencies** PRD-1
- [ ] PRD-2 Add popup guidance for load error recovery

### Task PRD-3

- **ID** PRD-3
- **Context Bundle** `popup.js`, `content-script.js`
- **DoD** Ensure the toggle accurately reflects enabled state and that disabling the filter reliably stops all DOM mutations.
- **Checklist**
  * Toggle state sync remains consistent with storage key.
  * Disabling stops observer and reveals hidden elements.
- **Dependencies** None
- [ ] PRD-3 Validate toggle behavior during error recovery

---

## Success Criteria

- YouTube load errors no longer persist when the extension is enabled.
- Users can recover by toggling the filter without reinstalling or disabling the extension.
- No new permissions are added.

---

## Sources

- https://support.google.com/youtube/answer/3037019
