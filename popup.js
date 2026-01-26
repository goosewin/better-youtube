"use strict";

const STORAGE_KEY = "betterYouTubeEnabled";

const normalizeEnabledValue = (value) =>
  value === undefined ? true : Boolean(value);

const getToggle = () => document.getElementById("shorts-toggle");

const setToggleState = (enabled) => {
  const toggle = getToggle();
  if (!toggle) {
    return;
  }
  toggle.checked = Boolean(enabled);
};

const loadToggleState = () => {
  if (!chrome?.storage?.sync) {
    setToggleState(true);
    return;
  }

  chrome.storage.sync.get({ [STORAGE_KEY]: true }, (result) => {
    setToggleState(normalizeEnabledValue(result[STORAGE_KEY]));
  });
};

const handleToggleChange = (event) => {
  if (!chrome?.storage?.sync) {
    return;
  }
  const nextValue = Boolean(event.target.checked);
  chrome.storage.sync.set({ [STORAGE_KEY]: nextValue });
};

const handleStorageChanges = (changes, areaName) => {
  if (areaName !== "sync" || !changes[STORAGE_KEY]) {
    return;
  }
  setToggleState(normalizeEnabledValue(changes[STORAGE_KEY].newValue));
};

document.addEventListener("DOMContentLoaded", () => {
  const toggle = getToggle();
  if (toggle) {
    toggle.addEventListener("change", handleToggleChange);
  }
  loadToggleState();
});

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener(handleStorageChanges);
}
