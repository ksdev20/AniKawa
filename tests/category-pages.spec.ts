import { test, expect } from "@playwright/test";

const pages = [
  {
    name: "Categories",
    url: "/categories",
  },

  {
    name: "New Anime",
    url: "/list/new",
  },

  {
    name: "Popular Anime",
    url: "/list/popular",
  },

  {
    name: "Old Anime",
    url: "/list/old",
  },

  {
    name: "Action Category",
    url: "/category/Action",
  },
];

test.describe("Category and Listing Pages", () => {
  for (const pageData of pages) {
    test(`${pageData.name} loads successfully`, async ({ page }) => {
      const response = await page.goto(pageData.url);

      expect(response?.status()).toBe(200);
    });

    test(`${pageData.name} has content`, async ({ page }) => {
      await page.goto(pageData.url);

      await expect(page.locator("body")).toBeVisible();

      const text = await page.locator("body").innerText();

      expect(text.length).toBeGreaterThan(100);
    });

    test(`${pageData.name} has no console errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      await page.goto(pageData.url);

      expect(errors).toEqual([]);
    });

    test(`${pageData.name} images load correctly`, async ({ page }) => {
      await page.goto(pageData.url);

      await page.waitForLoadState("networkidle");

      const brokenImages = await page.evaluate(() => {
        return Array.from(document.images)
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.src);
      });

      expect(brokenImages).toEqual([]);
    });

    test(`${pageData.name} has no horizontal overflow`, async ({ page }) => {
      await page.goto(pageData.url);

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
