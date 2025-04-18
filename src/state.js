"use strict";

function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem("templates")) || [];
  } catch {
    return [];
  }
}

export const state = {
  isGameStarted: false,
  checkWordPosition: false,
  chainsSeparateSymbol: ",",
  splitSymbol: " ",
  chainLength: 2,
  gameScore: 0,
  closeTileDelay: 2000,
  wordChains: new Map(),
  indexToWord: new Map(),
  selectedWords: [],
  selectedWord: "",
  selectedTile: null,
  selectedTileId: 0,
  templates: loadTemplates(),
};
