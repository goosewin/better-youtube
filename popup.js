"use strict";

const SHORTS_STORAGE_KEY = "betterYouTubeEnabled";
const MORE_FROM_YOUTUBE_STORAGE_KEY =
  "betterYouTubeHideMoreFromYouTubeEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const getShortsToggle = () => document.getElementById("shorts-toggle");
const getMoreFromToggle = () =>
  document.getElementById("more-from-youtube-toggle");

const setToggleState = (toggle, enabled) => {
  if (!toggle) {
    return;
  }
  toggle.checked = Boolean(enabled);
};

const loadToggleState = () => {
  const shortsToggle = getShortsToggle();
  const moreFromToggle = getMoreFromToggle();
  if (!chrome?.storage?.sync) {
    setToggleState(shortsToggle, true);
    setToggleState(moreFromToggle, true);
    return;
  }

  chrome.storage.sync.get(
    {
      [SHORTS_STORAGE_KEY]: true,
      [MORE_FROM_YOUTUBE_STORAGE_KEY]: true,
    },
    (result) => {
      setToggleState(
        shortsToggle,
        normalizeEnabledValue(result[SHORTS_STORAGE_KEY])
      );
      setToggleState(
        moreFromToggle,
        normalizeEnabledValue(result[MORE_FROM_YOUTUBE_STORAGE_KEY])
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

const handleMoreFromToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [MORE_FROM_YOUTUBE_STORAGE_KEY]: nextValue });
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
  if (changes[MORE_FROM_YOUTUBE_STORAGE_KEY]) {
    const moreFromToggle = getMoreFromToggle();
    setToggleState(
      moreFromToggle,
      normalizeEnabledValue(changes[MORE_FROM_YOUTUBE_STORAGE_KEY].newValue)
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const shortsToggle = getShortsToggle();
  if (shortsToggle) {
    shortsToggle.addEventListener("change", handleShortsToggleChange);
  }
  const moreFromToggle = getMoreFromToggle();
  if (moreFromToggle) {
    moreFromToggle.addEventListener("change", handleMoreFromToggleChange);
  }
  loadToggleState();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
