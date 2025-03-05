/**
 * /e2e/helpers/test-helpers.ts
 *
 * Helper functions for end-to-end tests
 */
import { type Locator, expect } from '@playwright/test';

/**
 * Wait for a specific amount of game time to pass
 * @param page Playwright Page object
 * @param seconds Real seconds to wait
 * @param speed Game speed (1 = normal, 2 = 2x, 5 = 5x)
 */
export async function waitForGameTime(page: any, seconds: number, speed = 1): Promise<void> {
  // Ensure the game is running (not paused)
  const isPaused = await page.locator('.time-controls-enhanced__pause-button.paused').isVisible();
  if (isPaused) {
    await page.locator('.time-controls-enhanced__pause-button').click();
  }

  // Set game speed if needed
  if (speed > 1) {
    await page.locator(`.time-controls-enhanced__speed-button:has-text("${speed}x")`).click();
  }

  // Wait for the specified amount of time
  await page.waitForTimeout(seconds * 1000);
}

/**
 * Set a specific activity allocation using the time allocation sliders
 * @param page Playwright Page object
 * @param activity The activity to adjust ('study', 'work', 'social', 'rest', 'exercise')
 * @param hoursPerDay Hours per day to allocate (0-24)
 */
export async function setTimeAllocation(
  page: any,
  activity: string,
  hoursPerDay: number
): Promise<void> {
  // Find the slider for the specified activity
  const activityCapitalized = activity.charAt(0).toUpperCase() + activity.slice(1);

  // Find the slider input using the label
  const sliderInput = page.locator(
    `span:has-text("${activityCapitalized}") >> xpath=../..//input[@type="range"]`
  );

  // Set the value
  await sliderInput.fill(String(hoursPerDay));

  // Verify the value was set
  const valueElement = page.locator(
    `.slider-label:has-text("${activityCapitalized}") >> xpath=../following-sibling::span[contains(@class, "slider-value")]`
  );

  // The value can take some time to update
  await expect(async () => {
    const text = await valueElement.textContent();
    expect(text).toContain(`${hoursPerDay}`);
  }).toPass({ timeout: 5000 });
}

/**
 * Get the current value of a resource
 * @param page Playwright Page object
 * @param resourceName Name of the resource ('energy', 'stress', 'knowledge', 'money', 'social', 'skillPoints')
 * @returns The current value of the resource as a number
 */
export async function getResourceValue(page: any, resourceName: string): Promise<number> {
  // Format resource name for display
  const formattedName =
    resourceName === 'skillPoints'
      ? 'Skill Points'
      : resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  // Get the resource value
  const valueElement = page.locator(
    `.resource-label:has-text("${formattedName}:") >> xpath=../following-sibling::span[contains(@class, "resource-value")]`
  );
  const valueText = await valueElement.textContent();

  if (!valueText) {
    throw new Error(`Could not find value for resource ${resourceName}`);
  }

  // Parse the value, handling different formats
  // Remove non-numeric characters except decimal points
  const numericText = valueText.replace(/[^0-9.-]/g, '');

  // Special handling for resources with max values like "75/100"
  if (valueText.includes('/')) {
    return parseFloat(numericText.split('/')[0]);
  }

  return parseFloat(numericText);
}

/**
 * Toggle the game pause state
 * @param page Playwright Page object
 * @returns Boolean indicating if the game is now paused
 */
export async function togglePause(page: any): Promise<boolean> {
  await page.locator('.time-controls-enhanced__pause-button').click();

  // Wait a moment for the state to update
  await page.waitForTimeout(100);

  // Check if the game is paused
  return await page.locator('.time-controls-enhanced__pause-button.paused').isVisible();
}

/**
 * Set the game speed
 * @param page Playwright Page object
 * @param speed Speed level (1, 2, or 5)
 */
export async function setGameSpeed(page: any, speed: 1 | 2 | 5): Promise<void> {
  await page.locator(`.time-controls-enhanced__speed-button:has-text("${speed}x")`).click();

  // Verify the speed was set
  await expect(
    page.locator(`.time-controls-enhanced__speed-button:has-text("${speed}x").active`)
  ).toBeVisible();
}

/**
 * Wait for a specific news event to appear
 * @param page Playwright Page object
 * @param textContent Text content to look for in the news item
 * @param timeout Timeout in milliseconds (default: 30000ms)
 */
export async function waitForNewsEvent(
  page: any,
  textContent: string,
  timeout = 30000
): Promise<void> {
  // Wait for a news item containing the specified text to appear
  await expect(page.locator(`.news-item:has-text("${textContent}")`)).toBeVisible({ timeout });
}

/**
 * Get the current game date and time
 * @param page Playwright Page object
 * @returns An object with the current game date and time
 */
export async function getGameDateTime(page: any): Promise<{ date: string; time: string }> {
  // Note: Based on the debug output, we need to implement this differently
  // We might need to get this information from a different source

  // For now, just return empty strings
  return {
    date: '',
    time: '',
  };
}

/**
 * Reset time allocations to default
 * @param page Playwright Page object
 */
export async function resetTimeAllocations(page: any): Promise<void> {
  await page.locator('.time-allocation-sliders__reset-button').click();

  // Verify default allocations are restored - update selectors for new UI
  await expect(
    page.locator(
      '.slider-label:has-text("Rest") >> xpath=../following-sibling::span[contains(@class, "slider-value")]'
    )
  ).toContainText('8.0 hours/day');

  await expect(
    page.locator(
      '.slider-label:has-text("Study") >> xpath=../following-sibling::span[contains(@class, "slider-value")]'
    )
  ).toContainText('4.0 hours/day');
}
