/**
 * /e2e/flows/game-initialization.spec.ts
 *
 * Tests for game initialization
 */
import { test, expect } from '@playwright/test';

test.describe('Game Initialization', () => {
  test('loads the game with all components visible', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');

    // Verify the page title
    await expect(page).toHaveTitle(/Middle Age Multiverse/);

    // Verify main game components are visible
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.game-content')).toBeVisible();

    // Verify time components
    await expect(page.locator('.time-display')).toBeVisible();
    await expect(page.locator('.time-controls')).toBeVisible();

    // Verify resource statistics
    await expect(page.locator('.resource-statistics')).toBeVisible();

    // Verify time allocation components
    await expect(page.locator('.time-allocation-sliders')).toBeVisible();
    await expect(page.locator('.time-distribution-view')).toBeVisible();
    await expect(page.locator('.resource-impact-preview')).toBeVisible();

    // Verify narrative components
    await expect(page.locator('.narrative-panel')).toBeVisible();

    // Verify news stream
    await expect(page.locator('.news-stream')).toBeVisible();
  });

  test('initializes time manager with correct settings', async ({ page }) => {
    await page.goto('/');

    // Time should be paused by default
    await expect(page.locator('.time-controls .pause-button.active')).toBeVisible();

    // Default date should be set to September 1, 1983
    const dateDisplay = page.locator('.time-display .date');
    await expect(dateDisplay).toContainText('September 1, 1983');

    // Time should be set to 8:00 AM
    const timeDisplay = page.locator('.time-display .time');
    await expect(timeDisplay).toContainText('8:00 AM');

    // Speed should be set to normal (1x)
    await expect(page.locator('.time-controls .speed-button[data-speed="1"].active')).toBeVisible();
  });

  test('initializes use of time manager with default allocations', async ({ page }) => {
    await page.goto('/');

    // Check for default allocations in the time allocation sliders
    // Default: 8 hours rest, 4 hours each for other activities
    const restSlider = page.locator(
      '.time-allocation-sliders .slider-container[data-activity="rest"] input[type="range"]'
    );
    await expect(restSlider).toHaveValue('8');

    const studySlider = page.locator(
      '.time-allocation-sliders .slider-container[data-activity="study"] input[type="range"]'
    );
    await expect(studySlider).toHaveValue('4');

    const workSlider = page.locator(
      '.time-allocation-sliders .slider-container[data-activity="work"] input[type="range"]'
    );
    await expect(workSlider).toHaveValue('4');

    const socialSlider = page.locator(
      '.time-allocation-sliders .slider-container[data-activity="social"] input[type="range"]'
    );
    await expect(socialSlider).toHaveValue('4');

    const exerciseSlider = page.locator(
      '.time-allocation-sliders .slider-container[data-activity="exercise"] input[type="range"]'
    );
    await expect(exerciseSlider).toHaveValue('4');

    // Check that the distribution view shows the correct percentages
    // Rest: 33.33% (8/24 hours), Others: 16.67% (4/24 hours)
    const restPercentage = page.locator(
      '.time-distribution-view .distribution-item[data-activity="rest"] .percentage'
    );
    await expect(restPercentage).toContainText('33.3');

    const studyPercentage = page.locator(
      '.time-distribution-view .distribution-item[data-activity="study"] .percentage'
    );
    await expect(studyPercentage).toContainText('16.7');
  });

  test('displays initial resource values', async ({ page }) => {
    await page.goto('/');

    // Check that resource values are displayed
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Energy:")) .resource-value'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Stress:")) .resource-value'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Knowledge:")) .resource-value'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Money:")) .resource-value'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Social:")) .resource-value'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
    ).toBeVisible();
  });
});
