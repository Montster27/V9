/**
 * /src/__tests__/unit/domain/services/ValidationService.test.ts
 *
 * Unit tests for the ValidationService
 */

import { ValidationService } from '../../../../domain/services/ValidationService';
import {
  ResourcesState,
  EnergyState,
  StressState,
  createDefaultResourcesState,
  createDefaultEnergyState,
  createDefaultStressState,
} from '../../../../domain/models';

describe('ValidationService', () => {
  describe('validateResourceState', () => {
    it('should validate a valid resource state', () => {
      const resources = createDefaultResourcesState();
      const result = ValidationService.validateResourceState(resources);

      expect(result.isValid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid energy value', () => {
      const resources = createDefaultResourcesState();
      resources.energy.current = -10; // Invalid negative value

      const result = ValidationService.validateResourceState(resources);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Energy value');
    });

    it('should detect invalid stress value', () => {
      const resources = createDefaultResourcesState();
      resources.stress.current = 150; // Invalid over-max value

      const result = ValidationService.validateResourceState(resources);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Stress value');
    });

    it('should detect invalid skill points state', () => {
      const resources = createDefaultResourcesState();
      resources.skillPoints.current = 100;
      resources.skillPoints.generated = 50;
      resources.skillPoints.spent = 0;
      // Current > generated - spent, which is impossible

      const result = ValidationService.validateResourceState(resources);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Skill points');
    });
  });

  describe('validateEnergyState', () => {
    it('should validate a valid energy state', () => {
      const energy = createDefaultEnergyState();
      const result = ValidationService.validateEnergyState(energy);

      expect(result.isValid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid energy value', () => {
      const energy = createDefaultEnergyState();
      energy.current = -5; // Invalid negative value

      const result = ValidationService.validateEnergyState(energy);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid regeneration rate', () => {
      const energy = createDefaultEnergyState();
      energy.regen = -2; // Invalid negative regeneration

      const result = ValidationService.validateEnergyState(energy);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateStressState', () => {
    it('should validate a valid stress state', () => {
      const stress = createDefaultStressState();
      const result = ValidationService.validateStressState(stress);

      expect(result.isValid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid stress value', () => {
      const stress = createDefaultStressState();
      stress.current = 120; // Invalid over-max value

      const result = ValidationService.validateStressState(stress);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
