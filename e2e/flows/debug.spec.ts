/**
 * /e2e/flows/debug.spec.ts
 *
 * Debug test to examine the actual UI structure
 */
import { test, expect } from '@playwright/test';

test('debug: capture UI structure', async ({ page }) => {
  // Navigate to the game
  await page.goto('/');

  // Wait for page to load
  await page.waitForTimeout(1000);

  // Take a screenshot of the entire page
  await page.screenshot({ path: 'debug-full-page.png', fullPage: true });

  // Check for specific elements using more general selectors
  console.log('Looking for title element:');
  const title = await page.locator('title').textContent();
  console.log('Page title:', title);

  console.log('Looking for h1 elements:');
  const h1Count = await page.locator('h1').count();
  console.log('Number of h1 elements:', h1Count);

  console.log('Looking for .game-container:');
  const gameContainerExists = (await page.locator('.game-container').count()) > 0;
  console.log('Game container exists:', gameContainerExists);

  // Find time controls with multiple selectors
  console.log('Looking for time controls:');
  const timeControlsSelectors = [
    '.time-controls',
    '[class*="time-controls"]',
    '[class*="timeControls"]',
    '[data-testid*="time-controls"]',
  ];

  for (const selector of timeControlsSelectors) {
    const count = await page.locator(selector).count();
    console.log(`Time controls selector "${selector}" found ${count} elements`);

    if (count > 0) {
      try {
        // List the first element's HTML
        const html = await page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML);
        console.log(`First element HTML: ${html}`);
      } catch (e) {
        console.log(`Could not get HTML: ${e}`);
      }
    }
  }

  // Find pause buttons with multiple selectors
  console.log('Looking for pause buttons:');
  const pauseButtonSelectors = [
    '.time-controls__pause-button',
    '[class*="pause"]',
    'button[class*="pause"]',
    '[aria-label*="pause" i]',
    '[aria-label*="resume" i]',
    'button:has-text("▶")',
  ];

  for (const selector of pauseButtonSelectors) {
    const count = await page.locator(selector).count();
    console.log(`Pause button selector "${selector}" found ${count} elements`);

    if (count > 0) {
      try {
        // List the first element's HTML
        const html = await page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML);
        console.log(`First element HTML: ${html}`);
      } catch (e) {
        console.log(`Could not get HTML: ${e}`);
      }
    }
  }

  // Look for time allocation sliders
  console.log('Looking for time allocation sliders:');
  const sliderSelectors = [
    '.time-allocation-sliders',
    '[class*="slider"]',
    'input[type="range"]',
    '[class*="allocation"]',
    '[data-testid*="slider"]',
  ];

  for (const selector of sliderSelectors) {
    const count = await page.locator(selector).count();
    console.log(`Slider selector "${selector}" found ${count} elements`);

    if (count > 0) {
      try {
        // List the first element's HTML
        const html = await page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML);
        console.log(`First element HTML: ${html}`);
      } catch (e) {
        console.log(`Could not get HTML: ${e}`);
      }
    }
  }

  // Look for resource displays
  console.log('Looking for resource displays:');
  const resourceSelectors = [
    '.resource-statistics',
    '[class*="resource"]',
    '[data-testid*="resource"]',
  ];

  for (const selector of resourceSelectors) {
    const count = await page.locator(selector).count();
    console.log(`Resource selector "${selector}" found ${count} elements`);

    if (count > 0 && count < 10) {
      // Avoid too much output
      try {
        // List the first element's HTML
        const html = await page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML);
        console.log(`First element HTML: ${html}`);
      } catch (e) {
        console.log(`Could not get HTML: ${e}`);
      }
    }
  }

  // Look for narrative elements
  console.log('Looking for narrative elements:');
  const narrativeSelectors = [
    '.narrative-panel',
    '[class*="narrative"]',
    '[data-testid*="narrative"]',
    '[class*="story"]',
    '[class*="news"]',
  ];

  for (const selector of narrativeSelectors) {
    const count = await page.locator(selector).count();
    console.log(`Narrative selector "${selector}" found ${count} elements`);

    if (count > 0 && count < 5) {
      // Avoid too much output
      try {
        // List the first element's HTML
        const html = await page
          .locator(selector)
          .first()
          .evaluate((el) => el.outerHTML);
        console.log(`First element HTML: ${html}`);
      } catch (e) {
        console.log(`Could not get HTML: ${e}`);
      }
    }
  }

  // General page content analysis
  console.log('Analyzing page content:');
  const bodyText = await page.locator('body').textContent();
  console.log('Page contains "Middle Age":', bodyText?.includes('Middle Age'));
  console.log('Page contains "Multiverse":', bodyText?.includes('Multiverse'));
  console.log('Page contains "skill":', bodyText?.includes('skill'));
  console.log('Page contains "time":', bodyText?.includes('time'));

  // Pass the test so we can check the logs
  expect(true).toBeTruthy();
});

test('debug: try clicking UI elements', async ({ page }) => {
  // Navigate to the game
  await page.goto('/');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Take a before screenshot
  await page.screenshot({ path: 'debug-before-interaction.png', fullPage: true });

  // Try to find and click the pause button
  console.log('Trying to interact with pause button:');
  const pauseButtonSelectors = [
    '.time-controls__pause-button',
    '[class*="pause"]',
    'button[class*="pause"]',
    '[aria-label*="pause" i]',
    '[aria-label*="resume" i]',
    'button:has-text("▶")',
  ];

  let clicked = false;
  for (const selector of pauseButtonSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      try {
        await page.locator(selector).first().click();
        console.log(`Successfully clicked ${selector}`);
        clicked = true;
        break;
      } catch (e) {
        console.log(`Failed to click ${selector}: ${e}`);
      }
    }
  }

  // Wait a bit to see effects
  await page.waitForTimeout(1000);

  // Take an after screenshot
  await page.screenshot({ path: 'debug-after-pause-click.png', fullPage: true });

  // Try to find and click a speed button
  console.log('Trying to interact with speed button:');
  const speedButtonSelectors = [
    '.time-controls__speed-button:has-text("2x")',
    'button:has-text("2x")',
    '[aria-label*="speed" i]:has-text("2")',
    'button[class*="speed"]:has-text("2")',
  ];

  clicked = false;
  for (const selector of speedButtonSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      try {
        await page.locator(selector).first().click();
        console.log(`Successfully clicked ${selector}`);
        clicked = true;
        break;
      } catch (e) {
        console.log(`Failed to click ${selector}: ${e}`);
      }
    }
  }

  // Wait a bit to see effects
  await page.waitForTimeout(1000);

  // Take an after screenshot
  await page.screenshot({ path: 'debug-after-speed-click.png', fullPage: true });

  // Pass the test so we can check the logs
  expect(true).toBeTruthy();
});
