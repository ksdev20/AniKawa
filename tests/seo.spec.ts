import { test, expect } from "@playwright/test";

const pages = [
  {
    name: "Homepage",
    url: "/",
  },

  {
    name: "Anime Page",
    url: "/show/uynEy9k743xKQ2L/ms-koizumi-loves-ramen-noodles",
  },

  {
    name: "Categories",
    url: "/categories",
  },

  {
    name: "Popular Anime",
    url: "/list/popular",
  },

  {
    name: "Blog",
    url: "/blog",
  },

  {
    name: "Blog Article",
    url: "/blog/10-action-anime-that-deliver-from-start-to-finish",
  },
];

test.describe("SEO Checks", () => {
  for (const pageData of pages) {
    test(`${pageData.name} has title`, async ({ page }) => {
      await page.goto(pageData.url);

      const title = await page.title();

      expect(title.length).toBeGreaterThan(10);
    });

    test(`${pageData.name} has meta description`, async ({ page }) => {
      await page.goto(pageData.url);

      const description = page.locator('meta[name="description"]');

      await expect(description).toHaveCount(1);

      const content = await description.getAttribute("content");

      expect(content?.length).toBeGreaterThan(50);
    });

    test(`${pageData.name} has canonical URL`, async ({ page }) => {
      await page.goto(pageData.url);

      const canonical = page.locator('link[rel="canonical"]');

      await expect(canonical).toHaveCount(1);

      const href = await canonical.getAttribute("href");

      expect(href).toContain("anikawa");
    });

    test(`${pageData.name} is not accidentally noindex`, async ({ page }) => {
      await page.goto(pageData.url);

      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute("content");

      if (robots) {
        expect(robots.toLowerCase()).not.toContain("noindex");
      }
    });

    test(`${pageData.name} has OpenGraph metadata`, async ({ page }) => {
      await page.goto(pageData.url);

      const ogTitle = page.locator('meta[property="og:title"]');

      const ogImage = page.locator('meta[property="og:image"]');

      await expect(ogTitle).toHaveCount(1);

      await expect(ogImage).toHaveCount(1);
    });

    test(`${pageData.name} has Twitter card metadata`, async ({ page }) => {
      await page.goto(pageData.url);

      const twitterCard = page.locator('meta[name="twitter:card"]');

      await expect(twitterCard).toHaveCount(1);
    });
  }

  test("robots.txt exists", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);
  });

  test("sitemap exists", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(200);
  });
});
