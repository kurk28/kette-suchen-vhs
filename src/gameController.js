"use strict";

import { DIALOG_EVENTS, CHAIN_EVENTS } from "./events.js";
import { shuffleArray } from "./util.js";

export class GameController {
  #uiElements;
  #state;
  #dialogController;

  constructor(state, ui, dialogController) {
    this.#uiElements = ui;
    this.#state = state;
    this.#dialogController = dialogController;
  }

  updateGameScore(score) {
    if (isNaN(score)) return;
    this.#state.gameScore = score;
    this.#uiElements.gameScoreElem = score;
  }

  switchGameScoreWrapperVisibility(value) {
    const { gameScoreWrapper } = this.#uiElements;
    if (value) {
      gameScoreWrapper.classList.remove("game-score-wrapper--hidden");
    } else {
      gameScoreWrapper.classList.add("game-score-wrapper--hidden");
    }
  }

  switchDisabledAttr(elements, value = true) {
    elements.forEach((el) => (el.disabled = value));
  }

  resetGame() {
    const {
      radioButtons,
      setLengthButton,
      addChainButton,
      chooseTemplateButton,
      playButton,
      saveTemplateButton,
    } = this.#uiElements;
    this.#state.wordChains.clear();
    this.#state.indexToWord.clear();
    this.#state.selectedWords.length = 0;
    this.#state.chainLength = 2;
    this.#uiElements.chainInput.value = "";
    this.#uiElements.chainLengthInput.value = 2;
    this.#uiElements.game.replaceChildren();
    this.#uiElements.chainPreview.replaceChildren();
    this.updateGameScore(0);
    this.switchGameScoreWrapperVisibility(false);
    this.switchChainPreviewVisibility(false);
    this.switchDisabledAttr(
      [radioButtons, setLengthButton, addChainButton, chooseTemplateButton],
      false
    );
    this.switchDisabledAttr([playButton, saveTemplateButton], true);
  }

  setChainLength(chainLength) {
    this.#uiElements.chainLengthInput.value = chainLength;
    this.#state.chainLength = chainLength;
  }

  onSetLengthClick() {
    const { chainLengthInput } = this.#uiElements;
    const newChainLength = parseInt(chainLengthInput.value, 10);
    if (isNaN(newChainLength)) return;
    this.resetGame();
    this.setChainLength(newChainLength);
  }

  switchChainPreviewVisibility(v = false) {
    const { chainPreview } = this.#uiElements;
    if (v) {
      if (chainPreview.classList.contains("chain-preview-wrapper--hidden")) {
        chainPreview.classList.remove("chain-preview-wrapper--hidden");
        chainPreview.classList.add("chain-preview-wrapper--visible");
      }
    } else {
      if (chainPreview.classList.contains("chain-preview-wrapper--visible")) {
        chainPreview.classList.remove("chain-preview-wrapper--visible");
        chainPreview.classList.add("chain-preview-wrapper--hidden");
      }
    }
  }

  checkChainPreviewVisibility() {
    if (this.#uiElements.chainPreview.children.length === 1) {
      this.switchChainPreviewVisibility();
    }
  }

  createCloseIcon() {
    const img = document.createElement("img");
    img.setAttribute("src", "./icons/close.svg");
    img.classList.add("cross-icon");
    img.setAttribute("alt", "Delete chain");
    const deleteChainEvent = new CustomEvent(CHAIN_EVENTS.deleteChain, {
      bubbles: true,
    });
    img.addEventListener(
      "click",
      (event) => {
        event.target.dispatchEvent(deleteChainEvent);
        event.target.parentElement.remove();
      },
      { once: true }
    );

    return img;
  }

  createChainElement(chain) {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const text = document.createTextNode(chain);
    const img = this.createCloseIcon();

    div.classList.add("word-preview");
    span.appendChild(text);
    div.appendChild(span);
    div.appendChild(img);
    return div;
  }

  createChainHash(chain) {
    if (chain) {
      const { chainLength } = this.#state;
      const { splitSymbol, wordChains } = this.#state;
      const words = chain.trim().split(splitSymbol);
      if (words.length === chainLength) {
        let hash = 0;
        for (let w of words) {
          hash += w.split("").reduce((acc, curr) => {
            const code = curr.charCodeAt(0);
            return acc + code;
          }, 0);
        }
        if (wordChains.has(hash)) return 0;
        wordChains.set(hash, chain.trim());
        return hash;
      }
    }
  }

  addChain(chain) {
    const { chainPreview } = this.#uiElements;
    const hash = this.createChainHash(chain);
    if (hash) {
      const chainElement = this.createChainElement(chain);
      chainPreview.appendChild(chainElement);
      return true;
    }
    return false;
  }

  addChainHandler(chains) {
    const { chainsSeparateSymbol } = this.#state;
    const chainsCopy = [...chains];
    for (let i = 0; i < chainsCopy.length; i++) {
      const isChainAdded = this.addChain(chainsCopy[i]);
      if (isChainAdded) {
        chainsCopy[i] = "";
      }
    }

    const notAddedChains = [];
    for (let i = 0; i < chainsCopy.length; i++) {
      if (chainsCopy[i].length > 0) {
        const trimmedChain = chainsCopy[i].trim();
        if (trimmedChain.length > 0) {
          notAddedChains.push(`${trimmedChain}${chainsSeparateSymbol}`);
        }
      }
    }
    return notAddedChains.join(" ").slice(0, -1);
  }

  onAddChainButtonClick() {
    const { isGameStarted, chainsSeparateSymbol } = this.#state;
    const { chainInput, playButton, saveTemplateButton, chainPreview } =
      this.#uiElements;
    if (isGameStarted) return;
    if (chainInput.value.includes(chainsSeparateSymbol)) {
      const chains = chainInput.value.split(chainsSeparateSymbol);
      const notAddedChains = this.addChainHandler(chains);
      chainInput.value = notAddedChains;
    } else {
      const notAddedChains = this.addChainHandler([chainInput.value]);
      chainInput.value = notAddedChains;
    }

    if (
      playButton.disabled &&
      saveTemplateButton.disabled &&
      chainPreview.children.length > 0
    ) {
      this.switchDisabledAttr([playButton, saveTemplateButton], false);
      this.switchChainPreviewVisibility(true);
    }
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

  openTile() {
    const { selectedTile: tile, selectedWord: word } = this.#state;
    return new Promise((resolve) => {
      tile.addEventListener(
        "animationend",
        function (event) {
          if (event.animationName === "rotate-word-container") {
            this.classList.remove("rotate-word-container");
            this.firstChild.innerHTML = word;
            resolve();
          }
        },
        { once: true }
      );
      tile.classList.add("rotate-word-container");
      tile.firstChild.innerHTML = "";
    });
  }

  closeTiles() {
    const promises = this.#state.selectedWords.map((wd) => {
      return new Promise((resolve) => {
        const tileId = wd.tileId;
        const tile = document.querySelector(`[tile-id="${tileId}"]`);
        tile.addEventListener(
          "animationend",
          function (event) {
            if (event.animationName === "rotate-word-container") {
              this.classList.remove("rotate-word-container");
              this.firstChild.innerHTML = tileId;
              resolve();
            }
          },
          { once: true }
        );
        tile.classList.add("rotate-word-container");
        tile.firstChild.innerHTML = "";
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
        const isWordOnHisPlace = checkWordPosition && words[i] === sw[i].word;
        const isChainContainsWord = words.includes(selectedWords[i].word);
        return isWordOnHisPlace || isChainContainsWord;
      }
    }
    return false;
  }

  async onTileClick(tile) {
    const { selectedWords, indexToWord, chainLength, gameScore } = this.#state;
    this.#state.selectedTileId = tile.getAttribute("tile-id");
    this.#state.selectedWord = indexToWord.get(this.#state.selectedTileId);
    this.#state.selectedTile = tile;
    // skip click if tile is already chained
    if (tile.classList.contains("word-container--chained")) return;

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
        await this.openTile();
        this.addWordForCalculation();
      } else {
        await this.closeTiles();
        selectedWords.length = 0;
        this.addWordForCalculation();
        await this.openTile();
      }
      // calculate chain
      if (selectedWords.length === chainLength) {
        const isSelectedRight = this.checkSelectedWords();
        this.updateGameScore(gameScore + 1);
        if (isSelectedRight) {
          for (let w of selectedWords) {
            const tile = document.querySelector(`[tile-id="${w.tileId}"]`);
            tile.classList.remove("word-container--not-chained");
            tile.classList.add("word-container--chained");
          }
          selectedWords.length = 0;
        }
      }
    }
  }

  createTiles(wordPositions) {
    const { indexToWord } = this.#state;
    const { game } = this.#uiElements;
    let maxHeight = 0;
    for (let i = 0; i < wordPositions.length; i++) {
      const wordContainerElem = document.createElement("div");
      wordContainerElem.classList.add("word-container");
      wordContainerElem.classList.add("word-container--not-chained");
      const tileId = i + 1;
      wordContainerElem.setAttribute("tile-id", tileId);
      const wordElem = document.createElement("div");
      wordElem.innerText = wordPositions[i];
      wordContainerElem.appendChild(wordElem);
      wordContainerElem.addEventListener("click", () => {
        this.onTileClick(wordContainerElem);
      });
      game.appendChild(wordContainerElem);

      const height = wordContainerElem.offsetHeight;
      maxHeight = Math.max(maxHeight, height);
      wordElem.innerText = tileId;
      indexToWord.set(String(tileId), wordPositions[i]);
    }
  }

  onPlayButtonClick() {
    const {
      playButton,
      addChainButton,
      setLengthButton,
      chooseTemplateButton,
      saveTemplateButton,
      radioButtons,
      chainPreview,
    } = this.#uiElements;
    const wordPositions = this.getWordPositions();
    this.createTiles(wordPositions);
    chainPreview.innerHTML = "";
    this.switchDisabledAttr([
      playButton,
      addChainButton,
      setLengthButton,
      chooseTemplateButton,
      saveTemplateButton,
      ...radioButtons,
    ]);
    this.switchChainPreviewVisibility(false);
    this.switchGameScoreWrapperVisibility(true);
  }

  switchWordOrderImportance(isImportant) {
    let { checkWordPosition } = this.#state;
    const { radioButtons } = this.#uiElements;
    const selectedValue = isImportant === "true";
    if (selectedValue !== checkWordPosition) {
      this.#state.checkWordPosition = selectedValue;
      for (let button of radioButtons) {
        button.ariaChecked = button.ariaChecked === "false" ? true : false;
      }
    }
  }

  markTemplateToDelete(index) {
    this.#state.templates[index].isDeleted = true;
  }

  checkTemplatesToDelete() {
    const { templates } = this.#state;
    this.#state.templates = templates.filter((t) => !t.isDeleted);
    if (templates.length === this.#state.templates) return;
    localStorage.setItem("template", JSON.stringify(this.#state.templates));
  }

  loadTemplate(index) {
    const { radioButtons, chainLengthInput, chainInput } = this.#uiElements;
    const { templates } = this.#state;
    this.#state.checkWordPosition = templates[index].checkWordPosition;
    this.#state.chainLength = templates[index].chainLength;
    chainLengthInput.value = templates[index].chainLength;
    for (let button of radioButtons) {
      button.ariaChecked =
        button.value === String(templates[index].checkWordPosition)
          ? true
          : false;
    }
    chainInput.value = templates[index].wordChains;
    this.onAddChainButtonClick();
  }

  chooseTemplate() {
    const { templates } = this.#state;
    const { dialog } = this.#uiElements;
    const controller = new AbortController();
    dialog.addEventListener(
      DIALOG_EVENTS.deleteTemplate,
      (event) => this.markTemplateToDelete(event.detail.index),
      { signal: controller.signal }
    );
    dialog.addEventListener(
      DIALOG_EVENTS.loadTemplate,
      (event) => {
        this.resetGame();
        this.loadTemplate(event.detail.index);
      },
      { signal: controller.signal }
    );
    dialog.addEventListener(
      "close",
      () => {
        this.checkTemplatesToDelete();
        controller.abort();
      },
      { signal: controller.signal }
    );
    this.#dialogController.showChooseTemplate(templates);
  }

  saveTemplate(name) {
    const { wordChains, checkWordPosition, chainLength, chainsSeparateSymbol } =
      this.#state;
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
    };

    const templates = JSON.parse(localStorage.getItem("templates")) || [];
    templates.push(template);
    this.#state.templates = templates;
    localStorage.setItem("templates", JSON.stringify(templates));
  }

  onSaveTemplateClick() {
    const { dialog } = this.#uiElements;
    const controller = new AbortController();
    dialog.addEventListener(
      DIALOG_EVENTS.saveTemplate,
      (event) => this.saveTemplate(event.detail.name),
      { signal: controller.signal }
    );

    dialog.addEventListener(
      "close",
      () => {
        controller.abort();
      },
      { signal: controller.signal }
    );
    this.#dialogController.showSaveTemplate();
  }

  init() {
    const {
      setLengthButton,
      chainLengthInput,
      addChainButton,
      chainInput,
      playButton,
      resetButton,
      radioButtons,
      chooseTemplateButton,
      saveTemplateButton,
      chainPreview,
    } = this.#uiElements;

    setLengthButton.addEventListener("click", () => this.onSetLengthClick());
    chainLengthInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.onSetLengthClick();
      }
    });
    addChainButton.addEventListener("click", () =>
      this.onAddChainButtonClick()
    );
    chainInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.onAddChainButtonClick();
      }
    });
    playButton.addEventListener("click", () => {
      this.onPlayButtonClick();
    });
    resetButton.addEventListener("click", () => this.resetGame());
    radioButtons.forEach((button) => {
      button.addEventListener("click", (event) =>
        this.switchWordOrderImportance(event.target.value)
      );
    });
    chooseTemplateButton.addEventListener("click", () => this.chooseTemplate());
    saveTemplateButton.addEventListener("click", () =>
      this.onSaveTemplateClick()
    );
    chainPreview.addEventListener(CHAIN_EVENTS.deleteChain, () =>
      this.checkChainPreviewVisibility()
    );
  }
}
