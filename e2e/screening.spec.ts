import { test, expect } from "@playwright/test";

test("root redirects to /screening and renders the console", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/screening$/);
  await expect(page.getByText("HAWKEYE STERLING")).toBeVisible();
});

test("the subject register ships empty", async ({ page }) => {
  await page.goto("/screening");
  await expect(page.getByText("No subjects yet")).toBeVisible();
});

test("switching modules swaps the centre content", async ({ page }) => {
  await page.goto("/screening");
  await page.getByRole("link", { name: "Cases" }).click();
  await expect(page.getByText("No open cases")).toBeVisible();
});
