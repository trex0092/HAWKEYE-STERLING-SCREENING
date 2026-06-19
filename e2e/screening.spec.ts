import { test, expect } from "@playwright/test";

test("root redirects to /screening and renders the console", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/screening$/);
  await expect(page.getByText("HAWKEYE STERLING")).toBeVisible();
});

test("the subject register lists seed subjects and shows the analyst HUD", async ({ page }) => {
  await page.goto("/screening");
  // Use subjects that aren't selected by default (Boris Volkov) and aren't in
  // the RU "related subjects" list, so each name appears exactly once.
  await expect(page.getByText("Helena Vance")).toBeVisible();
  await expect(page.getByText("Amira Hassan")).toBeVisible();
  // The HUD fronts the selected subject's analyst (Boris Volkov → Ember).
  await expect(page.getByText("Ember")).toBeVisible();
});

test("switching modules swaps the centre content", async ({ page }) => {
  await page.goto("/screening");
  await page.getByRole("link", { name: "Cases" }).click();
  // A case-row id only the Cases table renders (Boris Volkov is escalated).
  await expect(page.getByText("CS-10001")).toBeVisible();
  await page.getByRole("link", { name: "Sanctions" }).click();
  await expect(page.getByText("OFAC SDN & Consolidated")).toBeVisible();
});
