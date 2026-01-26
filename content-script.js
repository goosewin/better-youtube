"use strict";

// Centralized selectors for Shorts-related UI elements across YouTube pages.
const shortsSelectors = {
  homepage: {
    shelf: [
      "ytd-rich-shelf-renderer[is-shorts]",
      "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
      "ytd-reel-shelf-renderer",
    ],
    items: [
      "ytd-rich-item-renderer:has(a[href^=\"/shorts/\"])",
      "ytd-rich-grid-row:has(a[href^=\"/shorts/\"])",
    ],
  },
  navigation: {
    sidebarLink: [
      "ytd-guide-entry-renderer a[title=\"Shorts\"]",
      "ytd-guide-entry-renderer a[href^=\"/shorts\"]",
      "a[title=\"Shorts\"][href^=\"/shorts\"]",
    ],
  },
  search: {
    shelf: [
      "ytd-reel-shelf-renderer",
      "ytd-shelf-renderer:has(a[href^=\"/shorts/\"])",
    ],
    results: [
      "ytd-video-renderer:has(a[href^=\"/shorts/\"])",
      "ytd-item-section-renderer:has(a[href^=\"/shorts/\"])",
    ],
  },
  subscriptions: {
    items: [
      "ytd-rich-item-renderer:has(a[href^=\"/shorts/\"])",
      "ytd-grid-video-renderer:has(a[href^=\"/shorts/\"])",
      "ytd-reel-item-renderer",
    ],
  },
};

window.BetterYouTubeSelectors = shortsSelectors;

const hideShorts = (root = document) => {
  const selectors = Object.values(shortsSelectors).flatMap((group) =>
    Object.values(group).flat()
  );

  selectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((element) => {
        if (element && element.style.display !== "none") {
          element.style.display = "none";
          element.setAttribute("data-better-youtube-hidden", "true");
        }
      });
    } catch (error) {
      return;
    }
  });
};

const revealShorts = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-hidden");
    });
};

window.BetterYouTubeHideShorts = hideShorts;

let observer = null;
let observerScheduled = false;
let observerEnabled = false;
let domReadyListenerAttached = false;

const scheduleHideShorts = () => {
  if (!observerEnabled || observerScheduled) {
    return;
  }
  observerScheduled = true;
  window.requestAnimationFrame(() => {
    observerScheduled = false;
    hideShorts(document);
  });
};

const handleMutations = (mutations) => {
  if (!observerEnabled || !mutations || mutations.length === 0) {
    return;
  }
  scheduleHideShorts();
};

const startObserver = () => {
  if (observer || !document.body) {
    return;
  }
  observer = new MutationObserver(handleMutations);
  observer.observe(document.body, { childList: true, subtree: true });
};

const stopObserver = () => {
  if (!observer) {
    return;
  }
  observer.disconnect();
  observer = null;
};

const setObserverEnabled = (enabled) => {
  observerEnabled = Boolean(enabled);
  if (observerEnabled) {
    stopObserver();
    if (document.body) {
      startObserver();
    } else if (!domReadyListenerAttached) {
      domReadyListenerAttached = true;
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          domReadyListenerAttached = false;
          if (observerEnabled) {
            startObserver();
            hideShorts(document);
          }
        },
        { once: true }
      );
    }
    hideShorts(document);
    return;
  }
  stopObserver();
  revealShorts(document);
};

const STORAGE_KEY = "betterYouTubeEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const loadEnabledState = () => {
  if (!chrome?.storage?.sync) {
    setObserverEnabled(true);
    return;
  }

  chrome.storage.sync.get({ [STORAGE_KEY]: true }, (result) => {
    const enabled = normalizeEnabledValue(result[STORAGE_KEY]);
    setObserverEnabled(enabled);
  });
};

const handleStorageChanges = (changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) {
    return;
  }
  const nextValue = normalizeEnabledValue(changes[STORAGE_KEY].newValue);
  setObserverEnabled(nextValue);
};

window.BetterYouTubeSetObserverEnabled = setObserverEnabled;

loadEnabledState();
if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
