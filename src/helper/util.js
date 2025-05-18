"use strict";

export function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem("templates")) || [];
  } catch {
    return [];
  }
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export function shuffleArray(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    const j = i + Math.floor(Math.random() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createHash(words) {
  let hash = 0;
  for (let w of words) {
    hash += w.split("").reduce((acc, curr) => {
      const code = curr.charCodeAt(0);
      return acc + code;
    }, 0);
  }
  return hash;
}

export function getWordGenus(words) {
  const genus = ["der", "die", "das"];
  for (let i = 0; i < words.length; i++) {
    const index = genus.indexOf(words[i].word);
    if (index !== -1) return index;
  }
  return -1;
}
