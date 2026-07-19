import { test, expect } from "@playwright/test";

const blogPages = [
  {
    name: "Blog Homepage",
    url: "/blog",
  },

  {
    name: "Action Anime Article",
    url: "/blog/10-action-anime-that-deliver-from-start-to-finish",
  },

  {
    name: "Anime Recommendations Category",
    url: "/blog/category/anime-recommendations",
  },
];

test.describe("Blog Pages", () => {
  for (const blog of blogPages) {
    test(`${blog.name} loads successfully`, async ({ page }) => {
      const response = await page.goto(blog.url);

      expect(response?.status()).toBe(200);
    });

    test(`${blog.name} has valid title`, async ({ page }) => {
      await page.goto(blog.url);

      const title = await page.title();

      expect(title.length).toBeGreaterThan(5);

      expect(title).toMatch(/Anikawa|Anime|Blog/i);
    });

    test(`${blog.name} contains content`, async ({ page }) => {
      await page.goto(blog.url);

      const body = await page.locator("body").innerText();

      expect(body.length).toBeGreaterThan(200);
    });

    test(`${blog.name} has no console errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      await page.goto(blog.url);

      expect(errors).toEqual([]);
    });

    test(`${blog.name} images load correctly`, async ({ page }) => {
      await page.goto(blog.url);

      await page.waitForLoadState("networkidle");

      const brokenImages = await page.evaluate(() => {
        return Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.src);
      });

      expect(brokenImages).toEqual([]);
    });

    test(`${blog.name} has no horizontal overflow`, async ({ page }) => {
      await page.goto(blog.url);

      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(overflow).toBe(false);
    });
  }
});
