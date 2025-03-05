/**
 * /src/infrastructure/state/slices/__tests__/resourcesSlice.test.ts
 *
 * Tests for resources slice
 */

import resourcesReducer, {
  updateEnergy,
  updateStress,
  updateHealth,
  updateBelonging,
  updateKnowledge,
  addKnowledge,
  updateMoney,
  addMoney,
  updateSocial,
  addSocial,
  updateSkillPoints,
  addSkillPoints,
  updateResources,
} from '../resourcesSlice';
import { createDefaultResourcesState } from '../../../../domain/models';

describe('resourcesSlice', () => {
  // Initial state with UI properties
  const initialState = {
    ...createDefaultResourcesState(),
    initialized: true,
  };

  describe('updateEnergy', () => {
    test('should update energy correctly', () => {
      const result = resourcesReducer(initialState, updateEnergy({ current: 50 }));

      expect(result.energy.current).toBe(50);
      expect(result.energy.max).toBe(initialState.energy.max);
    });

    test('should clamp energy to max value', () => {
      const result = resourcesReducer(initialState, updateEnergy({ current: 200 }));

      expect(result.energy.current).toBe(initialState.energy.max);
    });

    test('should clamp energy to min value', () => {
      const result = resourcesReducer(initialState, updateEnergy({ current: -10 }));

      expect(result.energy.current).toBe(0);
    });

    test('should update trend correctly', () => {
      const result = resourcesReducer(
        initialState,
        updateEnergy({ trend: 'increasing', rate: 'fast' })
      );

      expect(result.energy.trend).toBe('increasing');
      expect(result.energy.rate).toBe('fast');
    });
  });

  describe('addKnowledge', () => {
    test('should add knowledge correctly', () => {
      const initialKnowledge = initialState.knowledge;

      const result = resourcesReducer(initialState, addKnowledge(100));

      expect(result.knowledge).toBe(initialKnowledge + 100);
    });

    test('should not go below zero', () => {
      const result = resourcesReducer(initialState, addKnowledge(-10000));

      expect(result.knowledge).toBe(0);
    });
  });

  describe('addSkillPoints', () => {
    test('should add skill points correctly', () => {
      const initialPoints = initialState.skillPoints.current;
      const initialGenerated = initialState.skillPoints.generated;

      const result = resourcesReducer(initialState, addSkillPoints(10));

      expect(result.skillPoints.current).toBe(initialPoints + 10);
      expect(result.skillPoints.generated).toBe(initialGenerated + 10);
      expect(result.skillPoints.spent).toBe(initialState.skillPoints.spent);
    });

    test('should handle spending skill points correctly', () => {
      const initialPoints = initialState.skillPoints.current;
      const initialSpent = initialState.skillPoints.spent;

      const result = resourcesReducer(initialState, addSkillPoints(-5));

      expect(result.skillPoints.current).toBe(initialPoints - 5);
      expect(result.skillPoints.generated).toBe(initialState.skillPoints.generated);
      expect(result.skillPoints.spent).toBe(initialSpent + 5);
    });

    test('should not go below zero', () => {
      // Create a test state with 3 skill points
      const testState = {
        ...initialState,
        skillPoints: {
          ...initialState.skillPoints,
          current: 3,
          spent: 75,
        },
      };

      // Try to spend 5 points when only 3 are available
      const points = resourcesReducer(testState, addSkillPoints(-5));

      // Should only spend 3 points
      expect(points.skillPoints.current).toBe(0);
      expect(points.skillPoints.spent).toBe(testState.skillPoints.spent + 3);
    });
  });

  describe('updateResources', () => {
    test('should update multiple resources correctly', () => {
      const result = resourcesReducer(
        initialState,
        updateResources({
          energy: { current: 60, trend: 'increasing' },
          money: 1500,
          knowledge: 2000,
        })
      );

      expect(result.energy.current).toBe(60);
      expect(result.energy.trend).toBe('increasing');
      expect(result.money).toBe(1500);
      expect(result.knowledge).toBe(2000);

      // Other resources should remain unchanged
      expect(result.stress).toEqual(initialState.stress);
      expect(result.social).toBe(initialState.social);
    });

    test('should handle empty update', () => {
      const result = resourcesReducer(initialState, updateResources({}));

      // Everything should be the same except for lastUpdated
      expect(result.energy).toEqual(initialState.energy);
      expect(result.stress).toEqual(initialState.stress);
      expect(result.health).toEqual(initialState.health);
      expect(result.belonging).toEqual(initialState.belonging);
      expect(result.knowledge).toBe(initialState.knowledge);
      expect(result.money).toBe(initialState.money);
      expect(result.social).toBe(initialState.social);
      expect(result.skillPoints).toEqual(initialState.skillPoints);

      // LastUpdated should be updated
      expect(result.lastUpdated).not.toBe(initialState.lastUpdated);
    });
  });
});
