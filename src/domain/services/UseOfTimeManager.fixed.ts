/**
 * /src/domain/services/UseOfTimeManager.fixed.ts
 *
 * UseOfTimeManager Service - Fixed version with proper type handling
 *
 * Manages time allocation for different activities and calculates resource impacts.
 * This service provides functionality to adjust time allocations, calculate resource
 * impacts, and validate time allocation constraints.
 */

import {
  ActivityType,
  TimeAllocation,
  WeeklyTimeAllocation,
  ResourceImpact,
  DEFAULT_ACTIVITY_IMPACTS,
  createDefaultTimeAllocation,
  calculateResourceImpact,
  calculateStressPenalties,
  validateTimeAllocation,
} from '../models/UseOfTime';

import { TimeManager } from './TimeManager';
import { updateTimeAllocation, updateWeeklyTimeAllocation } from '../utils/typeSafeUpdates';
import {
  createValidTimeAllocation,
  validateWeeklyTimeAllocation,
} from '../utils/validationHelpers';
import { isValidActivityType } from '../utils/enumHelpers';

/**
 * Configuration options for the UseOfTimeManager
 */
export interface UseOfTimeManagerConfig {
  baseSkillCost: number;
  tierScalingFactor: number;
  threadProgressionFactor: number;
  timeManager?: TimeManager;
  initialAllocation?: WeeklyTimeAllocation;
}

/**
 * State maintained by the UseOfTimeManager
 */
export interface UseOfTimeManagerState {
  currentAllocation: WeeklyTimeAllocation;
  resourceImpacts: ResourceImpact;
  stressPenalties: number;
  isValid: boolean;
  validationErrors: string[];
}

/**
 * UseOfTimeManager Service
 *
 * Manages time allocation for different activities and calculates impacts.
 */
export class UseOfTimeManager {
  private config: UseOfTimeManagerConfig;
  private state: UseOfTimeManagerState;

  /**
   * Create a new UseOfTimeManager
   * @param config Configuration options
   */
  constructor(config: UseOfTimeManagerConfig) {
    this.config = { ...config };

    // Initialize with default or provided allocation
    const initialAllocation = config.initialAllocation || createDefaultTimeAllocation();

    // Validate the allocation
    const validationResult = validateWeeklyTimeAllocation(initialAllocation);

    // Calculate resource impacts
    const resourceImpacts = calculateResourceImpact(initialAllocation);
    const stressPenalties = calculateStressPenalties(initialAllocation);

    // Set initial state
    this.state = {
      currentAllocation: initialAllocation,
      resourceImpacts,
      stressPenalties,
      isValid: validationResult.isValid,
      validationErrors: validationResult.errors,
    };
  }

  /**
   * Get the current manager state
   * @returns Current manager state
   */
  getState(): UseOfTimeManagerState {
    return { ...this.state };
  }

  /**
   * Update time allocation for a specific activity
   * @param activityType Activity to update
   * @param hoursPerDay New hours per day for the activity
   * @returns Updated manager state
   */
  updateAllocation(activityType: ActivityType, hoursPerDay: number): UseOfTimeManagerState {
    // Validate activity type
    if (!isValidActivityType(activityType)) {
      throw new Error(`Invalid activity type: ${activityType}`);
    }

    // Update allocation using immutable update
    const updatedAllocation = updateWeeklyTimeAllocation(
      this.state.currentAllocation,
      activityType,
      hoursPerDay
    );

    // Validate the updated allocation
    const validationResult = validateWeeklyTimeAllocation(updatedAllocation);

    // Calculate resource impacts
    const resourceImpacts = calculateResourceImpact(updatedAllocation);
    const stressPenalties = calculateStressPenalties(updatedAllocation);

    // Update state
    this.state = {
      currentAllocation: updatedAllocation,
      resourceImpacts,
      stressPenalties,
      isValid: validationResult.isValid,
      validationErrors: validationResult.errors,
    };

    return { ...this.state };
  }

  /**
   * Reset time allocation to default
   * @returns Updated manager state
   */
  resetToDefault(): UseOfTimeManagerState {
    // Create default allocation
    const defaultAllocation = createDefaultTimeAllocation();

    // Calculate resource impacts
    const resourceImpacts = calculateResourceImpact(defaultAllocation);
    const stressPenalties = calculateStressPenalties(defaultAllocation);

    // Reset to default
    this.state = {
      currentAllocation: defaultAllocation,
      resourceImpacts,
      stressPenalties,
      isValid: true,
      validationErrors: [],
    };

    return { ...this.state };
  }

  /**
   * Calculate resource impacts based on current allocation
   * @returns Resource impacts
   */
  calculateResourceImpact(): ResourceImpact {
    return calculateResourceImpact(this.state.currentAllocation);
  }

  /**
   * Calculate resource impacts for a specific time period
   * @param hours Number of game hours to calculate impacts for
   * @returns Resource impacts scaled to the time period
   */
  calculateHourlyResourceImpact(hours: number): ResourceImpact {
    const weeklyImpact = this.calculateResourceImpact();
    const hourlyRate = 1 / 168; // 1 hour / 168 hours in a week

    // Scale weekly impact to specified hours
    return {
      knowledge: weeklyImpact.knowledge * hourlyRate * hours,
      money: weeklyImpact.money * hourlyRate * hours,
      social: weeklyImpact.social * hourlyRate * hours,
      energy: weeklyImpact.energy * hourlyRate * hours,
      stress: weeklyImpact.stress * hourlyRate * hours,
    };
  }

  /**
   * Calculate stress penalties from current allocation
   * @returns Stress penalties
   */
  calculateStressPenalties(): number {
    return calculateStressPenalties(this.state.currentAllocation);
  }

  /**
   * Calculate the cost of a skill based on tier and thread progression
   * @param baseSkillCost Base cost in skill points
   * @param tier Skill tier (1-3)
   * @param previousSkillsInThread Number of skills already acquired in thread
   * @param threadName Name of the thread (for logging)
   * @returns Calculated skill cost
   */
  calculateSkillCost(
    baseSkillCost: number,
    tier: number,
    previousSkillsInThread: number,
    threadName: string
  ): number {
    // Apply exponential scaling based on tier
    const tierMultiplier = Math.pow(this.config.tierScalingFactor, tier - 1);

    // Apply additional scaling based on how many skills already acquired
    const progressionScaling = 1 + previousSkillsInThread * this.config.threadProgressionFactor;

    // Calculate final cost
    return Math.floor(baseSkillCost * tierMultiplier * progressionScaling);
  }
}
