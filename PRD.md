## Overview

Better YouTube is a Chrome extension that removes and hides YouTube Shorts from the YouTube interface. The extension targets users who prefer long-form content and find Shorts disruptive to their viewing experience. By eliminating Shorts from the homepage, navigation, search results, and subscriptions feed, users regain a focused, traditional YouTube browsing experience.

## Problem Statement

- YouTube Shorts occupy significant screen real estate on the homepage, search results, and subscription feeds, diverting attention from long-form content.
- Users seeking educational, documentary, or in-depth video content find Shorts intrusive and algorithmically promoted.
- No native YouTube option exists to disable or hide Shorts entirely.
- Existing solutions are often bloated, outdated, or request excessive permissions.

## Solution

A lightweight Manifest V3 Chrome extension that uses content scripts to detect and hide Shorts-related DOM elements across all YouTube pages. The extension operates automatically upon installation with no required configuration, though users may toggle the feature via a simple popup interface.

---

## Functional Requirements

### FR-1: Hide Shorts from Homepage

The extension detects and hides the Shorts shelf and any Shorts video cards displayed on the YouTube homepage (youtube.com). This includes the horizontal Shorts carousel and any standalone Shorts entries mixed into the recommended feed.

### FR-2: Hide Shorts from Navigation

The extension removes or hides the "Shorts" link from the YouTube sidebar navigation menu, preventing users from accidentally navigating to the Shorts section.

### FR-3: Hide Shorts from Search Results

When users search on YouTube, any Shorts results interspersed with regular video results are hidden. The Shorts shelf within search results is also removed.

### FR-4: Hide Shorts from Subscriptions Feed

The extension filters out Shorts from the subscriptions feed, ensuring only traditional videos from subscribed channels appear.

### FR-5: Toggle Extension On/Off

Users can click the extension icon in the Chrome toolbar to open a popup with a simple toggle switch. When disabled, Shorts reappear; when enabled, Shorts are hidden. The preference persists across browser sessions using Chrome storage.

### FR-6: Handle Dynamic Content Loading

YouTube uses dynamic content loading (infinite scroll, SPA navigation). The extension must observe DOM mutations and apply hiding rules to newly loaded Shorts content without requiring page refresh.

---

## Non-Functional Requirements

### NFR-1: Performance

- DOM manipulation must not introduce visible layout shifts or jank.
- MutationObserver callbacks must complete within 50ms to avoid blocking the main thread.
- The extension must not increase YouTube page load time by more than 100ms.

### NFR-2: Reliability

- The extension must handle YouTube UI updates gracefully; if selectors fail, the extension should not crash or produce console errors.
- The toggle state must persist reliably across browser restarts using chrome.storage.sync.

### NFR-3: Privacy

- The extension must not collect, transmit, or store any user data beyond the toggle preference.
- The extension must request only the minimum required permissions (activeTab, storage, host permission for youtube.com).

### NFR-4: Maintainability

- CSS selectors and DOM queries must be documented and centralized for easy updates when YouTube changes its markup.
- Code must follow a modular structure separating concerns (selectors, observers, storage, popup).

---

## Implementation Tasks

### Task EXT-1

- **ID** EXT-1
- **Context Bundle** None (fresh repository)
- **DoD** A valid manifest.json file exists at the project root with Manifest V3 configuration, correct permissions, content script declaration for YouTube, and popup action defined.
- **Checklist**
  * manifest_version is set to 3.
  * name, description, and version fields are populated.
  * permissions array includes "storage".
  * host_permissions includes "https://www.youtube.com/*".
  * content_scripts array specifies matches for YouTube and references the content script file.
  * action field defines default_popup and default_icon.
- **Dependencies** None
- [x] EXT-1 Create manifest.json with Manifest V3 configuration

### Task EXT-2

- **ID** EXT-2
- **Context Bundle** None (fresh repository)
- **DoD** A content script file exists that defines CSS selectors targeting Shorts elements and exports or exposes them for use by the hiding logic.
- **Checklist**
  * Selectors target the Shorts shelf on the homepage.
  * Selectors target Shorts navigation link in the sidebar.
  * Selectors target Shorts in search results.
  * Selectors target Shorts in the subscriptions feed.
  * Selectors are organized in a documented object or module.
- **Dependencies** EXT-1
- [x] EXT-2 Define CSS selectors for all Shorts-related DOM elements

### Task EXT-3

- **ID** EXT-3
- **Context Bundle** None (fresh repository)
- **DoD** The content script contains a function that queries and hides all Shorts elements matching the defined selectors by setting display:none or removing them from the DOM.
- **Checklist**
  * Function accepts a root element parameter for targeted hiding.
  * Function iterates through all selector patterns.
  * Hidden elements do not reappear until page reload or toggle change.
  * No console errors when selectors match zero elements.
- **Dependencies** EXT-2
- [x] EXT-3 Implement Shorts hiding logic in content script

### Task EXT-4

- **ID** EXT-4
- **Context Bundle** None (fresh repository)
- **DoD** A MutationObserver is configured in the content script to detect new Shorts elements added to the DOM and apply the hiding logic automatically.
- **Checklist**
  * Observer watches document.body with childList and subtree options.
  * Observer callback invokes the hiding function on mutation batches.
  * Observer is disconnected when the extension is disabled.
  * Performance remains acceptable with high mutation rates.
- **Dependencies** EXT-3
- [x] EXT-4 Implement MutationObserver for dynamic content handling

### Task EXT-5

- **ID** EXT-5
- **Context Bundle** None (fresh repository)
- **DoD** The content script reads the enabled/disabled state from chrome.storage.sync on load and only applies hiding logic when enabled.
- **Checklist**
  * Default state is enabled if no stored value exists.
  * Storage read is asynchronous and non-blocking.
  * Content script listens for storage changes and reacts in real-time.
- **Dependencies** EXT-3
- [x] EXT-5 Integrate chrome.storage for persisting toggle state

### Task EXT-6

- **ID** EXT-6
- **Context Bundle** None (fresh repository)
- **DoD** An HTML popup file exists with a toggle switch UI element and basic styling.
- **Checklist**
  * Popup contains a labeled toggle/checkbox input.
  * Popup displays extension name or logo.
  * Popup has clean, minimal styling.
  * Popup dimensions are appropriate (max 300px width).
- **Dependencies** EXT-1
- [x] EXT-6 Create popup HTML with toggle switch UI

### Task EXT-7

- **ID** EXT-7
- **Context Bundle** None (fresh repository)
- **DoD** A popup JavaScript file reads the current toggle state from storage on load and updates the toggle UI accordingly.
- **Checklist**
  * Toggle reflects stored enabled/disabled state.
  * Toggle change event updates chrome.storage.sync.
  * Storage update triggers content script to show/hide Shorts.
- **Dependencies** EXT-5, EXT-6
- [x] EXT-7 Implement popup JavaScript for toggle functionality

### Task EXT-8

- **ID** EXT-8
- **Context Bundle** None (fresh repository)
- **DoD** Extension icons exist in required sizes (16x16, 48x48, 128x128) and are referenced correctly in the manifest.
- **Checklist**
  * Icons are PNG format with transparent background.
  * Icons visually represent the extension purpose.
  * Manifest references icons in the action and icons fields.
- **Dependencies** EXT-1
- [x] EXT-8 Create extension icons in required sizes

### Task EXT-9

- **ID** EXT-9
- **Context Bundle** None (fresh repository)
- **DoD** The extension loads successfully in Chrome via "Load unpacked" and hides Shorts on the YouTube homepage.
- **Checklist**
  * No errors in chrome://extensions page.
  * No errors in browser console on YouTube.
  * Shorts shelf is hidden on youtube.com homepage.
  * Navigation Shorts link is hidden.
- **Dependencies** EXT-1, EXT-2, EXT-3, EXT-4, EXT-5
- [ ] EXT-9 Integration test: load extension and verify homepage Shorts hiding

### Task EXT-10

- **ID** EXT-10
- **Context Bundle** None (fresh repository)
- **DoD** The extension correctly hides Shorts in YouTube search results and subscriptions feed.
- **Checklist**
  * Search for any term and verify Shorts results are hidden.
  * Navigate to subscriptions and verify Shorts are hidden.
  * Dynamic loading of additional results maintains hiding.
- **Dependencies** EXT-9
- [ ] EXT-10 Integration test: verify Shorts hiding in search and subscriptions

### Task EXT-11

- **ID** EXT-11
- **Context Bundle** None (fresh repository)
- **DoD** The popup toggle correctly enables and disables Shorts hiding without requiring page reload.
- **Checklist**
  * Disabling toggle causes hidden Shorts to reappear.
  * Enabling toggle hides Shorts again.
  * State persists after closing and reopening popup.
  * State persists after browser restart.
- **Dependencies** EXT-7, EXT-9
- [ ] EXT-11 Integration test: verify popup toggle functionality

---

## Success Criteria

- The extension installs without errors on Chrome 120+.
- Shorts are hidden from the YouTube homepage, navigation, search results, and subscriptions feed within 500ms of page load.
- The popup toggle correctly enables/disables hiding functionality with immediate effect.
- No user data is collected or transmitted.
- The extension uses only the permissions declared in the manifest with no additional permission prompts.
- The extension functions correctly after YouTube SPA navigation without requiring full page reload.

---

## Sources

- https://developer.chrome.com/docs/extensions
- https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
- https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab
- https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events
- https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager
- https://developer.chrome.com/docs/extensions/get-started/tutorial/debug
- https://developer.chrome.com/docs/extensions/develop
- https://developer.chrome.com/docs/extensions/how-to
