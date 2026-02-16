// tests/preview-ignores-critical.spec.ts
import { test, expect } from "@playwright/test";

test("preview → ignoring a critical shows the court overlay (via Exit)", async ({
  page,
}) => {
  // Go to the Builder/Preview page
  await page.goto("/court-room");

  // Fill minimal scenario fields
  await page.getByTestId("timerMinutes").fill("5");
  await page.getByTestId("backgroundUrl").fill("/backgrounds/workdesk-bg.png");
  await page.getByTestId("punishmentText").fill("Penalty text");

  // Satisfy Rules (validation)
  await page.getByTestId("majorLimit").fill("1");
  await page.getByTestId("minorLimit").fill("1");

  // Add ONE critical message (must include punishment + reason or the form rejects it)
  await page.getByTestId("msgCategory").selectOption("critical");
  await page.getByTestId("msgSeverity").selectOption("major");
  await page.getByTestId("msgText").fill("Critical: fix alt text");
  await page.getByTestId("msgAnswer").fill("alt='description'");
  // Fill required court outcome fields (use placeholders from the form)
  await page
    .getByPlaceholder("e.g., 3 months suspension")
    .fill("3 months suspension");
  await page
    .getByPlaceholder("e.g., Breach of Privacy Act")
    .fill("Breach of Privacy Act");
  await page.getByTestId("addMessage").click();

  // Show preview (resets preview state)
  await page.getByTestId("previewBtn").click();

  // Start the session
  await page.getByRole("button", { name: "Start" }).click();

  // FIRST dock icon appears ~30s after Start → allow up to 50s
  const notifBtn = page.getByRole("button", { name: "Open notification" });
  await expect(notifBtn).toBeVisible({ timeout: 50_000 });

  // Open the dock popup (toggle)
  await notifBtn.click();

  // The popup contains Resolve/Dismiss; pick Resolve to open the critical modal
  const popupResolve = page.getByRole("button", { name: "Resolve" });
  await expect(popupResolve).toBeVisible();
  await popupResolve.click();

  // In the critical modal, click Exit ⇒ instant Court
  await page.getByRole("button", { name: "Exit" }).click();

  // Court overlay should be visible (verdict text present)
  await expect(page.getByText("Courtroom Verdict")).toBeVisible();
});
