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
  minimumChainLength: 2,
  chainLength: 2,
  gameScore: 0,
  closeTileDelay: 2000,
  wordChains: new Map(),
  indexToWord: new Map(),
  selectedWords: [],
  selectedWord: "",
  selectedTileId: 0,
  templates: loadTemplates(),
  chainedTiles: new Set(),
};
