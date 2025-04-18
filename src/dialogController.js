"use strict";

import { DIALOG_EVENTS } from "./events.js";

export class DialogController {
  #dialog;

  constructor(dialog) {
    this.#dialog = dialog;
    this.#dialog.addEventListener("close", (event) =>
      event.target.replaceChildren()
    );
  }

  showSaveTemplate() {
    const content = document.createElement("div");
    content.classList.add("dialog__save-template-wrapper");
    const label = document.createElement("label");
    label.innerHTML = "Set name for a template";
    label.classList.add("dialog__input-label");
    const input = document.createElement("input");
    input.type = "text";
    input.required = true;
    input.classList.add("dialog__input");
    const buttonWrapper = this.createSaveTemplateBtnWrapper(input);
    content.append(label, input, buttonWrapper);
    this.#dialog.append(content);
    this.#dialog.showModal();
  }

  createSaveTemplateBtnWrapper(input) {
    const controller = new AbortController();
    const saveButton = this.createSaveButton(input, controller);
    const cancelButton = this.createCancelButton(controller);

    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("dialog__btn-wrapper");
    buttonWrapper.append(saveButton, cancelButton);
    return buttonWrapper;
  }

  createSaveButton(input, controller) {
    const saveButton = document.createElement("button");
    saveButton.classList.add("dialog__save-button");
    saveButton.innerText = "Save";
    saveButton.addEventListener(
      "click",
      () => {
        if (input.value.trim()) {
          const saveTemplateEvent = new CustomEvent(
            DIALOG_EVENTS.saveTemplate,
            { detail: { name: input.value } }
          );
          this.#dialog.dispatchEvent(saveTemplateEvent);
          controller.abort();
          this.#dialog.close();
        }
      },
      { signal: controller.signal }
    );
    return saveButton;
  }

  createCancelButton(controller) {
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("dialog__cancel-button");
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener(
      "click",
      () => {
        controller.abort();
        this.#dialog.close();
      },
      { signal: controller.signal }
    );
    return cancelButton;
  }

  createTemplateElem(templateName, index) {
    const temWrapperElem = document.createElement("div");
    temWrapperElem.classList.add("dialog__template-wrapper");
    const name = document.createElement("span");
    name.classList.add("dialog__template-name");
    name.innerText = templateName;
    const buttonWrapper = document.createElement("div");
    buttonWrapper.classList.add("dialog__btn-wrapper");
    const controller = new AbortController();
    const loadButton = this.createLoadButton(index, controller);
    const deleteButton = this.createDeleteButton(index, controller);
    buttonWrapper.append(loadButton, deleteButton);
    temWrapperElem.append(name, buttonWrapper);
    return temWrapperElem;
  }

  createLoadButton(index, controller) {
    const loadButton = document.createElement("button");
    loadButton.classList.add("load-template-button");
    loadButton.innerText = "Load";
    const loadTemplateEvent = new CustomEvent(DIALOG_EVENTS.loadTemplate, {
      detail: { index },
    });
    loadButton.addEventListener(
      "click",
      () => {
        this.#dialog.dispatchEvent(loadTemplateEvent);
        controller.abort();
        this.#dialog.close();
      },
      { signal: controller.signal }
    );
    return loadButton;
  }

  createDeleteButton(index, controller) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-template-button");
    deleteButton.innerText = "Delete";
    const deleteTemplateEvent = new CustomEvent(DIALOG_EVENTS.deleteTemplate, {
      detail: { index },
    });
    deleteButton.addEventListener(
      "click",
      (event) => {
        this.#dialog.dispatchEvent(deleteTemplateEvent);
        event.target.parentElement.parentElement.remove();
        controller.abort();
      },
      { signal: controller.signal }
    );
    return deleteButton;
  }

  showChooseTemplate(templates) {
    if (!templates) return;

    const section = document.createElement("section");
    section.classList.add("dialog__templates-wrapper");

    const header = document.createElement("h3");
    header.classList.add("dialog__header");
    header.innerHTML = "Choose template to load";
    section.append(header);

    for (let i = 0; i < templates.length; i++) {
      section.append(this.createTemplateElem(templates[i].name, i));
    }
    this.#dialog.append(section);
    this.#dialog.showModal();
  }
}
