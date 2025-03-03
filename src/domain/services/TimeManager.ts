import { TimeValue } from '../valueObjects/TimeValue';

/**
 * Event types emitted by the TimeManager
 */
export enum TimeEventType {
  TICK = 'tick',
  DAY_CHANGED = 'day_changed',
  HOUR_CHANGED = 'hour_changed',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  SKILL_POINTS_GENERATED = 'skill_points_generated',
  NEWS_UPDATE = 'news_update',
}

/**
 * Configuration options for the TimeManager
 */
export interface TimeManagerConfig {
  /** Number of real seconds that equal one game day (default: 3) */
  realSecondsPerGameDay: number;
  /** Number of skill points generated per game hour (default: 1) */
  skillPointsPerGameHour: number;
  /** Frequency of news updates in game hours (default: 4) */
  newsUpdateFrequencyHours: number;
  /** Initial game time */
  initialGameTime?: TimeValue;
  /** Whether the time is initially paused (default: false) */
  startPaused?: boolean;
}

/**
 * State of the TimeManager
 */
export interface TimeManagerState {
  /** Current game time */
  currentTime: TimeValue;
  /** Whether time progression is paused */
  isPaused: boolean;
  /** Timestamp of the last update in milliseconds */
  lastUpdateTimestamp: number;
  /** Total accumulated skill points from time progression */
  totalGeneratedSkillPoints: number;
  /** Total accumulated game hours */
  totalElapsedGameHours: number;
  /** Total number of news updates triggered */
  totalNewsUpdates: number;
}

/**
 * Interface for TimeManager event listeners
 */
export interface TimeEventData {
  currentTime: TimeValue;
  elapsedRealMs: number;
  elapsedGameHours: number;
  skillPointsGenerated?: number;
  newsUpdate?: {
    timestamp: number;
    updateId: number;
  };
}

/**
 * TimeManager handles game time progression, pausing, skill point generation,
 * and news updates based on the passage of time.
 */
export class TimeManager {
  private config: TimeManagerConfig;
  private state: TimeManagerState;
  private eventListeners: Map<TimeEventType, Array<(data: TimeEventData) => void>>;

  /**
   * Creates a new TimeManager instance
   * @param config Configuration options
   */
  constructor(config?: Partial<TimeManagerConfig>) {
    // Set default configuration
    this.config = {
      realSecondsPerGameDay: 3,
      skillPointsPerGameHour: 1,
      newsUpdateFrequencyHours: 4,
      startPaused: false,
      ...config
    };

    // Initialize event listeners
    this.eventListeners = new Map();
    Object.values(TimeEventType).forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });

    // Initialize state
    const initialTime = this.config.initialGameTime || new TimeValue(new Date(1983, 8, 1));  // Sept 1, 1983
    this.state = {
      currentTime: initialTime,
      isPaused: this.config.startPaused || false,
      lastUpdateTimestamp: Date.now(),
      totalGeneratedSkillPoints: 0,
      totalElapsedGameHours: 0,
      totalNewsUpdates: 0,
    };
  }

  /**
   * Update game time based on elapsed real time
   * @param currentTimestamp Current timestamp in milliseconds
   * @returns Updated state
   */
  public tick(currentTimestamp: number = Date.now()): TimeManagerState {
    if (this.state.isPaused) {
      // Update the last update timestamp without advancing time
      this.state = {
        ...this.state,
        lastUpdateTimestamp: currentTimestamp
      };
      return { ...this.state };
    }

    // Calculate elapsed real time in milliseconds
    const elapsedRealMs = currentTimestamp - this.state.lastUpdateTimestamp;
    
    // Skip update if no measurable time has passed
    if (elapsedRealMs <= 0) {
      return { ...this.state };
    }

    // Calculate elapsed game time
    const realMsPerGameDay = this.config.realSecondsPerGameDay * 1000;
    const realMsPerGameHour = realMsPerGameDay / 24;
    const elapsedGameHours = elapsedRealMs / realMsPerGameHour;
    
    // Update game time
    const newTime = this.state.currentTime.advanceHours(elapsedGameHours);
    
    // Calculate skill points generated
    const skillPointsGenerated = this.generateSkillPoints(elapsedGameHours);
    
    // Save previous time reference for event checking
    const previousTime = this.state.currentTime;

    // Calculate total elapsed game hours
    const totalGameHours = this.state.totalElapsedGameHours + elapsedGameHours;
    
    // Calculate news updates to trigger
    const prevNewsUpdates = Math.floor(this.state.totalElapsedGameHours / this.config.newsUpdateFrequencyHours);
    const newNewsUpdates = Math.floor(totalGameHours / this.config.newsUpdateFrequencyHours);
    const newsUpdatesToTrigger = Math.max(0, newNewsUpdates - prevNewsUpdates);
    
    // Update state
    this.state = {
      currentTime: newTime,
      isPaused: this.state.isPaused,
      lastUpdateTimestamp: currentTimestamp,
      totalGeneratedSkillPoints: this.state.totalGeneratedSkillPoints + skillPointsGenerated,
      totalElapsedGameHours: totalGameHours,
      totalNewsUpdates: this.state.totalNewsUpdates + newsUpdatesToTrigger,
    };
    
    // Prepare event data
    const eventData: TimeEventData = {
      currentTime: newTime,
      elapsedRealMs,
      elapsedGameHours,
      skillPointsGenerated,
    };
    
    // Emit tick event
    this.emitEvent(TimeEventType.TICK, eventData);
    
    // Check for hour changes and day changes
    const prevHour = previousTime.getGameDate().getHours();
    const newHour = newTime.getGameDate().getHours();
    const prevDay = previousTime.getGameDate().getDate();
    const newDay = newTime.getGameDate().getDate();
    
    // Emit hour changed event if hour boundary crossed
    if (prevHour !== newHour || prevDay !== newDay) {
      this.emitEvent(TimeEventType.HOUR_CHANGED, eventData);
    }
    
    // Emit day changed event if day boundary crossed
    if (prevDay !== newDay) {
      this.emitEvent(TimeEventType.DAY_CHANGED, eventData);
    }
    
    // Emit skill points generated event
    if (skillPointsGenerated > 0) {
      this.emitEvent(TimeEventType.SKILL_POINTS_GENERATED, {
        ...eventData,
        skillPointsGenerated
      });
    }
    
    // Emit news update events (one for each boundary crossed)
    for (let i = 0; i < newsUpdatesToTrigger; i++) {
      this.emitEvent(TimeEventType.NEWS_UPDATE, {
        ...eventData,
        newsUpdate: {
          timestamp: currentTimestamp,
          updateId: this.state.totalNewsUpdates - i
        }
      });
    }
    
    return { ...this.state };
  }

  /**
   * Pause time progression
   */
  public pause(): void {
    if (!this.state.isPaused) {
      this.state = {
        ...this.state,
        isPaused: true
      };
      this.emitEvent(TimeEventType.PAUSED, {
        currentTime: this.state.currentTime,
        elapsedRealMs: 0,
        elapsedGameHours: 0
      });
    }
  }

  /**
   * Resume time progression
   */
  public resume(): void {
    if (this.state.isPaused) {
      this.state = {
        ...this.state,
        isPaused: false,
        lastUpdateTimestamp: Date.now() // Reset timestamp to avoid big jumps
      };
      this.emitEvent(TimeEventType.RESUMED, {
        currentTime: this.state.currentTime,
        elapsedRealMs: 0,
        elapsedGameHours: 0
      });
    }
  }

  /**
   * Toggle the pause state
   * @returns New pause state
   */
  public togglePause(): boolean {
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.state.isPaused;
  }

  /**
   * Generate skill points based on elapsed game hours
   * @param elapsedGameHours Number of game hours elapsed
   * @returns Number of skill points generated
   */
  private generateSkillPoints(elapsedGameHours: number): number {
    return Math.floor(elapsedGameHours * this.config.skillPointsPerGameHour);
  }

  /**
   * Add an event listener
   * @param eventType Event type to listen for
   * @param callback Callback function to execute when event occurs
   */
  public addEventListener(
    eventType: TimeEventType, 
    callback: (data: TimeEventData) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);
  }

  /**
   * Remove an event listener
   * @param eventType Event type to remove listener from
   * @param callback Callback function to remove
   */
  public removeEventListener(
    eventType: TimeEventType, 
    callback: (data: TimeEventData) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param eventType Event type to emit
   * @param data Event data
   */
  private emitEvent(eventType: TimeEventType, data: TimeEventData): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in TimeManager event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get the current state
   * @returns Current TimeManager state
   */
  public getState(): TimeManagerState {
    return { ...this.state };
  }

  /**
   * Set the game time directly
   * @param newTime New game time
   */
  public setTime(newTime: TimeValue): void {
    this.state = {
      ...this.state,
      currentTime: newTime
    };
  }

  /**
   * Get the current game time
   * @returns Current game time
   */
  public getCurrentTime(): TimeValue {
    return this.state.currentTime;
  }

  /**
   * Check if time progression is paused
   * @returns True if paused, false otherwise
   */
  public isPaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Get total generated skill points
   * @returns Total number of skill points generated
   */
  public getTotalGeneratedSkillPoints(): number {
    return this.state.totalGeneratedSkillPoints;
  }
}