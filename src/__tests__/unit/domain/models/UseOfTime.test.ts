/**
 * Tests for UseOfTime model
 */
import { describe, it, expect } from 'vitest';
import {
  ActivityType,
  DEFAULT_ACTIVITY_IMPACTS,
  TimeAllocation,
  WeeklyTimeAllocation,
  calculateResourceImpact,
  calculateStressPenalties,
  createDefaultTimeAllocation,
  adjustTimeAllocation,
  validateTimeAllocation,
} from '../../../../domain/models/UseOfTime';

describe('UseOfTime Model', () => {
  describe('ActivityType Enum', () => {
    it('should define all required activity types', () => {
      expect(ActivityType.STUDY).toBe('study');
      expect(ActivityType.WORK).toBe('work');
      expect(ActivityType.SOCIAL).toBe('social');
      expect(ActivityType.REST).toBe('rest');
      expect(ActivityType.EXERCISE).toBe('exercise');
    });
  });

  describe('DEFAULT_ACTIVITY_IMPACTS', () => {
    it('should define impacts for all activity types', () => {
      Object.values(ActivityType).forEach((activity) => {
        expect(DEFAULT_ACTIVITY_IMPACTS[activity]).toBeDefined();
      });
    });

    it('should have correct impact values for each activity', () => {
      // Check STUDY impacts
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].knowledgeRate).toBe(5);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].moneyRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].socialRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].energyCost).toBe(5);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].stressChange).toBe(1);

      // Check WORK impacts
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].knowledgeRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].moneyRate).toBe(3);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].socialRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].energyCost).toBe(8);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].stressChange).toBe(1);

      // Check REST impacts
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].knowledgeRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].moneyRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].socialRate).toBe(0);
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].energyCost).toBe(-5); // Regenerates energy
      expect(DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].stressChange).toBe(-1); // Reduces stress
    });
  });

  describe('createDefaultTimeAllocation', () => {
    it('should create a valid default time allocation', () => {
      const allocation = createDefaultTimeAllocation();

      // Check if all activities are included
      Object.values(ActivityType).forEach((activity) => {
        expect(allocation.allocations[activity]).toBeDefined();
      });

      // Check total hours
      expect(allocation.totalHours).toBe(168);

      // Check REST has 8 hours per day
      expect(allocation.allocations[ActivityType.REST].hoursPerDay).toBe(8);
      expect(allocation.allocations[ActivityType.REST].hoursPerWeek).toBe(56);

      // Other activities should each have 4 hours per day
      const otherActivities = Object.values(ActivityType).filter((a) => a !== ActivityType.REST);
      otherActivities.forEach((activity) => {
        expect(allocation.allocations[activity].hoursPerDay).toBe(4);
        expect(allocation.allocations[activity].hoursPerWeek).toBe(28);
      });

      // Check percentages
      expect(allocation.allocations[ActivityType.REST].percentage).toBeCloseTo(33.33, 1);
      otherActivities.forEach((activity) => {
        expect(allocation.allocations[activity].percentage).toBeCloseTo(16.67, 1);
      });
    });
  });

  describe('adjustTimeAllocation', () => {
    it('should adjust time allocation for a specific activity', () => {
      const initial = createDefaultTimeAllocation();
      const updated = adjustTimeAllocation(initial, ActivityType.STUDY, 6);

      // Study should now be 6 hours per day
      expect(updated.allocations[ActivityType.STUDY].hoursPerDay).toBe(6);
      expect(updated.allocations[ActivityType.STUDY].hoursPerWeek).toBe(42);

      // Other activities should be proportionally reduced
      const otherActivities = Object.values(ActivityType).filter((a) => a !== ActivityType.STUDY);

      // Total hours should still be 168
      expect(updated.totalHours).toBe(168);

      // The sum of all hoursPerWeek should be 168
      const totalWeeklyHours = Object.values(updated.allocations).reduce(
        (sum, alloc) => sum + alloc.hoursPerWeek,
        0
      );
      expect(totalWeeklyHours).toBeCloseTo(168, 1);
    });

    it('should maintain 24 hours per day when adjusting', () => {
      const initial = createDefaultTimeAllocation();
      const updated = adjustTimeAllocation(initial, ActivityType.WORK, 10);

      // Calculate total hours per day
      const totalHoursPerDay = Object.values(updated.allocations).reduce(
        (sum, alloc) => sum + alloc.hoursPerDay,
        0
      );

      expect(totalHoursPerDay).toBeCloseTo(24, 1);
    });

    it('should handle minimum bounds (0 hours)', () => {
      const initial = createDefaultTimeAllocation();
      const updated = adjustTimeAllocation(initial, ActivityType.EXERCISE, 0);

      expect(updated.allocations[ActivityType.EXERCISE].hoursPerDay).toBe(0);
      expect(updated.allocations[ActivityType.EXERCISE].hoursPerWeek).toBe(0);

      // Other activities should increase to compensate
      const totalHoursPerDay = Object.values(updated.allocations).reduce(
        (sum, alloc) => sum + alloc.hoursPerDay,
        0
      );

      expect(totalHoursPerDay).toBeCloseTo(24, 1);
    });

    it('should handle maximum bounds (24 hours)', () => {
      const initial = createDefaultTimeAllocation();
      const updated = adjustTimeAllocation(initial, ActivityType.REST, 24);

      expect(updated.allocations[ActivityType.REST].hoursPerDay).toBe(24);
      expect(updated.allocations[ActivityType.REST].hoursPerWeek).toBe(168);

      // All other activities should be 0
      Object.values(ActivityType)
        .filter((a) => a !== ActivityType.REST)
        .forEach((activity) => {
          expect(updated.allocations[activity].hoursPerDay).toBe(0);
          expect(updated.allocations[activity].hoursPerWeek).toBe(0);
        });
    });
  });

  describe('calculateResourceImpact', () => {
    it('should calculate correct resource impacts for a given allocation', () => {
      const allocation = createDefaultTimeAllocation();
      const impact = calculateResourceImpact(allocation);

      // Calculate expected values based on default allocation and impacts
      const studyHours = allocation.allocations[ActivityType.STUDY].hoursPerWeek;
      const workHours = allocation.allocations[ActivityType.WORK].hoursPerWeek;
      const socialHours = allocation.allocations[ActivityType.SOCIAL].hoursPerWeek;
      const restHours = allocation.allocations[ActivityType.REST].hoursPerWeek;
      const exerciseHours = allocation.allocations[ActivityType.EXERCISE].hoursPerWeek;

      const expectedKnowledge =
        studyHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].knowledgeRate;
      const expectedMoney = workHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].moneyRate;
      const expectedSocial =
        socialHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.SOCIAL].socialRate +
        exerciseHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.EXERCISE].socialRate;
      const expectedEnergy =
        -(studyHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].energyCost) +
        -(workHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].energyCost) +
        -(socialHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.SOCIAL].energyCost) +
        -(restHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].energyCost) +
        -(exerciseHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.EXERCISE].energyCost);
      const expectedStress =
        studyHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.STUDY].stressChange +
        workHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.WORK].stressChange +
        socialHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.SOCIAL].stressChange +
        restHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.REST].stressChange +
        exerciseHours * DEFAULT_ACTIVITY_IMPACTS[ActivityType.EXERCISE].stressChange;

      expect(impact.knowledge).toBeCloseTo(expectedKnowledge);
      expect(impact.money).toBeCloseTo(expectedMoney);
      expect(impact.social).toBeCloseTo(expectedSocial);
      expect(impact.energy).toBeCloseTo(expectedEnergy);
      expect(impact.stress).toBeCloseTo(expectedStress);
    });

    it('should use custom activity impacts when provided', () => {
      const allocation = createDefaultTimeAllocation();
      const customImpacts = { ...DEFAULT_ACTIVITY_IMPACTS };

      // Double the knowledge rate for studying
      customImpacts[ActivityType.STUDY] = {
        ...customImpacts[ActivityType.STUDY],
        knowledgeRate: 10,
      };

      const impact = calculateResourceImpact(allocation, customImpacts);

      // Knowledge should be doubled compared to default
      const studyHours = allocation.allocations[ActivityType.STUDY].hoursPerWeek;
      const expectedKnowledge = studyHours * 10;

      expect(impact.knowledge).toBeCloseTo(expectedKnowledge);
    });
  });

  describe('calculateStressPenalties', () => {
    it('should calculate stress penalties for insufficient rest', () => {
      const allocation = createDefaultTimeAllocation();

      // Adjust REST to 6 hours per day (below 8 hour minimum)
      const updated = adjustTimeAllocation(allocation, ActivityType.REST, 6);
      const stressPenalty = calculateStressPenalties(updated);

      // Expected penalty:
      // Rest deficit: (8 - 6) * 5 * 7 = 70
      // Active hours = 18, exceeding 12 by 6 hours
      // Overexertion: (18 - 12) * 10 * 7 = 420
      // Total: 70 + 420 = 490
      expect(stressPenalty).toBe(490);
    });

    it('should calculate stress penalties for overexertion', () => {
      const allocation = createDefaultTimeAllocation();

      // Adjust REST to 4 hours per day (20 active hours, exceeding 12 hour threshold)
      const updated = adjustTimeAllocation(allocation, ActivityType.REST, 4);
      const stressPenalty = calculateStressPenalties(updated);

      // Expected penalty:
      // Rest deficit: (8 - 4) * 5 * 7 = 140
      // Overexertion: (20 - 12) * 10 * 7 = 560
      // Total: 140 + 560 = 700
      expect(stressPenalty).toBe(700);
    });

    it('should return 0 when rest is sufficient and activity is balanced', () => {
      const allocation = createDefaultTimeAllocation();

      // Adjust REST to 12 hours per day (12 active hours, at threshold)
      const updated = adjustTimeAllocation(allocation, ActivityType.REST, 12);
      const stressPenalty = calculateStressPenalties(updated);

      // No stress penalty should be applied
      expect(stressPenalty).toBe(0);
    });
  });

  describe('validateTimeAllocation', () => {
    it('should validate a correct allocation as valid', () => {
      const allocation = createDefaultTimeAllocation();
      const validation = validateTimeAllocation(allocation);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect missing activities', () => {
      const allocation = createDefaultTimeAllocation();
      // Create a new object without SOCIAL activity
      const allocationsWithoutSocial = { ...allocation.allocations };
      // Remove the key using destructuring and rest
      const { [ActivityType.SOCIAL]: _, ...remainingAllocations } = allocationsWithoutSocial;

      const invalid = {
        ...allocation,
        allocations: remainingAllocations,
      } as WeeklyTimeAllocation;

      const validation = validateTimeAllocation(invalid);

      expect(validation.isValid).toBe(false);
      // The validation is actually finding multiple errors because missing an activity
      // also affects the total hours calculation
      expect(validation.errors.length).toBe(2);
      expect(validation.errors[0]).toContain('Missing activities');
    });

    it('should detect incorrect total hours', () => {
      const allocation = createDefaultTimeAllocation();

      // Create an invalid allocation with incorrect hours
      // We need to actually change the hours in the allocations, not just the totalHours field
      const invalid = {
        ...allocation,
        allocations: {
          ...allocation.allocations,
          [ActivityType.STUDY]: {
            ...allocation.allocations[ActivityType.STUDY],
            hoursPerDay: 0, // Change from 4 to 0
            hoursPerWeek: 0, // Change from 28 to 0
          },
        },
      };

      const validation = validateTimeAllocation(invalid);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContainEqual(expect.stringContaining('Total hours'));
    });

    it('should detect negative hours', () => {
      const allocation = createDefaultTimeAllocation();
      const invalid = {
        ...allocation,
        allocations: {
          ...allocation.allocations,
          [ActivityType.STUDY]: {
            ...allocation.allocations[ActivityType.STUDY],
            hoursPerDay: -2,
            hoursPerWeek: -14,
          },
        },
      };

      const validation = validateTimeAllocation(invalid);

      expect(validation.isValid).toBe(false);
      // The test finds both negative hours and total hours errors
      expect(validation.errors.length).toBe(2);
      expect(validation.errors).toContainEqual(expect.stringContaining('Negative hours'));
    });

    it('should detect mismatched hours per day and per week', () => {
      const allocation = createDefaultTimeAllocation();
      const invalid = {
        ...allocation,
        allocations: {
          ...allocation.allocations,
          [ActivityType.WORK]: {
            ...allocation.allocations[ActivityType.WORK],
            hoursPerDay: 4,
            hoursPerWeek: 20, // Should be 28 (4 * 7)
          },
        },
      };

      const validation = validateTimeAllocation(invalid);

      expect(validation.isValid).toBe(false);
      // The test finds both mismatched hours and total hours errors
      expect(validation.errors.length).toBe(2);
      expect(validation.errors).toContainEqual(expect.stringContaining('match'));
    });
  });
});
