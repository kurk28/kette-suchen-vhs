"use strict";

import { uiElements } from "./helper/ui.js";
import { state } from "./helper/state.js";
import { GameController } from "./gameController.js";
import { DialogFactory } from "./dialog/dialogFactory.js";
import { UIService } from "./UIService.js";

const gameController = new GameController({
  state,
  saveTemplateDialog: DialogFactory.getSaveTemplateDialog(uiElements.dialog),
  loadTemplateDialog: DialogFactory.getLoadTemplateDialog(uiElements.dialog),
  uiService: new UIService(uiElements),
});
gameController.init();
