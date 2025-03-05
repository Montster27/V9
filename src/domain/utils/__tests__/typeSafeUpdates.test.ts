/**
 * /src/domain/utils/__tests__/typeSafeUpdates.test.ts
 *
 * Tests for the type-safe update utilities
 */

import {
  updateResourceValue,
  updateSkillPointsValue,
  addSkillPoints,
  updateResourcesState,
  updateTimeAllocation,
  updateWeeklyTimeAllocation,
  updateEventQueue,
  addEventToQueue,
  moveEventBetweenQueues,
} from '../typeSafeUpdates';

import { ActivityType } from '../../models/UseOfTime';
import { EventType, TriggerType } from '../../models/Event';

describe('Type-Safe Update Utilities', () => {
  describe('updateResourceValue', () => {
    it('should create a new resource with updated properties', () => {
      const original = {
        current: 50,
        max: 100,
        trend: 'stable' as const,
        rate: 'slow' as const,
      };

      const updated = updateResourceValue(original, { current: 75 });

      // Original should not be modified
      expect(original.current).toBe(50);

      // New object should have updated property
      expect(updated.current).toBe(75);
      expect(updated.max).toBe(100);
      expect(updated.trend).toBe('stable');
      expect(updated.rate).toBe('slow');
    });

    it('should bound current to max', () => {
      const original = {
        current: 50,
        max: 100,
        trend: 'stable' as const,
        rate: 'slow' as const,
      };

      const updated = updateResourceValue(original, { current: 150 });

      // Current should be bound to max
      expect(updated.current).toBe(100);
    });

    it('should bound current to 0 at minimum', () => {
      const original = {
        current: 50,
        max: 100,
        trend: 'stable' as const,
        rate: 'slow' as const,
      };

      const updated = updateResourceValue(original, { current: -10 });

      // Current should be bound to 0
      expect(updated.current).toBe(0);
    });
  });

  describe('updateSkillPointsValue', () => {
    it('should create a new skill points object with updated properties', () => {
      const original = {
        current: 50,
        generated: 100,
        spent: 50,
        trend: 'increasing' as const,
      };

      const updated = updateSkillPointsValue(original, { current: 75 });

      // Original should not be modified
      expect(original.current).toBe(50);

      // New object should have updated property
      expect(updated.current).toBe(75);
      expect(updated.generated).toBe(100);
      expect(updated.spent).toBe(50);
      expect(updated.trend).toBe('increasing');
    });

    it('should prevent negative values', () => {
      const original = {
        current: 50,
        generated: 100,
        spent: 50,
        trend: 'increasing' as const,
      };

      const updated = updateSkillPointsValue(original, { current: -10 });

      // Current should be bound to 0
      expect(updated.current).toBe(0);
    });
  });

  describe('addSkillPoints', () => {
    it('should add points correctly', () => {
      const original = {
        current: 50,
        generated: 100,
        spent: 50,
        trend: 'increasing' as const,
      };

      const updated = addSkillPoints(original, 25);

      // Original should not be modified
      expect(original.current).toBe(50);
      expect(original.generated).toBe(100);

      // New object should have updated properties
      expect(updated.current).toBe(75);
      expect(updated.generated).toBe(125);
      expect(updated.spent).toBe(50); // Unchanged
    });

    it('should subtract points correctly', () => {
      const original = {
        current: 50,
        generated: 100,
        spent: 50,
        trend: 'increasing' as const,
      };

      const updated = addSkillPoints(original, -25);

      // Original should not be modified
      expect(original.current).toBe(50);
      expect(original.spent).toBe(50);

      // New object should have updated properties
      expect(updated.current).toBe(25);
      expect(updated.generated).toBe(100); // Unchanged
      expect(updated.spent).toBe(75);
    });

    it('should handle spending more than available', () => {
      const original = {
        current: 30,
        generated: 100,
        spent: 70,
        trend: 'increasing' as const,
      };

      const updated = addSkillPoints(original, -50);

      // Should spend only what's available
      expect(updated.current).toBe(0);
      expect(updated.spent).toBe(100);
    });
  });

  describe('updateResourcesState', () => {
    it('should update multiple resources correctly', () => {
      const original = {
        energy: { current: 50, max: 100, trend: 'stable' as const, rate: 'slow' as const },
        stress: { current: 30, max: 100, trend: 'stable' as const, rate: 'slow' as const },
        health: { current: 80, max: 100, trend: 'stable' as const, rate: 'slow' as const },
        belonging: { current: 60, max: 100, trend: 'stable' as const, rate: 'slow' as const },
        knowledge: 1000,
        money: 500,
        social: 200,
        skillPoints: { current: 20, generated: 50, spent: 30, trend: 'stable' as const },
        lastUpdated: 123456789,
      };

      const updated = updateResourcesState(original, {
        energy: { current: 60 },
        money: 600,
        skillPoints: { current: 25 },
      });

      // Original should not be modified
      expect(original.energy.current).toBe(50);
      expect(original.money).toBe(500);
      expect(original.skillPoints.current).toBe(20);

      // New object should have updated properties
      expect(updated.energy.current).toBe(60);
      expect(updated.money).toBe(600);
      expect(updated.skillPoints.current).toBe(25);

      // Other properties should be unchanged
      expect(updated.stress.current).toBe(30);
      expect(updated.knowledge).toBe(1000);

      // Timestamp should be updated
      expect(updated.lastUpdated).not.toBe(123456789);
    });
  });

  describe('updateTimeAllocation', () => {
    it('should create a valid time allocation with updated hours', () => {
      const original = {
        activityType: ActivityType.STUDY,
        hoursPerDay: 4,
        hoursPerWeek: 28,
        percentage: 16.67,
      };

      const updated = updateTimeAllocation(original, 6);

      // Original should not be modified
      expect(original.hoursPerDay).toBe(4);
      expect(original.hoursPerWeek).toBe(28);

      // New object should have updated properties
      expect(updated.hoursPerDay).toBe(6);
      expect(updated.hoursPerWeek).toBe(42);
      expect(updated.percentage).toBe(25);
    });

    it('should bound hours to 0-24 range', () => {
      const original = {
        activityType: ActivityType.STUDY,
        hoursPerDay: 4,
        hoursPerWeek: 28,
        percentage: 16.67,
      };

      const tooHigh = updateTimeAllocation(original, 30);
      const tooLow = updateTimeAllocation(original, -5);

      // Hours should be bounded
      expect(tooHigh.hoursPerDay).toBe(24);
      expect(tooHigh.hoursPerWeek).toBe(168);

      expect(tooLow.hoursPerDay).toBe(0);
      expect(tooLow.hoursPerWeek).toBe(0);
    });
  });

  describe('updateWeeklyTimeAllocation', () => {
    it('should update an activity and balance other activities', () => {
      const original = {
        allocations: {
          [ActivityType.STUDY]: {
            activityType: ActivityType.STUDY,
            hoursPerDay: 4,
            hoursPerWeek: 28,
            percentage: 16.67,
          },
          [ActivityType.WORK]: {
            activityType: ActivityType.WORK,
            hoursPerDay: 4,
            hoursPerWeek: 28,
            percentage: 16.67,
          },
          [ActivityType.SOCIAL]: {
            activityType: ActivityType.SOCIAL,
            hoursPerDay: 4,
            hoursPerWeek: 28,
            percentage: 16.67,
          },
          [ActivityType.REST]: {
            activityType: ActivityType.REST,
            hoursPerDay: 8,
            hoursPerWeek: 56,
            percentage: 33.33,
          },
          [ActivityType.EXERCISE]: {
            activityType: ActivityType.EXERCISE,
            hoursPerDay: 4,
            hoursPerWeek: 28,
            percentage: 16.67,
          },
        },
        totalHours: 168,
        lastUpdated: 123456789,
      };

      const updated = updateWeeklyTimeAllocation(original, ActivityType.STUDY, 6);

      // Original should not be modified
      expect(original.allocations[ActivityType.STUDY].hoursPerDay).toBe(4);

      // Study should be increased
      expect(updated.allocations[ActivityType.STUDY].hoursPerDay).toBe(6);
      expect(updated.allocations[ActivityType.STUDY].hoursPerWeek).toBe(42);

      // Other activities should be reduced proportionally
      expect(updated.totalHours).toBe(168);

      // Total hours per day should be 24
      const totalHoursPerDay = Object.values(updated.allocations).reduce(
        (total, alloc) => total + alloc.hoursPerDay,
        0
      );
      expect(Math.round(totalHoursPerDay)).toBe(24);
    });
  });

  describe('updateEventQueue', () => {
    it('should create a new event queue with updated properties', () => {
      const original = {
        pending: [
          {
            id: 'event1',
            title: 'Event 1',
            description: 'Test event',
            type: EventType.TIME,
            trigger: { type: TriggerType.TIME, conditions: {} },
            conditions: [],
            effects: [],
          },
        ],
        active: [],
        resolved: [],
        narrativeArcs: {},
      };

      const newEvent = {
        id: 'event2',
        title: 'Event 2',
        description: 'Test event',
        type: EventType.TIME,
        trigger: { type: TriggerType.TIME, conditions: {} },
        conditions: [],
        effects: [],
      };

      const updated = updateEventQueue(original, {
        pending: [...original.pending, newEvent],
      });

      // Original should not be modified
      expect(original.pending.length).toBe(1);

      // New queue should have updated pending list
      expect(updated.pending.length).toBe(2);
      expect(updated.pending[1].id).toBe('event2');

      // Other properties should be unchanged
      expect(updated.active.length).toBe(0);
      expect(updated.resolved.length).toBe(0);
    });
  });

  describe('addEventToQueue', () => {
    it('should add an event to the pending queue', () => {
      const original = {
        pending: [
          {
            id: 'event1',
            title: 'Event 1',
            description: 'Test event',
            type: EventType.TIME,
            trigger: { type: TriggerType.TIME, conditions: {} },
            conditions: [],
            effects: [],
          },
        ],
        active: [],
        resolved: [],
        narrativeArcs: {},
      };

      const newEvent = {
        id: 'event2',
        title: 'Event 2',
        description: 'Test event',
        type: EventType.TIME,
        trigger: { type: TriggerType.TIME, conditions: {} },
        conditions: [],
        effects: [],
      };

      const updated = addEventToQueue(original, newEvent);

      // Original should not be modified
      expect(original.pending.length).toBe(1);

      // New queue should have event added to pending
      expect(updated.pending.length).toBe(2);
      expect(updated.pending[1].id).toBe('event2');
    });

    it('should add an event to the specified queue', () => {
      const original = {
        pending: [],
        active: [],
        resolved: [
          {
            id: 'event1',
            title: 'Event 1',
            description: 'Test event',
            type: EventType.TIME,
            trigger: { type: TriggerType.TIME, conditions: {} },
            conditions: [],
            effects: [],
          },
        ],
        narrativeArcs: {},
      };

      const newEvent = {
        id: 'event2',
        title: 'Event 2',
        description: 'Test event',
        type: EventType.TIME,
        trigger: { type: TriggerType.TIME, conditions: {} },
        conditions: [],
        effects: [],
      };

      const updated = addEventToQueue(original, newEvent, 'resolved');

      // New queue should have event added to resolved
      expect(updated.resolved.length).toBe(2);
      expect(updated.resolved[1].id).toBe('event2');

      // Other queues should be unchanged
      expect(updated.pending.length).toBe(0);
      expect(updated.active.length).toBe(0);
    });
  });

  describe('moveEventBetweenQueues', () => {
    it('should move an event from pending to active', () => {
      const original = {
        pending: [
          {
            id: 'event1',
            title: 'Event 1',
            description: 'Test event',
            type: EventType.TIME,
            trigger: { type: TriggerType.TIME, conditions: {} },
            conditions: [],
            effects: [],
          },
        ],
        active: [],
        resolved: [],
        narrativeArcs: {},
      };

      const updated = moveEventBetweenQueues(original, 'event1', 'pending', 'active');

      // Original should not be modified
      expect(original.pending.length).toBe(1);
      expect(original.active.length).toBe(0);

      // Event should be moved from pending to active
      expect(updated.pending.length).toBe(0);
      expect(updated.active.length).toBe(1);
      expect(updated.active[0].id).toBe('event1');
    });

    it('should not modify the queue if event is not found', () => {
      const original = {
        pending: [
          {
            id: 'event1',
            title: 'Event 1',
            description: 'Test event',
            type: EventType.TIME,
            trigger: { type: TriggerType.TIME, conditions: {} },
            conditions: [],
            effects: [],
          },
        ],
        active: [],
        resolved: [],
        narrativeArcs: {},
      };

      const updated = moveEventBetweenQueues(original, 'nonexistent', 'pending', 'active');

      // Queues should be unchanged
      expect(updated.pending.length).toBe(1);
      expect(updated.active.length).toBe(0);
      expect(updated.pending[0].id).toBe('event1');
    });
  });
});
