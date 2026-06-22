import { test, expect } from "@playwright/test";

test("root redirects to /screening and renders the console", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/screening$/);
  await expect(page.getByText("HAWKEYE STERLING")).toBeVisible();
});

test("the subject register ships empty with a standby HUD", async ({ page }) => {
  await page.goto("/screening");
  await expect(page.getByText("No subjects yet")).toBeVisible();
  // The HUD shows a neutral standby state when no analyst is assigned.
  await expect(page.getByText("No analyst assigned")).toBeVisible();
});

test("switching modules swaps the centre content (all empty)", async ({ page }) => {
  await page.goto("/screening");
  await page.getByRole("link", { name: "Cases" }).click();
  await expect(page.getByText("No open cases")).toBeVisible();
  await page.getByRole("link", { name: "Sanctions" }).click();
  await expect(page.getByText("No watchlist sources")).toBeVisible();
});
