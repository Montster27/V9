/**
 * /src/domain/valueObjects/TimeValue.ts
 * 
 * TimeValue Value Object
 * 
 * Represents game time in the Middle Age Multiverse game.
 * Conversion rate: 3 real seconds = 1 game day
 */
export class TimeValue {
  private readonly REAL_SECONDS_PER_GAME_DAY = 3;
  private readonly HOURS_PER_DAY = 24;
  private readonly DAYS_PER_WEEK = 7;
  
  private gameDate: Date;
  private isPaused: boolean;
  private lastRealTimestamp: number;
  
  /**
   * Creates a new TimeValue instance
   * @param initialDate Initial game date (defaults to game start date)
   * @param isPaused Whether time is initially paused (defaults to true)
   */
  constructor(initialDate: Date = new Date(1983, 8, 1), isPaused: boolean = true) {
    this.gameDate = initialDate;
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
      const updated = new TimeValue(new Date(this.gameDate));
      updated.isPaused = this.isPaused;
      updated.lastRealTimestamp = currentRealTimestamp;
      return updated;
    }
    
    // Calculate elapsed real seconds
    const elapsedRealSeconds = (currentRealTimestamp - this.lastRealTimestamp) / 1000;
    
    // Calculate elapsed game days
    const elapsedGameDays = elapsedRealSeconds / this.REAL_SECONDS_PER_GAME_DAY;
    
    // Calculate new game date
    const newGameDate = new Date(this.gameDate);
    newGameDate.setDate(newGameDate.getDate() + Math.floor(elapsedGameDays));
    
    // Calculate remaining hours from fractional days
    const fractionalDay = elapsedGameDays - Math.floor(elapsedGameDays);
    const additionalHours = fractionalDay * this.HOURS_PER_DAY;
    newGameDate.setHours(
      newGameDate.getHours() + Math.floor(additionalHours)
    );
    
    // Create and return new TimeValue with updated values
    const updated = new TimeValue(newGameDate);
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
    const paused = new TimeValue(updated.gameDate);
    paused.isPaused = true;
    paused.lastRealTimestamp = updated.lastRealTimestamp;
    return paused;
  }
  
  /**
   * Resume game time
   * @returns Updated TimeValue with resumed state
   */
  public resume(): TimeValue {
    const resumed = new TimeValue(this.gameDate);
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
    const newDate = new Date(this.gameDate);
    newDate.setDate(newDate.getDate() + days);
    
    const advanced = new TimeValue(newDate);
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
    const newDate = new Date(this.gameDate);
    newDate.setHours(newDate.getHours() + hours);
    
    const advanced = new TimeValue(newDate);
    advanced.isPaused = this.isPaused;
    advanced.lastRealTimestamp = this.lastRealTimestamp;
    return advanced;
  }
  
  /**
   * Get the current game date
   */
  public getGameDate(): Date {
    return new Date(this.gameDate);
  }
  
  /**
   * Check if game time is paused
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }
  
  /**
   * Calculate the number of game hours that would elapse given real seconds
   * @param realSeconds Number of real seconds
   */
  public static realSecondsToGameHours(realSeconds: number): number {
    const realSecondsPerGameDay = 3;
    const hoursPerDay = 24;
    return (realSeconds / realSecondsPerGameDay) * hoursPerDay;
  }
  
  /**
   * Calculate the number of real seconds needed for game hours
   * @param gameHours Number of game hours
   */
  public static gameHoursToRealSeconds(gameHours: number): number {
    const realSecondsPerGameDay = 3;
    const hoursPerDay = 24;
    return (gameHours / hoursPerDay) * realSecondsPerGameDay;
  }
}
