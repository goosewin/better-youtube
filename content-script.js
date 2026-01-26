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
