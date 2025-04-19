"use strict";

import { uiElements } from "./ui.js";
import { state } from "./state.js";
import { GameController } from "./gameController.js";
import { DialogController } from "./dialogController.js";
import { UIService } from "./UIService.js";

const gameController = new GameController(
  state,
  new DialogController(uiElements.dialog),
  new UIService(uiElements)
);
gameController.init();
