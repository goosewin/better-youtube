"use strict";

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const EXPLORE_STORAGE_KEY = "betterYouTubeHideExploreEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";
const HOME_TOPIC_TABS_STORAGE_KEY = "betterYouTubeHideHomeTopicTabsEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const getShortsToggle = () => document.getElementById("shorts-toggle");
const getExploreToggle = () => document.getElementById("explore-toggle");
const getMoreFromToggle = () =>
  document.getElementById("more-from-youtube-toggle");
const getHomeTabsToggle = () => document.getElementById("home-tabs-toggle");

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
  const homeTabsToggle = getHomeTabsToggle();
  if (!chrome?.storage?.sync) {
    setToggleState(shortsToggle, true);
    setToggleState(exploreToggle, true);
    setToggleState(moreFromToggle, true);
    setToggleState(homeTabsToggle, false);
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
        homeTabsToggle,
        normalizeEnabledValue(result[HOME_TOPIC_TABS_STORAGE_KEY])
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

const handleHomeTabsToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [HOME_TOPIC_TABS_STORAGE_KEY]: nextValue });
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
  if (changes[HOME_TOPIC_TABS_STORAGE_KEY]) {
    const homeTabsToggle = getHomeTabsToggle();
    setToggleState(
      homeTabsToggle,
      normalizeEnabledValue(changes[HOME_TOPIC_TABS_STORAGE_KEY].newValue)
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
  const homeTabsToggle = getHomeTabsToggle();
  if (homeTabsToggle) {
    homeTabsToggle.addEventListener("change", handleHomeTabsToggleChange);
  }
  loadToggleState();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
