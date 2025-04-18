"use strict";

import { uiElements } from "./ui.js";
import { state } from "./state.js";
import { GameController } from "./gameController.js";
import { DialogController } from "./dialogController.js";

const gameController = new GameController(state, uiElements, DialogController);
gameController.init();
