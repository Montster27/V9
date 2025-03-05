/**
 * /src/domain/services/simulation/ResourceCalculationService.ts
 *
 * Service for calculating resource changes over time
 * Handles all resource-related calculations based on activities and elapsed time
 */

import {
  ResourcesState,
  ResourceValue,
  ResourceImpact,
  calculateResourceChanges,
} from '../../models/Resource';
import { SkillPointsValue } from '../../models/Resource';
import { WeeklyTimeAllocation } from '../../models/UseOfTime';

/**
 * Configuration options for ResourceCalculationService
 */
export interface ResourceCalculationConfig {
  baseEnergyRegen: number; // Base energy regeneration per hour of rest
  baseStressAccumulation: number; // Base stress accumulation per active hour
  baseStressRecovery: number; // Base stress recovery per hour of rest
  skillPointsPerHour: number; // Skill points generated per game hour
  knowledgePerStudyHour: number; // Knowledge points per hour of study
  moneyPerWorkHour: number; // Money earned per hour of work
  socialPerSocialHour: number; // Social points per hour of social activity
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ResourceCalculationConfig = {
  baseEnergyRegen: 5,
  baseStressAccumulation: 1,
  baseStressRecovery: 2,
  skillPointsPerHour: 1,
  knowledgePerStudyHour: 5,
  moneyPerWorkHour: 3,
  socialPerSocialHour: 3,
};

/**
 * Service for calculating resource changes
 */
export class ResourceCalculationService {
  private config: ResourceCalculationConfig;

  /**
   * Create a new ResourceCalculationService
   * @param config Configuration options (optional)
   */
  constructor(config: Partial<ResourceCalculationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate resource changes based on elapsed time and current allocation
   * @param currentResources Current resource state
   * @param timeAllocation Current time allocation
   * @param elapsedHours Elapsed game hours
   * @returns Updated resource state
   */
  calculateResourceChanges(
    currentResources: ResourcesState,
    timeAllocation: WeeklyTimeAllocation,
    elapsedHours: number
  ): ResourcesState {
    // Calculate impact based on time allocation
    const impact = this.calculateResourceImpact(timeAllocation);

    // Apply changes using domain calculation function
    return calculateResourceChanges(currentResources, impact, elapsedHours);
  }

  /**
   * Calculate resource impact based on time allocation
   * @param timeAllocation Current time allocation
   * @returns Resource impact values
   */
  calculateResourceImpact(timeAllocation: WeeklyTimeAllocation): ResourceImpact {
    const allocations = timeAllocation.allocations;

    // Calculate impact from each activity type
    const impact: ResourceImpact = {
      energy: this.calculateEnergyImpact(allocations),
      stress: this.calculateStressImpact(allocations),
      knowledge: this.calculateKnowledgeGain(allocations),
      money: this.calculateMoneyGain(allocations),
      social: this.calculateSocialGain(allocations),
      health: this.calculateHealthImpact(allocations),
      belonging: this.calculateBelongingImpact(allocations),
    };

    return impact;
  }

  /**
   * Calculate energy impact from time allocation
   * @param allocations Activity allocations
   * @returns Energy change per hour
   */
  private calculateEnergyImpact(allocations: Record<string, number>): number {
    // Energy consumption from active hours
    const activeEnergyDrain =
      (allocations.study || 0) * -5 +
      (allocations.work || 0) * -8 +
      (allocations.exercise || 0) * -10 +
      (allocations.social || 0) * -3;

    // Energy regeneration from rest
    const restEnergyRegen = (allocations.rest || 0) * this.config.baseEnergyRegen;

    // Net energy change per hour
    return activeEnergyDrain + restEnergyRegen;
  }

  /**
   * Calculate stress impact from time allocation
   * @param allocations Activity allocations
   * @returns Stress change per hour
   */
  private calculateStressImpact(allocations: Record<string, number>): number {
    // Stress accumulation from active hours
    const activeStressGain =
      ((allocations.study || 0) + (allocations.work || 0)) * this.config.baseStressAccumulation;

    // Stress reduction from rest and relaxation
    const stressReduction =
      (allocations.rest || 0) * this.config.baseStressRecovery +
      (allocations.social || 0) * (this.config.baseStressRecovery / 2);

    // Net stress change per hour
    return activeStressGain - stressReduction;
  }

  /**
   * Calculate knowledge gain from time allocation
   * @param allocations Activity allocations
   * @returns Knowledge points per hour
   */
  private calculateKnowledgeGain(allocations: Record<string, number>): number {
    return (allocations.study || 0) * this.config.knowledgePerStudyHour;
  }

  /**
   * Calculate money gain from time allocation
   * @param allocations Activity allocations
   * @returns Money earned per hour
   */
  private calculateMoneyGain(allocations: Record<string, number>): number {
    return (allocations.work || 0) * this.config.moneyPerWorkHour;
  }

  /**
   * Calculate social gain from time allocation
   * @param allocations Activity allocations
   * @returns Social points per hour
   */
  private calculateSocialGain(allocations: Record<string, number>): number {
    return (allocations.social || 0) * this.config.socialPerSocialHour;
  }

  /**
   * Calculate health impact from time allocation
   * @param allocations Activity allocations
   * @returns Health change per hour
   */
  private calculateHealthImpact(allocations: Record<string, number>): number {
    // Health benefits from exercise
    const exerciseBonus = (allocations.exercise || 0) * 2;

    // Health penalties from insufficient rest
    const restDeficit = Math.max(0, 8 - (allocations.rest || 0));
    const restPenalty = restDeficit * -0.5;

    // Net health change per hour
    return exerciseBonus + restPenalty;
  }

  /**
   * Calculate belonging impact from time allocation
   * @param allocations Activity allocations
   * @returns Belonging change per hour
   */
  private calculateBelongingImpact(allocations: Record<string, number>): number {
    // Belonging benefits from social activities
    const socialBonus = (allocations.social || 0) * 1.5;

    // Belonging decay from isolation (if very low social hours)
    const socialDeficit = Math.max(0, 2 - (allocations.social || 0));
    const isolationPenalty = socialDeficit * -0.3;

    // Net belonging change per hour
    return socialBonus + isolationPenalty;
  }

  /**
   * Calculate skill points generation
   * @param elapsedHours Elapsed game hours
   * @returns Generated skill points
   */
  calculateSkillPointsGeneration(
    currentSkillPoints: SkillPointsValue,
    elapsedHours: number
  ): SkillPointsValue {
    // Calculate generated points
    const pointsToGenerate = Math.floor(elapsedHours * this.config.skillPointsPerHour);

    // Update skill points
    return {
      current: currentSkillPoints.current + pointsToGenerate,
      generated: currentSkillPoints.generated + pointsToGenerate,
      spent: currentSkillPoints.spent,
      trend: 'increasing',
    };
  }

  /**
   * Get service configuration
   * @returns Current configuration
   */
  getConfig(): ResourceCalculationConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<ResourceCalculationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
