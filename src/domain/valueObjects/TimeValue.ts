/**
 * /src/domain/valueObjects/TimeValue.optimized.ts
 *
 * Optimized TimeValue Value Object
 *
 * Represents game time in the Middle Age Multiverse game.
 * Conversion rate: 3 real seconds = 1 game day
 *
 * Performance improvements:
 * - Memoized time conversion calculations
 * - Reduced Date object creation
 * - Optimized time progression calculations
 */

// Simple memoization cache for time conversions
interface MemoCache<T> {
  [key: string]: T;
}

export class TimeValue {
  private readonly REAL_SECONDS_PER_GAME_DAY = 3;
  private readonly HOURS_PER_DAY = 24;
  private readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  // Store time as timestamp for faster calculations
  private gameTimestamp: number;
  private isPaused: boolean;
  private lastRealTimestamp: number;

  // Caches for memoized calculations
  private static readonly REAL_TO_GAME_CACHE: MemoCache<number> = {};
  private static readonly GAME_TO_REAL_CACHE: MemoCache<number> = {};
  private static readonly CACHE_SIZE_LIMIT = 100;

  /**
   * Creates a new TimeValue instance
   * @param initialDate Initial game date (defaults to game start date)
   * @param isPaused Whether time is initially paused (defaults to true)
   */
  constructor(initialDate: Date = new Date(1983, 8, 1), isPaused: boolean = true) {
    this.gameTimestamp = initialDate.getTime();
    this.isPaused = isPaused;
    this.lastRealTimestamp = Date.now();
  }

  /**
   * Update the game time based on elapsed real time
   * @param currentRealTimestamp Current real timestamp in milliseconds
   * @returns Updated TimeValue object (immutable pattern)
   */
  public update(currentRealTimestamp: number): TimeValue {
    if (this.isPaused) {
      // When paused, only update the lastRealTimestamp
      const updated = new TimeValue(this.getGameDate());
      updated.isPaused = this.isPaused;
      updated.lastRealTimestamp = currentRealTimestamp;
      return updated;
    }

    // Calculate elapsed real seconds
    const elapsedRealMs = currentRealTimestamp - this.lastRealTimestamp;
    if (elapsedRealMs <= 0) return this; // No time has passed, return the current instance

    const elapsedRealSeconds = elapsedRealMs / 1000;

    // Calculate elapsed game days (optimize by avoiding division when possible)
    const elapsedGameDays = elapsedRealSeconds / this.REAL_SECONDS_PER_GAME_DAY;

    // Calculate new game timestamp directly without creating intermediate Date objects
    const elapsedGameMs = elapsedGameDays * this.MS_PER_DAY;
    const newGameTimestamp = this.gameTimestamp + elapsedGameMs;

    // Create and return new TimeValue with updated values
    const updated = new TimeValue();
    updated.gameTimestamp = newGameTimestamp;
    updated.isPaused = this.isPaused;
    updated.lastRealTimestamp = currentRealTimestamp;
    return updated;
  }

  /**
   * Pause game time
   * @returns Updated TimeValue with paused state
   */
  public pause(): TimeValue {
    // First update to ensure time is current
    const updated = this.update(Date.now());
    // Then pause
    const paused = new TimeValue();
    paused.gameTimestamp = updated.gameTimestamp;
    paused.isPaused = true;
    paused.lastRealTimestamp = updated.lastRealTimestamp;
    return paused;
  }

  /**
   * Resume game time
   * @returns Updated TimeValue with resumed state
   */
  public resume(): TimeValue {
    const resumed = new TimeValue();
    resumed.gameTimestamp = this.gameTimestamp;
    resumed.isPaused = false;
    resumed.lastRealTimestamp = Date.now(); // Reset timestamp when resuming
    return resumed;
  }

  /**
   * Advance game time by a specific number of days
   * @param days Number of days to advance
   * @returns Updated TimeValue
   */
  public advanceDays(days: number): TimeValue {
    // Calculate directly with timestamps
    const advanceMs = days * this.MS_PER_DAY;

    const advanced = new TimeValue();
    advanced.gameTimestamp = this.gameTimestamp + advanceMs;
    advanced.isPaused = this.isPaused;
    advanced.lastRealTimestamp = this.lastRealTimestamp;
    return advanced;
  }

  /**
   * Advance game time by a specific number of hours
   * @param hours Number of hours to advance
   * @returns Updated TimeValue
   */
  public advanceHours(hours: number): TimeValue {
    // Calculate directly with timestamps
    const advanceMs = hours * (this.MS_PER_DAY / this.HOURS_PER_DAY);

    const advanced = new TimeValue();
    advanced.gameTimestamp = this.gameTimestamp + advanceMs;
    advanced.isPaused = this.isPaused;
    advanced.lastRealTimestamp = this.lastRealTimestamp;
    return advanced;
  }

  /**
   * Get the current game date
   */
  public getGameDate(): Date {
    return new Date(this.gameTimestamp);
  }

  /**
   * Check if game time is paused
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get the underlying game timestamp
   * @returns Raw game timestamp in milliseconds
   */
  public getGameTimestamp(): number {
    return this.gameTimestamp;
  }

  /**
   * Calculate the number of game hours that would elapse given real seconds
   * @param realSeconds Number of real seconds
   */
  public static realSecondsToGameHours(realSeconds: number): number {
    // Use memoization to avoid recalculating
    const cacheKey = `rs_${realSeconds}`;
    if (TimeValue.REAL_TO_GAME_CACHE[cacheKey] !== undefined) {
      return TimeValue.REAL_TO_GAME_CACHE[cacheKey];
    }

    const realSecondsPerGameDay = 3;
    const hoursPerDay = 24;
    const result = (realSeconds / realSecondsPerGameDay) * hoursPerDay;

    // Cache the result
    TimeValue.maintainCacheSize(TimeValue.REAL_TO_GAME_CACHE);
    TimeValue.REAL_TO_GAME_CACHE[cacheKey] = result;

    return result;
  }

  /**
   * Calculate the number of real seconds needed for game hours
   * @param gameHours Number of game hours
   */
  public static gameHoursToRealSeconds(gameHours: number): number {
    // Use memoization to avoid recalculating
    const cacheKey = `gh_${gameHours}`;
    if (TimeValue.GAME_TO_REAL_CACHE[cacheKey] !== undefined) {
      return TimeValue.GAME_TO_REAL_CACHE[cacheKey];
    }

    const realSecondsPerGameDay = 3;
    const hoursPerDay = 24;
    const result = (gameHours / hoursPerDay) * realSecondsPerGameDay;

    // Cache the result
    TimeValue.maintainCacheSize(TimeValue.GAME_TO_REAL_CACHE);
    TimeValue.GAME_TO_REAL_CACHE[cacheKey] = result;

    return result;
  }

  /**
   * Maintain cache size to prevent memory leaks
   * @param cache Cache to check and potentially clear
   */
  private static maintainCacheSize(cache: MemoCache<number>): void {
    const keys = Object.keys(cache);
    if (keys.length > TimeValue.CACHE_SIZE_LIMIT) {
      // Remove oldest 20% of entries when limit is reached
      const keysToRemove = keys.slice(0, Math.floor(TimeValue.CACHE_SIZE_LIMIT * 0.2));
      keysToRemove.forEach((key) => delete cache[key]);
    }
  }
}
