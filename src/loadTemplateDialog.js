"use strict";

import { DIALOG_EVENTS } from "./events.js";

export class LoadTemplateDialog extends EventTarget {
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

  closeAndSave() {
    const event = new CustomEvent(DIALOG_EVENTS.closeDialogAndSave);
    this.dispatchEvent(event);
  }

  createCancelButton() {
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("dialog__cancel-button");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener(
      "click",
      () => {
        this.closeAndCancel();
      },
      { signal: this.#controller.signal }
    );
    return cancelButton;
  }

  createSaveButton() {
    const saveButton = document.createElement("button");
    saveButton.classList.add("dialog__save-button");
    saveButton.innerText = "Save";
    saveButton.addEventListener(
      "click",
      () => {
        this.closeAndSave();
      },
      { signal: this.#controller.signal }
    );
    return saveButton;
  }

  createLoadButton(index) {
    const loadButton = document.createElement("button");
    loadButton.classList.add("load-template-button");
    loadButton.innerText = "Load";
    const loadTemplateEvent = new CustomEvent(DIALOG_EVENTS.loadTemplate, {
      detail: { index },
    });
    loadButton.addEventListener(
      "click",
      () => {
        this.dispatchEvent(loadTemplateEvent);
      },
      { signal: this.#controller.signal }
    );
    return loadButton;
  }

  deleteTemplate(index) {
    const template = document.querySelector(
      `.dialog__template-wrapper[data-value="${index}"]`
    );
    template.remove();
  }

  createDeleteButton(index) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-template-button");
    deleteButton.innerText = "Delete";
    const deleteTemplateEvent = new CustomEvent(DIALOG_EVENTS.deleteTemplate, {
      detail: { index },
    });
    deleteButton.addEventListener(
      "click",
      (event) => {
        this.dispatchEvent(deleteTemplateEvent);
      },
      { signal: this.#controller.signal }
    );
    return deleteButton;
  }

  createHeader() {
    const header = document.createElement("h3");
    header.classList.add("dialog__header");
    header.innerHTML = "Choose template to load";
    return header;
  }

  createTemplateElem(templateName, index) {
    const temWrapperElem = document.createElement("div");
    temWrapperElem.classList.add("dialog__template-wrapper");
    temWrapperElem.dataset.value = index;
    const name = document.createElement("span");
    name.classList.add("dialog__template-name");
    name.innerText = templateName;
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("dialog__btn-wrapper");
    const loadButton = this.createLoadButton(index);
    const deleteButton = this.createDeleteButton(index);
    buttonWrapper.append(loadButton, deleteButton);
    temWrapperElem.append(name, buttonWrapper);
    return temWrapperElem;
  }

  showDialog(templates) {
    if (!templates) return;
    this.#controller = new AbortController();
    this.#dialog.addEventListener(
      "close",
      () => {
        this.#dialog.replaceChildren();
        this.#controller.abort();
      },
      { signal: this.#controller.signal }
    );
    const section = document.createElement("section");
    section.classList.add("dialog__templates-wrapper");
    const header = this.createHeader();
    section.append(header);
    for (let i = 0; i < templates.length; i++) {
      section.append(this.createTemplateElem(templates[i].name, i));
    }
    const cancelButton = this.createCancelButton();
    const saveButton = this.createSaveButton();
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("dialog__btn-wrapper");
    buttonWrapper.append(saveButton, cancelButton);
    section.append(buttonWrapper);
    this.#dialog.append(section);
    this.#dialog.showModal();
  }
}
