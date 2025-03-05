/**
 * /src/domain/services/simulation/GameSimulationService.ts
 *
 * Main service for coordinating game simulation
 * Integrates all simulation services for a complete game update
 */

import { ResourceCalculationService } from './ResourceCalculationService';
import { ActivityImpactService } from './ActivityImpactService';
import { TimeProgressionService } from './TimeProgressionService';
import { EventGenerationService, EventCheckState } from './EventGenerationService';
import { ResourcesState } from '../../models/Resource';
import { GameEvent } from '../../models/Event';
import { WeeklyTimeAllocation } from '../../models/UseOfTime';
import { TimeValue } from '../../valueObjects/TimeValue';

/**
 * Configuration for GameSimulationService
 */
export interface GameSimulationConfig {
  simulationTickRate: number; // Milliseconds between simulation ticks
  maxEventsPerTick: number; // Maximum events to generate per tick
  resourceUpdateInterval: number; // Game hours between resource updates
}

/**
 * Default game simulation config
 */
const DEFAULT_CONFIG: GameSimulationConfig = {
  simulationTickRate: 100, // 10 ticks per second
  maxEventsPerTick: 1, // Max 1 event per tick
  resourceUpdateInterval: 0.5, // Update resources every half game hour
};

/**
 * Complete simulation update result
 */
export interface SimulationUpdate {
  timeUpdate: {
    currentDate: Date;
    previousDate: Date;
    elapsedGameHours: number;
    elapsedGameDays: number;
    isPaused: boolean;
    speedMultiplier: number;
  };
  resourceUpdate: ResourcesState | null;
  newEvents: GameEvent[];
}

/**
 * Subscription callback type
 */
export type SimulationSubscriber = (update: SimulationUpdate) => void;

/**
 * Main service for game simulation
 */
export class GameSimulationService {
  private config: GameSimulationConfig;
  private resourceService: ResourceCalculationService;
  private activityService: ActivityImpactService;
  private timeService: TimeProgressionService;
  private eventService: EventGenerationService;

  private resources: ResourcesState | null = null;
  private allocation: WeeklyTimeAllocation | null = null;
  private activeEvents: GameEvent[] = [];
  private discoveredClues: string[] = [];
  private narrativeProgress: Record<string, number> = {};

  private lastResourceUpdate: number = 0;
  private subscribers: SimulationSubscriber[] = [];
  private tickInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Create a new GameSimulationService
   * @param config Service configuration
   * @param resourceService Resource calculation service
   * @param activityService Activity impact service
   * @param timeService Time progression service
   * @param eventService Event generation service
   */
  constructor(
    config: Partial<GameSimulationConfig> = {},
    resourceService?: ResourceCalculationService,
    activityService?: ActivityImpactService,
    timeService?: TimeProgressionService,
    eventService?: EventGenerationService
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize services with defaults if not provided
    this.resourceService = resourceService || new ResourceCalculationService();
    this.activityService = activityService || new ActivityImpactService();
    this.timeService = timeService || new TimeProgressionService();
    this.eventService = eventService || new EventGenerationService();
  }

  /**
   * Start the simulation
   * @returns Whether the simulation was started
   */
  start(): boolean {
    if (this.isRunning) {
      return false;
    }

    console.log('Starting simulation');
    this.isRunning = true;

    // No longer using setInterval as ticks are driven by the game loop

    return true;
  }

  /**
   * Stop the simulation
   * @returns Whether the simulation was stopped
   */
  stop(): boolean {
    if (!this.isRunning) {
      return false;
    }

    console.log('Stopping simulation');
    this.isRunning = false;

    // No longer need to clear interval as we're not using setInterval

    return true;
  }

  /**
   * Pause the game time
   */
  pauseTime(): void {
    console.log('Pausing time in simulation service');
    this.timeService.pause();
  }

  /**
   * Resume the game time
   */
  resumeTime(): void {
    console.log('Resuming time in simulation service');
    this.timeService.resume();
  }

  /**
   * Toggle the pause state
   * @returns New pause state
   */
  togglePause(): boolean {
    this.timeService.togglePause();
    return this.timeService.isPaused();
  }

  /**
   * Perform a simulation tick
   * @returns Simulation update
   */
  tick(): SimulationUpdate {
    // Check if simulation is paused and log
    if (this.timeService.isPaused()) {
      console.log('Simulation is paused during tick, will have limited updates');
    } else {
      console.log('Simulation tick running in active state');
    }
    // Debug logging
    console.log('Simulation tick at:', new Date().toISOString());
    console.log(
      'activeEvents type:',
      typeof this.activeEvents,
      'isArray:',
      Array.isArray(this.activeEvents)
    );

    // Get current timestamp
    const currentTimestamp = Date.now();

    // Update time with detailed logging
    const timeUpdate = this.timeService.update(currentTimestamp);
    console.log(
      'Time update:',
      'date:',
      timeUpdate.currentDate.toLocaleString(),
      'elapsed hours:',
      timeUpdate.elapsedGameHours.toFixed(2),
      'paused:',
      timeUpdate.isPaused
    );

    // Initialize update result
    const update: SimulationUpdate = {
      timeUpdate,
      resourceUpdate: null,
      newEvents: [],
    };

    // Skip resource updates if paused or no resources/allocation
    if (!timeUpdate.isPaused && this.resources && this.allocation) {
      // Check if it's time for a resource update
      const hoursSinceLastUpdate =
        timeUpdate.elapsedGameHours +
        (this.lastResourceUpdate > 0 ? 0 : this.config.resourceUpdateInterval);

      if (hoursSinceLastUpdate >= this.config.resourceUpdateInterval) {
        // Update resources
        const updatedResources = this.resourceService.calculateResourceChanges(
          this.resources,
          this.allocation,
          timeUpdate.elapsedGameHours
        );

        // Update skill points
        if (updatedResources.skillPoints) {
          updatedResources.skillPoints = this.resourceService.calculateSkillPointsGeneration(
            updatedResources.skillPoints,
            timeUpdate.elapsedGameHours
          );
        }

        // Save updated resources
        this.resources = updatedResources;
        update.resourceUpdate = updatedResources;

        // Reset last update counter
        this.lastResourceUpdate = 0;
      } else {
        // Increment last update counter
        this.lastResourceUpdate += timeUpdate.elapsedGameHours;
      }
    }

    // Check for events if not paused and resources exist
    if (!timeUpdate.isPaused && this.resources) {
      // Prepare event check state
      const eventCheckState: EventCheckState = {
        resources: this.resources,
        gameTime: this.timeService.getCurrentGameTime(),
        discoveredClues: this.discoveredClues,
        narrativeProgress: this.narrativeProgress,
        lastEventTime: new Date(timeUpdate.previousDate),
      };

      // Check for new events
      const newEvents = this.eventService.checkForEvents(eventCheckState, this.activeEvents);

      // Add new events to active events
      if (newEvents && Array.isArray(newEvents) && newEvents.length > 0) {
        // Check if activeEvents is an array before attempting to modify it
        if (!Array.isArray(this.activeEvents)) {
          console.warn('activeEvents is not an array, resetting:', this.activeEvents);
          this.activeEvents = [];
        }

        // Use concat instead of push with spread operator
        this.activeEvents = this.activeEvents.concat(newEvents);
        update.newEvents = newEvents;

        // Pause on new events with choices
        const hasChoices = newEvents.some((e) => e.choices && e.choices.length > 0);
        if (hasChoices) {
          this.pauseTime();
        }
      } else {
        update.newEvents = []; // Ensure newEvents is always an array in the update
      }
    }

    // Debug resource updates
    if (update.resourceUpdate) {
      console.log('Resource update generated:', JSON.stringify(update.resourceUpdate));
    }

    // Debug event generation
    if (update.newEvents.length > 0) {
      console.log('New events generated:', update.newEvents.length);
    }

    // Notify subscribers
    this.notifySubscribers(update);

    return update;
  }

  /**
   * Process an event choice
   * @param eventId Event ID
   * @param choiceId Choice ID
   * @returns Whether the choice was processed
   */
  processEventChoice(eventId: string, choiceId: string): boolean {
    // Find the event
    const eventIndex = this.activeEvents.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      return false;
    }

    const event = this.activeEvents[eventIndex];

    // Find the choice
    const choice = event.choices?.find((c) => c.id === choiceId);
    if (!choice) {
      return false;
    }

    // Apply choice effects
    if (this.resources && choice.effects) {
      // Simple resource effects
      for (const effect of choice.effects) {
        if (effect.type === 'MODIFY_RESOURCE' && typeof effect.value === 'number') {
          if (effect.target === 'energy') {
            this.resources.energy.current = Math.max(
              0,
              Math.min(this.resources.energy.max, this.resources.energy.current + effect.value)
            );
          } else if (effect.target === 'stress') {
            this.resources.stress.current = Math.max(
              0,
              Math.min(this.resources.stress.max, this.resources.stress.current + effect.value)
            );
          } else if (effect.target === 'health') {
            this.resources.health.current = Math.max(
              0,
              Math.min(this.resources.health.max, this.resources.health.current + effect.value)
            );
          } else if (effect.target === 'belonging') {
            this.resources.belonging.current = Math.max(
              0,
              Math.min(
                this.resources.belonging.max,
                this.resources.belonging.current + effect.value
              )
            );
          } else if (effect.target === 'knowledge') {
            this.resources.knowledge += effect.value;
          } else if (effect.target === 'money') {
            this.resources.money += effect.value;
          } else if (effect.target === 'social') {
            this.resources.social += effect.value;
          }
        } else if (effect.type === 'ADVANCE_NARRATIVE' && effect.arcId) {
          // Narrative advancement
          this.narrativeProgress[effect.arcId] = effect.level || 1;

          // Add clues if provided
          if (effect.clues && Array.isArray(effect.clues)) {
            for (const clue of effect.clues) {
              if (!this.discoveredClues.includes(clue)) {
                this.discoveredClues.push(clue);
              }
            }
          }
        }
      }
    }

    // Remove the event from active events
    this.activeEvents.splice(eventIndex, 1);

    // Resume time if no more active events
    if (this.activeEvents.length === 0 && this.timeService.isPaused()) {
      this.resumeTime();
    }

    return true;
  }

  /**
   * Set current resources
   * @param resources Resource state
   */
  setResources(resources: ResourcesState): void {
    this.resources = { ...resources };
  }

  /**
   * Set current time allocation
   * @param allocation Time allocation
   */
  setTimeAllocation(allocation: WeeklyTimeAllocation): void {
    this.allocation = { ...allocation };
  }

  /**
   * Set active events
   * @param events Active events
   */
  setActiveEvents(events: GameEvent[]): void {
    // Avoid spread operator entirely
    if (Array.isArray(events)) {
      this.activeEvents = events.slice(); // Use slice instead of spread
    } else {
      console.warn('Non-array passed to setActiveEvents:', events);
      this.activeEvents = [];
    }
  }

  /**
   * Set discovered clues
   * @param clues Discovered clues
   */
  setDiscoveredClues(clues: string[]): void {
    if (Array.isArray(clues)) {
      this.discoveredClues = clues.slice();
    } else {
      console.warn('Non-array passed to setDiscoveredClues:', clues);
      this.discoveredClues = [];
    }
  }

  /**
   * Set narrative progress
   * @param progress Narrative progress
   */
  setNarrativeProgress(progress: Record<string, number>): void {
    this.narrativeProgress = { ...progress };
  }

  /**
   * Get current resources
   * @returns Current resources
   */
  getResources(): ResourcesState | null {
    return this.resources ? { ...this.resources } : null;
  }

  /**
   * Get current time allocation
   * @returns Current time allocation
   */
  getTimeAllocation(): WeeklyTimeAllocation | null {
    return this.allocation ? { ...this.allocation } : null;
  }

  /**
   * Get active events
   * @returns Active events
   */
  getActiveEvents(): GameEvent[] {
    // Avoid spread operator entirely
    if (Array.isArray(this.activeEvents)) {
      return this.activeEvents.slice(); // Use slice instead of spread
    } else {
      console.warn('activeEvents is not an array:', this.activeEvents);
      this.activeEvents = []; // Fix the array if it's corrupted
      return [];
    }
  }

  /**
   * Get discovered clues
   * @returns Discovered clues
   */
  getDiscoveredClues(): string[] {
    if (!Array.isArray(this.discoveredClues)) {
      console.warn('discoveredClues is not an array:', this.discoveredClues);
      this.discoveredClues = [];
      return [];
    }
    return this.discoveredClues.slice();
  }

  /**
   * Get narrative progress
   * @returns Narrative progress
   */
  getNarrativeProgress(): Record<string, number> {
    return { ...this.narrativeProgress };
  }

  /**
   * Get current game time
   * @returns Current game time
   */
  getCurrentGameTime(): TimeValue {
    return this.timeService.getCurrentGameTime();
  }

  /**
   * Subscribe to simulation updates
   * @param subscriber Subscriber function
   * @returns Unsubscribe function
   */
  subscribe(subscriber: SimulationSubscriber): () => void {
    this.subscribers.push(subscriber);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Update service configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<GameSimulationConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart tick interval if running
    if (this.isRunning && this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = setInterval(() => {
        this.tick();
      }, this.config.simulationTickRate);
    }
  }

  /**
   * Get service configuration
   * @returns Current configuration
   */
  getConfig(): GameSimulationConfig {
    return { ...this.config };
  }

  /**
   * Get individual services
   * @returns Object containing all services
   */
  getServices(): {
    resourceService: ResourceCalculationService;
    activityService: ActivityImpactService;
    timeService: TimeProgressionService;
    eventService: EventGenerationService;
  } {
    return {
      resourceService: this.resourceService,
      activityService: this.activityService,
      timeService: this.timeService,
      eventService: this.eventService,
    };
  }

  /**
   * Reset all simulation state
   */
  reset(): void {
    this.resources = null;
    this.allocation = null;
    this.activeEvents = [];
    this.discoveredClues = [];
    this.narrativeProgress = {};
    this.lastResourceUpdate = 0;
    this.timeService.reset();

    // Stop and restart if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Notify all subscribers of a simulation update
   * @param update Simulation update
   */
  private notifySubscribers(update: SimulationUpdate): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(update);
      } catch (error) {
        console.error('Error in simulation subscriber:', error);
      }
    }
  }
}
