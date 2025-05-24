// @ts-check
import { test, expect } from "@playwright/test";

const DEFAULT_CHAIN_SEPARATOR_SYMBOL = "0";
const DEFAULT_ORDER_IMPORTANCE = "false";
const DEFAULT_CHAIN_LENGTH = "2";

test.describe("check UI on start:", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should disable buttons", async ({ page }) => {
    const playBtn = await page.getByTestId("play-button").isDisabled();
    expect(playBtn).toBe(true);
    const saveTemplateBtn = await page
      .getByTestId("save-template-button")
      .isDisabled();
    expect(saveTemplateBtn).toBe(true);
  });

  test("should enabled buttons", async ({ page }) => {
    const setLengthBtn = page.getByTestId("set-length-button");
    await expect(setLengthBtn).toBeEnabled();
    const addChainBtn = page.getByTestId("add-chain-button");
    await expect(addChainBtn).toBeEnabled();
    const resetBtn = page.getByTestId("reset-button");
    await expect(resetBtn).toBeEnabled();
    const chooseTemplateBtn = page.getByTestId("choose-template-button");
    await expect(chooseTemplateBtn).toBeEnabled();
  });

  test("should enable chain length input", async ({ page }) => {
    const chainLengthInput = page.getByTestId("chain-length-input");
    await expect(chainLengthInput).toBeEnabled();
    const chainInput = page.getByTestId("chain-input");
    await expect(chainInput).toBeEnabled();
  });

  test("should set default chain separator symbol", async ({ page }) => {
    const separator = await page
      .locator("input[name='chainSplit']:checked")
      .getAttribute("value");
    expect(separator).toBe(DEFAULT_CHAIN_SEPARATOR_SYMBOL);
  });

  test("should set default order importance", async ({ page }) => {
    const isImportant = await page
      .locator("input[name='wordOrder']:checked")
      .getAttribute("value");
    expect(isImportant).toBe(DEFAULT_ORDER_IMPORTANCE);
  });

  test("should set default chain length", async ({ page }) => {
    await expect(page.getByTestId("chain-length-input")).toHaveValue(
      DEFAULT_CHAIN_LENGTH
    );
  });
});
