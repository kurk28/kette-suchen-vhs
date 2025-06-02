'use strict';

import { DIALOG_EVENTS } from '../helpers/events.js';

export class SaveTemplateDialog extends EventTarget {
  #dialog;
  #controller;

  constructor(dialog) {
    super();
    this.#dialog = dialog;
  }

  closeDialog() {
    this.#dialog.close();
  }

  closeAndCancel() {
    const event = new CustomEvent(DIALOG_EVENTS.closeDialogAndCancel);
    this.dispatchEvent(event);
  }

  closeAndSave(name) {
    const event = new CustomEvent(DIALOG_EVENTS.closeDialogAndSave, {
      detail: { name },
    });
    this.dispatchEvent(event);
  }

  createSaveButton() {
    const saveButton = document.createElement('button');
    saveButton.classList.add('dialog__save-button');
    saveButton.innerText = 'Save';
    saveButton.addEventListener(
      'click',
      () => {
        const input = document.querySelector('.dialog__input');
        const trimmedName = input.value.trim();
        if (trimmedName) {
          this.closeAndSave(trimmedName);
        }
      },
      { signal: this.#controller.signal }
    );
    return saveButton;
  }

  createCancelButton() {
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('dialog__cancel-button');
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener(
      'click',
      () => {
        this.closeAndCancel();
      },
      { signal: this.#controller.signal }
    );
    return cancelButton;
  }

  createSaveTemplateBtnWrapper() {
    this.#controller = new AbortController();
    const saveButton = this.createSaveButton();
    const cancelButton = this.createCancelButton('Cancel');

    const buttonWrapper = document.createElement('div');
    buttonWrapper.classList.add('dialog__btn-wrapper');
    buttonWrapper.append(saveButton, cancelButton);
    return buttonWrapper;
  }

  showSaveTemplate() {
    this.#controller = new AbortController();
    this.#dialog.addEventListener('close', (event) => {
      event.target.replaceChildren();
      this.#controller.abort();
    });
    const content = document.createElement('div');
    content.classList.add('dialog__save-template-wrapper');
    const label = document.createElement('label');
    label.innerHTML = 'Set name for a template';
    label.classList.add('dialog__input-label');
    const input = document.createElement('input');
    input.type = 'text';
    input.required = true;
    input.classList.add('dialog__input');
    const buttonWrapper = this.createSaveTemplateBtnWrapper();
    content.append(label, input, buttonWrapper);
    this.#dialog.append(content);
    this.#dialog.showModal();
  }
}
