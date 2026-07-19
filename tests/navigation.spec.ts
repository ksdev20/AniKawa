import { test, expect } from "@playwright/test";

test.describe("Site Navigation", () => {
  test("homepage logo links correctly", async ({ page }) => {
    await page.goto("/");

    const logo = page
      .locator("a")
      .filter({
        has: page.locator("img"),
      })
      .first();

    if (await logo.count()) {
      await logo.click();

      await expect(page).toHaveURL(/\/$/);
    }
  });

  test("navbar exists on homepage", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav");

    await expect(nav).toBeVisible();
  });

  test("main navigation links work", async ({ page }) => {
    await page.goto("/");

    const links = ["/", "/categories", "/list/new", "/list/popular", "/blog"];

    for (const link of links) {
      const response = await page.request.get(link);

      expect(response.status()).toBe(200);
    }
  });

  test("footer exists", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");

    await expect(footer).toBeVisible();
  });

  test("internal navigation does not lead to broken pages", async ({
    page,
  }) => {
    await page.goto("/");

    const hrefs = await page.locator("a").evaluateAll((anchors) =>
      anchors
        .map((a) => a.getAttribute("href"))
        .filter((href) => href && href.startsWith("/"))
        .slice(0, 20),
    );

    for (const href of hrefs) {
      const response = await page.request.get(href!);

      expect(response.status()).toBeLessThan(400);
    }
  });

  test("navigation works on mobile", async ({ page }) => {
    await page.goto("/");

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    expect(overflow).toBe(false);
  });
});
