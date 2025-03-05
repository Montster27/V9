/**
 * /src/domain/services/simulation/ActivityImpactService.ts
 *
 * Service for calculating activity impacts on resources
 * Determines how different activities affect player resources
 */

import { ResourceImpact } from '../../models/Resource';
import { ActivityType } from '../../models/UseOfTime';

/**
 * Interface for activity definitions
 */
export interface ActivityDefinition {
  type: ActivityType;
  name: string;
  energyCost: number;
  stressChange: number;
  moneyChange: number;
  knowledgeChange: number;
  socialChange: number;
  healthChange: number;
  belongingChange: number;
  description: string;
  unlockRequirements?: {
    skills?: Record<string, number>;
    resources?: Record<string, number>;
  };
}

/**
 * Configuration for ActivityImpactService
 */
export interface ActivityImpactConfig {
  efficiencyFloor: number; // Minimum efficiency multiplier (0-1)
  highStressPenalty: number; // Efficiency penalty for high stress (0-1)
  lowEnergyPenalty: number; // Efficiency penalty for low energy (0-1)
  skillBonus: number; // Maximum bonus from skills (0-1)
}

/**
 * Default activity impact config
 */
const DEFAULT_CONFIG: ActivityImpactConfig = {
  efficiencyFloor: 0.5, // Minimum 50% efficiency
  highStressPenalty: 0.3, // Up to 30% penalty for high stress
  lowEnergyPenalty: 0.4, // Up to 40% penalty for low energy
  skillBonus: 0.5, // Up to 50% bonus from skills
};

/**
 * Default activity definitions
 */
const DEFAULT_ACTIVITIES: ActivityDefinition[] = [
  {
    type: 'study',
    name: 'Study',
    energyCost: 5,
    stressChange: 1,
    moneyChange: 0,
    knowledgeChange: 5,
    socialChange: 0,
    healthChange: -0.1,
    belongingChange: 0,
    description: 'Build academic knowledge',
  },
  {
    type: 'work',
    name: 'Work',
    energyCost: 8,
    stressChange: 1.5,
    moneyChange: 3,
    knowledgeChange: 1,
    socialChange: 0.5,
    healthChange: -0.2,
    belongingChange: 0.2,
    description: 'Earn money and career experience',
  },
  {
    type: 'social',
    name: 'Socialize',
    energyCost: 3,
    stressChange: -1,
    moneyChange: -1,
    knowledgeChange: 0.5,
    socialChange: 3,
    healthChange: 0.1,
    belongingChange: 1.5,
    description: 'Build relationships and connections',
  },
  {
    type: 'exercise',
    name: 'Exercise',
    energyCost: 10,
    stressChange: -2,
    moneyChange: -0.5,
    knowledgeChange: 0,
    socialChange: 0.5,
    healthChange: 2,
    belongingChange: 0.3,
    description: 'Improve health and reduce stress',
  },
  {
    type: 'rest',
    name: 'Rest',
    energyCost: -5, // Negative cost means regeneration
    stressChange: -2,
    moneyChange: 0,
    knowledgeChange: 0,
    socialChange: 0,
    healthChange: 1,
    belongingChange: 0.1,
    description: 'Recover energy and reduce stress',
  },
];

/**
 * Service for calculating activity impacts
 */
export class ActivityImpactService {
  private config: ActivityImpactConfig;
  private activities: Map<ActivityType, ActivityDefinition>;

  /**
   * Create a new ActivityImpactService
   * @param config Configuration options
   * @param activities Custom activity definitions
   */
  constructor(config: Partial<ActivityImpactConfig> = {}, activities: ActivityDefinition[] = []) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize activity map
    this.activities = new Map();

    // Add default activities
    DEFAULT_ACTIVITIES.forEach((activity) => {
      this.activities.set(activity.type, { ...activity });
    });

    // Add or override with custom activities
    activities.forEach((activity) => {
      this.activities.set(activity.type, { ...activity });
    });
  }

  /**
   * Calculate activity efficiency based on player state
   * @param activityType Type of activity
   * @param energyLevel Current energy level (0-100)
   * @param stressLevel Current stress level (0-100)
   * @param skillLevels Relevant skill levels
   * @returns Efficiency multiplier (0-1.5)
   */
  calculateEfficiency(
    activityType: ActivityType,
    energyLevel: number,
    stressLevel: number,
    skillLevels: Record<string, number> = {}
  ): number {
    // Base efficiency
    let efficiency = 1.0;

    // Apply energy penalty
    if (energyLevel < 50) {
      const energyPenalty = this.config.lowEnergyPenalty * ((50 - energyLevel) / 50);
      efficiency -= energyPenalty;
    }

    // Apply stress penalty
    if (stressLevel > 50) {
      const stressPenalty = this.config.highStressPenalty * ((stressLevel - 50) / 50);
      efficiency -= stressPenalty;
    }

    // Apply skill bonus (simplified calculation)
    const totalSkillLevel = Object.values(skillLevels).reduce((sum, level) => sum + level, 0);
    const skillBonus = Math.min(this.config.skillBonus, totalSkillLevel / 100);
    efficiency += skillBonus;

    // Ensure efficiency doesn't go below minimum
    return Math.max(this.config.efficiencyFloor, efficiency);
  }

  /**
   * Calculate resource impact for a specific activity
   * @param activityType Type of activity
   * @param duration Duration in hours
   * @param efficiency Efficiency multiplier (0-1.5)
   * @returns Resource impact
   */
  calculateActivityImpact(
    activityType: ActivityType,
    duration: number,
    efficiency: number = 1.0
  ): ResourceImpact {
    // Get activity definition
    const activity = this.activities.get(activityType);

    if (!activity) {
      throw new Error(`Unknown activity type: ${activityType}`);
    }

    // Calculate impacts with efficiency
    const impact: ResourceImpact = {
      energy: activity.energyCost,
      stress: activity.stressChange,
      // Apply efficiency to gains only (not costs)
      knowledge: activity.knowledgeChange * (activity.knowledgeChange > 0 ? efficiency : 1),
      money: activity.moneyChange * (activity.moneyChange > 0 ? efficiency : 1),
      social: activity.socialChange * (activity.socialChange > 0 ? efficiency : 1),
      health: activity.healthChange,
      belonging: activity.belongingChange,
    };

    return impact;
  }

  /**
   * Get full impact for an activity over time
   * @param activityType Type of activity
   * @param duration Duration in hours
   * @param energyLevel Current energy level
   * @param stressLevel Current stress level
   * @param skillLevels Relevant skill levels
   * @returns Total resource impact
   */
  getActivityImpact(
    activityType: ActivityType,
    duration: number,
    energyLevel: number,
    stressLevel: number,
    skillLevels: Record<string, number> = {}
  ): ResourceImpact {
    // Calculate efficiency
    const efficiency = this.calculateEfficiency(
      activityType,
      energyLevel,
      stressLevel,
      skillLevels
    );

    // Get base impact for one hour
    const hourlyImpact = this.calculateActivityImpact(activityType, 1, efficiency);

    // Scale impact by duration
    const totalImpact: ResourceImpact = {
      energy: hourlyImpact.energy * duration,
      stress: hourlyImpact.stress * duration,
      knowledge: hourlyImpact.knowledge * duration,
      money: hourlyImpact.money * duration,
      social: hourlyImpact.social * duration,
      health: hourlyImpact.health ? hourlyImpact.health * duration : 0,
      belonging: hourlyImpact.belonging ? hourlyImpact.belonging * duration : 0,
    };

    return totalImpact;
  }

  /**
   * Get all available activities
   * @returns Array of activity definitions
   */
  getActivities(): ActivityDefinition[] {
    return Array.from(this.activities.values());
  }

  /**
   * Get a specific activity definition
   * @param activityType Type of activity
   * @returns Activity definition
   */
  getActivity(activityType: ActivityType): ActivityDefinition | undefined {
    return this.activities.get(activityType);
  }

  /**
   * Get service configuration
   * @returns Current configuration
   */
  getConfig(): ActivityImpactConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<ActivityImpactConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add or update an activity definition
   * @param activity Activity definition
   */
  setActivity(activity: ActivityDefinition): void {
    this.activities.set(activity.type, { ...activity });
  }
}
