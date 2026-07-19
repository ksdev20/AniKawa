import { test, expect } from '@playwright/test';


test.describe('Anime Page', () => {


  const animeUrl =
    '/show/uynEy9k743xKQ2L/ms-koizumi-loves-ramen-noodles';



  test('anime page loads successfully', async ({ page }) => {

    const response = await page.goto(animeUrl);

    expect(response?.status()).toBe(200);

  });



  test('anime page has correct title', async ({ page }) => {

    await page.goto(animeUrl);


    await expect(page)
      .toHaveTitle(/Koizumi|Ramen|Anikawa/i);

  });



  test('anime page does not have console errors', async ({ page }) => {

    const errors: string[] = [];


    page.on('console', msg => {

      if (msg.type() === 'error') {
        errors.push(msg.text());
      }

    });


    page.on('pageerror', error => {

      errors.push(error.message);

    });


    await page.goto(animeUrl);


    expect(errors).toEqual([]);

  });



  test('anime information is visible', async ({ page }) => {

    await page.goto(animeUrl);


    const body = page.locator('body');


    await expect(body)
      .toContainText('Koizumi');


  });



  test('anime page images load correctly', async ({ page }) => {

    await page.goto(animeUrl);


    await page.waitForLoadState('networkidle');


    const brokenImages = await page.evaluate(() => {

      return Array.from(document.images)
        .filter(img =>
          img.complete &&
          img.naturalWidth === 0
        )
        .map(img => img.src);

    });


    expect(brokenImages)
      .toEqual([]);

  });



  test('anime page works on mobile', async ({ page }) => {

    await page.goto(animeUrl);


    const overflow =
      await page.evaluate(() => {

        return document.documentElement.scrollWidth >
               document.documentElement.clientWidth;

      });


    expect(overflow)
      .toBe(false);

  });


});