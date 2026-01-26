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

const homeTopicTabsSelectors = {
  homepage: {
    row: [
      "ytd-feed-filter-chip-bar-renderer",
      "ytd-feed-filter-chip-bar-renderer ytd-chip-cloud-renderer",
    ],
  },
};

const errorStateSelectors = [
  "ytd-error-screen",
  "#error-screen",
  "ytd-app[is-error]",
  "ytd-app[error]",
  "ytd-page-manager[error]",
];

const errorStateTextSnippets = [
  "something went wrong",
  "an error occurred",
  "try again later",
];

window.BetterYouTubeSelectors = {
  shorts: shortsSelectors,
  explore: exploreSelectors,
  moreFromYouTube: moreFromYouTubeSelectors,
  homeTopicTabs: homeTopicTabsSelectors,
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

const hideHomeTopicTabs = (root = document) => {
  const selectors = Object.values(homeTopicTabsSelectors).flatMap((group) =>
    Object.values(group).flat()
  );

  selectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((element) => {
        if (element && element.style.display !== "none") {
          element.style.display = "none";
          element.setAttribute("data-better-youtube-home-tabs-hidden", "true");
        }
      });
    } catch (error) {
      return;
    }
  });
};

const revealHomeTopicTabs = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-home-tabs-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-home-tabs-hidden");
    });
};

const revealAllHiddenContent = (root = document) => {
  revealShorts(root);
  revealExplore(root);
  revealMoreFromYouTube(root);
  revealHomeTopicTabs(root);
};

const isYouTubeErrorState = (root = document) => {
  const selector = errorStateSelectors.join(",");
  try {
    if (root.querySelector(selector)) {
      return true;
    }
    const errorRoot = root.querySelector("#error-screen, ytd-error-screen");
    if (!errorRoot) {
      return false;
    }
    const normalized = normalizeTitleText(errorRoot.textContent ?? "");
    return errorStateTextSnippets.some((snippet) =>
      normalized.includes(snippet)
    );
  } catch (error) {
    return false;
  }
};

const hideEnabledContent = (root = document) => {
  if (errorStateActive) {
    return;
  }
  if (shortsEnabled) {
    hideShorts(root);
  }
  if (exploreEnabled) {
    hideExplore(root);
  }
  if (moreFromYouTubeEnabled) {
    hideMoreFromYouTube(root);
  }
  if (homeTopicTabsEnabled) {
    hideHomeTopicTabs(root);
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
let homeTopicTabsEnabled = false;
let errorStateActive = false;
let errorStatePollTimer = null;
let playbackSpeedObserver = null;
let playbackSpeedObserverScheduled = false;
let playbackSpeedDomReadyListenerAttached = false;
let lastPlaybackSpeedPlayer = null;
let lastPlaybackSpeedVideo = null;
let lastPlaybackSpeedVideoSrc = null;

const stopErrorStatePolling = () => {
  if (!errorStatePollTimer) {
    return;
  }
  window.clearInterval(errorStatePollTimer);
  errorStatePollTimer = null;
};

const startErrorStatePolling = () => {
  if (errorStatePollTimer) {
    return;
  }
  errorStatePollTimer = window.setInterval(() => {
    if (!isYouTubeErrorState(document)) {
      setErrorStateActive(false);
    }
  }, 2000);
};

const setErrorStateActive = (nextState) => {
  const nextValue = Boolean(nextState);
  if (nextValue === errorStateActive) {
    return errorStateActive;
  }
  errorStateActive = nextValue;
  if (errorStateActive) {
    setObserverEnabled(false);
    revealAllHiddenContent(document);
    startErrorStatePolling();
    return errorStateActive;
  }
  stopErrorStatePolling();
  updateObserverState();
  hideEnabledContent(document);
  return errorStateActive;
};

const updateErrorState = () => setErrorStateActive(isYouTubeErrorState(document));

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
  if (!mutations || mutations.length === 0) {
    return;
  }
  if (updateErrorState()) {
    return;
  }
  if (!observerEnabled) {
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

const playbackSpeedSelectors = {
  player: ["#movie_player", "ytd-player", "ytd-watch-flexy"],
  video: ["video.html5-main-video", "#movie_player video", "ytd-player video"],
};

const findPlaybackSpeedPlayer = () => {
  const selector = playbackSpeedSelectors.player.join(",");
  return document.querySelector(selector);
};

const findPlaybackSpeedVideo = (player) => {
  const selector = playbackSpeedSelectors.video.join(",");
  if (player) {
    const videoInPlayer = player.querySelector(selector);
    if (videoInPlayer) {
      return videoInPlayer;
    }
  }
  return document.querySelector(selector);
};

const initializePlaybackSpeedControls = (player, video) => {
  if (!player || !video) {
    return;
  }
};

const syncPlaybackSpeedTargets = () => {
  const player = findPlaybackSpeedPlayer();
  const video = findPlaybackSpeedVideo(player);
  if (!player || !video) {
    return;
  }
  const videoSrc = video.currentSrc || video.src || null;
  const playerChanged = player !== lastPlaybackSpeedPlayer;
  const videoChanged =
    video !== lastPlaybackSpeedVideo ||
    (videoSrc && videoSrc !== lastPlaybackSpeedVideoSrc);
  if (!playerChanged && !videoChanged) {
    return;
  }
  lastPlaybackSpeedPlayer = player;
  lastPlaybackSpeedVideo = video;
  lastPlaybackSpeedVideoSrc = videoSrc;
  initializePlaybackSpeedControls(player, video);
};

const schedulePlaybackSpeedSync = () => {
  if (playbackSpeedObserverScheduled) {
    return;
  }
  playbackSpeedObserverScheduled = true;
  window.requestAnimationFrame(() => {
    playbackSpeedObserverScheduled = false;
    syncPlaybackSpeedTargets();
  });
};

const handlePlaybackSpeedMutations = (mutations) => {
  if (!mutations || mutations.length === 0) {
    return;
  }
  schedulePlaybackSpeedSync();
};

const startPlaybackSpeedObserver = () => {
  if (playbackSpeedObserver || !document.body) {
    return;
  }
  playbackSpeedObserver = new MutationObserver(handlePlaybackSpeedMutations);
  playbackSpeedObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const stopPlaybackSpeedObserver = () => {
  if (!playbackSpeedObserver) {
    return;
  }
  playbackSpeedObserver.disconnect();
  playbackSpeedObserver = null;
};

const startPlaybackSpeedLifecycle = () => {
  stopPlaybackSpeedObserver();
  if (document.body) {
    startPlaybackSpeedObserver();
  } else if (!playbackSpeedDomReadyListenerAttached) {
    playbackSpeedDomReadyListenerAttached = true;
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        playbackSpeedDomReadyListenerAttached = false;
        startPlaybackSpeedObserver();
        schedulePlaybackSpeedSync();
      },
      { once: true }
    );
  }
  schedulePlaybackSpeedSync();
};

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const EXPLORE_STORAGE_KEY = "betterYouTubeHideExploreEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";
const HOME_TOPIC_TABS_STORAGE_KEY = "betterYouTubeHideHomeTopicTabsEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const normalizeEnabledValueWithDefault = (value, defaultValue) =>
  value === undefined ? Boolean(defaultValue) : Boolean(value);

const updateObserverState = () => {
  const shouldEnableObserver = !errorStateActive && shortsEnabled;
  setObserverEnabled(shouldEnableObserver);
};

const setShortsEnabled = (enabled) => {
  shortsEnabled = Boolean(enabled);
  if (!shortsEnabled) {
    revealAllHiddenContent(document);
    updateObserverState();
    return;
  }
  if (!errorStateActive) {
    hideEnabledContent(document);
  }
  updateObserverState();
};

const setMoreFromYouTubeEnabled = (enabled) => {
  moreFromYouTubeEnabled = Boolean(enabled);
  if (moreFromYouTubeEnabled && !errorStateActive) {
    hideMoreFromYouTube(document);
  } else {
    revealMoreFromYouTube(document);
  }
  updateObserverState();
};

const setHomeTopicTabsEnabled = (enabled) => {
  homeTopicTabsEnabled = Boolean(enabled);
  if (homeTopicTabsEnabled && !errorStateActive) {
    hideHomeTopicTabs(document);
  } else {
    revealHomeTopicTabs(document);
  }
  updateObserverState();
};

const setExploreEnabled = (enabled) => {
  exploreEnabled = Boolean(enabled);
  if (exploreEnabled && !errorStateActive) {
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
    setHomeTopicTabsEnabled(false);
    return;
  }

  chrome.storage.sync.get(
    {
      [SHORTS_STORAGE_KEY]: true,
      [EXPLORE_STORAGE_KEY]: true,
      [MORE_FROM_YOUTUBE_STORAGE_KEY]: true,
      [HOME_TOPIC_TABS_STORAGE_KEY]: false,
    },
    (result) => {
      const shortsEnabledValue = normalizeEnabledValue(
        result[SHORTS_STORAGE_KEY]
      );
      const exploreEnabledValue = normalizeEnabledValue(
        result[EXPLORE_STORAGE_KEY]
      );
      const moreFromEnabledValue = normalizeEnabledValue(
        result[MORE_FROM_YOUTUBE_STORAGE_KEY]
      );
      const homeTopicTabsEnabledValue = normalizeEnabledValueWithDefault(
        result[HOME_TOPIC_TABS_STORAGE_KEY],
        false
      );
      setShortsEnabled(shortsEnabledValue);
      setExploreEnabled(exploreEnabledValue);
      setMoreFromYouTubeEnabled(moreFromEnabledValue);
      setHomeTopicTabsEnabled(homeTopicTabsEnabledValue);
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
  if (changes[EXPLORE_STORAGE_KEY]) {
    const nextExploreValue = normalizeEnabledValue(
      changes[EXPLORE_STORAGE_KEY].newValue
    );
    setExploreEnabled(nextExploreValue);
  }
  if (changes[MORE_FROM_YOUTUBE_STORAGE_KEY]) {
    const nextMoreFromValue = normalizeEnabledValue(
      changes[MORE_FROM_YOUTUBE_STORAGE_KEY].newValue
    );
    setMoreFromYouTubeEnabled(nextMoreFromValue);
  }
  if (changes[HOME_TOPIC_TABS_STORAGE_KEY]) {
    const nextHomeTabsValue = normalizeEnabledValueWithDefault(
      changes[HOME_TOPIC_TABS_STORAGE_KEY].newValue,
      false
    );
    setHomeTopicTabsEnabled(nextHomeTabsValue);
  }
};

window.BetterYouTubeSetObserverEnabled = setObserverEnabled;

updateErrorState();
loadEnabledState();
startPlaybackSpeedLifecycle();
window.addEventListener("yt-navigate-finish", schedulePlaybackSpeedSync);
window.addEventListener("yt-page-data-updated", schedulePlaybackSpeedSync);
window.addEventListener("yt-player-updated", schedulePlaybackSpeedSync);
if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
