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

const exploreSelectors = {
  navigation: {
    sections: [
      "ytd-guide-section-renderer",
      "ytd-guide-collapsible-section-entry-renderer",
    ],
    titles: [
      "#guide-section-title",
      "h3#guide-section-title",
      "yt-formatted-string#title",
      "h3#title",
      "span#title",
    ],
  },
};

const moreFromYouTubeSelectors = {
  sections: [
    "ytd-rich-section-renderer",
    "ytd-item-section-renderer",
    "ytd-shelf-renderer",
    "ytd-rich-shelf-renderer",
  ],
  titles: ["h2#title", "span#title", "#title"],
};

window.BetterYouTubeSelectors = {
  shorts: shortsSelectors,
  explore: exploreSelectors,
  moreFromYouTube: moreFromYouTubeSelectors,
};
window.BetterYouTubeExtensionId = chrome?.runtime?.id ?? null;

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

const normalizeTitleText = (value) =>
  value ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";

const EXPLORE_SECTION_TITLE = "explore";

const findExploreSections = (root = document) => {
  const titleSelector = exploreSelectors.navigation.titles.join(",");
  const sectionSelector = exploreSelectors.navigation.sections.join(",");
  const sections = new Set();

  root.querySelectorAll(titleSelector).forEach((title) => {
    const normalized = normalizeTitleText(title?.textContent ?? "");
    if (normalized !== EXPLORE_SECTION_TITLE) {
      return;
    }
    const section = title.closest(sectionSelector);
    if (section) {
      sections.add(section);
    }
  });

  return Array.from(sections);
};

const hideExplore = (root = document) => {
  findExploreSections(root).forEach((section) => {
    if (section && section.style.display !== "none") {
      section.style.display = "none";
      section.setAttribute("data-better-youtube-explore-hidden", "true");
    }
  });
};

const revealExplore = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-explore-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-explore-hidden");
    });
};

const MORE_FROM_YOUTUBE_TITLE = "more from youtube";

const findMoreFromYouTubeSections = (root = document) => {
  const titleSelector = moreFromYouTubeSelectors.titles.join(",");
  const sectionSelector = moreFromYouTubeSelectors.sections.join(",");
  const sections = new Set();

  root.querySelectorAll(titleSelector).forEach((title) => {
    const normalized = normalizeTitleText(title?.textContent ?? "");
    if (normalized !== MORE_FROM_YOUTUBE_TITLE) {
      return;
    }
    const section = title.closest(sectionSelector);
    if (section) {
      sections.add(section);
    }
  });

  return Array.from(sections);
};

const hideMoreFromYouTube = (root = document) => {
  findMoreFromYouTubeSections(root).forEach((section) => {
    if (section && section.style.display !== "none") {
      section.style.display = "none";
      section.setAttribute("data-better-youtube-more-from-hidden", "true");
    }
  });
};

const revealMoreFromYouTube = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-more-from-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-more-from-hidden");
    });
};

const hideEnabledContent = (root = document) => {
  if (shortsEnabled) {
    hideShorts(root);
  }
  if (exploreEnabled) {
    hideExplore(root);
  }
  if (moreFromYouTubeEnabled) {
    hideMoreFromYouTube(root);
  }
};

window.BetterYouTubeHideShorts = hideShorts;

let observer = null;
let observerScheduled = false;
let observerEnabled = false;
let domReadyListenerAttached = false;
let shortsEnabled = false;
let exploreEnabled = false;
let moreFromYouTubeEnabled = false;

const scheduleHideContent = () => {
  if (!observerEnabled || observerScheduled) {
    return;
  }
  observerScheduled = true;
  window.requestAnimationFrame(() => {
    observerScheduled = false;
    hideEnabledContent(document);
  });
};

const handleMutations = (mutations) => {
  if (!observerEnabled || !mutations || mutations.length === 0) {
    return;
  }
  scheduleHideContent();
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
            hideEnabledContent(document);
          }
        },
        { once: true }
      );
    }
    return;
  }
  stopObserver();
};

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const updateObserverState = () => {
  const shouldEnableObserver =
    shortsEnabled || exploreEnabled || moreFromYouTubeEnabled;
  setObserverEnabled(shouldEnableObserver);
};

const setShortsEnabled = (enabled) => {
  shortsEnabled = Boolean(enabled);
  if (shortsEnabled) {
    hideShorts(document);
  } else {
    revealShorts(document);
  }
  updateObserverState();
};

const setMoreFromYouTubeEnabled = (enabled) => {
  moreFromYouTubeEnabled = Boolean(enabled);
  if (moreFromYouTubeEnabled) {
    hideMoreFromYouTube(document);
  } else {
    revealMoreFromYouTube(document);
  }
  updateObserverState();
};

const setExploreEnabled = (enabled) => {
  exploreEnabled = Boolean(enabled);
  if (exploreEnabled) {
    hideExplore(document);
  } else {
    revealExplore(document);
  }
  updateObserverState();
};

const loadEnabledState = () => {
  if (!chrome?.storage?.sync) {
    setShortsEnabled(true);
    setMoreFromYouTubeEnabled(true);
    return;
  }

  chrome.storage.sync.get(
    {
      [SHORTS_STORAGE_KEY]: true,
      [MORE_FROM_YOUTUBE_STORAGE_KEY]: true,
    },
    (result) => {
      const shortsEnabledValue = normalizeEnabledValue(
        result[SHORTS_STORAGE_KEY]
      );
      const moreFromEnabledValue = normalizeEnabledValue(
        result[MORE_FROM_YOUTUBE_STORAGE_KEY]
      );
      setShortsEnabled(shortsEnabledValue);
      setMoreFromYouTubeEnabled(moreFromEnabledValue);
    }
  );
};

const handleStorageChanges = (changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }
  if (changes[SHORTS_STORAGE_KEY]) {
    const nextShortsValue = normalizeEnabledValue(
      changes[SHORTS_STORAGE_KEY].newValue
    );
    setShortsEnabled(nextShortsValue);
  }
  if (changes[MORE_FROM_YOUTUBE_STORAGE_KEY]) {
    const nextMoreFromValue = normalizeEnabledValue(
      changes[MORE_FROM_YOUTUBE_STORAGE_KEY].newValue
    );
    setMoreFromYouTubeEnabled(nextMoreFromValue);
  }
};

window.BetterYouTubeSetObserverEnabled = setObserverEnabled;

loadEnabledState();
if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
