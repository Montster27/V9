/**
 * /src/domain/utils/validationHelpers.ts
 *
 * Validation Helper Functions
 *
 * This file provides utilities for validating objects against interfaces
 * to ensure they have all required properties.
 */

import {
  GameEvent,
  EventTrigger,
  EventEffect,
  EventCondition,
  EventChoice,
  TriggerType,
  EffectType,
} from '../models/Event';

import {
  TimeAllocation,
  WeeklyTimeAllocation,
  ActivityType,
  ResourceImpact,
} from '../models/UseOfTime';

import {
  ResourceValue,
  SkillPointsValue,
  ResourcesState,
  ResourceImpact as ResourceImpactModel,
} from '../models/Resource';

/**
 * Validate a GameEvent object has all required properties
 * @param event Event to validate
 * @returns Object with validation result and error messages
 */
export function validateGameEvent(event: Partial<GameEvent>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!event.id) {
    errors.push('Missing required property: id');
  }

  if (!event.title) {
    errors.push('Missing required property: title');
  }

  if (!event.description) {
    errors.push('Missing required property: description');
  }

  if (!event.type) {
    errors.push('Missing required property: type');
  }

  if (!event.trigger) {
    errors.push('Missing required property: trigger');
  } else {
    // Validate trigger
    const triggerErrors = validateEventTrigger(event.trigger);
    errors.push(...triggerErrors.errors);
  }

  if (!event.conditions) {
    errors.push('Missing required property: conditions');
  } else if (!Array.isArray(event.conditions)) {
    errors.push('Property conditions must be an array');
  }

  if (!event.effects) {
    errors.push('Missing required property: effects');
  } else if (!Array.isArray(event.effects)) {
    errors.push('Property effects must be an array');
  } else {
    // Validate each effect
    event.effects.forEach((effect, index) => {
      const effectErrors = validateEventEffect(effect);
      effectErrors.errors.forEach((error) => {
        errors.push(`Effect at index ${index}: ${error}`);
      });
    });
  }

  // Validate choices if present
  if (event.choices && Array.isArray(event.choices)) {
    event.choices.forEach((choice, index) => {
      const choiceErrors = validateEventChoice(choice);
      choiceErrors.errors.forEach((error) => {
        errors.push(`Choice at index ${index}: ${error}`);
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an EventTrigger object has all required properties
 * @param trigger Trigger to validate
 * @returns Object with validation result and error messages
 */
export function validateEventTrigger(trigger: Partial<EventTrigger>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!trigger.type) {
    errors.push('Missing required property: type');
  }

  if (!trigger.conditions) {
    errors.push('Missing required property: conditions');
  } else if (typeof trigger.conditions !== 'object') {
    errors.push('Property conditions must be an object');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an EventEffect object has all required properties
 * @param effect Effect to validate
 * @returns Object with validation result and error messages
 */
export function validateEventEffect(effect: Partial<EventEffect>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!effect.type) {
    errors.push('Missing required property: type');
  }

  if (!effect.target) {
    errors.push('Missing required property: target');
  }

  if (effect.value === undefined) {
    errors.push('Missing required property: value');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an EventChoice object has all required properties
 * @param choice Choice to validate
 * @returns Object with validation result and error messages
 */
export function validateEventChoice(choice: Partial<EventChoice>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!choice.id) {
    errors.push('Missing required property: id');
  }

  if (!choice.text) {
    errors.push('Missing required property: text');
  }

  if (!choice.requirements) {
    errors.push('Missing required property: requirements');
  } else if (!Array.isArray(choice.requirements)) {
    errors.push('Property requirements must be an array');
  }

  if (!choice.effects) {
    errors.push('Missing required property: effects');
  } else if (!Array.isArray(choice.effects)) {
    errors.push('Property effects must be an array');
  }

  if (choice.stress === undefined) {
    errors.push('Missing required property: stress');
  }

  if (choice.energy === undefined) {
    errors.push('Missing required property: energy');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a TimeAllocation object has all required properties
 * @param allocation Allocation to validate
 * @returns Object with validation result and error messages
 */
export function validateTimeAllocation(allocation: Partial<TimeAllocation>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!allocation.activityType) {
    errors.push('Missing required property: activityType');
  }

  if (allocation.hoursPerDay === undefined) {
    errors.push('Missing required property: hoursPerDay');
  } else if (allocation.hoursPerDay < 0 || allocation.hoursPerDay > 24) {
    errors.push('hoursPerDay must be between 0 and 24');
  }

  if (allocation.hoursPerWeek === undefined) {
    errors.push('Missing required property: hoursPerWeek');
  } else if (allocation.hoursPerWeek < 0 || allocation.hoursPerWeek > 168) {
    errors.push('hoursPerWeek must be between 0 and 168');
  }

  if (allocation.percentage === undefined) {
    errors.push('Missing required property: percentage');
  } else if (allocation.percentage < 0 || allocation.percentage > 100) {
    errors.push('percentage must be between 0 and 100');
  }

  // Verify consistency
  if (allocation.hoursPerDay !== undefined && allocation.hoursPerWeek !== undefined) {
    const expectedWeeklyHours = allocation.hoursPerDay * 7;
    if (Math.abs(expectedWeeklyHours - allocation.hoursPerWeek) > 0.1) {
      errors.push(
        `hoursPerWeek (${allocation.hoursPerWeek}) does not match hoursPerDay * 7 (${expectedWeeklyHours})`
      );
    }
  }

  if (allocation.hoursPerWeek !== undefined && allocation.percentage !== undefined) {
    const expectedPercentage = (allocation.hoursPerWeek / 168) * 100;
    if (Math.abs(expectedPercentage - allocation.percentage) > 0.1) {
      errors.push(
        `percentage (${allocation.percentage}) does not match (hoursPerWeek / 168) * 100 (${expectedPercentage})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a WeeklyTimeAllocation object has all required properties
 * @param allocation Allocation to validate
 * @returns Object with validation result and error messages
 */
export function validateWeeklyTimeAllocation(allocation: Partial<WeeklyTimeAllocation>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (!allocation.allocations) {
    errors.push('Missing required property: allocations');
  } else {
    // Check all activity types are present
    const activityTypes = Object.values(ActivityType);
    const missingTypes = activityTypes.filter((type) => !allocation.allocations![type]);

    if (missingTypes.length > 0) {
      errors.push(`Missing allocations for activity types: ${missingTypes.join(', ')}`);
    }

    // Validate each allocation
    Object.entries(allocation.allocations).forEach(([type, alloc]) => {
      const allocErrors = validateTimeAllocation(alloc);
      allocErrors.errors.forEach((error) => {
        errors.push(`Allocation for ${type}: ${error}`);
      });
    });

    // Check total hours
    if (allocation.allocations) {
      let totalHoursPerWeek = 0;
      Object.values(allocation.allocations).forEach((alloc) => {
        totalHoursPerWeek += alloc.hoursPerWeek;
      });

      if (Math.abs(totalHoursPerWeek - 168) > 0.1) {
        errors.push(`Total hours per week (${totalHoursPerWeek}) does not equal 168`);
      }
    }
  }

  if (allocation.totalHours === undefined) {
    errors.push('Missing required property: totalHours');
  } else if (Math.abs(allocation.totalHours - 168) > 0.1) {
    errors.push(`totalHours (${allocation.totalHours}) does not equal 168`);
  }

  if (!allocation.lastUpdated) {
    errors.push('Missing required property: lastUpdated');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a ResourceValue object has all required properties
 * @param resource Resource to validate
 * @returns Object with validation result and error messages
 */
export function validateResourceValue(resource: Partial<ResourceValue>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required properties
  if (resource.current === undefined) {
    errors.push('Missing required property: current');
  }

  if (resource.max === undefined) {
    errors.push('Missing required property: max');
  }

  // Verify bounds
  if (resource.current !== undefined && resource.max !== undefined) {
    if (resource.current < 0) {
      errors.push(`current (${resource.current}) cannot be negative`);
    }

    if (resource.current > resource.max) {
      errors.push(`current (${resource.current}) cannot exceed max (${resource.max})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a valid ResourceValue object from a partial input
 * @param resource Partial resource value
 * @returns Valid ResourceValue with defaults for missing properties
 */
export function createValidResourceValue(resource: Partial<ResourceValue>): ResourceValue {
  // Set default values
  const current = resource.current !== undefined ? Math.max(0, resource.current) : 0;
  const max = resource.max !== undefined ? Math.max(1, resource.max) : 100;

  // Ensure current doesn't exceed max
  const boundedCurrent = Math.min(current, max);

  return {
    current: boundedCurrent,
    max,
    trend: resource.trend || 'stable',
    rate: resource.rate || 'slow',
  };
}

/**
 * Create a valid SkillPointsValue object from a partial input
 * @param skillPoints Partial skill points value
 * @returns Valid SkillPointsValue with defaults for missing properties
 */
export function createValidSkillPointsValue(
  skillPoints: Partial<SkillPointsValue>
): SkillPointsValue {
  return {
    current: skillPoints.current !== undefined ? Math.max(0, skillPoints.current) : 0,
    generated: skillPoints.generated !== undefined ? Math.max(0, skillPoints.generated) : 0,
    spent: skillPoints.spent !== undefined ? Math.max(0, skillPoints.spent) : 0,
    trend: skillPoints.trend || 'stable',
  };
}

/**
 * Create a valid TimeAllocation object from a partial input
 * @param allocation Partial time allocation
 * @returns Valid TimeAllocation with consistent values
 */
export function createValidTimeAllocation(allocation: Partial<TimeAllocation>): TimeAllocation {
  // Ensure we have an activity type
  const activityType = allocation.activityType || ActivityType.REST;

  // Ensure hours are within bounds
  const hoursPerDay =
    allocation.hoursPerDay !== undefined ? Math.max(0, Math.min(24, allocation.hoursPerDay)) : 0;

  // Calculate derived values
  const hoursPerWeek = hoursPerDay * 7;
  const percentage = (hoursPerWeek / 168) * 100;

  return {
    activityType,
    hoursPerDay,
    hoursPerWeek,
    percentage,
  };
}

/**
 * Create a valid ResourceImpact object from a partial input
 * @param impact Partial resource impact
 * @returns Valid ResourceImpact with defaults for missing properties
 */
export function createValidResourceImpact(impact: Partial<ResourceImpact>): ResourceImpact {
  return {
    knowledge: impact.knowledge !== undefined ? impact.knowledge : 0,
    money: impact.money !== undefined ? impact.money : 0,
    social: impact.social !== undefined ? impact.social : 0,
    energy: impact.energy !== undefined ? impact.energy : 0,
    stress: impact.stress !== undefined ? impact.stress : 0,
  };
}

/**
 * Create a valid EventTrigger object from a partial input
 * @param trigger Partial event trigger
 * @returns Valid EventTrigger with defaults for missing properties
 */
export function createValidEventTrigger(trigger: Partial<EventTrigger>): EventTrigger {
  return {
    type: trigger.type || TriggerType.TIME,
    conditions: trigger.conditions || {},
  };
}

/**
 * Create a valid EventEffect object from a partial input
 * @param effect Partial event effect
 * @returns Valid EventEffect with defaults for missing properties
 */
export function createValidEventEffect(effect: Partial<EventEffect>): EventEffect {
  return {
    type: effect.type || EffectType.MODIFY_RESOURCE,
    target: effect.target || 'energy',
    value: effect.value !== undefined ? effect.value : 0,
    duration: effect.duration,
  };
}
