/**
 * /e2e/flows/basic.spec.ts
 *
 * Basic E2E tests for the Middle Age Multiverse game
 */
import { test, expect } from '@playwright/test';

test('basic page load test', async ({ page }) => {
  await page.goto('/');

  // Check page title
  await expect(page).toHaveTitle(/The Middle Age Multiverse/);

  // Verify the game container is visible
  await expect(page.locator('.game-container')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'basic-page-load.png' });
});

test('verify time controls are present', async ({ page }) => {
  await page.goto('/');

  // Verify time controls
  await expect(page.locator('.time-controls')).toBeVisible();

  // Verify pause button
  await expect(page.locator('.time-controls__pause-button')).toBeVisible();

  // Verify speed buttons
  await expect(page.locator('.time-controls__speed-button')).toHaveCount(3);

  // Take a screenshot for verification
  await page.screenshot({ path: 'time-controls-present.png' });
});

test('verify resource displays are present', async ({ page }) => {
  await page.goto('/');

  // Verify resource statistics container
  await expect(page.locator('.resource-statistics')).toBeVisible();

  // Verify resource items
  await expect(page.locator('.resource-item')).toHaveCount(6);

  // Check specific resources
  await expect(page.locator('.resource-label:has-text("Energy:")')).toBeVisible();
  await expect(page.locator('.resource-label:has-text("Stress:")')).toBeVisible();
  await expect(page.locator('.resource-label:has-text("Knowledge:")')).toBeVisible();
  await expect(page.locator('.resource-label:has-text("Money:")')).toBeVisible();
  await expect(page.locator('.resource-label:has-text("Social:")')).toBeVisible();
  await expect(page.locator('.resource-label:has-text("Skill Points:")')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'resource-displays-present.png' });
});

test('verify time allocation sliders are present', async ({ page }) => {
  await page.goto('/');

  // Verify time allocation container
  await expect(page.locator('.time-allocation-sliders')).toBeVisible();

  // Verify individual sliders
  await expect(page.locator('.time-allocation-slider')).toHaveCount(5);

  // Verify slider inputs
  await expect(page.locator('input[type="range"].time-allocation-slider__input')).toHaveCount(5);

  // Check specific activities
  await expect(page.locator('.time-allocation-slider__label:has-text("Study")')).toBeVisible();
  await expect(page.locator('.time-allocation-slider__label:has-text("Work")')).toBeVisible();
  await expect(page.locator('.time-allocation-slider__label:has-text("Social")')).toBeVisible();
  await expect(page.locator('.time-allocation-slider__label:has-text("Rest")')).toBeVisible();
  await expect(page.locator('.time-allocation-slider__label:has-text("Exercise")')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'time-allocation-sliders-present.png' });
});

test('verify narrative elements are present', async ({ page }) => {
  await page.goto('/');

  // Verify narrative panel
  await expect(page.locator('.narrative-panel')).toBeVisible();

  // Verify narrative content
  await expect(page.locator('.narrative-content')).toBeVisible();

  // Verify narrative text exists
  await expect(page.locator('.narrative-text')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'narrative-elements-present.png' });
});

test('basic interaction test: pause and speed', async ({ page }) => {
  await page.goto('/');

  // Click the pause button
  await page.locator('.time-controls__pause-button').click();

  // Click the 2x speed button
  await page.locator('.time-controls__speed-button:has-text("2x")').click();

  // Verify 2x button is now active
  await expect(page.locator('.time-controls__speed-button:has-text("2x").active')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'basic-interaction.png' });
});
