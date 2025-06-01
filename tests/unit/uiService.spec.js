import { describe, it, expect, vi, beforeEach } from "vitest";
import { UIService } from "@src/UIService.js";
import { UI_EVENTS } from "@src/helpers/events.js";
import { createUiMockElements } from "./helpers/uiService.helpers";

describe("UIService", () => {
  let uiElements;
  let uiService;

  beforeEach(() => {
    uiElements = createUiMockElements();
    uiService = new UIService(uiElements);
  });

  it("should change chain length value and dispatch event", () => {
    const listener = vi.fn();
    uiService.addEventListener(UI_EVENTS.setChainLength, listener);
    uiElements.chainLengthInput.value = "3";
    uiService.onSetLengthClick();
    expect(listener).toHaveBeenCalled();
    const expectedObject = expect.objectContaining({ detail: { value: "3" } });
    expect(listener).toHaveBeenCalledWith(expectedObject);
  });

  it("should add new chain on button click and dispatches event", () => {
    const listener = vi.fn();
    uiService.addEventListener(UI_EVENTS.addChain, listener);
    uiService.onAddChainButtonClick("der Stuhl");
    expect(listener).toHaveBeenCalled();
    const expectedObject = expect.objectContaining({
      detail: { value: "der Stuhl" },
    });
    expect(listener).toHaveBeenCalledWith(expectedObject);
  });

  it("should update chain input value", () => {
    uiService.fillChainInput("der Stuhl");
    expect(uiElements.chainInput.value).toBe("der Stuhl");
  });

  it("should switch disable attribute", () => {
    const { playButton, setLengthButton } = uiElements;
    uiService.switchDisabledAttr([playButton, setLengthButton], true);
    expect(setLengthButton.disabled).toBe(true);
    expect(playButton.disabled).toBe(true);
    uiService.switchDisabledAttr([playButton, setLengthButton], false);
    expect(setLengthButton.disabled).toBe(false);
    expect(playButton.disabled).toBe(false);
  });

  it("should switch chain preview visibility", () => {
    const { chainPreview } = uiElements;
    uiService.switchChainPreviewVisibility(true);
    expect(
      chainPreview.classList.contains("chain-preview-wrapper--visible")
    ).toBe(true);
    uiService.switchChainPreviewVisibility(false);
    expect(
      chainPreview.classList.contains("chain-preview-wrapper--hidden")
    ).toBe(true);
  });

  it("should dispatch event on play button click", () => {
    const listener = vi.fn();
    uiService.addEventListener(UI_EVENTS.playButtonClick, listener);
    uiService.onPlayButtonClick();
    expect(listener).toHaveBeenCalled();
  });
});
