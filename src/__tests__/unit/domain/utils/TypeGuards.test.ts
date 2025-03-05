/**
 * /src/__tests__/unit/domain/utils/TypeGuards.test.ts
 *
 * Unit tests for the type guard utilities
 */

import {
  isResourcesState,
  isEnergyState,
  isStressState,
  isGameEvent,
  isEventQueue,
} from '../../../../domain/utils/TypeGuards';
import {
  createDefaultResourcesState,
  createDefaultEnergyState,
  createDefaultStressState,
  createDefaultEventQueue,
} from '../../../../domain/models';

describe('TypeGuards', () => {
  describe('isResourcesState', () => {
    it('should return true for a valid ResourcesState object', () => {
      const resources = createDefaultResourcesState();
      expect(isResourcesState(resources)).toBe(true);
    });

    it('should return false for an object missing required properties', () => {
      const invalidObject = {
        energy: { current: 50, max: 100 },
        // Missing other required properties
      };

      expect(isResourcesState(invalidObject)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isResourcesState(null)).toBe(false);
      expect(isResourcesState(undefined)).toBe(false);
    });

    it('should return false for primitive types', () => {
      expect(isResourcesState('string')).toBe(false);
      expect(isResourcesState(123)).toBe(false);
      expect(isResourcesState(true)).toBe(false);
    });
  });

  describe('isEnergyState', () => {
    it('should return true for a valid EnergyState object', () => {
      const energy = createDefaultEnergyState();
      expect(isEnergyState(energy)).toBe(true);
    });

    it('should return false for an object missing required properties', () => {
      const invalidObject = {
        current: 50,
        max: 100,
        // Missing regen and lastUpdate
      };

      expect(isEnergyState(invalidObject)).toBe(false);
    });
  });

  describe('isStressState', () => {
    it('should return true for a valid StressState object', () => {
      const stress = createDefaultStressState();
      expect(isStressState(stress)).toBe(true);
    });

    it('should return false for an object missing required properties', () => {
      const invalidObject = {
        current: 30,
        // Missing accumulation, recovery, and lastUpdate
      };

      expect(isStressState(invalidObject)).toBe(false);
    });
  });

  describe('isGameEvent', () => {
    it('should return true for a valid GameEvent object', () => {
      const event = {
        id: '123',
        title: 'Test Event',
        description: 'Test Description',
        type: 'TIME',
        trigger: { type: 'TIME', conditions: {} },
        effects: [{ type: 'MODIFY_RESOURCE', target: 'energy', value: 10 }],
        conditions: [], // Add the conditions array
      };

      expect(isGameEvent(event)).toBe(true);
    });

    it('should return false for an object missing required properties', () => {
      const invalidObject = {
        id: '123',
        type: 'TIME',
        // Missing trigger and effects
      };

      expect(isGameEvent(invalidObject)).toBe(false);
    });
  });

  describe('isEventQueue', () => {
    it('should return true for a valid EventQueue object', () => {
      const queue = createDefaultEventQueue();
      expect(isEventQueue(queue)).toBe(true);
    });

    it('should return false for an object missing required properties', () => {
      const invalidObject = {
        pending: [],
        active: [],
        // Missing resolved and narrativeArcs
      };

      expect(isEventQueue(invalidObject)).toBe(false);
    });
  });
});
