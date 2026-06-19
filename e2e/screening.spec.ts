import { test, expect } from "@playwright/test";

test("root redirects to /screening and renders the console", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/screening$/);
  await expect(page.getByText("HAWKEYE").first()).toBeVisible();
});

test("the subject queue lists seed subjects", async ({ page }) => {
  await page.goto("/screening");
  // Scope to the queue table — the selected subject's name also appears in the
  // detail panel heading, which would otherwise trip Playwright strict mode.
  const table = page.getByRole("table");
  await expect(table.getByText("Boris Volkov")).toBeVisible();
  await expect(table.getByText("Vladimir Putin")).toBeVisible();
});
