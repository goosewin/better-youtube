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

const sidebarSectionSelectors = [
  "ytd-guide-section-renderer",
  "ytd-guide-collapsible-section-entry-renderer",
];

const sidebarTitleSelectors = [
  "#guide-section-title",
  "h3#guide-section-title",
  "yt-formatted-string#title",
  "h3#title",
  "span#title",
];

const feedSectionSelectors = [
  "ytd-rich-section-renderer",
  "ytd-item-section-renderer",
  "ytd-shelf-renderer",
  "ytd-rich-shelf-renderer",
];

const feedTitleSelectors = [
  "h2#title",
  "yt-formatted-string#title",
  "span#title",
];

const exploreSelectors = {
  sections: sidebarSectionSelectors,
  titles: sidebarTitleSelectors,
};

const moreFromYouTubeSelectors = {
  sections: [...feedSectionSelectors, ...sidebarSectionSelectors],
  titles: [...feedTitleSelectors, ...sidebarTitleSelectors],
};

const breakingNewsSelectors = {
  sections: feedSectionSelectors,
  titles: feedTitleSelectors,
};

const moviesSelectors = {
  sections: [...feedSectionSelectors, ...sidebarSectionSelectors],
  titles: [...feedTitleSelectors, ...sidebarTitleSelectors],
};

const homeTopicTabsSelectors = {
  homepage: {
    row: [
      "ytd-browse[page-subtype=\"home\"] ytd-feed-filter-chip-bar-renderer",
      "ytd-browse[page-subtype=\"home\"] ytd-feed-filter-chip-bar-renderer ytd-chip-cloud-renderer",
      "ytd-browse[page-subtype=\"home\"] #chips",
      "ytd-browse[page-subtype=\"home\"] #chips-wrapper",
      "ytd-browse[page-subtype=\"home\"] #chips-content",
      "ytd-browse[page-subtype=\"home\"] #chips-header",
      "ytd-browse[page-subtype=\"home\"] #chip-bar",
      "ytd-browse[page-subtype=\"home\"] #chips-bar",
    ],
  },
};

const HOME_TABS_PARENT_IDS = new Set([
  "chips",
  "chips-wrapper",
  "chips-content",
  "chips-header",
  "chip-bar",
  "chips-bar",
]);

const CHIPBAR_CLASS = "with-chipbar";
const CHIPBAR_CLASS_ATTRIBUTE = "data-better-youtube-chipbar-class";

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

window.BetterYouTubeSelectors = shortsSelectors;
window.BetterYouTubeExtensionId = chrome?.runtime?.id ?? null;

const SHORTS_SELECTORS_ATTRIBUTE = "data-better-youtube-shorts-selectors";
const EXTENSION_ID_ATTRIBUTE = "data-better-youtube-extension-id";

const writePageMetadata = () => {
  const root = document.documentElement;
  if (!root) {
    return false;
  }
  try {
    root.setAttribute(
      SHORTS_SELECTORS_ATTRIBUTE,
      JSON.stringify(shortsSelectors)
    );
    root.setAttribute(EXTENSION_ID_ATTRIBUTE, chrome?.runtime?.id ?? "");
    return true;
  } catch (error) {
    return false;
  }
};

if (!writePageMetadata()) {
  document.addEventListener("DOMContentLoaded", writePageMetadata, {
    once: true,
  });
}

const hideShorts = (root = document) => {
  const selectors = Object.values(shortsSelectors).flatMap((group) =>
    Object.values(group).flat()
  );

  selectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((element) => {
        if (
          element &&
          element.style.display !== "none" &&
          !shouldSkipElement(element)
        ) {
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

const findSectionsByTitle = (
  root,
  titles,
  sectionSelectors,
  titleSelectors
) => {
  const normalizedTargets = new Set(
    (Array.isArray(titles) ? titles : [titles])
      .map((title) => normalizeTitleText(title))
      .filter(Boolean)
  );
  if (normalizedTargets.size === 0) {
    return [];
  }
  const sectionSelector = sectionSelectors.join(",");
  const titleSelector = titleSelectors.join(",");
  if (!sectionSelector || !titleSelector) {
    return [];
  }
  const sections = new Set();
  root.querySelectorAll(sectionSelector).forEach((section) => {
    const titleNodes = section.querySelectorAll(titleSelector);
    for (const titleNode of titleNodes) {
      const normalized = normalizeTitleText(titleNode?.textContent ?? "");
      if (normalizedTargets.has(normalized)) {
        sections.add(section);
        break;
      }
    }
  });
  return Array.from(sections);
};

const isElementVisible = (element) => {
  if (!element) {
    return false;
  }
  const style = getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0"
  ) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const shouldSkipElement = (element) => {
  if (!element) {
    return true;
  }
  const active = document.activeElement;
  if (!active) {
    return false;
  }
  return element === active || element.contains(active);
};


const EXPLORE_SECTION_TITLE = "explore";

const findExploreSections = (root = document) =>
  findSectionsByTitle(
    root,
    EXPLORE_SECTION_TITLE,
    exploreSelectors.sections,
    exploreSelectors.titles
  );

const hideExplore = (root = document) => {
  findExploreSections(root).forEach((section) => {
    if (
      section &&
      section.style.display !== "none" &&
      !shouldSkipElement(section)
    ) {
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

const findMoreFromYouTubeSections = (root = document) =>
  findSectionsByTitle(
    root,
    MORE_FROM_YOUTUBE_TITLE,
    moreFromYouTubeSelectors.sections,
    moreFromYouTubeSelectors.titles
  );

const hideMoreFromYouTube = (root = document) => {
  findMoreFromYouTubeSections(root).forEach((section) => {
    if (
      section &&
      section.style.display !== "none" &&
      !shouldSkipElement(section)
    ) {
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

const BREAKING_NEWS_TITLES = ["breaking news"];

const findBreakingNewsSections = (root = document) =>
  findSectionsByTitle(
    root,
    BREAKING_NEWS_TITLES,
    breakingNewsSelectors.sections,
    breakingNewsSelectors.titles
  );

const hideBreakingNews = (root = document) => {
  findBreakingNewsSections(root).forEach((section) => {
    if (
      section &&
      section.style.display !== "none" &&
      !shouldSkipElement(section)
    ) {
      section.style.display = "none";
      section.setAttribute(
        "data-better-youtube-breaking-news-hidden",
        "true"
      );
    }
  });
};

const revealBreakingNews = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-breaking-news-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-breaking-news-hidden");
    });
};

const MOVIES_TITLES = [
  "movies",
  "movies & tv",
  "movies and tv",
  "movies & shows",
  "movies and shows",
];

const MOVIE_BADGE_KEYWORDS = [
  "free with ads",
  "buy or rent",
  "rent",
  "buy",
  "premium",
];

const MOVIE_METADATA_KEYWORDS = [
  "movie",
  "movies & tv",
  "movies and tv",
  "movies & shows",
  "movies and shows",
];

const MOVIE_ITEM_SELECTORS = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
];

const findMoviesSections = (root = document) =>
  findSectionsByTitle(
    root,
    MOVIES_TITLES,
    moviesSelectors.sections,
    moviesSelectors.titles
  );

const elementHasMovieBadge = (element) => {
  if (!element) {
    return false;
  }
  const badges = element.querySelectorAll(
    "ytd-badge-supported-renderer, ytd-metadata-badge-renderer"
  );
  for (const badge of badges) {
    const text = normalizeTitleText(badge.textContent ?? "");
    if (MOVIE_BADGE_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return true;
    }
  }
  const metadata = element.querySelectorAll(
    "#metadata-line span, #metadata-line yt-formatted-string"
  );
  for (const meta of metadata) {
    const text = normalizeTitleText(meta.textContent ?? "");
    if (MOVIE_METADATA_KEYWORDS.some((keyword) => text.includes(keyword))) {
      return true;
    }
  }
  return false;
};

const findMovieItems = (root = document) => {
  const selector = MOVIE_ITEM_SELECTORS.join(",");
  const matches = new Set();
  root.querySelectorAll(selector).forEach((element) => {
    if (elementHasMovieBadge(element)) {
      matches.add(element);
    }
  });
  return Array.from(matches);
};

const hideMovies = (root = document) => {
  const matches = new Set([
    ...findMoviesSections(root),
    ...findMovieItems(root),
  ]);
  matches.forEach((section) => {
    if (
      section &&
      section.style.display !== "none" &&
      !shouldSkipElement(section)
    ) {
      section.style.display = "none";
      section.setAttribute("data-better-youtube-movies-hidden", "true");
    }
  });
};

const revealMovies = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-movies-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.removeAttribute("data-better-youtube-movies-hidden");
    });
};

const hideHomeTopicTabs = (root = document) => {
  if (!root.querySelector('ytd-browse[page-subtype="home"]')) {
    return;
  }
  const selectors = Object.values(homeTopicTabsSelectors).flatMap((group) =>
    Object.values(group).flat()
  );

  const collapseElement = (element) => {
    if (!element) {
      return;
    }
    if (shouldSkipElement(element)) {
      return;
    }
    if (element.id === "frosted-glass") {
      const appRoot = root.querySelector("ytd-app");
      if (appRoot && appRoot.classList.contains(CHIPBAR_CLASS)) {
        appRoot.classList.remove(CHIPBAR_CLASS);
        appRoot.setAttribute(CHIPBAR_CLASS_ATTRIBUTE, "true");
      }
      if (element.classList.contains(CHIPBAR_CLASS)) {
        element.classList.remove(CHIPBAR_CLASS);
        element.setAttribute(CHIPBAR_CLASS_ATTRIBUTE, "true");
      }
    }
    element.style.display = "none";
    element.style.height = "0";
    element.style.minHeight = "0";
    element.style.maxHeight = "0";
    element.style.margin = "0";
    element.style.padding = "0";
    element.style.overflow = "hidden";
    element.setAttribute("data-better-youtube-home-tabs-hidden", "true");
  };

  const collapseParentsIfNeeded = (element) => {
    let current = element?.parentElement;
    let depth = 0;
    while (current && depth < 3) {
      if (HOME_TABS_PARENT_IDS.has(current.id)) {
        collapseElement(current);
      }
      current = current.parentElement;
      depth += 1;
    }
  };

  selectors.forEach((selector) => {
    try {
      root.querySelectorAll(selector).forEach((element) => {
        collapseElement(element);
        collapseParentsIfNeeded(element);
      });
    } catch (error) {
      return;
    }
  });

  const frostedGlass = root.querySelector("#frosted-glass");
  if (frostedGlass) {
    collapseElement(frostedGlass);
  }
};

const revealHomeTopicTabs = (root = document) => {
  root
    .querySelectorAll('[data-better-youtube-home-tabs-hidden="true"]')
    .forEach((element) => {
      if (!element) {
        return;
      }
      element.style.removeProperty("display");
      element.style.removeProperty("height");
      element.style.removeProperty("min-height");
      element.style.removeProperty("max-height");
      element.style.removeProperty("margin");
      element.style.removeProperty("padding");
      element.style.removeProperty("overflow");
      element.removeAttribute("data-better-youtube-home-tabs-hidden");
    });

  const appRoot = root.querySelector("ytd-app");
  if (appRoot?.getAttribute(CHIPBAR_CLASS_ATTRIBUTE) === "true") {
    appRoot.classList.add(CHIPBAR_CLASS);
    appRoot.removeAttribute(CHIPBAR_CLASS_ATTRIBUTE);
  }
  const frostedGlass = root.querySelector("#frosted-glass");
  if (frostedGlass?.getAttribute(CHIPBAR_CLASS_ATTRIBUTE) === "true") {
    frostedGlass.classList.add(CHIPBAR_CLASS);
    frostedGlass.removeAttribute(CHIPBAR_CLASS_ATTRIBUTE);
  }
};

const revealAllHiddenContent = (root = document) => {
  revealShorts(root);
  revealExplore(root);
  revealMoreFromYouTube(root);
  revealBreakingNews(root);
  revealMovies(root);
  revealHomeTopicTabs(root);
};

const isYouTubeErrorState = (root = document) => {
  const selector = errorStateSelectors.join(",");
  try {
    const errorNodes = root.querySelectorAll(selector);
    for (const element of errorNodes) {
      if (isElementVisible(element)) {
        return true;
      }
    }
    const errorRoot = root.querySelector("#error-screen, ytd-error-screen");
    if (!errorRoot || !isElementVisible(errorRoot)) {
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
  if (errorStateActive || navigationActive) {
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
  if (breakingNewsEnabled) {
    hideBreakingNews(root);
  }
  if (moviesEnabled) {
    hideMovies(root);
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
let breakingNewsEnabled = false;
let moviesEnabled = false;
let homeTopicTabsEnabled = false;
let errorStateActive = false;
let errorStatePollTimer = null;
let navigationActive = false;
let playbackSpeedObserver = null;
let playbackSpeedObserverScheduled = false;
let playbackSpeedDomReadyListenerAttached = false;
let lastPlaybackSpeedPlayer = null;
let lastPlaybackSpeedVideo = null;
let lastPlaybackSpeedVideoSrc = null;
let playbackSpeedEnabled = false;

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

const handleNavigationStart = () => {
  navigationActive = true;
};

const handleNavigationFinish = () => {
  navigationActive = false;
  hideEnabledContent(document);
};

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

const PLAYBACK_SPEED_MIN = 0.1;
const PLAYBACK_SPEED_MAX = 5;
const PLAYBACK_SPEED_STEP = 0.1;
const PLAYBACK_SPEED_STYLE_ID = "better-youtube-playback-speed-style";
const PLAYBACK_SPEED_STORAGE_KEY = "betterYouTubePlaybackSpeed";
const PLAYBACK_SPEED_CONTROLS_STORAGE_KEY =
  "betterYouTubePlaybackSpeedControlsEnabled";

const playbackSpeedState = {
  container: null,
  slider: null,
  label: null,
  decrementButton: null,
  incrementButton: null,
  video: null,
  onRateChange: null,
  lastSavedValue: null,
  restoreToken: 0,
};

const clampPlaybackSpeed = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 1;
  }
  return Math.min(PLAYBACK_SPEED_MAX, Math.max(PLAYBACK_SPEED_MIN, numeric));
};

const normalizePlaybackSpeed = (value) =>
  Math.round(value / PLAYBACK_SPEED_STEP) * PLAYBACK_SPEED_STEP;

const formatPlaybackSpeed = (value) => `${value.toFixed(1)}x`;

const persistPlaybackSpeed = (value) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const clamped = clampPlaybackSpeed(value);
  const normalized = normalizePlaybackSpeed(clamped);
  if (playbackSpeedState.lastSavedValue === normalized) {
    return;
  }
  playbackSpeedState.lastSavedValue = normalized;
  chrome.storage.sync.set({ [PLAYBACK_SPEED_STORAGE_KEY]: normalized });
};

const applySavedPlaybackSpeed = (video) => {
  if (!video) {
    return;
  }
  if (!chrome?.storage?.sync) {
    syncPlaybackSpeedFromVideo();
    return;
  }
  const token = (playbackSpeedState.restoreToken += 1);
  chrome.storage.sync.get(
    { [PLAYBACK_SPEED_STORAGE_KEY]: null },
    (result) => {
      if (token !== playbackSpeedState.restoreToken) {
        return;
      }
      if (playbackSpeedState.video !== video) {
        return;
      }
      const saved = result[PLAYBACK_SPEED_STORAGE_KEY];
      if (typeof saved === "number") {
        setPlaybackSpeed(saved);
        return;
      }
      syncPlaybackSpeedFromVideo();
    }
  );
};

const updatePlaybackSpeedUI = (value) => {
  if (!playbackSpeedState.slider || !playbackSpeedState.label) {
    return;
  }
  const clamped = clampPlaybackSpeed(value);
  playbackSpeedState.slider.value = clamped.toFixed(1);
  playbackSpeedState.label.textContent = formatPlaybackSpeed(clamped);
  if (playbackSpeedState.decrementButton) {
    playbackSpeedState.decrementButton.disabled = clamped <= PLAYBACK_SPEED_MIN;
  }
  if (playbackSpeedState.incrementButton) {
    playbackSpeedState.incrementButton.disabled = clamped >= PLAYBACK_SPEED_MAX;
  }
};

const setPlaybackSpeed = (value) => {
  if (!playbackSpeedState.video) {
    return;
  }
  const clamped = clampPlaybackSpeed(value);
  const normalized = normalizePlaybackSpeed(clamped);
  playbackSpeedState.video.playbackRate = normalized;
  updatePlaybackSpeedUI(normalized);
  persistPlaybackSpeed(normalized);
};

const syncPlaybackSpeedFromVideo = () => {
  if (!playbackSpeedState.video) {
    return;
  }
  const clamped = clampPlaybackSpeed(playbackSpeedState.video.playbackRate);
  if (clamped !== playbackSpeedState.video.playbackRate) {
    playbackSpeedState.video.playbackRate = clamped;
  }
  updatePlaybackSpeedUI(clamped);
  persistPlaybackSpeed(clamped);
};

const ensurePlaybackSpeedStyles = () => {
  if (document.getElementById(PLAYBACK_SPEED_STYLE_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = PLAYBACK_SPEED_STYLE_ID;
  style.textContent = `
    .better-youtube-speed-controls {
      display: inline-flex;
      align-items: center;
      align-self: center;
      gap: 6px;
      padding: 0 6px;
      height: 28px;
      margin: 0;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-size: 12px;
      font-family: "YouTube Sans", "Roboto", "Arial", sans-serif;
      pointer-events: auto;
      line-height: 1;
    }

    .better-youtube-speed-button {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: inherit;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      font-size: 14px;
      line-height: 20px;
      cursor: pointer;
      padding: 0;
    }

    .better-youtube-speed-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .better-youtube-speed-slider {
      width: 90px;
      accent-color: #ffef6b;
    }

    .better-youtube-speed-label {
      min-width: 36px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  `;
  document.head?.appendChild(style);
};

const createPlaybackSpeedControls = () => {
  const container = document.createElement("div");
  container.className = "better-youtube-speed-controls";
  container.setAttribute("data-better-youtube-speed-controls", "true");

  const decrementButton = document.createElement("button");
  decrementButton.type = "button";
  decrementButton.className = "better-youtube-speed-button";
  decrementButton.setAttribute("aria-label", "Decrease playback speed");
  decrementButton.textContent = "-";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "better-youtube-speed-slider";
  slider.min = PLAYBACK_SPEED_MIN.toFixed(1);
  slider.max = PLAYBACK_SPEED_MAX.toFixed(1);
  slider.step = PLAYBACK_SPEED_STEP.toFixed(1);
  slider.value = "1.0";
  slider.setAttribute("aria-label", "Playback speed");

  const incrementButton = document.createElement("button");
  incrementButton.type = "button";
  incrementButton.className = "better-youtube-speed-button";
  incrementButton.setAttribute("aria-label", "Increase playback speed");
  incrementButton.textContent = "+";

  const label = document.createElement("span");
  label.className = "better-youtube-speed-label";
  label.textContent = "1.0x";

  container.append(decrementButton, slider, incrementButton, label);

  playbackSpeedState.container = container;
  playbackSpeedState.slider = slider;
  playbackSpeedState.label = label;
  playbackSpeedState.decrementButton = decrementButton;
  playbackSpeedState.incrementButton = incrementButton;

  slider.addEventListener("input", (event) => {
    const targetValue = Number(event.target.value);
    setPlaybackSpeed(targetValue);
  });

  decrementButton.addEventListener("click", () => {
    const current = playbackSpeedState.video
      ? playbackSpeedState.video.playbackRate
      : Number(playbackSpeedState.slider?.value) || 1;
    setPlaybackSpeed(current - PLAYBACK_SPEED_STEP);
  });

  incrementButton.addEventListener("click", () => {
    const current = playbackSpeedState.video
      ? playbackSpeedState.video.playbackRate
      : Number(playbackSpeedState.slider?.value) || 1;
    setPlaybackSpeed(current + PLAYBACK_SPEED_STEP);
  });

  return container;
};

const ensurePlaybackSpeedControls = (player) => {
  ensurePlaybackSpeedStyles();
  let container = player.querySelector("[data-better-youtube-speed-controls]");
  if (!container) {
    container = createPlaybackSpeedControls();
    const target =
      player.querySelector(".ytp-right-controls") ||
      player.querySelector(".ytp-left-controls") ||
      player.querySelector(".ytp-chrome-bottom") ||
      player;
    target.appendChild(container);
  }
  return container;
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
  ensurePlaybackSpeedControls(player);
  if (playbackSpeedState.video !== video) {
    if (playbackSpeedState.video && playbackSpeedState.onRateChange) {
      playbackSpeedState.video.removeEventListener(
        "ratechange",
        playbackSpeedState.onRateChange
      );
    }
    playbackSpeedState.video = video;
    playbackSpeedState.onRateChange = syncPlaybackSpeedFromVideo;
    video.addEventListener("ratechange", playbackSpeedState.onRateChange);
  }
  syncPlaybackSpeedFromVideo();
};

const syncPlaybackSpeedTargets = () => {
  if (!playbackSpeedEnabled) {
    return;
  }
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
  applySavedPlaybackSpeed(video);
};

const schedulePlaybackSpeedSync = () => {
  if (!playbackSpeedEnabled || playbackSpeedObserverScheduled) {
    return;
  }
  playbackSpeedObserverScheduled = true;
  window.requestAnimationFrame(() => {
    playbackSpeedObserverScheduled = false;
    syncPlaybackSpeedTargets();
  });
};

const handlePlaybackSpeedMutations = (mutations) => {
  if (!playbackSpeedEnabled || !mutations || mutations.length === 0) {
    return;
  }
  schedulePlaybackSpeedSync();
};

const startPlaybackSpeedObserver = () => {
  if (!playbackSpeedEnabled || playbackSpeedObserver || !document.body) {
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
  if (!playbackSpeedEnabled) {
    return;
  }
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

const removePlaybackSpeedControls = () => {
  if (playbackSpeedState.video && playbackSpeedState.onRateChange) {
    playbackSpeedState.video.removeEventListener(
      "ratechange",
      playbackSpeedState.onRateChange
    );
  }
  playbackSpeedState.video = null;
  playbackSpeedState.onRateChange = null;
  playbackSpeedState.slider = null;
  playbackSpeedState.label = null;
  playbackSpeedState.decrementButton = null;
  playbackSpeedState.incrementButton = null;
  if (playbackSpeedState.container) {
    playbackSpeedState.container.remove();
  }
  playbackSpeedState.container = null;
};

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const EXPLORE_STORAGE_KEY = "betterYouTubeHideExploreEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";
const BREAKING_NEWS_STORAGE_KEY = "betterYouTubeHideBreakingNewsEnabled";
const MOVIES_STORAGE_KEY = "betterYouTubeHideMoviesEnabled";
const HOME_TOPIC_TABS_STORAGE_KEY = "betterYouTubeHideHomeTopicTabsEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const normalizeEnabledValueWithDefault = (value, defaultValue) =>
  value === undefined ? Boolean(defaultValue) : Boolean(value);

const updateObserverState = () => {
  const shouldEnableObserver =
    !errorStateActive &&
    (shortsEnabled ||
      exploreEnabled ||
      moreFromYouTubeEnabled ||
      breakingNewsEnabled ||
      moviesEnabled ||
      homeTopicTabsEnabled);
  setObserverEnabled(shouldEnableObserver);
};

const setShortsEnabled = (enabled) => {
  shortsEnabled = Boolean(enabled);
  if (!shortsEnabled) {
    revealShorts(document);
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

const setBreakingNewsEnabled = (enabled) => {
  breakingNewsEnabled = Boolean(enabled);
  if (breakingNewsEnabled && !errorStateActive) {
    hideBreakingNews(document);
  } else {
    revealBreakingNews(document);
  }
  updateObserverState();
};

const setMoviesEnabled = (enabled) => {
  moviesEnabled = Boolean(enabled);
  if (moviesEnabled && !errorStateActive) {
    hideMovies(document);
  } else {
    revealMovies(document);
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

const setPlaybackSpeedEnabled = (enabled) => {
  playbackSpeedEnabled = Boolean(enabled);
  if (playbackSpeedEnabled) {
    startPlaybackSpeedLifecycle();
    return;
  }
  stopPlaybackSpeedObserver();
  removePlaybackSpeedControls();
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
    setExploreEnabled(true);
    setMoreFromYouTubeEnabled(true);
    setBreakingNewsEnabled(true);
    setMoviesEnabled(true);
    setHomeTopicTabsEnabled(true);
    setPlaybackSpeedEnabled(true);
    return;
  }

  chrome.storage.sync.get(
    {
      [SHORTS_STORAGE_KEY]: true,
      [EXPLORE_STORAGE_KEY]: true,
      [MORE_FROM_YOUTUBE_STORAGE_KEY]: true,
      [BREAKING_NEWS_STORAGE_KEY]: true,
      [MOVIES_STORAGE_KEY]: true,
      [HOME_TOPIC_TABS_STORAGE_KEY]: true,
      [PLAYBACK_SPEED_CONTROLS_STORAGE_KEY]: true,
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
      const breakingNewsEnabledValue = normalizeEnabledValueWithDefault(
        result[BREAKING_NEWS_STORAGE_KEY],
        false
      );
      const moviesEnabledValue = normalizeEnabledValueWithDefault(
        result[MOVIES_STORAGE_KEY],
        false
      );
      const homeTopicTabsEnabledValue = normalizeEnabledValueWithDefault(
        result[HOME_TOPIC_TABS_STORAGE_KEY],
        true
      );
      const playbackSpeedEnabledValue = normalizeEnabledValueWithDefault(
        result[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY],
        true
      );
      setShortsEnabled(shortsEnabledValue);
      setExploreEnabled(exploreEnabledValue);
      setMoreFromYouTubeEnabled(moreFromEnabledValue);
      setBreakingNewsEnabled(breakingNewsEnabledValue);
      setMoviesEnabled(moviesEnabledValue);
      setHomeTopicTabsEnabled(homeTopicTabsEnabledValue);
      setPlaybackSpeedEnabled(playbackSpeedEnabledValue);
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
  if (changes[BREAKING_NEWS_STORAGE_KEY]) {
    const nextBreakingValue = normalizeEnabledValueWithDefault(
      changes[BREAKING_NEWS_STORAGE_KEY].newValue,
      false
    );
    setBreakingNewsEnabled(nextBreakingValue);
  }
  if (changes[MOVIES_STORAGE_KEY]) {
    const nextMoviesValue = normalizeEnabledValueWithDefault(
      changes[MOVIES_STORAGE_KEY].newValue,
      false
    );
    setMoviesEnabled(nextMoviesValue);
  }
  if (changes[HOME_TOPIC_TABS_STORAGE_KEY]) {
    const nextHomeTabsValue = normalizeEnabledValueWithDefault(
      changes[HOME_TOPIC_TABS_STORAGE_KEY].newValue,
      true
    );
    setHomeTopicTabsEnabled(nextHomeTabsValue);
  }
  if (changes[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY]) {
    const nextPlaybackSpeedValue = normalizeEnabledValueWithDefault(
      changes[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY].newValue,
      true
    );
    setPlaybackSpeedEnabled(nextPlaybackSpeedValue);
  }
};

window.BetterYouTubeSetObserverEnabled = setObserverEnabled;

updateErrorState();
loadEnabledState();
window.addEventListener("yt-navigate-finish", schedulePlaybackSpeedSync);
window.addEventListener("yt-navigate-start", handleNavigationStart);
window.addEventListener("yt-navigate-finish", handleNavigationFinish);
window.addEventListener("yt-page-data-updated", schedulePlaybackSpeedSync);
window.addEventListener("yt-player-updated", schedulePlaybackSpeedSync);
if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
