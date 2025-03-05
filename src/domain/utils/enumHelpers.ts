/**
 * /src/domain/utils/enumHelpers.ts
 *
 * Enum Helper Functions
 *
 * This file provides utilities for working with TypeScript enums safely.
 * It includes type checking utilities and conversion functions that help
 * prevent string literal to enum mismatches.
 */

import { EventType, TriggerType, EffectType, ConditionOperation } from '../models/Event';

import { ActivityType } from '../models/UseOfTime';

/**
 * Check if a value is a valid EventType
 * @param value Value to check
 * @returns True if the value is a valid EventType, false otherwise
 */
export function isValidEventType(value: any): value is EventType {
  return Object.values(EventType).includes(value);
}

/**
 * Convert a string to EventType enum safely
 * @param value String value to convert
 * @returns EventType enum value or undefined if invalid
 */
export function toEventType(value: string): EventType | undefined {
  if (isValidEventType(value)) {
    return value;
  }
  return undefined;
}

/**
 * Check if a value is a valid TriggerType
 * @param value Value to check
 * @returns True if the value is a valid TriggerType, false otherwise
 */
export function isValidTriggerType(value: any): value is TriggerType {
  return Object.values(TriggerType).includes(value);
}

/**
 * Convert a string to TriggerType enum safely
 * @param value String value to convert
 * @returns TriggerType enum value or undefined if invalid
 */
export function toTriggerType(value: string): TriggerType | undefined {
  if (isValidTriggerType(value)) {
    return value;
  }
  return undefined;
}

/**
 * Check if a value is a valid EffectType
 * @param value Value to check
 * @returns True if the value is a valid EffectType, false otherwise
 */
export function isValidEffectType(value: any): value is EffectType {
  return Object.values(EffectType).includes(value);
}

/**
 * Convert a string to EffectType enum safely
 * @param value String value to convert
 * @returns EffectType enum value or undefined if invalid
 */
export function toEffectType(value: string): EffectType | undefined {
  if (isValidEffectType(value)) {
    return value;
  }
  return undefined;
}

/**
 * Check if a value is a valid ConditionOperation
 * @param value Value to check
 * @returns True if the value is a valid ConditionOperation, false otherwise
 */
export function isValidConditionOperation(value: any): value is ConditionOperation {
  return Object.values(ConditionOperation).includes(value);
}

/**
 * Convert a string to ConditionOperation enum safely
 * @param value String value to convert
 * @returns ConditionOperation enum value or undefined if invalid
 */
export function toConditionOperation(value: string): ConditionOperation | undefined {
  if (isValidConditionOperation(value)) {
    return value;
  }
  return undefined;
}

/**
 * Check if a value is a valid ActivityType
 * @param value Value to check
 * @returns True if the value is a valid ActivityType, false otherwise
 */
export function isValidActivityType(value: any): value is ActivityType {
  return Object.values(ActivityType).includes(value);
}

/**
 * Convert a string to ActivityType enum safely
 * @param value String value to convert
 * @returns ActivityType enum value or undefined if invalid
 */
export function toActivityType(value: string): ActivityType | undefined {
  if (isValidActivityType(value)) {
    return value;
  }
  return undefined;
}

/**
 * Get all values of an enum as an array
 * @param enumObject The enum to get values from
 * @returns Array of enum values
 */
export function getEnumValues<T extends Record<string, string | number>>(
  enumObject: T
): Array<T[keyof T]> {
  return Object.values(enumObject);
}

/**
 * Get all keys of an enum as an array
 * @param enumObject The enum to get keys from
 * @returns Array of enum keys
 */
export function getEnumKeys<T extends Record<string, string | number>>(
  enumObject: T
): Array<keyof T> {
  return Object.keys(enumObject) as Array<keyof T>;
}

/**
 * Create a mapping object between enum values and a set of associated data
 * @param enumObject The enum to map
 * @param mapFn Function that returns data for each enum value
 * @returns Record mapping enum values to data
 */
export function createEnumValueMap<T extends Record<string, string | number>, R>(
  enumObject: T,
  mapFn: (value: T[keyof T]) => R
): Record<T[keyof T], R> {
  return Object.values(enumObject).reduce(
    (acc, value) => {
      acc[value] = mapFn(value);
      return acc;
    },
    {} as Record<T[keyof T], R>
  );
}
