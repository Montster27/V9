/**
 * /src/domain/services/UseOfTimeManager.ts
 * 
 * UseOfTimeManager Service
 * 
 * Manages weekly time allocation, resource calculations, and skill point costs
 * for the Middle Age Multiverse game. This service provides methods to distribute
 * time across different activities, calculate resource impacts, and handle the
 * interaction between time allocation and game progression.
 */

import { TimeManager, TimeEventType, TimeEventData } from './TimeManager';
import { 
  ActivityType, 
  WeeklyTimeAllocation, 
  TimeAllocation, 
  ResourceImpact,
  createDefaultTimeAllocation,
  adjustTimeAllocation,
  calculateResourceImpact,
  calculateStressPenalties,
  validateTimeAllocation,
} from '../models/UseOfTime';

/**
 * Event types emitted by the UseOfTimeManager
 */
export enum UseOfTimeEventType {
  ALLOCATION_CHANGED = 'allocation_changed',
  RESOURCE_IMPACT_CALCULATED = 'resource_impact_calculated',
  SKILL_COST_CALCULATED = 'skill_cost_calculated',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Configuration options for the UseOfTimeManager
 */
export interface UseOfTimeManagerConfig {
  /** Time Manager instance to connect with */
  timeManager?: TimeManager;
  /** Initial time allocation */
  initialAllocation?: WeeklyTimeAllocation;
  /** Base skill point cost for tier 1 skills */
  baseSkillCost?: number;
  /** Scaling factor for skill costs based on tier */
  tierScalingFactor?: number;
  /** Additional scaling factor per skill already acquired in thread */
  threadProgressionFactor?: number;
}

/**
 * UseOfTimeManager state representation
 */
export interface UseOfTimeManagerState {
  /** Current time allocation */
  currentAllocation: WeeklyTimeAllocation;
  /** Currently calculated resource impacts */
  resourceImpacts: ResourceImpact;
  /** Additional stress from penalties */
  stressPenalties: number;
  /** Is the time allocation valid? */
  isValid: boolean;
  /** Validation errors (if any) */
  validationErrors: string[];
  /** Last time the allocation was updated */
  lastUpdated: number;
}

/**
 * Interface for UseOfTimeManager event listeners
 */
export interface UseOfTimeEventData {
  state: UseOfTimeManagerState;
  activityType?: ActivityType;
  skillId?: string;
  skillTier?: number;
  skillThreadName?: string;
  skillCost?: number;
  error?: string;
}

/**
 * UseOfTimeManager handles weekly time allocation, resource calculations,
 * and skill point costs for activities.
 */
export class UseOfTimeManager {
  private config: UseOfTimeManagerConfig;
  private state: UseOfTimeManagerState;
  private timeManager?: TimeManager;
  private eventListeners: Map<UseOfTimeEventType, Array<(data: UseOfTimeEventData) => void>>;

  /**
   * Creates a new UseOfTimeManager instance
   * @param config Configuration options
   */
  constructor(config?: Partial<UseOfTimeManagerConfig>) {
    // Set default configuration
    this.config = {
      baseSkillCost: 10,
      tierScalingFactor: 2,
      threadProgressionFactor: 0.1,
      ...config
    };

    // Initialize time manager connection if provided
    this.timeManager = config?.timeManager;

    // Initialize event listeners
    this.eventListeners = new Map();
    Object.values(UseOfTimeEventType).forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });

    // Create initial allocation or use provided one
    const initialAllocation = config?.initialAllocation || createDefaultTimeAllocation();
    const validation = validateTimeAllocation(initialAllocation);
    
    // Calculate initial resource impacts
    const resourceImpacts = calculateResourceImpact(initialAllocation);
    const stressPenalties = calculateStressPenalties(initialAllocation);

    // Initialize state
    this.state = {
      currentAllocation: initialAllocation,
      resourceImpacts: resourceImpacts,
      stressPenalties: stressPenalties,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      lastUpdated: Date.now(),
    };

    // Connect to time manager events if available
    if (this.timeManager) {
      this.connectToTimeManager();
    }
  }

  /**
   * Connect to TimeManager events for continuous updates
   */
  private connectToTimeManager(): void {
    if (!this.timeManager) return;

    // Listen for hour changes to update continuous resource impacts
    this.timeManager.addEventListener(
      TimeEventType.HOUR_CHANGED,
      this.handleTimeChanged.bind(this)
    );

    // Listen for day changes to apply daily effects
    this.timeManager.addEventListener(
      TimeEventType.DAY_CHANGED,
      this.handleDayChanged.bind(this)
    );
  }

  /**
   * Handle time change events from TimeManager
   * @param data Time event data
   */
  private handleTimeChanged(data: TimeEventData): void {
    // Update resource impacts based on time elapsed
    this.calculateHourlyResourceImpact(data.elapsedGameHours);
  }

  /**
   * Handle day change events from TimeManager
   * @param data Time event data
   */
  private handleDayChanged(data: TimeEventData): void {
    // Nothing specific to do yet on day changes
    // Future implementation could handle daily resets or special events
  }

  /**
   * Calculate resource impacts for a specific number of elapsed hours
   * @param elapsedHours Number of game hours elapsed
   * @returns Calculated resource impact for the elapsed time
   */
  public calculateHourlyResourceImpact(elapsedHours: number): ResourceImpact {
    // Calculate the proportion of a week this represents
    const weekProportion = elapsedHours / (24 * 7);
    
    // Scale the weekly impact by this proportion
    const weeklyImpact = this.state.resourceImpacts;
    const scaledImpact: ResourceImpact = {
      knowledge: weeklyImpact.knowledge * weekProportion,
      money: weeklyImpact.money * weekProportion,
      social: weeklyImpact.social * weekProportion,
      energy: weeklyImpact.energy * weekProportion,
      stress: weeklyImpact.stress * weekProportion + (this.state.stressPenalties * weekProportion),
    };
    
    // Emit resource impact calculated event
    this.emitEvent(UseOfTimeEventType.RESOURCE_IMPACT_CALCULATED, {
      state: this.getState(),
    });
    
    return scaledImpact;
  }

  /**
   * Update time allocation for a specific activity
   * @param activityType Activity to adjust
   * @param hoursPerDay New hours per day for the activity
   * @returns Updated state
   */
  public updateAllocation(
    activityType: ActivityType,
    hoursPerDay: number
  ): UseOfTimeManagerState {
    try {
      // Validate input
      if (hoursPerDay < 0 || hoursPerDay > 24) {
        throw new Error(`Hours per day must be between 0 and 24, got ${hoursPerDay}`);
      }

      // Update allocation
      const newAllocation = adjustTimeAllocation(
        this.state.currentAllocation,
        activityType,
        hoursPerDay
      );

      // Validate the updated allocation
      const validation = validateTimeAllocation(newAllocation);

      // Calculate new resource impacts
      const resourceImpacts = calculateResourceImpact(newAllocation);
      const stressPenalties = calculateStressPenalties(newAllocation);

      // Update state
      this.state = {
        currentAllocation: newAllocation,
        resourceImpacts: resourceImpacts,
        stressPenalties: stressPenalties,
        isValid: validation.isValid,
        validationErrors: validation.errors,
        lastUpdated: Date.now(),
      };

      // Emit allocation changed event
      this.emitEvent(UseOfTimeEventType.ALLOCATION_CHANGED, {
        state: this.getState(),
        activityType,
      });

      return { ...this.state };
    } catch (error) {
      // Log and emit error
      console.error("Error updating allocation:", error);
      this.emitEvent(UseOfTimeEventType.ERROR_OCCURRED, {
        state: this.getState(),
        activityType,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return { ...this.state };
    }
  }

  /**
   * Reset all time allocations to a balanced default
   * @returns Updated state
   */
  public resetToDefault(): UseOfTimeManagerState {
    const defaultAllocation = createDefaultTimeAllocation();
    const validation = validateTimeAllocation(defaultAllocation);
    const resourceImpacts = calculateResourceImpact(defaultAllocation);
    const stressPenalties = calculateStressPenalties(defaultAllocation);

    this.state = {
      currentAllocation: defaultAllocation,
      resourceImpacts: resourceImpacts,
      stressPenalties: stressPenalties,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      lastUpdated: Date.now(),
    };

    // Emit allocation changed event
    this.emitEvent(UseOfTimeEventType.ALLOCATION_CHANGED, {
      state: this.getState(),
    });

    return { ...this.state };
  }

  /**
   * Calculate skill point cost based on tier and thread progression
   * @param baseSkillCost Base cost of the skill
   * @param tier Skill tier (1-3)
   * @param previousSkillsInThread Number of skills already acquired in the thread
   * @returns Calculated skill cost
   */
  public calculateSkillCost(
    baseSkillCost: number,
    tier: number,
    previousSkillsInThread: number,
    threadName: string
  ): number {
    // Apply exponential scaling based on tier
    const tierMultiplier = Math.pow(
      this.config.tierScalingFactor || 2, 
      tier - 1
    ); // 1x for tier 1, 2x for tier 2, 4x for tier 3
    
    // Apply additional scaling based on how many skills already acquired
    const progressionScaling = 1 + (
      previousSkillsInThread * (this.config.threadProgressionFactor || 0.1)
    ); 
    
    // Calculate final cost
    const cost = Math.floor(baseSkillCost * tierMultiplier * progressionScaling);
    
    // Emit skill cost calculated event
    this.emitEvent(UseOfTimeEventType.SKILL_COST_CALCULATED, {
      state: this.getState(),
      skillTier: tier,
      skillThreadName: threadName,
      skillCost: cost,
    });
    
    return cost;
  }

  /**
   * Calculate total weekly resource impacts from current allocation
   * @returns Current weekly resource impacts
   */
  public getWeeklyResourceImpacts(): ResourceImpact & { totalStress: number } {
    const impacts = this.state.resourceImpacts;
    return {
      ...impacts,
      totalStress: impacts.stress + this.state.stressPenalties,
    };
  }

  /**
   * Add an event listener
   * @param eventType Event type to listen for
   * @param callback Callback function to execute when event occurs
   */
  public addEventListener(
    eventType: UseOfTimeEventType, 
    callback: (data: UseOfTimeEventData) => void
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
    eventType: UseOfTimeEventType, 
    callback: (data: UseOfTimeEventData) => void
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
  private emitEvent(eventType: UseOfTimeEventType, data: UseOfTimeEventData): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in UseOfTimeManager event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get the current state
   * @returns Current UseOfTimeManager state
   */
  public getState(): UseOfTimeManagerState {
    return { ...this.state };
  }

  /**
   * Set the time manager instance to connect with
   * @param timeManager TimeManager instance
   */
  public setTimeManager(timeManager: TimeManager): void {
    this.timeManager = timeManager;
    this.connectToTimeManager();
  }

  /**
   * Get allocation for a specific activity
   * @param activityType Activity type
   * @returns Time allocation for the activity
   */
  public getAllocationForActivity(activityType: ActivityType): TimeAllocation {
    return { ...this.state.currentAllocation.allocations[activityType] };
  }

  /**
   * Get all current time allocations
   * @returns Current weekly time allocation
   */
  public getCurrentAllocation(): WeeklyTimeAllocation {
    return { ...this.state.currentAllocation };
  }
}