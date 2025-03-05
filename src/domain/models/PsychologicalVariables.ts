/**
 * /src/domain/models/PsychologicalVariables.ts
 *
 * Models for the psychological variables system
 * Includes energy, stress, belonging, and health states and modifiers
 */

/**
 * Energy state tracking
 */
export interface EnergyState {
  readonly current: number; // Current energy level
  readonly max: number; // Maximum energy (affected by stress)
  readonly regen: number; // Regeneration rate
  readonly lastUpdate: number; // Timestamp of last update
}

/**
 * Modifiers that affect energy values
 */
export interface EnergyModifiers {
  readonly stressImpact: number; // Reduction in max energy from stress
  readonly use_of_timeDrain: number; // Current drain rate from use_of_time allocations
  readonly regenModifier: number; // Modifier to base regeneration
}

/**
 * Belonging (social connection) state tracking
 */
export interface BelongingState {
  readonly current: number; // Current belonging level
  readonly connections: number; // Number of active social connections
  readonly community: number; // Involvement in community activities
  readonly lastUpdate: number; // Timestamp of last update
}

/**
 * Modifiers that affect belonging values
 */
export interface BelongingModifiers {
  readonly socialImpact: number; // Effect of social activities
  readonly isolationPenalty: number; // Reduction due to isolation
  readonly communityBonus: number; // Bonus from community participation
}

/**
 * Health state tracking (physical and mental)
 */
export interface HealthState {
  readonly current: number; // Current health level
  readonly physical: number; // Physical health component
  readonly mental: number; // Mental health component
  readonly lastUpdate: number; // Timestamp of last update
}

/**
 * Modifiers that affect health values
 */
export interface HealthModifiers {
  readonly exerciseBonus: number; // Impact of regular exercise
  readonly restQuality: number; // Impact of sleep quality
  readonly stressImpact: number; // Reduction due to chronic stress
  readonly nutritionFactor: number; // Impact of nutrition choices
}

/**
 * Stress state tracking
 */
export interface StressState {
  readonly current: number; // Current stress level
  readonly accumulation: number; // Rate of stress increase
  readonly recovery: number; // Rate of stress decrease
  readonly lastUpdate: number; // Timestamp of last update
}

/**
 * Types of stress in the game
 */
export enum StressType {
  ACADEMIC = 'academic',
  FINANCIAL = 'financial',
  SOCIAL = 'social',
  PHYSICAL = 'physical',
  TIME = 'time',
}

/**
 * A source of stress with magnitude and duration
 */
export interface StressSource {
  readonly type: StressType;
  readonly magnitude: number;
  readonly duration: number;
}

/**
 * Creates a default energy state
 * @returns A new EnergyState with default values
 */
export function createDefaultEnergyState(): EnergyState {
  return {
    current: 75,
    max: 100,
    regen: 5,
    lastUpdate: Date.now(),
  };
}

/**
 * Creates default energy modifiers
 * @returns A new EnergyModifiers with default values
 */
export function createDefaultEnergyModifiers(): EnergyModifiers {
  return {
    stressImpact: 0,
    use_of_timeDrain: 0,
    regenModifier: 1,
  };
}

/**
 * Creates a default stress state
 * @returns A new StressState with default values
 */
export function createDefaultStressState(): StressState {
  return {
    current: 30,
    accumulation: 1,
    recovery: 2,
    lastUpdate: Date.now(),
  };
}

/**
 * Creates a default belonging state
 * @returns A new BelongingState with default values
 */
export function createDefaultBelongingState(): BelongingState {
  return {
    current: 60,
    connections: 5,
    community: 3,
    lastUpdate: Date.now(),
  };
}

/**
 * Creates a default health state
 * @returns A new HealthState with default values
 */
export function createDefaultHealthState(): HealthState {
  return {
    current: 85,
    physical: 80,
    mental: 90,
    lastUpdate: Date.now(),
  };
}

/**
 * Calculate new energy state based on elapsed time and modifiers
 *
 * @param current Current energy state
 * @param modifiers Energy modifiers to apply
 * @param elapsedTime Time elapsed in game hours
 * @returns Updated energy state
 */
export function calculateEnergyState(
  current: EnergyState,
  modifiers: EnergyModifiers,
  elapsedTime: number
): EnergyState {
  // Calculate stress impact on maximum energy
  const effectiveMaxEnergy = current.max * (1 - modifiers.stressImpact);

  // Calculate regeneration amount
  const regenAmount = current.regen * modifiers.regenModifier * elapsedTime;

  // Calculate drain from activities
  const drainAmount = modifiers.use_of_timeDrain * elapsedTime;

  // Calculate new energy level
  const newEnergy = Math.max(
    0,
    Math.min(effectiveMaxEnergy, current.current + regenAmount - drainAmount)
  );

  return {
    current: newEnergy,
    max: current.max,
    regen: current.regen,
    lastUpdate: Date.now(),
  };
}

/**
 * Calculate stress accumulation from sources
 *
 * @param current Current stress state
 * @param sources Sources of stress
 * @param elapsedTime Time elapsed in game hours
 * @returns Updated stress state
 */
export function calculateStressState(
  current: StressState,
  sources: StressSource[],
  elapsedTime: number
): StressState {
  // Calculate accumulation from sources
  const accumulation = sources.reduce((total, source) => {
    // Only count the source if it's still active
    const effectiveDuration = Math.min(elapsedTime, source.duration);
    return total + source.magnitude * effectiveDuration;
  }, 0);

  // Calculate recovery
  const recovery = current.recovery * elapsedTime;

  // Calculate new stress level
  const newStress = Math.max(
    0,
    Math.min(
      100, // Max stress is always 100
      current.current + accumulation - recovery
    )
  );

  return {
    current: newStress,
    accumulation: current.accumulation,
    recovery: current.recovery,
    lastUpdate: Date.now(),
  };
}

/**
 * Determines the effective efficiency based on stress level
 * Implements the stress impact curve from the specification
 *
 * @param stressLevel Current stress level (0-100)
 * @returns Efficiency modifier (0-1.2)
 */
export function calculateStressEfficiency(stressLevel: number): number {
  if (stressLevel <= 20) {
    return 1.1; // 10% bonus at low stress
  } else if (stressLevel <= 40) {
    return 1.0; // Normal efficiency
  } else if (stressLevel <= 60) {
    return 0.9; // 10% reduction
  } else if (stressLevel <= 80) {
    return 0.8; // 20% reduction
  } else {
    return 0.7; // 30% reduction at high stress
  }
}

/**
 * Calculates energy efficiency based on current level
 * Implements the energy impact curve from the specification
 *
 * @param energyLevel Current energy level (0-100)
 * @param energyMax Maximum energy (0-100)
 * @returns Efficiency modifier (0.8-1.2)
 */
export function calculateEnergyEfficiency(energyLevel: number, energyMax: number): number {
  // Convert to percentage of maximum
  const energyPercent = (energyLevel / energyMax) * 100;

  if (energyPercent >= 81) {
    return 1.2; // 20% bonus at high energy
  } else if (energyPercent >= 61) {
    return 1.1; // 10% bonus
  } else if (energyPercent >= 41) {
    return 1.0; // Normal efficiency
  } else if (energyPercent >= 21) {
    return 0.9; // 10% reduction
  } else {
    return 0.8; // 20% reduction at low energy
  }
}
