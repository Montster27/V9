/**
 * /src/domain/services/UseOfTimeManager.test.ts
 * 
 * Tests for the UseOfTimeManager service
 */

import { UseOfTimeManager, UseOfTimeEventType } from './UseOfTimeManager';
import { TimeManager } from './TimeManager';
import { ActivityType, createDefaultTimeAllocation } from '../models/UseOfTime';
import { TimeValue } from '../valueObjects/TimeValue';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UseOfTimeManager', () => {
  let useOfTimeManager: UseOfTimeManager;
  let timeManager: TimeManager;

  beforeEach(() => {
    // Create a fresh TimeManager instance for each test
    timeManager = new TimeManager({
      realSecondsPerGameDay: 3,
      skillPointsPerGameHour: 1,
      newsUpdateFrequencyHours: 4,
      startPaused: true
    });

    // Create a fresh UseOfTimeManager instance for each test
    useOfTimeManager = new UseOfTimeManager({
      timeManager,
      baseSkillCost: 10,
      tierScalingFactor: 2,
      threadProgressionFactor: 0.1
    });

    // Mock Date.now to return a consistent value
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    // Restore mocked functions
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values when no config is provided', () => {
      const manager = new UseOfTimeManager();
      const state = manager.getState();
      
      expect(state.currentAllocation).toBeDefined();
      expect(state.resourceImpacts).toBeDefined();
      expect(state.isValid).toBe(true);
      expect(state.validationErrors).toHaveLength(0);
    });

    it('should use provided initial allocation when given', () => {
      const initialAllocation = createDefaultTimeAllocation();
      initialAllocation.allocations[ActivityType.STUDY].hoursPerDay = 6;
      initialAllocation.allocations[ActivityType.WORK].hoursPerDay = 4;
      initialAllocation.allocations[ActivityType.SOCIAL].hoursPerDay = 4;
      initialAllocation.allocations[ActivityType.REST].hoursPerDay = 8;
      initialAllocation.allocations[ActivityType.EXERCISE].hoursPerDay = 2;
      
      const manager = new UseOfTimeManager({ initialAllocation });
      const state = manager.getState();
      
      expect(state.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay).toBe(6);
      expect(state.currentAllocation.allocations[ActivityType.WORK].hoursPerDay).toBe(4);
    });
  });

  describe('updateAllocation', () => {
    it('should update allocation for a specific activity', () => {
      const newHoursPerDay = 6;
      useOfTimeManager.updateAllocation(ActivityType.STUDY, newHoursPerDay);
      
      const updatedState = useOfTimeManager.getState();
      expect(updatedState.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay).toBe(newHoursPerDay);
      expect(updatedState.currentAllocation.allocations[ActivityType.STUDY].hoursPerWeek).toBe(newHoursPerDay * 7);
    });

    it('should proportionally adjust other activities when hours increase', () => {
      // Start with default allocation (8 hours rest, 4 hours each for other activities)
      const initialState = useOfTimeManager.getState();
      const initialRestHours = initialState.currentAllocation.allocations[ActivityType.REST].hoursPerDay;
      
      // Increase study to 8 hours (from 4)
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 8);
      
      // Check that other activities were reduced proportionally
      const updatedState = useOfTimeManager.getState();
      
      // Rest hours should be reduced but not eliminated
      expect(updatedState.currentAllocation.allocations[ActivityType.REST].hoursPerDay).toBeLessThan(initialRestHours);
      
      // Total daily hours should still be 24
      const totalDailyHours = Object.values(updatedState.currentAllocation.allocations)
        .reduce((sum, alloc) => sum + alloc.hoursPerDay, 0);
      
      expect(totalDailyHours).toBeCloseTo(24, 2);
    });

    it('should recalculate resource impacts after allocation update', () => {
      const initialImpacts = useOfTimeManager.getState().resourceImpacts;
      
      // Increase study hours
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 8);
      
      const updatedImpacts = useOfTimeManager.getState().resourceImpacts;
      
      // Knowledge should increase
      expect(updatedImpacts.knowledge).toBeGreaterThan(initialImpacts.knowledge);
      
      // Energy should decrease (more study = more energy consumption)
      expect(updatedImpacts.energy).toBeLessThan(initialImpacts.energy);
    });

    it('should calculate stress penalties for insufficient rest', () => {
      // Reduce rest to 4 hours (below 8 hours minimum)
      useOfTimeManager.updateAllocation(ActivityType.REST, 4);
      
      const state = useOfTimeManager.getState();
      
      // Should have stress penalties
      expect(state.stressPenalties).toBeGreaterThan(0);
    });

    it('should calculate stress penalties for overexertion (over 12 active hours)', () => {
      // Set rest to very low (1 hour) which means 23 active hours
      useOfTimeManager.updateAllocation(ActivityType.REST, 1);
      
      const state = useOfTimeManager.getState();
      
      // Should have overexertion penalties
      expect(state.stressPenalties).toBeGreaterThan(0);
    });

    it('should emit ALLOCATION_CHANGED event when allocation is updated', () => {
      const mockListener = vi.fn();
      useOfTimeManager.addEventListener(UseOfTimeEventType.ALLOCATION_CHANGED, mockListener);
      
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 6);
      
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener.mock.calls[0][0].activityType).toBe(ActivityType.STUDY);
    });

    it('should handle invalid inputs gracefully', () => {
      // Try to set negative hours
      useOfTimeManager.updateAllocation(ActivityType.STUDY, -5);
      
      // State should remain valid
      const state = useOfTimeManager.getState();
      expect(state.isValid).toBe(true);
      
      // Hours should be clamped to valid range
      expect(state.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetToDefault', () => {
    it('should reset allocation to default values', () => {
      // First, change the allocation
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 10);
      useOfTimeManager.updateAllocation(ActivityType.REST, 6);
      
      // Then reset to default
      useOfTimeManager.resetToDefault();
      
      // Check that values are back to default
      const state = useOfTimeManager.getState();
      expect(state.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay).toBe(4);
      expect(state.currentAllocation.allocations[ActivityType.REST].hoursPerDay).toBe(8);
    });

    it('should recalculate resource impacts after reset', () => {
      // First, change the allocation
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 10);
      
      // Get the modified resource impacts
      const modifiedImpacts = useOfTimeManager.getState().resourceImpacts;
      
      // Then reset to default
      useOfTimeManager.resetToDefault();
      
      // Get the default resource impacts
      const defaultImpacts = useOfTimeManager.getState().resourceImpacts;
      
      // They should be different
      expect(defaultImpacts).not.toEqual(modifiedImpacts);
    });
  });

  describe('calculateSkillCost', () => {
    it('should calculate tier 1 skill cost correctly', () => {
      const cost = useOfTimeManager.calculateSkillCost(10, 1, 0, 'Mind');
      expect(cost).toBe(10); // 10 * 1 * (1 + 0*0.1)
    });

    it('should apply tier scaling factor correctly', () => {
      const tier1Cost = useOfTimeManager.calculateSkillCost(10, 1, 0, 'Mind');
      const tier2Cost = useOfTimeManager.calculateSkillCost(10, 2, 0, 'Mind');
      const tier3Cost = useOfTimeManager.calculateSkillCost(10, 3, 0, 'Mind');
      
      expect(tier2Cost).toBe(tier1Cost * 2); // 10 * 2 * (1 + 0*0.1)
      expect(tier3Cost).toBe(tier1Cost * 4); // 10 * 4 * (1 + 0*0.1)
    });

    it('should apply thread progression scaling correctly', () => {
      const baseCase = useOfTimeManager.calculateSkillCost(10, 1, 0, 'Mind');
      const oneSkill = useOfTimeManager.calculateSkillCost(10, 1, 1, 'Mind');
      const fiveSkills = useOfTimeManager.calculateSkillCost(10, 1, 5, 'Mind');
      
      expect(oneSkill).toBe(Math.floor(10 * (1 + 1*0.1))); // 10 * 1 * (1 + 1*0.1) = 11
      expect(fiveSkills).toBe(Math.floor(10 * (1 + 5*0.1))); // 10 * 1 * (1 + 5*0.1) = 15
    });

    it('should combine tier scaling and thread progression', () => {
      const cost = useOfTimeManager.calculateSkillCost(10, 2, 3, 'Mind');
      
      // 10 * 2 (tier 2) * (1 + 3*0.1) = 10 * 2 * 1.3 = 26
      expect(cost).toBe(Math.floor(10 * 2 * (1 + 3*0.1)));
    });

    it('should emit SKILL_COST_CALCULATED event', () => {
      const mockListener = vi.fn();
      useOfTimeManager.addEventListener(UseOfTimeEventType.SKILL_COST_CALCULATED, mockListener);
      
      useOfTimeManager.calculateSkillCost(10, 2, 3, 'Mind');
      
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener.mock.calls[0][0].skillTier).toBe(2);
      expect(mockListener.mock.calls[0][0].skillThreadName).toBe('Mind');
    });
  });

  describe('calculateHourlyResourceImpact', () => {
    it('should calculate proportional resource impact for elapsed hours', () => {
      // Set up a known allocation
      useOfTimeManager.updateAllocation(ActivityType.STUDY, 8); // 56 hours per week (8 * 7)
      
      // Get weekly impact
      const weeklyImpact = useOfTimeManager.getWeeklyResourceImpacts();
      
      // Calculate impact for 24 hours (1 day)
      const dailyImpact = useOfTimeManager.calculateHourlyResourceImpact(24);
      
      // Should be approximately 1/7 of weekly impact
      expect(dailyImpact.knowledge).toBeCloseTo(weeklyImpact.knowledge / 7, 2);
      expect(dailyImpact.money).toBeCloseTo(weeklyImpact.money / 7, 2);
      expect(dailyImpact.social).toBeCloseTo(weeklyImpact.social / 7, 2);
      expect(dailyImpact.energy).toBeCloseTo(weeklyImpact.energy / 7, 2);
    });

    it('should include stress penalties in hourly calculations', () => {
      // Set up allocation with high stress penalties
      useOfTimeManager.updateAllocation(ActivityType.REST, 2); // Very little rest = high stress
      
      // Get weekly data
      const weeklyImpact = useOfTimeManager.getWeeklyResourceImpacts();
      const stressPenalties = useOfTimeManager.getState().stressPenalties;
      
      // Make sure we have penalties
      expect(stressPenalties).toBeGreaterThan(0);
      
      // Calculate impact for 24 hours (1 day)
      const dailyImpact = useOfTimeManager.calculateHourlyResourceImpact(24);
      
      // Total stress should include penalties scaled to 1 day
      const expectedDailyStress = (weeklyImpact.stress + stressPenalties) / 7;
      expect(dailyImpact.stress).toBeCloseTo(expectedDailyStress, 2);
    });
  });

  describe('TimeManager integration', () => {
    it('should connect to TimeManager events', () => {
      // Mock the emitEvent method
      const mockEmitEvent = vi.fn();
      useOfTimeManager['emitEvent'] = mockEmitEvent;
      
      // Simulate time passage (1 hour)
      const mockDate = new Date(1983, 8, 1, 1); // Sept 1, 1983, 1:00
      timeManager.setTime(new TimeValue(mockDate));
      timeManager.resume();
      
      // Mock 3 seconds elapsed (1 game day)
      vi.spyOn(Date, 'now').mockImplementation(() => 1000 + 3000);
      timeManager.tick(1000 + 3000);
      
      // Should have calculated hourly resource impact
      expect(mockEmitEvent).toHaveBeenCalled();
    });

    it('should handle additional TimeManager if set after construction', () => {
      // Create manager without TimeManager
      const managerWithoutTime = new UseOfTimeManager();
      
      // Set TimeManager after creation
      managerWithoutTime.setTimeManager(timeManager);
      
      // Should connect successfully
      expect(managerWithoutTime['timeManager']).toBe(timeManager);
    });
  });

  describe('utility methods', () => {
    it('should get allocation for a specific activity', () => {
      const studyAllocation = useOfTimeManager.getAllocationForActivity(ActivityType.STUDY);
      expect(studyAllocation.activityType).toBe(ActivityType.STUDY);
      expect(studyAllocation.hoursPerDay).toBeDefined();
    });

    it('should get weekly resource impacts including stress penalties', () => {
      // Set up an allocation with stress penalties
      useOfTimeManager.updateAllocation(ActivityType.REST, 4); // Below 8 hours = penalties
      
      const impacts = useOfTimeManager.getWeeklyResourceImpacts();
      
      // Should include total stress with penalties
      expect(impacts.totalStress).toBeGreaterThan(impacts.stress);
    });

    it('should get current allocation', () => {
      const allocation = useOfTimeManager.getCurrentAllocation();
      expect(allocation.totalHours).toBe(168);
      expect(Object.keys(allocation.allocations).length).toBe(5); // 5 activity types
    });
  });
});