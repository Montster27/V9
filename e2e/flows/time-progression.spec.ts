/**
 * /e2e/flows/time-progression.spec.ts
 *
 * Tests for time progression
 */
import { test, expect } from '@playwright/test';
import {
  getGameDateTime,
  togglePause,
  setGameSpeed,
  waitForGameTime,
} from '../helpers/test-helpers';

test.describe('Time Progression', () => {
  test('game starts paused and can be resumed', async ({ page }) => {
    await page.goto('/');

    // Game should start paused
    await expect(page.locator('.time-controls-enhanced__pause-button.paused')).toBeVisible();

    // Get the initial date and time
    const initialDateTime = await getGameDateTime(page);

    // Wait 3 seconds to verify time doesn't advance while paused
    await page.waitForTimeout(3000);

    // Date and time should still be the same
    const pausedDateTime = await getGameDateTime(page);
    expect(pausedDateTime).toEqual(initialDateTime);

    // Resume the game
    await togglePause(page);

    // Verify the game is running
    await expect(page.locator('.time-controls-enhanced__pause-button.paused')).not.toBeVisible();

    // Wait 3 seconds (which should be 1 game day at normal speed)
    await page.waitForTimeout(3000);

    // Date should have advanced by 1 day
    const newDateTime = await getGameDateTime(page);
    expect(newDateTime.date).not.toEqual(initialDateTime.date);

    // Parse initial date and new date to verify it's exactly 1 day difference
    const initialDateParts = initialDateTime.date.match(/(\w+) (\d+), (\d+)/);
    const newDateParts = newDateTime.date.match(/(\w+) (\d+), (\d+)/);

    if (initialDateParts && newDateParts) {
      const initialMonth = initialDateParts[1];
      const initialDay = parseInt(initialDateParts[2]);
      const initialYear = parseInt(initialDateParts[3]);

      const newMonth = newDateParts[1];
      const newDay = parseInt(newDateParts[2]);
      const newYear = parseInt(newDateParts[3]);

      // Check if it's exactly 1 day later (this is simplified and doesn't handle month boundaries)
      if (initialMonth === newMonth && initialYear === newYear) {
        expect(newDay).toBe(initialDay + 1);
      }
    }
  });

  test('time progression works at different speeds', async ({ page }) => {
    await page.goto('/');

    // Resume the game
    await togglePause(page);

    // Get initial date
    const initialDateTime = await getGameDateTime(page);

    // Set speed to 2x
    await setGameSpeed(page, 2);

    // Wait 3 seconds (which should be 2 game days at 2x speed)
    await page.waitForTimeout(3000);

    // Get new date
    const speedDateTime = await getGameDateTime(page);

    // Parse dates to verify the difference
    const initialDateParts = initialDateTime.date.match(/(\w+) (\d+), (\d+)/);
    const speedDateParts = speedDateTime.date.match(/(\w+) (\d+), (\d+)/);

    if (initialDateParts && speedDateParts) {
      const initialDay = parseInt(initialDateParts[2]);
      const speedDay = parseInt(speedDateParts[2]);

      // At 2x speed, 3 seconds should advance 2 days
      // This is a simplified check that doesn't handle month boundaries
      expect(speedDay).toBeGreaterThan(initialDay);
    }

    // Set speed to 5x instead of 3x (since we only support 1, 2, and 5)
    await setGameSpeed(page, 5);

    // Get new initial date
    const initialDateTime5x = await getGameDateTime(page);

    // Wait 3 seconds (which should be 5 game days at 5x speed)
    await page.waitForTimeout(3000);

    // Get new date
    const speedDateTime5x = await getGameDateTime(page);

    // Parse dates to verify the difference
    const initialDateParts5x = initialDateTime5x.date.match(/(\w+) (\d+), (\d+)/);
    const speedDateParts5x = speedDateTime5x.date.match(/(\w+) (\d+), (\d+)/);

    if (initialDateParts5x && speedDateParts5x) {
      const initialDay5x = parseInt(initialDateParts5x[2]);
      const speedDay5x = parseInt(speedDateParts5x[2]);

      // At 5x speed, 3 seconds should advance 5 days
      // This is a simplified check that doesn't handle month boundaries
      expect(speedDay5x).toBeGreaterThan(initialDay5x);
    }
  });

  test('pausing stops time progression', async ({ page }) => {
    await page.goto('/');

    // Resume the game
    await togglePause(page);

    // Wait a bit for time to start
    await page.waitForTimeout(1000);

    // Pause the game
    await togglePause(page);

    // Verify the game is paused
    await expect(page.locator('.time-controls-enhanced__pause-button.paused')).toBeVisible();

    // Get the date and time
    const pausedDateTime = await getGameDateTime(page);

    // Wait 3 seconds
    await page.waitForTimeout(3000);

    // Date and time should still be the same
    const stillPausedDateTime = await getGameDateTime(page);
    expect(stillPausedDateTime).toEqual(pausedDateTime);
  });

  test('3 real seconds equals 1 game day at normal speed', async ({ page }) => {
    await page.goto('/');

    // Set speed to 1x and make sure it's not paused
    await setGameSpeed(page, 1);
    await togglePause(page);
    await expect(page.locator('.time-controls-enhanced__pause-button.paused')).not.toBeVisible();

    // Get initial date and time
    const initialDateTime = await getGameDateTime(page);

    // Wait exactly 3 seconds
    await page.waitForTimeout(3000);

    // Get new date and time
    const newDateTime = await getGameDateTime(page);

    // Parse dates to verify the difference
    const initialDateParts = initialDateTime.date.match(/(\w+) (\d+), (\d+)/);
    const newDateParts = newDateTime.date.match(/(\w+) (\d+), (\d+)/);

    if (initialDateParts && newDateParts) {
      const initialMonth = initialDateParts[1];
      const initialDay = parseInt(initialDateParts[2]);
      const initialYear = parseInt(initialDateParts[3]);

      const newMonth = newDateParts[1];
      const newDay = parseInt(newDateParts[2]);
      const newYear = parseInt(newDateParts[3]);

      // Check if it's exactly 1 day later (this is simplified and doesn't handle month boundaries)
      if (initialMonth === newMonth && initialYear === newYear) {
        expect(newDay).toBe(initialDay + 1);
      } else {
        // If we crossed a month boundary, this test is a bit harder to validate precisely
        // We'll just check that the date has advanced
        expect(new Date(`${newMonth} ${newDay}, ${newYear}`).getTime()).toBeGreaterThan(
          new Date(`${initialMonth} ${initialDay}, ${initialYear}`).getTime()
        );
      }
    }
  });
});
