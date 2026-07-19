import { test, expect } from '@playwright/test';


test.describe('Episode Player', () => {


  const episodeUrl =
    '/episode/J3lHkPYdrLrKM6I/HUVvPA4qogdklDS0Gw2U9/los-fantasmas-tararean-un-requiem';



  test('episode page loads successfully', async ({ page }) => {

    const response = await page.goto(episodeUrl);

    expect(response?.status())
      .toBe(200);

  });



  test('episode page has video player', async ({ page }) => {

    await page.goto(episodeUrl);


    const iframe =
      page.locator('iframe');


    await expect(iframe.first())
      .toBeVisible();


  });



  test('youtube embed loads correctly', async ({ page }) => {


    await page.goto(episodeUrl);


    const iframe =
      page.locator(
        'iframe[src*="youtube"]'
      );


    await expect(iframe)
      .toHaveCount(1);



    const src =
      await iframe.getAttribute('src');


    expect(src)
      .toContain('youtube');


    expect(src)
      .toMatch(
        /embed|youtube\.com/
      );


  });



  test('youtube player is not showing obvious errors', async ({ page }) => {


    await page.goto(episodeUrl);



    // Wait for Youtube to initialize

    await page.waitForTimeout(5000);



    const bodyText =
      await page.locator('body').innerText();



    const blockedMessages = [

      'Video unavailable',

      'This video is private',

      'not available in your country',

      'Members only',

      'Sign in to confirm your age'

    ];



    for (const message of blockedMessages) {

      expect(bodyText)
        .not
        .toContain(message);

    }


  });



  test('episode page has no javascript errors', async ({ page }) => {


    const errors: string[] = [];



    page.on(
      'console',
      msg => {

        if (msg.type() === 'error') {

          errors.push(msg.text());

        }

      }
    );



    page.on(
      'pageerror',
      error => {

        errors.push(error.message);

      }
    );



    await page.goto(episodeUrl);



    expect(errors)
      .toEqual([]);


  });



});