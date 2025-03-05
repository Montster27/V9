/**
 * /src/domain/services/simulation/TimeProgressionService.ts
 *
 * Service for managing time progression and scaling
 * Controls time flow, scaling, and game date calculations
 */

import { TimeValue } from '../../valueObjects/TimeValue';

/**
 * Configuration for TimeProgressionService
 */
export interface TimeProgressionConfig {
  realSecondsPerGameDay: number; // Real seconds per game day
  startDate: Date; // Starting game date
  startPaused: boolean; // Whether time starts paused
  speedMultipliers: number[]; // Available speed multipliers
}

/**
 * Default time progression config
 */
const DEFAULT_CONFIG: TimeProgressionConfig = {
  realSecondsPerGameDay: 3, // 3 real seconds = 1 game day
  startDate: new Date(1983, 8, 1), // Sept 1, 1983
  startPaused: true, // Start paused
  speedMultipliers: [0.5, 1, 2, 4, 8], // Available speeds
};

/**
 * Time progression update result
 */
export interface TimeProgressionUpdate {
  previousDate: Date;
  currentDate: Date;
  elapsedGameHours: number;
  elapsedGameDays: number;
  isPaused: boolean;
  speedMultiplier: number;
}

/**
 * Service for managing time progression
 */
export class TimeProgressionService {
  private config: TimeProgressionConfig;
  private currentGameTime: TimeValue;
  private lastRealTimestamp: number;
  private speedMultiplierIndex: number = 1; // Default to normal speed (1x)

  /**
   * Create a new TimeProgressionService
   * @param config Configuration options
   */
  constructor(config: Partial<TimeProgressionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize game time
    this.currentGameTime = new TimeValue(this.config.startDate, this.config.startPaused);

    // Initialize timestamp
    this.lastRealTimestamp = Date.now();
  }

  /**
   * Update time progression based on elapsed real time
   * @param currentTimestamp Current real timestamp (milliseconds)
   * @returns Time progression update
   */
  update(currentTimestamp: number): TimeProgressionUpdate {
    console.log('TimeProgressionService update called, isPaused:', this.isPaused());
    // Previous game date
    const previousDate = this.currentGameTime.getGameDate();

    // If paused, no progression
    if (this.currentGameTime.getIsPaused()) {
      console.log('Time is paused, no progression');
      this.lastRealTimestamp = currentTimestamp;

      return {
        previousDate,
        currentDate: previousDate,
        elapsedGameHours: 0,
        elapsedGameDays: 0,
        isPaused: true,
        speedMultiplier: this.getCurrentSpeedMultiplier(),
      };
    }

    // Calculate elapsed real time
    const elapsedRealMs = currentTimestamp - this.lastRealTimestamp;
    const elapsedRealSeconds = elapsedRealMs / 1000;

    // Apply speed multiplier
    const adjustedRealSeconds = elapsedRealSeconds * this.getCurrentSpeedMultiplier();

    // Calculate elapsed game time
    const secondsPerDay = this.config.realSecondsPerGameDay;
    const elapsedGameDays = adjustedRealSeconds / secondsPerDay;
    const elapsedGameHours = elapsedGameDays * 24;

    // Skip update if very small time change
    if (elapsedGameHours < 0.01) {
      // Less than 1 minute of game time
      return {
        previousDate,
        currentDate: previousDate,
        elapsedGameHours: 0,
        elapsedGameDays: 0,
        isPaused: false,
        speedMultiplier: this.getCurrentSpeedMultiplier(),
      };
    }

    // Calculate new game date
    const msPerDay = 24 * 60 * 60 * 1000;
    const newGameDate = new Date(previousDate.getTime() + elapsedGameDays * msPerDay);

    // Update game time
    this.currentGameTime = new TimeValue(newGameDate, this.currentGameTime.getIsPaused());

    // Update timestamp
    this.lastRealTimestamp = currentTimestamp;

    // Return update information
    return {
      previousDate,
      currentDate: newGameDate,
      elapsedGameHours,
      elapsedGameDays,
      isPaused: false,
      speedMultiplier: this.getCurrentSpeedMultiplier(),
    };
  }

  /**
   * Pause time progression
   */
  pause(): void {
    console.log('TimeProgressionService pause called, current isPaused:', this.isPaused());
    if (!this.currentGameTime.getIsPaused()) {
      this.currentGameTime = new TimeValue(this.currentGameTime.getGameDate(), true);
      this.lastRealTimestamp = Date.now();
    }
  }

  /**
   * Resume time progression
   */
  resume(): void {
    console.log('TimeProgressionService resume called, current isPaused:', this.isPaused());
    if (this.currentGameTime.getIsPaused()) {
      this.currentGameTime = new TimeValue(this.currentGameTime.getGameDate(), false);
      this.lastRealTimestamp = Date.now();
    }
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    const isPaused = this.currentGameTime.getIsPaused();
    this.currentGameTime = new TimeValue(this.currentGameTime.getGameDate(), !isPaused);
    this.lastRealTimestamp = Date.now();
  }

  /**
   * Increase game speed
   * @returns New speed multiplier
   */
  increaseSpeed(): number {
    const maxIndex = this.config.speedMultipliers.length - 1;
    this.speedMultiplierIndex = Math.min(maxIndex, this.speedMultiplierIndex + 1);
    return this.getCurrentSpeedMultiplier();
  }

  /**
   * Decrease game speed
   * @returns New speed multiplier
   */
  decreaseSpeed(): number {
    this.speedMultiplierIndex = Math.max(0, this.speedMultiplierIndex - 1);
    return this.getCurrentSpeedMultiplier();
  }

  /**
   * Set game speed directly
   * @param multiplierIndex Index in speed multipliers array
   * @returns New speed multiplier
   */
  setSpeed(multiplierIndex: number): number {
    const maxIndex = this.config.speedMultipliers.length - 1;
    this.speedMultiplierIndex = Math.max(0, Math.min(maxIndex, multiplierIndex));
    return this.getCurrentSpeedMultiplier();
  }

  /**
   * Get current speed multiplier
   * @returns Current speed multiplier
   */
  getCurrentSpeedMultiplier(): number {
    return this.config.speedMultipliers[this.speedMultiplierIndex];
  }

  /**
   * Set game date directly
   * @param newDate New game date
   */
  setGameDate(newDate: Date): void {
    this.currentGameTime = new TimeValue(newDate, this.currentGameTime.getIsPaused());
    this.lastRealTimestamp = Date.now();
  }

  /**
   * Advance game time by a specific amount
   * @param days Days to advance
   * @param hours Hours to advance
   * @param minutes Minutes to advance
   * @returns New game date
   */
  advanceGameTime(days: number = 0, hours: number = 0, minutes: number = 0): Date {
    const currentDate = this.currentGameTime.getGameDate();

    // Calculate total milliseconds to advance
    const totalMs = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000;

    // Calculate new date
    const newDate = new Date(currentDate.getTime() + totalMs);

    // Update game time
    this.setGameDate(newDate);

    return newDate;
  }

  /**
   * Get current game time
   * @returns Current game time
   */
  getCurrentGameTime(): TimeValue {
    return this.currentGameTime;
  }

  /**
   * Get current game date
   * @returns Current game date
   */
  getCurrentGameDate(): Date {
    return this.currentGameTime.getGameDate();
  }

  /**
   * Get pause state
   * @returns Whether time is paused
   */
  isPaused(): boolean {
    return this.currentGameTime.getIsPaused();
  }

  /**
   * Get service configuration
   * @returns Current configuration
   */
  getConfig(): TimeProgressionConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<TimeProgressionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset service to initial state
   */
  reset(): void {
    this.currentGameTime = new TimeValue(this.config.startDate, this.config.startPaused);
    this.lastRealTimestamp = Date.now();
    this.speedMultiplierIndex = 1; // Reset to normal speed
  }
}
