"use strict";

import { uiElements } from "./ui.js";
import { state } from "./state.js";
import { GameController } from "./gameController.js";
import { SaveTemplateDialog } from "./saveTemplateDialog.js";
import { LoadTemplateDialog } from "./loadTemplateDialog.js";
import { UIService } from "./UIService.js";

const gameController = new GameController(
  state,
  new SaveTemplateDialog(uiElements.dialog),
  new LoadTemplateDialog(uiElements.dialog),
  new UIService(uiElements)
);
gameController.init();
