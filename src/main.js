var wordPositions;
var splitSymbol = " ";
var chainLength = 2;
var closeTileDelay = 2000;
var wordChains = new Map();
var indexToWord = new Map();
var selectedWords = [];
var chainInput = document.querySelector("#chain-input");
var chainPreview = document.querySelector(".chain-preview-wrapper");
var addChainButton = document.querySelector("#add-chain-button");
var playButton = document.querySelector("#play-button");
var resetButton = document.querySelector("#reset-button");
var game = document.querySelector("#game");
var setLengthButton = document.querySelector("#set-length-button");
var chainLengthInput = document.querySelector("#chain-length-input");

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

function shouldSkipTileClick(tile, sw, word) {
  if (tile.classList.contains("word-container--chained")) return true;
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
  if (shouldSkipTileClick(tile, selectedWords, word)) return;
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

  if (selectedWords.length === chainLength) {
    const hash = calculateWords(selectedWords);
    if (wordChains.has(hash)) {
      for (let w of selectedWords) {
        const tile = document.querySelector(`[tile-id="${w.tileId}"]`);
        tile.classList.remove("word-container--not-chained");
        tile.classList.add("word-container--chained");
      }
      selectedWords.length = 0;
    }
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

function addChain(v, cl, wc) {
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
  addDisabledAttr([playButton, addChainButton, setLengthButton]);
  switchWordsPreviewVisibility(false);
}

function onSetLengthButtonClick(l) {
  const newChainLength = parseInt(l, 10);
  if (newChainLength) {
    chainLength = newChainLength;
  }
}

setLengthButton.addEventListener("click", function (event) {
  onSetLengthButtonClick(chainLengthInput.value);
});

chainLengthInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !setLengthButton.hasAttribute("disabled")) {
    onSetLengthButtonClick(chainLengthInput.value);
  }
});

addChainButton.addEventListener("click", function (event) {
  const hash = addChain(chainInput.value, chainLength, wordChains);
  if (hash) {
    if (playButton.disabled) playButton.disabled = false;
    const span = document.createElement("span");
    span.classList.add("word-preview");
    const text = document.createTextNode(chainInput.value);
    span.appendChild(text);
    chainPreview.appendChild(span);
    chainInput.value = "";
    switchWordsPreviewVisibility(true);
  }
});

playButton.addEventListener("click", function (event) {
  onPlayButtonClick({
    chainLength,
    wordChains,
    chainPreview,
    playButton: this,
    addChainButton,
    setLengthButton,
  });
});

chainInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !addChainButton.hasAttribute("disabled")) {
    const hash = addChain(this.value, chainLength, wordChains);
    if (hash) {
      if (playButton.disabled) playButton.disabled = false;
      const span = document.createElement("span");
      span.classList.add("word-preview");
      const text = document.createTextNode(chainInput.value);
      span.appendChild(text);
      chainPreview.appendChild(span);
      chainInput.value = "";
      switchWordsPreviewVisibility(true);
    }
  }
});

resetButton.addEventListener("click", function (event) {
  resetGame();
  switchWordsPreviewVisibility(false);
});
