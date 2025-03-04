/**
 * /e2e/flows/use-of-time-allocation.spec.ts
 *
 * Tests for use of time allocation sliders
 */
import { test, expect } from '@playwright/test';
import { setTimeAllocation } from '../helpers/test-helpers';

test.describe('Use of Time Allocation', () => {
  test('time allocation sliders render with default values', async ({ page }) => {
    await page.goto('/');

    // Default allocations should be 8 hours rest, 4 hours each for other activities
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="rest"] input[type="range"]'
      )
    ).toHaveValue('8');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="study"] input[type="range"]'
      )
    ).toHaveValue('4');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="work"] input[type="range"]'
      )
    ).toHaveValue('4');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="social"] input[type="range"]'
      )
    ).toHaveValue('4');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="exercise"] input[type="range"]'
      )
    ).toHaveValue('4');

    // Check labels are shown correctly
    await expect(
      page.locator('.time-allocation-sliders .slider-container[data-activity="rest"] .slider-label')
    ).toContainText('Rest');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="study"] .slider-label'
      )
    ).toContainText('Study');
    await expect(
      page.locator('.time-allocation-sliders .slider-container[data-activity="work"] .slider-label')
    ).toContainText('Work');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="social"] .slider-label'
      )
    ).toContainText('Social');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="exercise"] .slider-label'
      )
    ).toContainText('Exercise');

    // Check hours per day are shown correctly
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="rest"] .hours-display'
      )
    ).toContainText('8 hours/day');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="study"] .hours-display'
      )
    ).toContainText('4 hours/day');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="work"] .hours-display'
      )
    ).toContainText('4 hours/day');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="social"] .hours-display'
      )
    ).toContainText('4 hours/day');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="exercise"] .hours-display'
      )
    ).toContainText('4 hours/day');
  });

  test('adjusting a slider updates the allocation and maintains 24 hour total', async ({
    page,
  }) => {
    await page.goto('/');

    // Change study time to 6 hours
    await setTimeAllocation(page, 'study', 6);

    // Verify the study slider is updated
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="study"] input[type="range"]'
      )
    ).toHaveValue('6');
    await expect(
      page.locator(
        '.time-allocation-sliders .slider-container[data-activity="study"] .hours-display'
      )
    ).toContainText('6 hours/day');

    // Verify other sliders adjusted proportionally
    // Total should still be 24 hours
    const restValue = await page
      .locator(
        '.time-allocation-sliders .slider-container[data-activity="rest"] input[type="range"]'
      )
      .getAttribute('value');
    const workValue = await page
      .locator(
        '.time-allocation-sliders .slider-container[data-activity="work"] input[type="range"]'
      )
      .getAttribute('value');
    const socialValue = await page
      .locator(
        '.time-allocation-sliders .slider-container[data-activity="social"] input[type="range"]'
      )
      .getAttribute('value');
    const exerciseValue = await page
      .locator(
        '.time-allocation-sliders .slider-container[data-activity="exercise"] input[type="range"]'
      )
      .getAttribute('value');

    // Convert to numbers
    const restHours = restValue ? parseFloat(restValue) : 0;
    const workHours = workValue ? parseFloat(workValue) : 0;
    const socialHours = socialValue ? parseFloat(socialValue) : 0;
    const exerciseHours = exerciseValue ? parseFloat(exerciseValue) : 0;

    // Total should be 24 hours (6 for study + the rest)
    const total = 6 + restHours + workHours + socialHours + exerciseHours;
    expect(Math.round(total)).toBe(24);
  });

  test('time distribution view updates when allocations change', async ({ page }) => {
    await page.goto('/');

    // Get initial percentages
    const initialRestPercentage = await page
      .locator('.time-distribution-view .distribution-item[data-activity="rest"] .percentage')
      .textContent();

    // Change rest time to 12 hours
    await setTimeAllocation(page, 'rest', 12);

    // Get new percentages
    const newRestPercentage = await page
      .locator('.time-distribution-view .distribution-item[data-activity="rest"] .percentage')
      .textContent();

    // Rest percentage should have increased
    if (initialRestPercentage && newRestPercentage) {
      const initialPercent = parseFloat(initialRestPercentage.replace('%', ''));
      const newPercent = parseFloat(newRestPercentage.replace('%', ''));
      expect(newPercent).toBeGreaterThan(initialPercent);
      expect(newPercent).toBeCloseTo(50, 1); // 12 / 24 = 50%
    }

    // Check that the pie chart or visualization is updated
    // This depends on the actual implementation, but we can check that it's there
    await expect(page.locator('.time-distribution-view .distribution-visualization')).toBeVisible();
  });

  test('resource impact preview updates when allocations change', async ({ page }) => {
    await page.goto('/');

    // Get initial resource impact values
    const initialKnowledgeImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="knowledge"] .impact-value')
      .textContent();
    const initialMoneyImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="money"] .impact-value')
      .textContent();

    // Change study time to 8 hours (double the default)
    await setTimeAllocation(page, 'study', 8);

    // Get new resource impact values
    const newKnowledgeImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="knowledge"] .impact-value')
      .textContent();

    // Knowledge impact should have increased
    if (initialKnowledgeImpact && newKnowledgeImpact) {
      const initialValue = parseFloat(initialKnowledgeImpact.replace(/[^0-9.-]/g, ''));
      const newValue = parseFloat(newKnowledgeImpact.replace(/[^0-9.-]/g, ''));
      expect(newValue).toBeGreaterThan(initialValue);
    }

    // Change work time to 8 hours (double the default)
    await setTimeAllocation(page, 'work', 8);

    // Get new money impact
    const newMoneyImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="money"] .impact-value')
      .textContent();

    // Money impact should have increased
    if (initialMoneyImpact && newMoneyImpact) {
      const initialValue = parseFloat(initialMoneyImpact.replace(/[^0-9.-]/g, ''));
      const newValue = parseFloat(newMoneyImpact.replace(/[^0-9.-]/g, ''));
      expect(newValue).toBeGreaterThan(initialValue);
    }
  });

  test('stress penalties are shown when rest is too low', async ({ page }) => {
    await page.goto('/');

    // Get initial stress impact
    const initialStressImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="stress"] .impact-value')
      .textContent();

    // Reduce rest to 4 hours (below the 8 hour threshold)
    await setTimeAllocation(page, 'rest', 4);

    // Check stress impact shows a penalty
    const newStressImpact = await page
      .locator('.resource-impact-preview .impact-item[data-resource="stress"] .impact-value')
      .textContent();

    if (initialStressImpact && newStressImpact) {
      const initialValue = parseFloat(initialStressImpact.replace(/[^0-9.-]/g, ''));
      const newValue = parseFloat(newStressImpact.replace(/[^0-9.-]/g, ''));

      // Stress should increase when rest is reduced below threshold
      expect(newValue).toBeGreaterThan(initialValue);
    }

    // Check for a stress penalty indicator or warning
    await expect(page.locator('.resource-impact-preview .stress-penalty-warning')).toBeVisible();
  });
});
