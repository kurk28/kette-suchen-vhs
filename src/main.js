var checkWordPosition = false;
var chainsSeparateSymbol = ",";
var splitSymbol = " ";
var chainLength = 2;
var gameScore = 0;
var closeTileDelay = 2000;
var wordChains = new Map();
var indexToWord = new Map();
var selectedWords = [];
var chainInput = document.querySelector(".chain-input");
var chainPreview = document.querySelector(".chain-preview-wrapper");
var addChainButton = document.querySelector(".add-chain-button");
var playButton = document.querySelector(".play-button");
var resetButton = document.querySelector(".reset-button");
var game = document.querySelector(".game");
var setLengthButton = document.querySelector(".set-length-button");
var chainLengthInput = document.querySelector(".chain-length-input");
var radioButtons = document.querySelectorAll(".set-word-order-button");
var gameScoreWrapper = document.querySelector(".game-score-wrapper");
var gameScoreElem = document.querySelector(".game-score");
var saveTemplateButton = document.querySelector(".save-template-button");
var chooseTemplateButton = document.querySelector(".choose-template-button");
var dialog = document.querySelector(".dialog");

function getWordPositions(cl, wc) {
  const elementsCount = wc.size;
  const iterator = wc.values();
  const wordPositions = new Array(elementsCount * cl);
  let chain = iterator.next();

  for (let i = 0; i < elementsCount; i++) {
    let words = chain.value.split(splitSymbol);
    for (let j = 0; j < cl; j++) {
      let position = Math.floor(Math.random() * elementsCount * cl);
      if (wordPositions[position]) {
        while (wordPositions[position] !== undefined) {
          if (position >= wordPositions.length - 1) {
            position = 0;
            continue;
          }
          position += 1;
        }
        wordPositions[position] = words[j];
      } else {
        wordPositions[position] = words[j];
      }
    }
    chain = iterator.next();
  }
  return wordPositions;
}

function isWordSelected(sw, word, tileId) {
  for (let i = 0; i < sw.length; i++) {
    if (sw[i].word === word && sw[i].tileId == tileId) return true;
  }
  return false;
}

async function onTileClick({
  tile,
  wordChains,
  selectedWords,
  chainLength,
  indexToWord,
}) {
  const tileId = tile.getAttribute("tile-id");
  const word = indexToWord.get(tileId);
  // skip click if tile is already chained
  if (tile.classList.contains("word-container--chained")) return;

  const isWordSel = isWordSelected(selectedWords, word, tileId);
  // close word if user click on the filled chain
  if (isWordSel && selectedWords.length === chainLength) {
    await closeTiles(selectedWords);
    selectedWords.length = 0;
    return;
  } else if (!isWordSel) {
    // open tile and add word for calculation
    // or close already opened tiles before
    if (
      selectedWords.length !== chainLength &&
      selectedWords.length < chainLength
    ) {
      await openTile(tile, word);
      addWordForCalculation(word, tileId, selectedWords);
    } else {
      await closeTiles(selectedWords);
      selectedWords.length = 0;
      addWordForCalculation(word, tileId, selectedWords);
      await openTile(tile, word);
    }
    // calculate chain
    if (selectedWords.length === chainLength) {
      const isSelectedRight = checkSelectedWords(selectedWords, wordChains);
      updateGameScore(gameScoreElem, gameScore + 1);
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

function updateGameScore(gse, gs = 0) {
  if (gse) {
    gameScore = gs;
    gse.textContent = gs;
  }
}

function createTiles(wp) {
  let maxHeight = 0;
  for (let i = 0; i < wp.length; i++) {
    const wordContainerElem = document.createElement("div");
    const wordElem = document.createElement("div");
    const tileId = i + 1;
    indexToWord.set(String(tileId), wp[i]);
    wordContainerElem.classList.add("word-container");
    wordContainerElem.classList.add("word-container--not-chained");
    wordContainerElem.setAttribute("tile-id", tileId);
    wordElem.innerText = wp[i];
    wordContainerElem.appendChild(wordElem);

    wordContainerElem.addEventListener("click", function () {
      onTileClick({
        tile: this,
        wordChains,
        selectedWords,
        chainLength,
        indexToWord,
      });
    });
    game.appendChild(wordContainerElem);
    const height = wordContainerElem.offsetHeight;
    maxHeight = Math.max(maxHeight, height);
    wordElem.innerText = tileId;
  }

  const root = document.querySelector(":root");
  root.style.setProperty("--max-word-container-height", `${maxHeight}px`);
  game.style.setProperty(
    "grid-auto-rows",
    "minmax(var(--max-word-container-width), var(--max-word-container-height))"
  );
  game.classList.remove("game--hidden");
}

function addWordForCalculation(w, tid, sw) {
  const wordData = {
    word: w,
    tileId: tid,
  };
  sw.push(wordData);
}

function calculateWords(sw) {
  let hash = 0;
  for (w of sw) {
    hash += w.word.split("").reduce((acc, curr) => {
      const code = curr.charCodeAt(0);
      return acc + code;
    }, 0);
  }
  return hash;
}

function checkSelectedWords(sw, wc) {
  const hash = calculateWords(sw);
  const chain = wc.get(hash);
  if (chain) {
    const words = chain.split(splitSymbol);
    for (let i = 0; i < words.length; i++) {
      if (checkWordPosition && words[i] !== sw[i].word) {
        return false;
      } else if (!words.includes(sw[i].word)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

function openTile(tile, word) {
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

function closeTiles(sw) {
  const promises = sw.map((wd) => {
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

function switchChainPreviewVisibility(chainPreview, v = false) {
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

function switchGameScoreWrapperVisibility(el, v = false) {
  if (el) {
    if (v) {
      el.classList.remove("game-score-wrapper--hidden");
    } else {
      el.classList.add("game-score-wrapper--hidden");
    }
  }
}

function createChainHash(v, cl, wc) {
  if (v) {
    const words = v.trim().split(splitSymbol);
    if (words.length === cl) {
      let hash = 0;
      for (w of words) {
        hash += w.split("").reduce((acc, curr) => {
          const code = curr.charCodeAt(0);
          return acc + code;
        }, 0);
      }
      if (!wc.has(hash)) {
        wc.set(hash, v.trim());
        return hash;
      }
    }
  }
}

function addDisabledAttr(elements) {
  elements.forEach((el) => (el.disabled = true));
}

function resetGame() {
  wordChains.clear();
  indexToWord.clear();
  selectedWords.length = 0;
  chainInput.value = "";
  chainLengthInput.value = 2;
  chainLength = 2;
  game.replaceChildren();
  chainPreview.replaceChildren();
  setLengthButton.disabled = false;
  addChainButton.disabled = false;
  playButton.disabled = true;
  saveTemplateButton.disabled = true;
  chooseTemplateButton.disabled = false;
  radioButtons.forEach((button) => (button.disabled = false));
  updateGameScore(gameScoreElem);
  switchGameScoreWrapperVisibility(gameScoreWrapper, false);
  switchChainPreviewVisibility(chainPreview, false);
}

function onPlayButtonClick({
  chainLength,
  wordChains,
  chainPreview,
  playButton,
  addChainButton,
  setLengthButton,
}) {
  wordPositions = getWordPositions(chainLength, wordChains);
  createTiles(wordPositions);
  chainPreview.innerHTML = "";
  addDisabledAttr([
    playButton,
    addChainButton,
    setLengthButton,
    chooseTemplateButton,
    saveTemplateButton,
    ...radioButtons,
  ]);
  switchChainPreviewVisibility(chainPreview, false);
  switchGameScoreWrapperVisibility(gameScoreWrapper, true);
}

function createCloseIcon(cp) {
  const img = document.createElement("img");
  img.setAttribute("src", "./icons/close.svg");
  img.classList.add("cross-icon");
  img.setAttribute("alt", "Delete chain");
  img.addEventListener("click", function (event) {
    event.target.parentElement.remove();
    if (chainPreview.children.length === 0) {
      switchChainPreviewVisibility(chainPreview, false);
    }
  });
  return img;
}

function onSaveTemplateClick() {
  const content = document.createElement("div");
  content.classList.add("dialog__save-template-wrapper");
  const label = document.createElement("label");
  label.innerHTML = "Set name for a template";
  label.classList.add("dialog__input-label");
  const input = document.createElement("input");
  input.type = "text";
  input.required = true;
  input.classList.add("dialog__input");
  const saveBtn = document.createElement("button");
  saveBtn.classList.add("dialog__save-button");
  saveBtn.innerText = "Save";
  const controller = new AbortController();
  saveBtn.addEventListener(
    "click",
    function onSaveButtonClick() {
      if (input.checkValidity()) {
        saveTemplate({
          wordChains,
          chainLength,
          checkWordPosition,
          name: input.value,
        });
        dialog.close();
        controller.abort();
      }
    },
    { signal: controller.signal }
  );

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("dialog__cancel-button");
  cancelBtn.innerText = "Cancel";
  cancelBtn.addEventListener(
    "click",
    function () {
      dialog.close();
      controller.abort();
    },
    { signal: controller.signal }
  );
  const btnWrapper = document.createElement("div");
  btnWrapper.classList.add("dialog__btn-wrapper");
  btnWrapper.append(saveBtn, cancelBtn);
  content.append(label, input, btnWrapper);
  dialog.append(content);
  dialog.showModal();
}

function saveTemplate({ wordChains, chainLength, checkWordPosition, name }) {
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

  const templates = JSON.parse(localStorage.getItem("template")) || [];
  templates.push(template);
  localStorage.setItem("template", JSON.stringify(templates));
}

function chooseTemplate({
  chainInput,
  chainLengthInput,
  radioButtons,
  addChainButton,
}) {
  const templates = JSON.parse(localStorage.getItem("template"));
  if (!templates) {
  }
  const controller = new AbortController();

  const deleteTemplate = (event) => {
    const index = parseInt(event.target.value, 10);
    templates[index].isDeleted = true;
    event.target.parentElement.parentElement.remove();
  };

  const loadTemplate = (event) => {
    resetGame();
    const index = parseInt(event.target.value, 10);
    checkWordPosition = templates[index].checkWordPosition;
    chainLength = templates[index].chainLength;
    chainLengthInput.value = templates[index].chainLength;
    for (let button of radioButtons) {
      button.ariaChecked =
        button.value === String(templates[index].checkWordPosition)
          ? true
          : false;
    }
    chainInput.value = templates[index].wordChains;
    addChainButton.click();
    dialog.close();
  };

  const section = document.createElement("section");
  section.classList.add("dialog__templates-wrapper");

  const header = document.createElement("h3");
  header.classList.add("dialog__header");
  header.innerHTML = "Choose template to load";
  section.append(header);

  for (let i = 0; i < templates.length; i++) {
    const temWrapperElem = document.createElement("div");
    temWrapperElem.classList.add("dialog__template-wrapper");
    const name = document.createElement("span");
    name.classList.add("dialog__template-name");
    const btnWrapper = document.createElement("div");
    btnWrapper.classList.add("dialog__btn-wrapper");
    const loadBtn = document.createElement("button");
    loadBtn.classList.add("load-template-button");
    loadBtn.value = i;
    loadBtn.addEventListener("click", loadTemplate, {
      signal: controller.signal,
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-template-button");
    deleteBtn.value = i;
    deleteBtn.addEventListener("click", deleteTemplate, {
      signal: controller.signal,
    });

    loadBtn.innerText = "Load";
    deleteBtn.innerText = "Delete";

    name.innerText = templates[i].name;
    btnWrapper.append(loadBtn, deleteBtn);
    temWrapperElem.append(name, btnWrapper);
    section.append(temWrapperElem);
  }

  dialog.append(section);

  dialog.addEventListener(
    "close",
    function () {
      const updatedTemplate = templates.filter((t) => !t.isDeleted);
      localStorage.setItem("template", JSON.stringify(updatedTemplate));
      controller.abort();
    },
    { signal: controller.signal }
  );

  dialog.showModal();
}

saveTemplateButton.addEventListener("click", function () {
  onSaveTemplateClick();
});

chooseTemplateButton.addEventListener("click", function () {
  chooseTemplate({
    chainInput,
    chainLengthInput,
    radioButtons,
    addChainButton,
  });
});

function createChainElement(c, cp) {
  const div = document.createElement("div");
  const span = document.createElement("span");
  const text = document.createTextNode(c);
  const img = createCloseIcon(cp);

  div.classList.add("word-preview");
  span.appendChild(text);
  div.appendChild(span);
  div.appendChild(img);
  return div;
}

function addChain({ chain, chainLength, wordChains, chainPreview }) {
  const hash = createChainHash(chain, chainLength, wordChains);
  if (hash) {
    const chainElement = createChainElement(chain, chainPreview);
    chainPreview.appendChild(chainElement);
    return true;
  }
  return false;
}

function addChainHandler({ chains, chainLength, wordChains, chainPreview }) {
  const chainsCopy = [...chains];
  for (let i = 0; i < chainsCopy.length; i++) {
    isChainAdded = addChain({
      chain: chainsCopy[i],
      chainLength,
      wordChains,
      chainPreview,
    });
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

setLengthButton.addEventListener("click", function () {
  const newChainLength = parseInt(chainLengthInput.value, 10);
  if (isNaN(newChainLength)) return;
  resetGame();
  chainLengthInput.value = newChainLength;
  chainLength = newChainLength;
});

chainLengthInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !setLengthButton.hasAttribute("disabled")) {
    const newChainLength = parseInt(event.target.value, 10);
    if (isNaN(newChainLength)) return;
    resetGame();
    event.target.value = newChainLength;
    chainLength = newChainLength;
  }
});

addChainButton.addEventListener("click", function () {
  const chains = chainInput.value.split(chainsSeparateSymbol);
  if (chains.length > 1) {
    const notAddedChains = addChainHandler({
      chains,
      chainLength,
      wordChains,
      chainPreview,
    });
    chainInput.value = notAddedChains;
  } else if (chains.length === 1) {
    const notAddedChains = addChainHandler({
      chains,
      chainLength,
      wordChains,
      chainPreview,
    });
    chainInput.value = notAddedChains;
  } else {
    const notAddedChains = addChainHandler({
      chains: [chainInput.value],
      chainLength,
      wordChains,
      chainPreview,
    });
    chainInput.value = notAddedChains;
  }

  if (
    playButton.disabled &&
    saveTemplateButton.disabled &&
    chainPreview.children.length > 0
  ) {
    playButton.disabled = false;
    saveTemplateButton.disabled = false;
    switchChainPreviewVisibility(chainPreview, true);
  }
});

playButton.addEventListener("click", function () {
  onPlayButtonClick({
    chainLength,
    wordChains,
    chainPreview,
    playButton: this,
    addChainButton,
    setLengthButton,
    gameScoreElem,
    gameScore,
  });
});

chainInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !addChainButton.hasAttribute("disabled")) {
    const chains = event.target.value.split(chainsSeparateSymbol);
    if (chains.length > 1) {
      const notAddedChains = addChainHandler({
        chains,
        chainLength,
        wordChains,
        chainPreview,
      });
      event.target.value = notAddedChains;
    } else if (chains.length === 1) {
      const notAddedChains = addChainHandler({
        chains,
        chainLength,
        wordChains,
        chainPreview,
      });
      event.target.value = notAddedChains;
    } else {
      const notAddedChains = addChainHandler({
        chains: [event.target.value],
        chainLength,
        wordChains,
        chainPreview,
      });
      event.target.value = notAddedChains;
    }

    if (
      playButton.disabled &&
      saveTemplateButton.disabled &&
      chainPreview.children.length > 0
    ) {
      playButton.disabled = false;
      saveTemplateButton.disabled = false;
      switchChainPreviewVisibility(chainPreview, true);
    }
  }
});

resetButton.addEventListener("click", function () {
  resetGame();
});

radioButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    const selectedValue = event.target.value === "true";
    if (selectedValue !== checkWordPosition) {
      checkWordPosition = selectedValue;
      for (let button of radioButtons) {
        button.ariaChecked = button.ariaChecked === "false" ? true : false;
      }
    }
  });
});

dialog.addEventListener("close", function (event) {
  event.target.replaceChildren();
});
