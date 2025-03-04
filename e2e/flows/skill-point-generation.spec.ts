/**
 * /e2e/flows/skill-point-generation.spec.ts
 *
 * Tests for skill point generation
 */
import { test, expect } from '@playwright/test';
import {
  togglePause,
  setGameSpeed,
  getGameDateTime,
  waitForGameTime,
} from '../helpers/test-helpers';

test.describe('Skill Point Generation', () => {
  test('generates skill points at rate of 1 per game hour', async ({ page }) => {
    await page.goto('/');

    // Get initial skill points
    const initialSkillPoints = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const initialPoints = initialSkillPoints
      ? parseInt(initialSkillPoints.replace(/[^0-9]/g, ''))
      : 0;

    // Resume the game
    await togglePause(page);

    // Set speed to 3x for faster testing
    await setGameSpeed(page, 3);

    // Wait 3 seconds (at 3x speed, this is 3 game days = 72 hours = 72 skill points)
    await page.waitForTimeout(3000);

    // Get new skill point value
    const newSkillPoints = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const newPoints = newSkillPoints ? parseInt(newSkillPoints.replace(/[^0-9]/g, '')) : 0;

    // Should have gained skill points (approximately 72, but may vary slightly due to timing)
    expect(newPoints).toBeGreaterThan(initialPoints);

    // We expect around 72 points (24 hours * 3 days)
    // Allow for some variation due to timing, but should be close
    const pointsGained = newPoints - initialPoints;
    expect(pointsGained).toBeGreaterThanOrEqual(65); // Lower bound allowing for timing variations
    expect(pointsGained).toBeLessThanOrEqual(80); // Upper bound allowing for timing variations
  });

  test('pausing stops skill point generation', async ({ page }) => {
    await page.goto('/');

    // Resume the game
    await togglePause(page);

    // Let it run for a bit to generate some skill points
    await page.waitForTimeout(1000);

    // Pause the game
    await togglePause(page);

    // Get skill points after pausing
    const skillPointsAfterPause = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const pointsAfterPause = skillPointsAfterPause
      ? parseInt(skillPointsAfterPause.replace(/[^0-9]/g, ''))
      : 0;

    // Wait 3 seconds while paused
    await page.waitForTimeout(3000);

    // Get skill points after waiting
    const skillPointsAfterWait = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const pointsAfterWait = skillPointsAfterWait
      ? parseInt(skillPointsAfterWait.replace(/[^0-9]/g, ''))
      : 0;

    // Skill points should not have changed while paused
    expect(pointsAfterWait).toBe(pointsAfterPause);
  });

  test('resuming continues skill point generation', async ({ page }) => {
    await page.goto('/');

    // Resume the game
    await togglePause(page);

    // Let it run for a bit to generate some skill points
    await page.waitForTimeout(1000);

    // Pause the game
    await togglePause(page);

    // Get skill points after pausing
    const skillPointsAfterPause = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const pointsAfterPause = skillPointsAfterPause
      ? parseInt(skillPointsAfterPause.replace(/[^0-9]/g, ''))
      : 0;

    // Resume the game
    await togglePause(page);

    // Wait 2 seconds
    await page.waitForTimeout(2000);

    // Get skill points after resuming
    const skillPointsAfterResume = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const pointsAfterResume = skillPointsAfterResume
      ? parseInt(skillPointsAfterResume.replace(/[^0-9]/g, ''))
      : 0;

    // Skill points should have increased after resuming
    expect(pointsAfterResume).toBeGreaterThan(pointsAfterPause);
  });

  test('skill points are generated proportional to game speed', async ({ page }) => {
    await page.goto('/');

    // Reset to starting state
    await page.reload();

    // Ensure game is paused at start
    await expect(page.locator('.time-controls .pause-button.active')).toBeVisible();

    // Get initial skill points
    const initialSkillPoints = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const initialPoints = initialSkillPoints
      ? parseInt(initialSkillPoints.replace(/[^0-9]/g, ''))
      : 0;

    // Set to 1x speed and run for 3 seconds
    await setGameSpeed(page, 1);
    await togglePause(page);
    await page.waitForTimeout(3000);
    await togglePause(page);

    // Get skill points at 1x speed
    const points1x = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const points1xValue = points1x ? parseInt(points1x.replace(/[^0-9]/g, '')) : 0;
    const gained1x = points1xValue - initialPoints;

    // Reset game
    await page.reload();

    // Ensure game is paused at start
    await expect(page.locator('.time-controls .pause-button.active')).toBeVisible();

    // Get initial skill points
    const initialSkillPoints2 = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const initialPoints2 = initialSkillPoints2
      ? parseInt(initialSkillPoints2.replace(/[^0-9]/g, ''))
      : 0;

    // Set to 3x speed and run for 3 seconds
    await setGameSpeed(page, 3);
    await togglePause(page);
    await page.waitForTimeout(3000);
    await togglePause(page);

    // Get skill points at 3x speed
    const points3x = await page
      .locator(
        '.resource-statistics .resource-item:has(.resource-label:text-is("Skill Points:")) .resource-value'
      )
      .textContent();
    const points3xValue = points3x ? parseInt(points3x.replace(/[^0-9]/g, '')) : 0;
    const gained3x = points3xValue - initialPoints2;

    // At 3x speed, should gain approximately 3 times as many points
    // Allow some margin for timing variations
    const ratio = gained3x / Math.max(1, gained1x); // Avoid division by zero
    expect(ratio).toBeGreaterThanOrEqual(2.5);
    expect(ratio).toBeLessThanOrEqual(3.5);
  });
});
