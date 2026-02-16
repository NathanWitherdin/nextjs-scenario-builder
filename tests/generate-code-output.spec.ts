import { test, expect } from "@playwright/test";

test("form → generate → outputs HTML", async ({ page }) => {
  await page.goto("/court-room");

  // Top-level fields
  await page.getByTestId("timerMinutes").fill("5");
  await page.getByTestId("backgroundUrl").fill("/backgrounds/workdesk-bg.png");
  await page.getByTestId("punishmentText").fill("Test punishment");

  // Satisfy Rules (validation)
  await page.getByTestId("majorLimit").fill("1");
  await page.getByTestId("minorLimit").fill("1");
  // checkboxes can stay as defaults

  // Draft a valid message and add it (task requires answer)
  await page.getByTestId("msgCategory").selectOption("task");
  await page.getByTestId("msgText").fill("hello playwright");
  await page.getByTestId("msgAnswer").fill("expected answer");
  await page.getByTestId("addMessage").click();

  // Generate code
  await page.getByTestId("generateBtn").click();

  // Wait until textarea gets non-empty HTML
  const textarea = page.getByRole("textbox", {
    name: "Generated single-file HTML code",
  });

  await expect
    .poll(async () => (await textarea.inputValue()).length, {
      message: "Generated code should not be empty",
      intervals: [200, 300, 500],
      timeout: 10000,
    })
    .toBeGreaterThan(0);

  const code = await textarea.inputValue();

  expect(code).toContain("hello playwright");
  expect(code).toContain("Test punishment");
});
