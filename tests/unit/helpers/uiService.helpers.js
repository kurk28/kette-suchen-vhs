export function createUiMockElements() {
  document.body.innerHTML = `
    <input class="chain-input">
    <section class="chain-preview-wrapper chain-preview-wrapper--hidden"></section>
    <button class="add-chain-button"></button>
    <button class="play-button"></button>
    <button class="reset-button"></button>
    <section class="game"></section>
    <button class="set-length-button"></button>
    <input class="chain-length-input">
    <input type="radio" id="order-important" class="radio-order" value="false" checked>
    <input type="radio" id="order-not-important" class="radio-order" value="true">
    <section class="game-score-wrapper" game-score-wrapper--hidden></section>
    <span class="game-score"></span>
    <button class="save-template-button"></button>
    <button class="choose-template-button"></button>
    <dialog class="dialog"></dialog>
    <input id="space" class="radio" type="radio" value="0" checked>
    <input id="comma" class="radio" type="radio" value="1">
    <input id="dash" class="radio" type="radio" value="2">
  `;

  return {
    chainInput: document.querySelector(".chain-input"),
    chainPreview: document.querySelector(".chain-preview-wrapper"),
    addChainButton: document.querySelector(".add-chain-button"),
    playButton: document.querySelector(".play-button"),
    resetButton: document.querySelector(".reset-button"),
    game: document.querySelector(".game"),
    setLengthButton: document.querySelector(".set-length-button"),
    chainLengthInput: document.querySelector(".chain-length-input"),
    orderImportantRadioButtons: document.querySelectorAll(".radio-order"),
    gameScoreWrapper: document.querySelector(".game-score-wrapper"),
    gameScoreElem: document.querySelector(".game-score"),
    saveTemplateButton: document.querySelector(".save-template-button"),
    chooseTemplateButton: document.querySelector(".choose-template-button"),
    dialog: document.querySelector(".dialog"),
    chainSplitRadioButtons: document.querySelectorAll(".radio"),
  };
}
