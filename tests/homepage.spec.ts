import { test, expect } from "@playwright/test";

test.describe("Anikawa Homepage", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
  });

  test("homepage has correct title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Anikawa/i);
  });

  test("homepage does not have console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");

    expect(errors).toEqual([]);
  });

  test("homepage contains main content", async ({ page }) => {
    await page.goto("/");

    const body = page.locator("body");

    await expect(body).toContainText("Anime");
  });

  test("homepage images load correctly", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    const brokenImages = await page.evaluate(() => {
      return Array.from(document.images)
        .filter((img) => {
          return img.complete && img.naturalWidth === 0;
        })
        .map((img) => img.src);
    });

    expect(brokenImages).toEqual([]);
  });

  test("homepage is responsive on mobile", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("body")).toBeVisible();

    const horizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    expect(horizontalOverflow).toBe(false);
  });
});
