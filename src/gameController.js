"use strict";

import { DIALOG_EVENTS, UI_EVENTS } from "./helper/events.js";
import { shuffleArray, createHash } from "./helper/util.js";

export class GameController {
  #state;
  #uiService;
  #saveTemplateDialog;
  #loadTemplateDialog;

  #splitSymbols = [" ", ",", "-"];

  constructor({ state, saveTemplateDialog, loadTemplateDialog, uiService }) {
    this.#state = state;
    this.#saveTemplateDialog = saveTemplateDialog;
    this.#loadTemplateDialog = loadTemplateDialog;
    this.#uiService = uiService;
    this.#uiService.init();
  }

  updateGameScore(score) {
    if (isNaN(score)) return;
    this.#state.gameScore = score;
    this.#uiService.updateScore(score);
  }

  switchDisabledAttr(elements, value = true) {
    elements.forEach((el) => (el.disabled = value));
  }

  resetGame() {
    this.#state.selectedWords.length = 0;
    this.#state.isGameStarted = false;
    this.#state.checkWordPosition = false;
    this.#state.chainLength = this.#state.minimumChainLength;
    this.#state.selectedWords.length = 0;
    this.#state.selectedTileId = 0;
    this.#state.splitSymbol = " ";
    this.updateGameScore(0);
    this.#state.chainedTiles.clear();
    this.#state.wordChains.clear();
    this.#state.indexToWord.clear();
    this.#uiService.resetGame();
  }

  setChainLength(chainLength) {
    this.#state.chainLength = chainLength;
  }

  onSetLengthClick(value) {
    const { minimumChainLength } = this.#state;
    const newChainLength = parseInt(value, 10);
    if (isNaN(newChainLength) || newChainLength < minimumChainLength) return;
    this.resetGame();
    this.setChainLength(newChainLength);
    this.#uiService.fillChainLengthInput(newChainLength);
  }

  onChainDelete(hash) {
    this.#state.wordChains.delete(hash);
  }

  setChainSplitSymbol(value) {
    switch (value) {
      case "0":
        this.#state.splitSymbol = " ";
        break;
      case "1":
        this.#state.splitSymbol = ",";
        break;
      case "2":
        this.#state.splitSymbol = "-";
        break;
      default:
        this.#state.splitSymbol = " ";
    }
  }

  onChainSplitSymbolSelect(value) {
    this.resetGame();
    this.setChainSplitSymbol(value);
  }

  createChainHash(chain) {
    if (chain) {
      const { chainLength } = this.#state;
      const { splitSymbol, wordChains } = this.#state;
      const words = chain.trim().split(splitSymbol);
      if (words.length === chainLength) {
        const hash = createHash(words);
        if (wordChains.has(hash)) return 0;
        wordChains.set(hash, chain.trim());
        return hash;
      }
    }
  }

  addChain(chain) {
    const hash = this.createChainHash(chain);
    if (hash) {
      this.#uiService.addChain(chain, hash);
      return true;
    }
    return false;
  }

  addChainHandler(chains) {
    const { chainsSeparateSymbol } = this.#state;
    const addedChains = [];
    const notAddedChains = [];
    for (let i = 0; i < chains.length; i++) {
      const isChainAdded = this.addChain(chains[i]);
      if (isChainAdded) {
        addedChains.push(chains[i]);
      } else {
        notAddedChains.push(chains[i]);
      }
    }

    for (let i = 0; i < notAddedChains.length; i++) {
      const trimmedChain = notAddedChains[i].trim();
      notAddedChains[i] = `${trimmedChain}${chainsSeparateSymbol}`;
    }
    return notAddedChains.join(" ").slice(0, -1);
  }

  onAddChainButtonClick(chain) {
    const { isGameStarted, chainsSeparateSymbol, wordChains } = this.#state;
    if (isGameStarted) return;
    const prevWordChainsSize = wordChains.size;
    if (chain.includes(chainsSeparateSymbol)) {
      const chains = chain.split(chainsSeparateSymbol);
      const notAddedChains = this.addChainHandler(chains);
      this.#uiService.fillChainInput(notAddedChains);
    } else {
      const notAddedChains = this.addChainHandler([chain]);
      this.#uiService.fillChainInput(notAddedChains);
    }
    const canStartGame = prevWordChainsSize === 0 && wordChains.size > 0;
    if (canStartGame) this.#uiService.setGameReadyToStart();
  }

  getWordPositions() {
    const { splitSymbol, wordChains } = this.#state;
    const elementsCount = wordChains.size;
    const iterator = wordChains.values();
    const words = [];
    for (let i = 0; i < elementsCount; i++) {
      let splittedChain = iterator.next().value.split(splitSymbol);
      words.push(...splittedChain);
    }
    const shuffledWords = shuffleArray(words);
    return shuffledWords;
  }

  isWordSelected() {
    const {
      selectedWords: sw,
      selectedTileId: tileId,
      selectedWord: word,
    } = this.#state;
    for (let i = 0; i < sw.length; i++) {
      if (sw[i].word === word && sw[i].tileId == tileId) return true;
    }
    return false;
  }

  openTile(tileId, word) {
    return new Promise((resolve) => {
      this.#uiService.openTile(tileId, word, resolve);
    });
  }

  closeTiles() {
    const promises = this.#state.selectedWords.map((wd) => {
      return new Promise((resolve) => {
        this.#uiService.closeTile(wd.tileId, resolve);
      });
    });
    return Promise.all(promises);
  }

  addWordForCalculation() {
    const { selectedWords, selectedTileId, selectedWord } = this.#state;
    const wordData = {
      word: selectedWord,
      tileId: selectedTileId,
    };
    selectedWords.push(wordData);
  }

  calculateWords() {
    const { selectedWords } = this.#state;
    let hash = 0;
    for (let w of selectedWords) {
      hash += w.word.split("").reduce((acc, curr) => {
        const code = curr.charCodeAt(0);
        return acc + code;
      }, 0);
    }
    return hash;
  }

  checkSelectedWords() {
    const { selectedWords, splitSymbol, checkWordPosition, wordChains } =
      this.#state;
    const hash = this.calculateWords();
    const chain = wordChains.get(hash);
    if (chain) {
      const words = chain.split(splitSymbol);
      for (let i = 0; i < words.length; i++) {
        if (checkWordPosition && words[i] !== selectedWords[i].word) {
          return false;
        } else if (!words.includes(selectedWords[i].word)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  async onTileClick(tileId) {
    const { selectedWords, indexToWord, chainLength, gameScore } = this.#state;
    this.#state.selectedTileId = tileId;
    this.#state.selectedWord = indexToWord.get(tileId);
    // skip click if tile is already chained
    if (this.#state.chainedTiles.has(tileId)) return;
    // if (tile.classList.contains("word-container--chained")) return;

    const isWordSel = this.isWordSelected();
    // close word if user click on the filled chain
    if (isWordSel && selectedWords.length === chainLength) {
      await this.closeTiles();
      selectedWords.length = 0;
      return;
    } else if (!isWordSel) {
      // open tile and add word for calculation
      // or close already opened tiles before
      if (
        selectedWords.length !== chainLength &&
        selectedWords.length < chainLength
      ) {
        await this.openTile(tileId, this.#state.selectedWord);
        this.addWordForCalculation();
      } else {
        await this.closeTiles();
        selectedWords.length = 0;
        this.addWordForCalculation();
        await this.openTile(tileId, this.#state.selectedWord);
      }
      // calculate chain
      if (selectedWords.length === chainLength) {
        const isSelectedRight = this.checkSelectedWords();
        this.updateGameScore(gameScore + 1);
        if (isSelectedRight) {
          for (let w of selectedWords) {
            this.#state.chainedTiles.add(w.tileId);
            this.#uiService.markTileChained(w.tileId);
          }
          selectedWords.length = 0;
        }
      }
    }
  }

  onTileCreated(tileInfo) {
    const { indexToWord } = this.#state;
    indexToWord.set(tileInfo.tileId, tileInfo.value);
  }

  onPlayButtonClick() {
    const wordPositions = this.getWordPositions();
    const maxTileHeight = this.#uiService.createTiles(wordPositions);
    this.#uiService.setTilesSize(maxTileHeight);
    this.#uiService.clearChainPreview();
    this.#uiService.startGame();
  }

  toggleWordOrderImportant(isImportant) {
    let { checkWordPosition } = this.#state;
    if (isImportant !== checkWordPosition) {
      this.#state.checkWordPosition = isImportant;
      this.#uiService.setWordOrderImportant(String(isImportant));
    }
  }

  onDeleteTemplateClick(index) {
    this.#state.templates[index].isDeleted = true;
    this.#loadTemplateDialog.deleteTemplate(index);
  }

  checkTemplatesToDelete() {
    const { templates } = this.#state;
    const filteredTemplates = templates.filter((t) => !t.isDeleted);
    if (filteredTemplates.length === this.#state.templates) return;
    this.#state.templates = filteredTemplates;
    localStorage.setItem("templates", JSON.stringify(this.#state.templates));
  }

  onChooseTemplateButtonClick() {
    this.#loadTemplateDialog.showDialog(this.#state.templates);
  }

  closeTemplatesDialogHandler() {
    this.checkTemplatesToDelete();
    this.closeDialog(this.#saveTemplateDialog);
  }

  onLoadTemplateClick(index) {
    this.loadTemplate(index);
    this.onAddChainButtonClick(this.#state.templates[index].wordChains);
    this.closeTemplatesDialogHandler();
  }

  loadTemplate(index) {
    const { templates } = this.#state;
    this.#state.checkWordPosition = templates[index].checkWordPosition;
    this.#state.chainLength = templates[index].chainLength;
    this.#state.splitSymbol = templates[index].splitSymbol;
    this.#uiService.setWordOrderImportant(
      String(this.#state.checkWordPosition)
    );
    const symbolValue = String(
      this.#splitSymbols.indexOf(this.#state.splitSymbol)
    );
    this.#uiService.setChainSplitSymbol(symbolValue);
    this.#uiService.fillChainLengthInput(this.#state.chainLength);
  }

  storeTemplate(name) {
    const {
      wordChains,
      checkWordPosition,
      chainLength,
      chainsSeparateSymbol,
      splitSymbol,
    } = this.#state;
    const chains = new Array(wordChains.size);
    const values = wordChains.values();
    for (let i = 0; i < wordChains.size; i++) {
      chains[i] = values.next().value;
    }
    const template = {
      name,
      checkWordPosition,
      chainLength,
      wordChains: chains.join(chainsSeparateSymbol),
      isDeleted: false,
      splitSymbol,
    };

    const templates = JSON.parse(localStorage.getItem("templates")) || [];
    templates.push(template);
    this.#state.templates = templates;
    localStorage.setItem("templates", JSON.stringify(templates));
  }

  storeTemplateHandler(name) {
    this.storeTemplate(name);
    this.closeDialog(this.#saveTemplateDialog);
  }

  closeDialog(dialog) {
    dialog.closeDialog();
  }

  onSaveTemplateButtonClick() {
    this.#saveTemplateDialog.showSaveTemplate();
  }

  init() {
    this.#uiService.addEventListener(UI_EVENTS.setChainLength, (event) =>
      this.onSetLengthClick(event.detail.value)
    );
    this.#uiService.addEventListener(UI_EVENTS.setChainLength, (event) =>
      this.onSetLengthClick(event.detail.value)
    );
    this.#uiService.addEventListener(UI_EVENTS.addChain, (event) =>
      this.onAddChainButtonClick(event.detail.value)
    );
    this.#uiService.addEventListener(UI_EVENTS.createdTile, (event) =>
      this.onTileCreated(event.detail)
    );
    this.#uiService.addEventListener(UI_EVENTS.playButtonClick, () => {
      this.onPlayButtonClick();
    });

    this.#uiService.addEventListener(UI_EVENTS.resetButtonClick, () =>
      this.resetGame()
    );
    this.#uiService.addEventListener(
      UI_EVENTS.toggleOrderImportant,
      (event) => {
        this.toggleWordOrderImportant(event.detail.value);
      }
    );
    this.#uiService.addEventListener(UI_EVENTS.onTileClick, (event) =>
      this.onTileClick(event.detail.tileId)
    );
    this.#uiService.addEventListener(UI_EVENTS.deleteChain, (event) =>
      this.onChainDelete(event.detail.hash)
    );
    this.#uiService.addEventListener(UI_EVENTS.saveTemplateButtonClick, () =>
      this.onSaveTemplateButtonClick()
    );
    this.#uiService.addEventListener(UI_EVENTS.chooseTemplateButtonClick, () =>
      this.onChooseTemplateButtonClick()
    );
    this.#uiService.addEventListener(
      UI_EVENTS.chainSplitSymbolSelect,
      (event) => this.onChainSplitSymbolSelect(event.detail.value)
    );
    this.#saveTemplateDialog.addEventListener(
      DIALOG_EVENTS.closeDialogAndSave,
      (event) => this.storeTemplateHandler(event.detail.name)
    );
    this.#saveTemplateDialog.addEventListener(
      DIALOG_EVENTS.closeDialogAndCancel,
      () => this.closeDialog(this.#saveTemplateDialog)
    );
    this.#loadTemplateDialog.addEventListener(
      DIALOG_EVENTS.loadTemplate,
      (event) => this.onLoadTemplateClick(event.detail.index)
    );
    this.#loadTemplateDialog.addEventListener(
      DIALOG_EVENTS.deleteTemplate,
      (event) => {
        this.onDeleteTemplateClick(event.detail.index);
      }
    );
    this.#loadTemplateDialog.addEventListener(
      DIALOG_EVENTS.closeDialogAndCancel,
      () => this.closeDialog(this.#loadTemplateDialog)
    );
    this.#loadTemplateDialog.addEventListener(
      DIALOG_EVENTS.closeDialogAndSave,
      () => this.closeTemplatesDialogHandler()
    );
  }
}
