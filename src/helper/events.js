"use strict";

export const DIALOG_EVENTS = {
  closeDialogAndSave: "dialog:close:save",
  closeDialogAndCancel: "dialog:close:cancel",
  deleteTemplate: "dialog:deleteTemplate",
  loadTemplate: "dialog:loadTemplate",
  saveTemplate: "dialog:saveTemplate",
};

export const UI_EVENTS = {
  deleteChain: "chain:delete",
  setChainLength: "chain:setLength",
  addChain: "chain:add",
  createdTile: "tile:created",
  playButtonClick: "playButton:click",
  resetButtonClick: "resetButton:click",
  toggleOrderImportant: "orderImportant:toggle",
  chooseTemplateButtonClick: "choosesTemplateButton:click",
  onTileClick: "tile:click",
  saveTemplateButtonClick: "saveTemplateButton:click",
  chainSplitSelect: "chainSplitSelect:select",
};
