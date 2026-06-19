import { test, expect } from "@playwright/test";

test("root redirects to /screening and renders the console", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/screening$/);
  await expect(page.getByText("HAWKEYE").first()).toBeVisible();
});

test("the subject queue lists seed subjects", async ({ page }) => {
  await page.goto("/screening");
  await expect(page.getByText("Boris Volkov")).toBeVisible();
  await expect(page.getByText("Vladimir Putin")).toBeVisible();
});
