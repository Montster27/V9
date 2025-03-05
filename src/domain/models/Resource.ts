/**
 * /src/domain/models/Resource.ts
 *
 * Standardized model for game resources
 * Defines the data structures for all resource types in the game
 */

/**
 * Base resource value with current and maximum levels
 */
export interface ResourceValue {
  readonly current: number;
  readonly max: number;
  readonly trend?: 'increasing' | 'decreasing' | 'stable';
  readonly rate?: 'slow' | 'moderate' | 'fast';
}

/**
 * Skill points resource with tracking of generated and spent points
 */
export interface SkillPointsValue {
  readonly current: number;
  readonly generated: number;
  readonly spent: number;
  readonly trend?: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Complete resource state for the game
 */
export interface ResourcesState {
  readonly energy: ResourceValue;
  readonly stress: ResourceValue;
  readonly health: ResourceValue;
  readonly belonging: ResourceValue;
  readonly knowledge: number;
  readonly money: number;
  readonly social: number;
  readonly skillPoints: SkillPointsValue;
  readonly lastUpdated: number;
}

/**
 * Resource impact from activities
 * Represents how activities affect different resources
 */
export interface ResourceImpact {
  readonly knowledge: number;
  readonly money: number;
  readonly social: number;
  readonly energy: number;
  readonly stress: number;
  readonly health?: number;
  readonly belonging?: number;
}

/**
 * Create a default resources state with initial values
 * @returns A new ResourcesState object with default values
 */
export function createDefaultResourcesState(): ResourcesState {
  return {
    energy: {
      current: 75,
      max: 100,
      trend: 'stable',
      rate: 'slow',
    },
    stress: {
      current: 30,
      max: 100,
      trend: 'stable',
      rate: 'slow',
    },
    health: {
      current: 85,
      max: 100,
      trend: 'stable',
      rate: 'slow',
    },
    belonging: {
      current: 60,
      max: 100,
      trend: 'stable',
      rate: 'slow',
    },
    knowledge: 1250,
    money: 2300,
    social: 850,
    skillPoints: {
      current: 45,
      generated: 120,
      spent: 75,
      trend: 'increasing',
    },
    lastUpdated: Date.now(),
  };
}

/**
 * Calculate resource changes over time
 *
 * @param current Current resource state
 * @param impact Impact factors to apply
 * @param elapsedTime Time elapsed in game hours
 * @returns Updated resource state
 */
export function calculateResourceChanges(
  current: ResourcesState,
  impact: ResourceImpact,
  elapsedTime: number
): ResourcesState {
  // Calculate new values
  const newKnowledge = current.knowledge + impact.knowledge * elapsedTime;
  const newMoney = current.money + impact.money * elapsedTime;
  const newSocial = current.social + impact.social * elapsedTime;

  // Calculate energy changes with bounds checking
  const newEnergyCurrent = Math.max(
    0,
    Math.min(current.energy.max, current.energy.current + impact.energy * elapsedTime)
  );

  // Calculate stress changes with bounds checking
  const newStressCurrent = Math.max(
    0,
    Math.min(current.stress.max, current.stress.current + impact.stress * elapsedTime)
  );

  // Calculate health changes if provided
  const newHealthCurrent =
    impact.health !== undefined
      ? Math.max(
          0,
          Math.min(current.health.max, current.health.current + impact.health * elapsedTime)
        )
      : current.health.current;

  // Calculate belonging changes if provided
  const newBelongingCurrent =
    impact.belonging !== undefined
      ? Math.max(
          0,
          Math.min(
            current.belonging.max,
            current.belonging.current + impact.belonging * elapsedTime
          )
        )
      : current.belonging.current;

  // Determine trends
  const energyTrend = determineResourceTrend(current.energy.current, newEnergyCurrent);
  const stressTrend = determineResourceTrend(current.stress.current, newStressCurrent);
  const healthTrend = determineResourceTrend(current.health.current, newHealthCurrent);
  const belongingTrend = determineResourceTrend(current.belonging.current, newBelongingCurrent);

  // Return updated state
  return {
    energy: {
      ...current.energy,
      current: newEnergyCurrent,
      trend: energyTrend,
    },
    stress: {
      ...current.stress,
      current: newStressCurrent,
      trend: stressTrend,
    },
    health: {
      ...current.health,
      current: newHealthCurrent,
      trend: healthTrend,
    },
    belonging: {
      ...current.belonging,
      current: newBelongingCurrent,
      trend: belongingTrend,
    },
    knowledge: newKnowledge,
    money: newMoney,
    social: newSocial,
    skillPoints: current.skillPoints, // No changes to skill points in this calculation
    lastUpdated: Date.now(),
  };
}

/**
 * Determine the trend of a resource based on previous and current values
 *
 * @param previous Previous resource value
 * @param current Current resource value
 * @returns Trend direction: 'increasing', 'decreasing', or 'stable'
 */
function determineResourceTrend(
  previous: number,
  current: number
): 'increasing' | 'decreasing' | 'stable' {
  const difference = current - previous;

  if (difference > 0.001) {
    // Small threshold to account for floating point errors
    return 'increasing';
  } else if (difference < -0.001) {
    return 'decreasing';
  } else {
    return 'stable';
  }
}
