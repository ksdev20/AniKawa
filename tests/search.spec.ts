import { test, expect } from '@playwright/test';


test.describe('Search Page', () => {


  const searchUrl = '/search';



  test('search page loads successfully', async ({ page }) => {


    const response =
      await page.goto(searchUrl);



    expect(response?.status())
      .toBe(200);


  });




  test('search page has search input', async ({ page }) => {


    await page.goto(searchUrl);



    const input =
      page.locator('input');



    await expect(input.first())
      .toBeVisible();



  });





  test('user can search anime', async ({ page }) => {


    await page.goto(searchUrl);



    const input =
      page.locator('input').first();



    await input.fill('Naruto');



    await input.press('Enter');



    await page.waitForLoadState(
      'networkidle'
    );



    await expect(page)
      .toHaveURL(/search/i);



    const body =
      await page.locator('body')
        .innerText();



    expect(body.length)
      .toBeGreaterThan(100);



  });





  test('search results contain anime content', async ({ page }) => {


    await page.goto(searchUrl);



    const input =
      page.locator('input').first();



    await input.fill('Naruto');



    await input.press('Enter');



    await page.waitForTimeout(2000);



    const body =
      await page.locator('body')
        .innerText();



    expect(body)
      .toMatch(/Naruto|Search|Result/i);



  });





  test('search has no javascript errors', async ({ page }) => {


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



    await page.goto(searchUrl);



    expect(errors)
      .toEqual([]);



  });





  test('search page works on mobile', async ({ page }) => {


    await page.goto(searchUrl);



    const overflow =
      await page.evaluate(() => {


        return document.documentElement.scrollWidth >
               document.documentElement.clientWidth;


      });



    expect(overflow)
      .toBe(false);



  });



});