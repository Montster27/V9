/**
 * /src/domain/services/ValidationService.ts
 *
 * Validation service for game models
 * Provides functions to validate the integrity and consistency of game data
 */

import {
  ResourcesState,
  GameEvent,
  EnergyState,
  StressState,
  HealthState,
  BelongingState,
  isTimeEvent,
  isStateEvent,
  isRandomEvent,
  isMysteryEvent,
  isConspiracyEvent,
  isNarrativeEvent,
} from '../models';
import { validateTimeAllocation, WeeklyTimeAllocation } from '../models/UseOfTime';

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Validation error types for categorizing errors
 */
export enum ValidationErrorType {
  RANGE_ERROR = 'range_error',
  TYPE_ERROR = 'type_error',
  CONSISTENCY_ERROR = 'consistency_error',
  MISSING_FIELD = 'missing_field',
  INVALID_VALUE = 'invalid_value',
  REFERENCE_ERROR = 'reference_error',
}

/**
 * Detailed validation error with type and context
 */
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  field?: string;
  value?: any;
  expected?: any;
}

/**
 * Service for validating various game models
 */
export class ValidationService {
  /**
   * Validates a resource state object
   *
   * @param resources The resources state to validate
   * @returns Validation result with detailed errors if any
   */
  static validateResourceState(resources: ResourcesState): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate energy
    if (resources.energy.current < 0 || resources.energy.current > resources.energy.max) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Energy value (${resources.energy.current}) outside valid range (0-${resources.energy.max})`,
        field: 'energy.current',
        value: resources.energy.current,
        expected: `0-${resources.energy.max}`,
      });
    }

    // Validate stress
    if (resources.stress.current < 0 || resources.stress.current > resources.stress.max) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Stress value (${resources.stress.current}) outside valid range (0-${resources.stress.max})`,
        field: 'stress.current',
        value: resources.stress.current,
        expected: `0-${resources.stress.max}`,
      });
    }

    // Validate health
    if (resources.health.current < 0 || resources.health.current > resources.health.max) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Health value (${resources.health.current}) outside valid range (0-${resources.health.max})`,
        field: 'health.current',
        value: resources.health.current,
        expected: `0-${resources.health.max}`,
      });
    }

    // Validate belonging
    if (resources.belonging.current < 0 || resources.belonging.current > resources.belonging.max) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Belonging value (${resources.belonging.current}) outside valid range (0-${resources.belonging.max})`,
        field: 'belonging.current',
        value: resources.belonging.current,
        expected: `0-${resources.belonging.max}`,
      });
    }

    // Validate knowledge (should be non-negative)
    if (resources.knowledge < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Knowledge value (${resources.knowledge}) cannot be negative`,
        field: 'knowledge',
        value: resources.knowledge,
        expected: '≥ 0',
      });
    }

    // Validate money (should be non-negative in this game)
    if (resources.money < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Money value (${resources.money}) cannot be negative`,
        field: 'money',
        value: resources.money,
        expected: '≥ 0',
      });
    }

    // Validate social (should be non-negative)
    if (resources.social < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Social value (${resources.social}) cannot be negative`,
        field: 'social',
        value: resources.social,
        expected: '≥ 0',
      });
    }

    // Validate skill points
    if (resources.skillPoints.current < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Skill points (${resources.skillPoints.current}) cannot be negative`,
        field: 'skillPoints.current',
        value: resources.skillPoints.current,
        expected: '≥ 0',
      });
    }

    // Validate skill points consistency
    const availablePoints = resources.skillPoints.generated - resources.skillPoints.spent;
    if (resources.skillPoints.current > availablePoints) {
      errors.push({
        type: ValidationErrorType.CONSISTENCY_ERROR,
        message: `Skill points inconsistency: current (${resources.skillPoints.current}) exceeds generated (${resources.skillPoints.generated}) minus spent (${resources.skillPoints.spent})`,
        field: 'skillPoints',
        value: resources.skillPoints,
        expected: `current ≤ ${availablePoints}`,
      });
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      metadata: {
        detailedErrors: errors,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates an energy state object
   *
   * @param energy The energy state to validate
   * @returns Validation result with detailed errors if any
   */
  static validateEnergyState(energy: EnergyState): ValidationResult {
    const errors: ValidationError[] = [];

    if (energy.current < 0 || energy.current > energy.max) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Energy value (${energy.current}) outside valid range (0-${energy.max})`,
        field: 'current',
        value: energy.current,
        expected: `0-${energy.max}`,
      });
    }

    if (energy.regen < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Energy regeneration (${energy.regen}) cannot be negative`,
        field: 'regen',
        value: energy.regen,
        expected: '≥ 0',
      });
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      metadata: {
        detailedErrors: errors,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates a stress state object
   *
   * @param stress The stress state to validate
   * @returns Validation result with detailed errors if any
   */
  static validateStressState(stress: StressState): ValidationResult {
    const errors: ValidationError[] = [];

    if (stress.current < 0 || stress.current > 100) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Stress value (${stress.current}) outside valid range (0-100)`,
        field: 'current',
        value: stress.current,
        expected: '0-100',
      });
    }

    if (stress.accumulation < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Stress accumulation (${stress.accumulation}) cannot be negative`,
        field: 'accumulation',
        value: stress.accumulation,
        expected: '≥ 0',
      });
    }

    if (stress.recovery < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Stress recovery (${stress.recovery}) cannot be negative`,
        field: 'recovery',
        value: stress.recovery,
        expected: '≥ 0',
      });
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      metadata: {
        detailedErrors: errors,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates a health state object
   *
   * @param health The health state to validate
   * @returns Validation result with detailed errors if any
   */
  static validateHealthState(health: HealthState): ValidationResult {
    const errors: ValidationError[] = [];

    if (health.current < 0 || health.current > 100) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Health value (${health.current}) outside valid range (0-100)`,
        field: 'current',
        value: health.current,
        expected: '0-100',
      });
    }

    if (health.physical < 0 || health.physical > 100) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Physical health (${health.physical}) outside valid range (0-100)`,
        field: 'physical',
        value: health.physical,
        expected: '0-100',
      });
    }

    if (health.mental < 0 || health.mental > 100) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Mental health (${health.mental}) outside valid range (0-100)`,
        field: 'mental',
        value: health.mental,
        expected: '0-100',
      });
    }

    // Check consistency with combined health
    const calculatedHealth = (health.physical + health.mental) / 2;
    if (Math.abs(health.current - calculatedHealth) > 5) {
      errors.push({
        type: ValidationErrorType.CONSISTENCY_ERROR,
        message: `Health value (${health.current}) should be approximately the average of physical (${health.physical}) and mental (${health.mental})`,
        field: 'current',
        value: health.current,
        expected: `≈ ${calculatedHealth}`,
      });
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      metadata: {
        detailedErrors: errors,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates a belonging state object
   *
   * @param belonging The belonging state to validate
   * @returns Validation result with detailed errors if any
   */
  static validateBelongingState(belonging: BelongingState): ValidationResult {
    const errors: ValidationError[] = [];

    if (belonging.current < 0 || belonging.current > 100) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Belonging value (${belonging.current}) outside valid range (0-100)`,
        field: 'current',
        value: belonging.current,
        expected: '0-100',
      });
    }

    if (belonging.connections < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Connections (${belonging.connections}) cannot be negative`,
        field: 'connections',
        value: belonging.connections,
        expected: '≥ 0',
      });
    }

    if (belonging.community < 0) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Community (${belonging.community}) cannot be negative`,
        field: 'community',
        value: belonging.community,
        expected: '≥ 0',
      });
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      metadata: {
        detailedErrors: errors,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates a game event object
   *
   * @param event The event to validate
   * @returns Validation result with detailed errors if any
   */
  static validateEvent(event: GameEvent): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check for required fields
    if (!event.id) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Event is missing an ID',
        field: 'id',
      });
    }

    if (!event.title) {
      warnings.push('Event is missing a title');
    }

    if (!event.description) {
      warnings.push('Event is missing a description');
    }

    if (!event.type) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Event is missing a type',
        field: 'type',
      });
    }

    if (!event.trigger) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Event is missing a trigger',
        field: 'trigger',
      });
    } else if (event.trigger.type !== event.type) {
      errors.push({
        type: ValidationErrorType.CONSISTENCY_ERROR,
        message: `Event type (${event.type}) does not match trigger type (${event.trigger.type})`,
        field: 'trigger.type',
        value: event.trigger.type,
        expected: event.type,
      });
    }

    if (!event.effects || event.effects.length === 0) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Event has no effects',
        field: 'effects',
      });
    }

    // Validate choices if present
    if (event.choices) {
      event.choices.forEach((choice, index) => {
        if (!choice.id) {
          errors.push({
            type: ValidationErrorType.MISSING_FIELD,
            message: `Choice ${index + 1} is missing an ID`,
            field: `choices[${index}].id`,
          });
        }

        if (!choice.text) {
          errors.push({
            type: ValidationErrorType.MISSING_FIELD,
            message: `Choice ${index + 1} is missing text`,
            field: `choices[${index}].text`,
          });
        }

        if (!choice.effects || choice.effects.length === 0) {
          errors.push({
            type: ValidationErrorType.MISSING_FIELD,
            message: `Choice ${index + 1} has no effects`,
            field: `choices[${index}].effects`,
          });
        }
      });
    }

    // Type-specific validations
    if (isTimeEvent(event)) {
      this.validateTimeEvent(event, errors);
    } else if (isStateEvent(event)) {
      this.validateStateEvent(event, errors);
    } else if (isRandomEvent(event)) {
      this.validateRandomEvent(event, errors);
    } else if (isMysteryEvent(event)) {
      this.validateMysteryEvent(event, errors);
    } else if (isConspiracyEvent(event)) {
      this.validateConspiracyEvent(event, errors);
    } else if (isNarrativeEvent(event)) {
      this.validateNarrativeEvent(event, errors);
    }

    // Create simple error messages from detailed errors
    const errorMessages = errors.map((error) => error.message);

    return {
      isValid: errors.length === 0,
      errors: errorMessages,
      warnings,
      metadata: {
        detailedErrors: errors,
        eventType: event.type,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validates a time-based event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateTimeEvent(event: any, errors: ValidationError[]): void {
    const conditions = event.trigger?.conditions;

    if (!conditions) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Time event is missing trigger conditions',
        field: 'trigger.conditions',
      });
      return;
    }

    // Validate time value if present
    if ('time' in conditions && typeof conditions.time !== 'number') {
      errors.push({
        type: ValidationErrorType.TYPE_ERROR,
        message: 'Time condition should be a number',
        field: 'trigger.conditions.time',
        value: conditions.time,
        expected: 'number',
      });
    }

    // Validate dayOfWeek if present
    if ('dayOfWeek' in conditions) {
      const day = conditions.dayOfWeek;
      if (typeof day !== 'number' || day < 0 || day > 6) {
        errors.push({
          type: ValidationErrorType.RANGE_ERROR,
          message: `Day of week (${day}) should be a number between 0-6`,
          field: 'trigger.conditions.dayOfWeek',
          value: day,
          expected: '0-6',
        });
      }
    }
  }

  /**
   * Validates a state-based event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateStateEvent(event: any, errors: ValidationError[]): void {
    const conditions = event.trigger?.conditions;

    if (!conditions) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'State event is missing trigger conditions',
        field: 'trigger.conditions',
      });
      return;
    }

    // At least one condition type should be present
    if (!conditions.resource && !conditions.stress && !conditions.energy) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'State event needs at least one condition (resource, stress, or energy)',
        field: 'trigger.conditions',
      });
    }
  }

  /**
   * Validates a random event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateRandomEvent(event: any, errors: ValidationError[]): void {
    const conditions = event.trigger?.conditions;

    if (!conditions) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Random event is missing trigger conditions',
        field: 'trigger.conditions',
      });
      return;
    }

    // Validate chance value
    if (!('chance' in conditions)) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Random event is missing chance value',
        field: 'trigger.conditions.chance',
      });
    } else if (
      typeof conditions.chance !== 'number' ||
      conditions.chance < 0 ||
      conditions.chance > 1
    ) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Chance value (${conditions.chance}) should be between 0-1`,
        field: 'trigger.conditions.chance',
        value: conditions.chance,
        expected: '0-1',
      });
    }
  }

  /**
   * Validates a mystery event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateMysteryEvent(event: any, errors: ValidationError[]): void {
    const conditions = event.trigger?.conditions;

    if (!conditions) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Mystery event is missing trigger conditions',
        field: 'trigger.conditions',
      });
      return;
    }

    // Validate conspiracy level
    if (!('conspiracyLevel' in conditions)) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Mystery event is missing conspiracy level',
        field: 'trigger.conditions.conspiracyLevel',
      });
    } else if (
      typeof conditions.conspiracyLevel !== 'number' ||
      conditions.conspiracyLevel < 1 ||
      conditions.conspiracyLevel > 10
    ) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Conspiracy level (${conditions.conspiracyLevel}) should be between 1-10`,
        field: 'trigger.conditions.conspiracyLevel',
        value: conditions.conspiracyLevel,
        expected: '1-10',
      });
    }
  }

  /**
   * Validates a conspiracy event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateConspiracyEvent(event: any, errors: ValidationError[]): void {
    // Check for required conspiracy-specific fields
    if (!('conspiracyTier' in event)) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Conspiracy event is missing conspiracyTier',
        field: 'conspiracyTier',
      });
    } else if (
      typeof event.conspiracyTier !== 'number' ||
      event.conspiracyTier < 1 ||
      event.conspiracyTier > 5
    ) {
      errors.push({
        type: ValidationErrorType.RANGE_ERROR,
        message: `Conspiracy tier (${event.conspiracyTier}) should be between 1-5`,
        field: 'conspiracyTier',
        value: event.conspiracyTier,
        expected: '1-5',
      });
    }
  }

  /**
   * Validates a narrative event
   * @param event The event to validate
   * @param errors Array to add errors to
   */
  private static validateNarrativeEvent(event: any, errors: ValidationError[]): void {
    // Check for required narrative-specific fields
    if (!('narrativeSegment' in event)) {
      errors.push({
        type: ValidationErrorType.MISSING_FIELD,
        message: 'Narrative event is missing narrativeSegment',
        field: 'narrativeSegment',
      });
    }
  }

  /**
   * Re-export the existing time allocation validation with improved type
   * @param allocation The time allocation to validate
   * @returns Validation result
   */
  static validateTimeAllocation(allocation: WeeklyTimeAllocation): ValidationResult {
    const result = validateTimeAllocation(allocation);

    return {
      isValid: result.isValid,
      errors: result.errors,
      metadata: {
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Tries to fix a resource state with common issues
   *
   * @param resources The resources state to fix
   * @returns Fixed resource state and list of changes made
   */
  static fixResourceState(resources: ResourcesState): {
    fixed: ResourcesState;
    changes: string[];
  } {
    const changes: string[] = [];
    const fixed = { ...resources };

    // Fix energy value
    if (fixed.energy.current < 0) {
      changes.push(`Fixed negative energy (${fixed.energy.current} → 0)`);
      fixed.energy = { ...fixed.energy, current: 0 };
    } else if (fixed.energy.current > fixed.energy.max) {
      changes.push(`Fixed energy exceeding max (${fixed.energy.current} → ${fixed.energy.max})`);
      fixed.energy = { ...fixed.energy, current: fixed.energy.max };
    }

    // Fix stress value
    if (fixed.stress.current < 0) {
      changes.push(`Fixed negative stress (${fixed.stress.current} → 0)`);
      fixed.stress = { ...fixed.stress, current: 0 };
    } else if (fixed.stress.current > fixed.stress.max) {
      changes.push(`Fixed stress exceeding max (${fixed.stress.current} → ${fixed.stress.max})`);
      fixed.stress = { ...fixed.stress, current: fixed.stress.max };
    }

    // Fix knowledge value
    if (fixed.knowledge < 0) {
      changes.push(`Fixed negative knowledge (${fixed.knowledge} → 0)`);
      fixed.knowledge = 0;
    }

    // Fix money value
    if (fixed.money < 0) {
      changes.push(`Fixed negative money (${fixed.money} → 0)`);
      fixed.money = 0;
    }

    // Fix social value
    if (fixed.social < 0) {
      changes.push(`Fixed negative social (${fixed.social} → 0)`);
      fixed.social = 0;
    }

    // Fix skill points
    if (fixed.skillPoints.current < 0) {
      changes.push(`Fixed negative skill points (${fixed.skillPoints.current} → 0)`);
      fixed.skillPoints = { ...fixed.skillPoints, current: 0 };
    }

    // Fix skill points consistency
    const availablePoints = fixed.skillPoints.generated - fixed.skillPoints.spent;
    if (fixed.skillPoints.current > availablePoints) {
      changes.push(
        `Fixed skill points inconsistency (${fixed.skillPoints.current} → ${availablePoints})`
      );
      fixed.skillPoints = { ...fixed.skillPoints, current: availablePoints };
    }

    // Update lastUpdated timestamp if changes were made
    if (changes.length > 0) {
      fixed.lastUpdated = Date.now();
    }

    return { fixed, changes };
  }
}
