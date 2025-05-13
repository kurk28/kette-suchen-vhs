"use strict";

import { UI_EVENTS } from "./helper/events.js";

export class UIService extends EventTarget {
  #uiElements;

  constructor(uiElements) {
    super();
    this.#uiElements = uiElements;
  }

  onSetLengthClick() {
    const { chainLengthInput } = this.#uiElements;
    const event = new CustomEvent(UI_EVENTS.setChainLength, {
      detail: { value: chainLengthInput.value },
    });
    this.dispatchEvent(event);
  }

  onAddChainButtonClick(chain) {
    const event = new CustomEvent(UI_EVENTS.addChain, {
      detail: { value: chain },
    });
    this.dispatchEvent(event);
  }

  fillChainInput(text) {
    this.#uiElements.chainInput.value = text;
  }

  setGameReadyToStart() {
    const { playButton, saveTemplateButton } = this.#uiElements;
    this.switchDisabledAttr([playButton, saveTemplateButton], false);
    this.switchChainPreviewVisibility(true);
  }

  clearChainPreview() {
    this.#uiElements.chainPreview.innerHTML = "";
  }

  onPlayButtonClick() {
    const event = new CustomEvent(UI_EVENTS.playButtonClick);
    this.dispatchEvent(event);
  }

  startGame() {
    const {
      playButton,
      addChainButton,
      setLengthButton,
      chooseTemplateButton,
      saveTemplateButton,
      radioButtons,
      chainSplitSelect,
    } = this.#uiElements;
    this.switchDisabledAttr([
      playButton,
      addChainButton,
      setLengthButton,
      chooseTemplateButton,
      saveTemplateButton,
      chainSplitSelect,
      ...radioButtons,
    ]);
    this.switchChainPreviewVisibility(false);
    this.switchGameScoreWrapperVisibility(true);
  }

  createTiles(wordPositions) {
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
      wordContainerElem.addEventListener(
        "click",
        ((tileId) => () => {
          this.onTileClick(tileId);
        })(tileId)
      );
      game.appendChild(wordContainerElem);

      const height = wordContainerElem.offsetHeight;
      maxHeight = Math.max(maxHeight, height);
      wordElem.innerText = tileId;
      const event = new CustomEvent(UI_EVENTS.createdTile, {
        detail: {
          tileId,
          value: wordPositions[i],
        },
      });
      this.dispatchEvent(event);
    }
    return maxHeight;
  }

  setTilesSize(maxHeight) {
    const { game } = this.#uiElements;
    const root = document.querySelector(":root");
    root.style.setProperty("--max-word-container-height", `${maxHeight}px`);
    game.style.setProperty(
      "grid-auto-rows",
      "minmax(var(--max-word-container-width), var(--max-word-container-height))"
    );
  }

  updateScore(score) {
    this.#uiElements.gameScoreElem.textContent = score;
  }

  switchGameScoreWrapperVisibility(isVisible) {
    const { gameScoreWrapper } = this.#uiElements;
    if (isVisible) {
      gameScoreWrapper.classList.remove("game-score-wrapper--hidden");
    } else {
      gameScoreWrapper.classList.add("game-score-wrapper--hidden");
    }
  }

  switchChainPreviewVisibility(isVisible = false) {
    const { chainPreview } = this.#uiElements;
    if (isVisible) {
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

  switchDisabledAttr(elements = [], value = true) {
    elements.forEach((el) => (el.disabled = value));
  }

  resetDisableButton() {
    const { playButton, saveTemplateButton } = this.#uiElements;
    this.switchDisabledAttr([playButton, saveTemplateButton], true);
  }

  fillChainLengthInput(chainLength) {
    this.#uiElements.chainLengthInput.value = chainLength;
  }

  clearGameBoard() {
    this.#uiElements.game.replaceChildren();
  }

  clearChainPreview() {
    this.#uiElements.chainPreview.replaceChildren();
  }

  updateChainInputValue(value) {
    this.#uiElements.chainInput.value = value;
  }

  createCloseIcon() {
    const img = document.createElement("img");
    img.setAttribute("src", "./icons/close.svg");
    img.classList.add("cross-icon");
    img.setAttribute("alt", "Delete chain");
    img.addEventListener(
      "click",
      (event) => {
        event.target.parentElement.remove();
        this.observeChainPreview();
      },
      { once: true }
    );
    return img;
  }

  observeChainPreview() {
    const { chainPreview } = this.#uiElements;
    const event = new CustomEvent(UI_EVENTS.deleteChain, {
      detail: { count: chainPreview.children.length },
    });
    this.dispatchEvent(event);
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

  addChain(chain) {
    const { chainPreview } = this.#uiElements;
    const chainElement = this.createChainElement(chain);
    chainPreview.appendChild(chainElement);
  }

  resetGame() {
    const {
      radioButtons,
      setLengthButton,
      addChainButton,
      chooseTemplateButton,
      playButton,
      saveTemplateButton,
      chainSplitSelect,
    } = this.#uiElements;
    this.#uiElements.chainInput.value = "";
    this.#uiElements.chainLengthInput.value = 2;
    this.#uiElements.game.replaceChildren();
    this.#uiElements.chainPreview.replaceChildren();
    this.switchGameScoreWrapperVisibility(false);
    this.switchChainPreviewVisibility(false);
    this.switchDisabledAttr(
      [
        ...radioButtons,
        setLengthButton,
        addChainButton,
        chooseTemplateButton,
        chainSplitSelect,
      ],
      false
    );
    this.switchDisabledAttr([playButton, saveTemplateButton], true);
  }

  onResetGameClick() {
    const event = new CustomEvent(UI_EVENTS.resetButtonClick);
    this.dispatchEvent(event);
  }

  onTileClick(tileId) {
    const event = new CustomEvent(UI_EVENTS.onTileClick, {
      detail: {
        tileId,
      },
    });
    this.dispatchEvent(event);
  }

  closeTile(tileId, resolve) {
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
  }

  openTile(tileId, word, resolve) {
    const tile = document.querySelector(`[tile-id="${tileId}"]`);
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
  }

  markTileChained(tileId) {
    const tile = document.querySelector(`[tile-id="${tileId}"]`);
    tile.classList.remove("word-container--not-chained");
    tile.classList.add("word-container--chained");
  }

  onToggleWordOrderImportanceClick(isImportant) {
    const selectedValue = isImportant === "true";
    const event = new CustomEvent(UI_EVENTS.toggleOrderImportant, {
      detail: { value: selectedValue },
    });
    this.dispatchEvent(event);
  }

  setWordOrderImportant(isImportant) {
    const { radioButtons } = this.#uiElements;
    for (let button of radioButtons) {
      button.ariaChecked = button.value === isImportant;
    }
  }

  onChooseTemplateButtonClick() {
    const event = new CustomEvent(UI_EVENTS.chooseTemplateButtonClick);
    this.dispatchEvent(event);
  }

  onSaveTemplateButtonClick() {
    const event = new CustomEvent(UI_EVENTS.saveTemplateButtonClick);
    this.dispatchEvent(event);
  }

  onChainSplitSelect(value) {
    const event = new CustomEvent(UI_EVENTS.chainSplitSelect, {
      detail: { value: value },
    });
    this.dispatchEvent(event);
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
      chainSplitSelect,
    } = this.#uiElements;

    setLengthButton.addEventListener("click", () => this.onSetLengthClick());
    chainLengthInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.onSetLengthClick();
      }
    });
    addChainButton.addEventListener("click", () =>
      this.onAddChainButtonClick(chainInput.value)
    );
    chainInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.onAddChainButtonClick(chainInput.value);
      }
    });
    playButton.addEventListener("click", () => {
      this.onPlayButtonClick();
    });
    resetButton.addEventListener("click", () => this.onResetGameClick());
    radioButtons.forEach((button) => {
      button.addEventListener("click", (event) =>
        this.onToggleWordOrderImportanceClick(event.target.value)
      );
    });
    chooseTemplateButton.addEventListener("click", () =>
      this.onChooseTemplateButtonClick()
    );
    saveTemplateButton.addEventListener("click", () =>
      this.onSaveTemplateButtonClick()
    );
    chainSplitSelect.addEventListener("input", (event) => {
      this.onChainSplitSelect(event.target.value);
    });
  }
}
