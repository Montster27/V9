/**
 * /src/__tests__/unit/domain/models/Resource.test.ts
 *
 * Unit tests for the Resource domain model
 */

import { createDefaultResourcesState, ResourcesState } from '../../../../domain/models/Resource';

describe('Resource', () => {
  describe('createDefaultResourcesState', () => {
    it('should create a default resources state with valid values', () => {
      const resources = createDefaultResourcesState();

      // Check that the function returns an object with the correct shape
      expect(resources).toBeDefined();

      // Check energy values
      expect(resources.energy.current).toBeLessThanOrEqual(resources.energy.max);
      expect(resources.energy.current).toBeGreaterThanOrEqual(0);
      expect(resources.energy.max).toBeGreaterThan(0);

      // Check stress values
      expect(resources.stress.current).toBeLessThanOrEqual(resources.stress.max);
      expect(resources.stress.current).toBeGreaterThanOrEqual(0);
      expect(resources.stress.max).toBeGreaterThan(0);

      // Check health values
      expect(resources.health.current).toBeLessThanOrEqual(resources.health.max);
      expect(resources.health.current).toBeGreaterThanOrEqual(0);
      expect(resources.health.max).toBeGreaterThan(0);

      // Check belonging values
      expect(resources.belonging.current).toBeLessThanOrEqual(resources.belonging.max);
      expect(resources.belonging.current).toBeGreaterThanOrEqual(0);
      expect(resources.belonging.max).toBeGreaterThan(0);

      // Check numerical resources
      expect(resources.knowledge).toBeGreaterThanOrEqual(0);
      expect(resources.money).toBeGreaterThanOrEqual(0);
      expect(resources.social).toBeGreaterThanOrEqual(0);

      // Check skill points
      expect(resources.skillPoints.current).toBeGreaterThanOrEqual(0);
      expect(resources.skillPoints.generated).toBeGreaterThanOrEqual(0);
      expect(resources.skillPoints.spent).toBeGreaterThanOrEqual(0);
      expect(resources.skillPoints.current).toBeLessThanOrEqual(
        resources.skillPoints.generated - resources.skillPoints.spent
      );

      // Check lastUpdated timestamp
      expect(resources.lastUpdated).toBeGreaterThan(0);
    });
  });

  // These tests would be useful when we implement resource calculation logic
  // describe('calculateResourceDelta', () => {
  //   it('should correctly calculate resource changes over time', () => {
  //     // Future implementation
  //   });
  // });
});
