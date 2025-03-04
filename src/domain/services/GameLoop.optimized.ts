/**
 * /src/domain/services/GameLoop.optimized.ts
 *
 * Optimized GameLoop Service
 *
 * Performance improvements:
 * - Optimized tick scheduling
 * - Reduced object creation
 * - Memoized calculations
 * - More efficient event handling
 * - Reduced redundant operations
 */

import { TimeManager, TimeEventType, TimeEventData } from './TimeManager';
import { UseOfTimeManager } from './UseOfTimeManager';
import { NarrativeManager } from './NarrativeManager';
import { SkillManager } from '../models/Skill';
import { ResourceType } from '../types';

/**
 * Events emitted by the GameLoop
 */
export enum GameLoopEventType {
  TICK = 'tick',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  RESOURCES_UPDATED = 'resources_updated',
  SKILLS_UPDATED = 'skills_updated',
  EVENT_TRIGGERED = 'event_triggered',
  EVENT_RESOLVED = 'event_resolved',
  ERROR = 'error',
}

/**
 * Configuration options for the GameLoop
 */
export interface GameLoopConfig {
  /** Time manager instance */
  timeManager: TimeManager;
  /** UseOfTime manager instance */
  useOfTimeManager?: UseOfTimeManager;
  /** Narrative manager instance */
  narrativeManager?: NarrativeManager;
  /** Skill manager instance */
  skillManager?: SkillManager;
  /** Tick rate in milliseconds (default: 1000) */
  tickRate?: number;
  /** Start the game loop immediately (default: false) */
  autoStart?: boolean;
}

/**
 * Resource update data calculated during game loop ticks
 */
export interface ResourceUpdate {
  type: ResourceType;
  value: number;
  change: number;
  source: string;
}

/**
 * Data for game loop events
 */
export interface GameLoopEventData {
  /** Time since last game loop tick in milliseconds */
  elapsed: number;
  /** Calculated resource updates */
  resourceUpdates?: ResourceUpdate[];
  /** Skill points generated */
  skillPointsGenerated?: number;
  /** Game event triggered */
  eventTriggered?: unknown;
  /** Error message if something went wrong */
  error?: string;
  /** Narrative progress update */
  narrativeUpdate?: unknown;
}

/**
 * State of the game loop
 */
export interface GameLoopState {
  /** Is the game loop currently running */
  isRunning: boolean;
  /** Is the game paused (time progression stopped but loop still ticking) */
  isPaused: boolean;
  /** Timestamp of the last tick in milliseconds */
  lastTickTime: number;
  /** Number of ticks processed */
  tickCount: number;
  /** Number of game days passed */
  daysPassed: number;
  /** Active events that need resolution */
  activeEvents: string[];
  /** Total skill points generated since game start */
  totalSkillPointsGenerated: number;
}

/**
 * Optimized GameLoop manages the core game tick functionality, orchestrating
 * all connected systems including time, resources, skills, and narrative.
 */
export class GameLoop {
  private config: Required<GameLoopConfig>;
  private state: GameLoopState;

  // Use Sets for faster event handling
  private eventListeners: Map<GameLoopEventType, Set<(data: GameLoopEventData) => void>>;

  private animationFrameId: number | null = null;
  private gameState: Record<string, any> = {};

  // Performance optimization: Throttling and debouncing
  private lastResourceUpdateTime = 0;
  private resourceUpdateThrottleMs = 250; // Only update resources every 250ms

  // Cached calculations
  private cachedResourceUpdates: ResourceUpdate[] = [];
  private cachedRealMsPerGameHour = 0;

  /**
   * Creates a new GameLoop instance
   * @param config Configuration options
   */
  constructor(config: GameLoopConfig) {
    // Set default configuration values
    this.config = {
      timeManager: config.timeManager,
      useOfTimeManager: config.useOfTimeManager || new UseOfTimeManager(),
      narrativeManager: config.narrativeManager || new NarrativeManager(),
      skillManager: config.skillManager || new SkillManager(),
      tickRate: config.tickRate || 1000, // 1 second default
      autoStart: config.autoStart || false,
    };

    // Connect UseOfTimeManager to TimeManager if not already connected
    if (this.config.useOfTimeManager && config.timeManager) {
      this.config.useOfTimeManager.setTimeManager(config.timeManager);
    }

    // Initialize state
    this.state = {
      isRunning: false,
      isPaused: config.timeManager.isPaused(),
      lastTickTime: Date.now(),
      tickCount: 0,
      daysPassed: 0,
      activeEvents: [],
      totalSkillPointsGenerated: 0,
    };

    // Initialize event listeners with Sets for better performance
    this.eventListeners = new Map();
    Object.values(GameLoopEventType).forEach((eventType) => {
      this.eventListeners.set(eventType, new Set());
    });

    // Set up time manager event listeners
    this.setupTimeManagerListeners();

    // Precalculate conversion values
    this.updateCachedCalculations();

    // Start the game loop if autoStart is true
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Update cached calculations when configuration changes
   */
  private updateCachedCalculations(): void {
    // Calculate real ms per game hour
    const realSecondsPerGameDay = this.config.timeManager
      .getState()
      .currentTime.getGameDate()
      .getTime();
    this.cachedRealMsPerGameHour = realSecondsPerGameDay / 24;
  }

  /**
   * Set up event listeners for the time manager
   */
  private setupTimeManagerListeners(): void {
    const { timeManager } = this.config;

    // Handle skill point generation events
    timeManager.addEventListener(
      TimeEventType.SKILL_POINTS_GENERATED,
      this.handleSkillPointsGenerated.bind(this)
    );

    // Handle day change events
    timeManager.addEventListener(TimeEventType.DAY_CHANGED, this.handleDayChanged.bind(this));

    // Handle pause/resume events
    timeManager.addEventListener(TimeEventType.PAUSED, () => {
      this.state.isPaused = true;
      this.emitEvent(GameLoopEventType.PAUSED, { elapsed: 0 });
    });

    timeManager.addEventListener(TimeEventType.RESUMED, () => {
      this.state.isPaused = false;
      this.emitEvent(GameLoopEventType.RESUMED, { elapsed: 0 });
    });
  }

  /**
   * Handle skill points generated by the time manager
   * @param data Time event data
   */
  private handleSkillPointsGenerated(data: TimeEventData): void {
    const { skillPointsGenerated = 0 } = data;

    // Skip if no skill points were generated
    if (skillPointsGenerated <= 0) return;

    // Update total skill points generated
    this.state.totalSkillPointsGenerated += skillPointsGenerated;

    // Update skill points using the skill manager
    if (this.config.skillManager) {
      // In a real implementation, we would maintain a skill state
      // and update it here with the generated points
      this.emitEvent(GameLoopEventType.SKILLS_UPDATED, {
        elapsed: data.elapsedRealMs,
        skillPointsGenerated,
      });
    }
  }

  /**
   * Handle day change events from the time manager
   * @param data Time event data
   */
  private handleDayChanged(data: TimeEventData): void {
    // Increment days passed
    this.state.daysPassed++;

    // In a real implementation, we might trigger certain events
    // or updates based on the day change
  }

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.lastTickTime = Date.now();
    this.scheduleTick();
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Schedule the next tick using requestAnimationFrame
   */
  private scheduleTick(): void {
    if (!this.state.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Main game loop tick function
   * @param timestamp Current timestamp from requestAnimationFrame
   */
  private tick(timestamp: number): void {
    // Schedule the next tick
    this.scheduleTick();

    // Calculate elapsed time since last tick
    const now = Date.now();
    const elapsed = now - this.state.lastTickTime;

    // Only process if enough time has passed (based on tickRate)
    if (elapsed >= this.config.tickRate) {
      try {
        // Update time
        this.updateTime(now);

        // Update resources (throttled)
        let resourceUpdates: ResourceUpdate[] = [];
        const timeSinceLastResourceUpdate = now - this.lastResourceUpdateTime;

        if (timeSinceLastResourceUpdate >= this.resourceUpdateThrottleMs) {
          resourceUpdates = this.updateResources(elapsed);
          this.lastResourceUpdateTime = now;
        } else {
          // Use cached updates from last calculation
          resourceUpdates = this.cachedResourceUpdates;
        }

        // Process narrative events
        const narrativeUpdate = this.processNarrativeEvents();

        // Emit tick event
        this.emitEvent(GameLoopEventType.TICK, {
          elapsed,
          resourceUpdates,
          narrativeUpdate,
        });

        // Update last tick time and increment tick count
        this.state.lastTickTime = now;
        this.state.tickCount++;
      } catch (error) {
        // Handle any errors during the tick
        console.error('Error in game loop tick:', error);
        this.emitEvent(GameLoopEventType.ERROR, {
          elapsed,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Update game time using the time manager
   * @param currentTime Current timestamp
   */
  private updateTime(currentTime: number): void {
    // Use the time manager to update game time
    this.config.timeManager.tick(currentTime);
  }

  /**
   * Update resources based on use of time allocations
   * @param elapsedMs Elapsed real time in milliseconds
   * @returns Array of resource updates
   */
  private updateResources(elapsedMs: number): ResourceUpdate[] {
    const resourceUpdates: ResourceUpdate[] = [];

    // Only process resource updates if the game is not paused
    if (!this.state.isPaused && this.config.useOfTimeManager) {
      // Convert elapsed time to game hours
      const elapsedGameHours = elapsedMs / this.cachedRealMsPerGameHour;

      // Calculate resource impacts
      const impacts = this.config.useOfTimeManager.calculateHourlyResourceImpact(elapsedGameHours);

      // Only create resource updates for non-zero impacts
      if (impacts.knowledge !== 0) {
        resourceUpdates.push({
          type: ResourceType.KNOWLEDGE_POINTS,
          value: 0, // We would get the current value from a resource manager
          change: impacts.knowledge,
          source: 'study',
        });
      }

      if (impacts.money !== 0) {
        resourceUpdates.push({
          type: ResourceType.MONEY,
          value: 0, // We would get the current value from a resource manager
          change: impacts.money,
          source: 'work',
        });
      }

      if (impacts.social !== 0) {
        resourceUpdates.push({
          type: ResourceType.SOCIAL_POINTS,
          value: 0, // We would get the current value from a resource manager
          change: impacts.social,
          source: 'social',
        });
      }

      if (impacts.energy !== 0) {
        resourceUpdates.push({
          type: ResourceType.ENERGY,
          value: 0, // We would get the current value from a resource manager
          change: impacts.energy,
          source: 'activities',
        });
      }

      if (impacts.stress !== 0) {
        resourceUpdates.push({
          type: ResourceType.STRESS,
          value: 0, // We would get the current value from a resource manager
          change: impacts.stress,
          source: 'activities',
        });
      }

      // Only emit event if there are updates
      if (resourceUpdates.length > 0) {
        this.emitEvent(GameLoopEventType.RESOURCES_UPDATED, {
          elapsed: elapsedMs,
          resourceUpdates,
        });
      }

      // Cache results for throttled updates
      this.cachedResourceUpdates = resourceUpdates;
    }

    return resourceUpdates;
  }

  /**
   * Process narrative events using the narrative manager
   * @returns Narrative update data
   */
  private processNarrativeEvents(): unknown {
    // Make sure narrative manager is available
    if (!this.config.narrativeManager) return null;

    // Skip if already paused due to events
    if (this.state.activeEvents.length > 0) {
      return {
        triggeredEvents: [],
        activeEvents: [...this.state.activeEvents],
      };
    }

    // Update game state with current values
    // In a real implementation, we would gather this from various managers

    // Process events based on current game state
    const triggeredEvents = this.config.narrativeManager.processEvents(this.gameState);

    // If events were triggered, pause the game and emit events
    if (triggeredEvents.length > 0) {
      // Pause the game for events
      if (!this.state.isPaused) {
        this.config.timeManager.pause();
      }

      // Add to active events (without mutation)
      const updatedActiveEvents = [...this.state.activeEvents];
      const newEvents = [];

      for (const event of triggeredEvents) {
        if (!updatedActiveEvents.includes(event.id)) {
          updatedActiveEvents.push(event.id);
          newEvents.push(event);
        }
      }

      // Update state with new active events
      this.state = {
        ...this.state,
        activeEvents: updatedActiveEvents,
      };

      // Emit events for newly triggered events only
      for (const event of newEvents) {
        this.emitEvent(GameLoopEventType.EVENT_TRIGGERED, {
          elapsed: 0,
          eventTriggered: event,
        });
      }
    }

    return {
      triggeredEvents,
      activeEvents: [...this.state.activeEvents],
    };
  }

  /**
   * Resolve a narrative event
   * @param eventId ID of the event to resolve
   * @param choiceId ID of the chosen option
   */
  public resolveEvent(eventId: string, choiceId?: string): void {
    if (!this.config.narrativeManager) return;

    // Check if the event exists before attempting to complete it
    const event = this.findEventById(eventId);
    if (!event) {
      console.error(`Event ${eventId} not found`);
      return;
    }

    // Complete the event with the chosen option
    this.config.narrativeManager.completeEvent(eventId, choiceId);

    // Remove from active events (without mutation)
    const updatedActiveEvents = [...this.state.activeEvents];
    const index = updatedActiveEvents.indexOf(eventId);

    if (index !== -1) {
      updatedActiveEvents.splice(index, 1);

      // Update state
      this.state = {
        ...this.state,
        activeEvents: updatedActiveEvents,
      };
    }

    // Emit event resolved
    this.emitEvent(GameLoopEventType.EVENT_RESOLVED, {
      elapsed: 0,
      eventTriggered: { id: eventId, choiceId },
    });

    // If no more active events, resume the game - make sure we update our internal state too
    if (updatedActiveEvents.length === 0 && this.state.isPaused) {
      this.config.timeManager.resume();
      this.state = {
        ...this.state,
        isPaused: false,
      };
      this.emitEvent(GameLoopEventType.RESUMED, { elapsed: 0 });
    }
  }

  /**
   * Add an event listener
   * @param eventType Event type to listen for
   * @param callback Callback function to execute when event occurs
   */
  public addEventListener(
    eventType: GameLoopEventType,
    callback: (data: GameLoopEventData) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(callback);
    }
  }

  /**
   * Remove an event listener
   * @param eventType Event type to remove listener from
   * @param callback Callback function to remove
   */
  public removeEventListener(
    eventType: GameLoopEventType,
    callback: (data: GameLoopEventData) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param eventType Event type to emit
   * @param data Event data
   */
  private emitEvent(eventType: GameLoopEventType, data: GameLoopEventData): void {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners || listeners.size === 0) return;

    // Create a frozen copy of the data to prevent modifications
    const frozenData = Object.freeze({ ...data });

    listeners.forEach((callback) => {
      try {
        callback(frozenData);
      } catch (error) {
        console.error(`Error in GameLoop event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get the current game loop state
   * @returns Current state
   */
  public getState(): GameLoopState {
    return { ...this.state };
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (!this.state.isPaused) {
      this.config.timeManager.pause();
      // Ensure we also emit our own event (may be redundant with timeManager listener, but ensures consistency)
      this.emitEvent(GameLoopEventType.PAUSED, { elapsed: 0 });
      this.state = {
        ...this.state,
        isPaused: true,
      };
    }
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.state.isPaused && this.state.activeEvents.length === 0) {
      this.config.timeManager.resume();
      // Ensure we also emit our own event
      this.emitEvent(GameLoopEventType.RESUMED, { elapsed: 0 });
      this.state = {
        ...this.state,
        isPaused: false,
      };
    }
  }

  /**
   * Toggle the pause state
   * @returns New pause state
   */
  public togglePause(): boolean {
    if (this.state.isPaused && this.state.activeEvents.length === 0) {
      this.config.timeManager.resume();
    } else if (!this.state.isPaused) {
      this.config.timeManager.pause();
    }
    return this.state.isPaused;
  }

  /**
   * Update the game state used for event processing
   * @param state New game state
   */
  public updateGameState(state: Record<string, any>): void {
    this.gameState = {
      ...this.gameState,
      ...state,
    };
  }

  /**
   * Helper to find event by ID
   * @param eventId Event ID to find
   * @returns The event object if found, undefined otherwise
   */
  private findEventById(eventId: string): unknown {
    if (!this.config.narrativeManager) return undefined;
    // Try to find the event in the narrative manager's queue
    const event = this.config.narrativeManager.getEventById(eventId);
    return event;
  }

  /**
   * Get active events
   * @returns Array of active event IDs
   */
  public getActiveEvents(): string[] {
    return [...this.state.activeEvents];
  }

  /**
   * Check if any events are active
   * @returns True if there are active events
   */
  public hasActiveEvents(): boolean {
    return this.state.activeEvents.length > 0;
  }

  /**
   * Get the total number of skill points generated
   * @returns Total skill points
   */
  public getTotalSkillPointsGenerated(): number {
    return this.state.totalSkillPointsGenerated;
  }

  /**
   * Get the current tick count
   * @returns Number of ticks processed
   */
  public getTickCount(): number {
    return this.state.tickCount;
  }

  /**
   * Get the number of game days passed
   * @returns Number of days
   */
  public getDaysPassed(): number {
    return this.state.daysPassed;
  }

  /**
   * Update the cached calculations
   * Called when configuration changes
   */
  public refreshCachedCalculations(): void {
    this.updateCachedCalculations();
  }

  /**
   * Set the resource update throttling time
   * @param throttleMs Throttle time in milliseconds
   */
  public setResourceUpdateThrottle(throttleMs: number): void {
    this.resourceUpdateThrottleMs = Math.max(50, throttleMs); // Ensure minimum of 50ms
  }
}
