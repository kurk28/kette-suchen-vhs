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

function isWordSelected(sw, word) {
  for (let i = 0; i < sw.length; i++) {
    if (sw[i].word === word) return true;
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

  const isWordSel = isWordSelected(selectedWords, word);
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
  for (let i = 0; i < wordPositions.length; i++) {
    const div = document.createElement("div");
    const tileId = i + 1;
    indexToWord.set(String(tileId), wp[i]);
    div.classList.add("word-container");
    div.classList.add("word-container--not-chained");
    div.setAttribute("tile-id", tileId);
    div.innerText = wordPositions[i];

    div.addEventListener("click", function () {
      onTileClick({
        tile: this,
        wordChains,
        selectedWords,
        chainLength,
        indexToWord,
      });
    });
    game.appendChild(div);
    const height = div.offsetHeight;
    maxHeight = Math.max(maxHeight, height);
    div.innerText = tileId;
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
          this.innerHTML = word;
          resolve();
        }
      },
      { once: true }
    );
    tile.classList.add("rotate-word-container");
    tile.innerHTML = "";
  });
}

function closeTiles(sw) {
  const promises = sw.map((wd) => {
    return new Promise((resolve) => {
      sw.forEach((wd) => {
        const tileId = wd.tileId;
        const tile = document.querySelector(`[tile-id="${tileId}"]`);
        tile.addEventListener(
          "animationend",
          function (event) {
            if (event.animationName === "rotate-word-container") {
              this.classList.remove("rotate-word-container");
              this.innerHTML = tileId;
              resolve();
            }
          },
          { once: true }
        );
        tile.classList.add("rotate-word-container");
        tile.innerHTML = "";
      });
    });
  });
  return Promise.all(promises);
}

function switchWordsPreviewVisibility(v = false) {
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
  radioButtons.forEach((button) => (button.disabled = false));
  updateGameScore(gameScoreElem);
  switchGameScoreWrapperVisibility(gameScoreWrapper, false);
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
    ...radioButtons,
  ]);
  switchWordsPreviewVisibility(false);
  switchGameScoreWrapperVisibility(gameScoreWrapper, true);
}

function onSetLengthButtonClick(target) {
  const newChainLength = parseInt(target.value, 10);
  if (target.validity.valid) {
    chainLength = newChainLength;
  }
}

function createCloseIcon() {
  const img = document.createElement("img");
  img.setAttribute("src", "./icons/close.svg");
  img.classList.add("cross-icon");
  img.setAttribute("alt", "Delete chain");
  img.addEventListener("click", function (event) {
    event.target.parentElement.remove();
    if (chainPreview.children.length === 0) {
      switchWordsPreviewVisibility(false);
    }
  });
  return img;
}

function createChainElement(c) {
  const div = document.createElement("div");
  const span = document.createElement("span");
  const text = document.createTextNode(c);
  const img = createCloseIcon();

  div.classList.add("word-preview");
  span.appendChild(text);
  div.appendChild(span);
  div.appendChild(img);
  return div;
}

function addChain({ chain, chainLength, wordChains, chainPreview }) {
  const hash = createChainHash(chain, chainLength, wordChains);
  if (hash) {
    const chainElement = createChainElement(chain);
    chainPreview.appendChild(chainElement);
    return true;
  }
  return false;
}

function addChainHandler({ chains, chainLength, wordChains, chainPreview }) {
  for (let i = 0; i < chains.length; i++) {
    isChainAdded = addChain({
      chain: chains[i],
      chainLength,
      wordChains,
      chainPreview,
    });
    if (isChainAdded) {
      chains[i] = "";
    }
  }

  const notAddedChains = [];
  for (let i = 0; i < chains.length; i++) {
    if (chains[i].length > 0) {
      const trimmedChain = chains[i].trim();
      if (trimmedChain.length > 0) {
        notAddedChains.push(`${trimmedChain}${chainsSeparateSymbol}`);
      }
    }
  }
  return notAddedChains.join(" ");
}

setLengthButton.addEventListener("click", function () {
  resetGame();
  onSetLengthButtonClick(chainLengthInput);
});

chainLengthInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !setLengthButton.hasAttribute("disabled")) {
    resetGame();
    onSetLengthButtonClick(event.target);
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

  if (playButton.disabled) {
    playButton.disabled = false;
    switchWordsPreviewVisibility(true);
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

    if (playButton.disabled) {
      playButton.disabled = false;
      switchWordsPreviewVisibility(true);
    }
  }
});

resetButton.addEventListener("click", function () {
  resetGame();
  switchWordsPreviewVisibility(false);
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
