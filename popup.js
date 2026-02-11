/**
 * Better YouTube - Popup Script
 *
 * Author: Dan Goosewin <dan@goosewin.com>
 * Website: https://goosewin.com
 * Version: 0.1.3
 * License: MIT
 *
 * This script handles the popup UI and syncs toggle states with
 * browser storage (chrome.storage or browser.storage).
 */

"use strict";

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const EXPLORE_STORAGE_KEY = "betterYouTubeHideExploreEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";
const BREAKING_NEWS_STORAGE_KEY = "betterYouTubeHideBreakingNewsEnabled";
const PLAYABLES_STORAGE_KEY = "betterYouTubeHidePlayablesEnabled";
const MOVIES_STORAGE_KEY = "betterYouTubeHideMoviesEnabled";
const HOME_TOPIC_TABS_STORAGE_KEY = "betterYouTubeHideHomeTopicTabsEnabled";
const PLAYBACK_SPEED_CONTROLS_STORAGE_KEY =
  "betterYouTubePlaybackSpeedControlsEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const getShortsToggle = () => document.getElementById("shorts-toggle");
const getExploreToggle = () => document.getElementById("explore-toggle");
const getMoreFromToggle = () =>
  document.getElementById("more-from-youtube-toggle");
const getBreakingNewsToggle = () =>
  document.getElementById("breaking-news-toggle");
const getPlayablesToggle = () => document.getElementById("playables-toggle");
const getMoviesToggle = () => document.getElementById("movies-toggle");
const getHomeTabsToggle = () => document.getElementById("home-tabs-toggle");
const getPlaybackSpeedToggle = () =>
  document.getElementById("playback-speed-toggle");

const setToggleState = (toggle, enabled) => {
  if (!toggle) {
    return;
  }
  toggle.checked = Boolean(enabled);
};

const loadToggleState = () => {
  const shortsToggle = getShortsToggle();
  const exploreToggle = getExploreToggle();
  const moreFromToggle = getMoreFromToggle();
  const breakingNewsToggle = getBreakingNewsToggle();
  const playablesToggle = getPlayablesToggle();
  const moviesToggle = getMoviesToggle();
  const homeTabsToggle = getHomeTabsToggle();
  const playbackSpeedToggle = getPlaybackSpeedToggle();
  if (!chrome?.storage?.sync) {
    setToggleState(shortsToggle, true);
    setToggleState(exploreToggle, true);
    setToggleState(moreFromToggle, true);
    setToggleState(breakingNewsToggle, true);
    setToggleState(playablesToggle, true);
    setToggleState(moviesToggle, true);
    setToggleState(homeTabsToggle, true);
    setToggleState(playbackSpeedToggle, true);
    return;
  }

  chrome.storage.sync.get(
    {
      [SHORTS_STORAGE_KEY]: true,
      [EXPLORE_STORAGE_KEY]: true,
      [MORE_FROM_YOUTUBE_STORAGE_KEY]: true,
      [BREAKING_NEWS_STORAGE_KEY]: true,
      [PLAYABLES_STORAGE_KEY]: true,
      [MOVIES_STORAGE_KEY]: true,
      [HOME_TOPIC_TABS_STORAGE_KEY]: true,
      [PLAYBACK_SPEED_CONTROLS_STORAGE_KEY]: true,
    },
    (result) => {
      setToggleState(
        shortsToggle,
        normalizeEnabledValue(result[SHORTS_STORAGE_KEY])
      );
      setToggleState(
        exploreToggle,
        normalizeEnabledValue(result[EXPLORE_STORAGE_KEY])
      );
      setToggleState(
        moreFromToggle,
        normalizeEnabledValue(result[MORE_FROM_YOUTUBE_STORAGE_KEY])
      );
      setToggleState(
        breakingNewsToggle,
        normalizeEnabledValue(result[BREAKING_NEWS_STORAGE_KEY])
      );
      setToggleState(
        playablesToggle,
        normalizeEnabledValue(result[PLAYABLES_STORAGE_KEY])
      );
      setToggleState(
        moviesToggle,
        normalizeEnabledValue(result[MOVIES_STORAGE_KEY])
      );
      setToggleState(
        homeTabsToggle,
        normalizeEnabledValue(result[HOME_TOPIC_TABS_STORAGE_KEY])
      );
      setToggleState(
        playbackSpeedToggle,
        normalizeEnabledValue(result[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY])
      );
    }
  );
};

const handleShortsToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [SHORTS_STORAGE_KEY]: nextValue });
};

const handleExploreToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [EXPLORE_STORAGE_KEY]: nextValue });
};

const handleMoreFromToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [MORE_FROM_YOUTUBE_STORAGE_KEY]: nextValue });
};

const handleBreakingNewsToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [BREAKING_NEWS_STORAGE_KEY]: nextValue });
};

const handlePlayablesToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [PLAYABLES_STORAGE_KEY]: nextValue });
};

const handleMoviesToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [MOVIES_STORAGE_KEY]: nextValue });
};

const handleHomeTabsToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [HOME_TOPIC_TABS_STORAGE_KEY]: nextValue });
};

const handlePlaybackSpeedToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [PLAYBACK_SPEED_CONTROLS_STORAGE_KEY]: nextValue });
};

const handleStorageChanges = (changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }
  if (changes[SHORTS_STORAGE_KEY]) {
    const shortsToggle = getShortsToggle();
    setToggleState(
      shortsToggle,
      normalizeEnabledValue(changes[SHORTS_STORAGE_KEY].newValue)
    );
  }
  if (changes[EXPLORE_STORAGE_KEY]) {
    const exploreToggle = getExploreToggle();
    setToggleState(
      exploreToggle,
      normalizeEnabledValue(changes[EXPLORE_STORAGE_KEY].newValue)
    );
  }
  if (changes[MORE_FROM_YOUTUBE_STORAGE_KEY]) {
    const moreFromToggle = getMoreFromToggle();
    setToggleState(
      moreFromToggle,
      normalizeEnabledValue(changes[MORE_FROM_YOUTUBE_STORAGE_KEY].newValue)
    );
  }
  if (changes[BREAKING_NEWS_STORAGE_KEY]) {
    const breakingNewsToggle = getBreakingNewsToggle();
    setToggleState(
      breakingNewsToggle,
      normalizeEnabledValue(changes[BREAKING_NEWS_STORAGE_KEY].newValue)
    );
  }
  if (changes[PLAYABLES_STORAGE_KEY]) {
    const playablesToggle = getPlayablesToggle();
    setToggleState(
      playablesToggle,
      normalizeEnabledValue(changes[PLAYABLES_STORAGE_KEY].newValue)
    );
  }
  if (changes[MOVIES_STORAGE_KEY]) {
    const moviesToggle = getMoviesToggle();
    setToggleState(
      moviesToggle,
      normalizeEnabledValue(changes[MOVIES_STORAGE_KEY].newValue)
    );
  }
  if (changes[HOME_TOPIC_TABS_STORAGE_KEY]) {
    const homeTabsToggle = getHomeTabsToggle();
    setToggleState(
      homeTabsToggle,
      normalizeEnabledValue(changes[HOME_TOPIC_TABS_STORAGE_KEY].newValue)
    );
  }
  if (changes[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY]) {
    const playbackSpeedToggle = getPlaybackSpeedToggle();
    setToggleState(
      playbackSpeedToggle,
      normalizeEnabledValue(
        changes[PLAYBACK_SPEED_CONTROLS_STORAGE_KEY].newValue
      )
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const shortsToggle = getShortsToggle();
  if (shortsToggle) {
    shortsToggle.addEventListener("change", handleShortsToggleChange);
  }
  const exploreToggle = getExploreToggle();
  if (exploreToggle) {
    exploreToggle.addEventListener("change", handleExploreToggleChange);
  }
  const moreFromToggle = getMoreFromToggle();
  if (moreFromToggle) {
    moreFromToggle.addEventListener("change", handleMoreFromToggleChange);
  }
  const breakingNewsToggle = getBreakingNewsToggle();
  if (breakingNewsToggle) {
    breakingNewsToggle.addEventListener(
      "change",
      handleBreakingNewsToggleChange
    );
  }
  const playablesToggle = getPlayablesToggle();
  if (playablesToggle) {
    playablesToggle.addEventListener("change", handlePlayablesToggleChange);
  }
  const moviesToggle = getMoviesToggle();
  if (moviesToggle) {
    moviesToggle.addEventListener("change", handleMoviesToggleChange);
  }
  const homeTabsToggle = getHomeTabsToggle();
  if (homeTabsToggle) {
    homeTabsToggle.addEventListener("change", handleHomeTabsToggleChange);
  }
  const playbackSpeedToggle = getPlaybackSpeedToggle();
  if (playbackSpeedToggle) {
    playbackSpeedToggle.addEventListener(
      "change",
      handlePlaybackSpeedToggleChange
    );
  }
  loadToggleState();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
