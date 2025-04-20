"use strict";

import { LoadTemplateDialog } from "./loadTemplateDialog.js";
import { SaveTemplateDialog } from "./saveTemplateDialog.js";

export class DialogFactory {
  static getLoadTemplateDialog(dialog) {
    return new LoadTemplateDialog(dialog);
  }

  static getSaveTemplateDialog(dialog) {
    return new SaveTemplateDialog(dialog);
  }
}
