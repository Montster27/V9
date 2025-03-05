/**
 * Unit tests for the Skill model
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LifePathThread,
  SkillNode,
  SkillEffect,
  AcquiredSkill,
  SkillState,
  SkillCostCalculator,
  SkillPointsCalculator,
  SkillRequirementChecker,
  SkillRegistry,
  SkillManager,
} from '../../../../domain/models/Skill';

describe('Skill System', () => {
  beforeEach(() => {
    // Ensure registry is initialized before each test
    SkillRegistry.initialize();
  });

  describe('SkillCostCalculator', () => {
    it('should calculate base cost for tier 1 skills', () => {
      const calculator = new SkillCostCalculator();
      const cost = calculator.calculateSkillCost(10, 1, 0);
      expect(cost).toBe(10); // Base cost * tier 1 multiplier (1x) * no progression scaling
    });

    it('should apply 2x multiplier for tier 2 skills', () => {
      const calculator = new SkillCostCalculator();
      const cost = calculator.calculateSkillCost(10, 2, 0);
      expect(cost).toBe(20); // Base cost * tier 2 multiplier (2x) * no progression scaling
    });

    it('should apply 4x multiplier for tier 3 skills', () => {
      const calculator = new SkillCostCalculator();
      const cost = calculator.calculateSkillCost(10, 3, 0);
      expect(cost).toBe(40); // Base cost * tier 3 multiplier (4x) * no progression scaling
    });

    it('should apply progression scaling based on previous skills', () => {
      const calculator = new SkillCostCalculator();
      const cost = calculator.calculateSkillCost(10, 1, 2);
      // Base cost (10) * tier 1 multiplier (1x) * progression scaling (1 + 2*0.1)
      expect(cost).toBe(Math.floor(10 * 1 * 1.2));
    });

    it('should handle combined tier and progression scaling', () => {
      const calculator = new SkillCostCalculator();
      const cost = calculator.calculateSkillCost(10, 3, 5);
      // Base cost (10) * tier 3 multiplier (4x) * progression scaling (1 + 5*0.1)
      expect(cost).toBe(Math.floor(10 * 4 * 1.5));
    });
  });

  describe('SkillPointsCalculator', () => {
    it('should generate points based on elapsed time', () => {
      const calculator = new SkillPointsCalculator();
      const points = calculator.calculateSkillPoints(24, 1, {});
      expect(points).toBe(24); // 24 hours * 1 point per hour
    });

    it('should apply activity bonuses', () => {
      const calculator = new SkillPointsCalculator();
      const points = calculator.calculateSkillPoints(24, 1, { activityBonus: 10 });
      expect(points).toBe(34); // 24 hours * 1 point + 10 bonus
    });

    it('should apply skill synergy multipliers', () => {
      const calculator = new SkillPointsCalculator();
      const points = calculator.calculateSkillPoints(24, 1, { skillSynergy: 1.5 });
      expect(points).toBe(36); // 24 hours * 1 point * 1.5 multiplier
    });

    it('should apply combined modifiers correctly', () => {
      const calculator = new SkillPointsCalculator();
      const points = calculator.calculateSkillPoints(24, 1, {
        activityBonus: 10,
        skillSynergy: 1.5,
      });
      expect(points).toBe(46); // (24 hours * 1 point * 1.5 multiplier) + 10 bonus
    });
  });

  describe('SkillRequirementChecker', () => {
    it('should allow skills with no prerequisites', () => {
      const checker = new SkillRequirementChecker();
      const skill: SkillNode = {
        id: 'test.skill',
        name: 'Test Skill',
        description: 'A test skill',
        thread: LifePathThread.BODY,
        tier: 1,
        baseCost: 10,
        requires: [],
        effects: [],
      };

      const result = checker.canAcquireSkill(skill, []);
      expect(result).toBe(true);
    });

    it('should check prerequisites for skills', () => {
      const checker = new SkillRequirementChecker();
      const skill: SkillNode = {
        id: 'test.advanced',
        name: 'Advanced Test Skill',
        description: 'An advanced test skill',
        thread: LifePathThread.BODY,
        tier: 2,
        baseCost: 20,
        requires: ['test.basic'],
        effects: [],
      };

      // Without prerequisite
      let result = checker.canAcquireSkill(skill, []);
      expect(result).toBe(false);

      // With prerequisite
      result = checker.canAcquireSkill(skill, [
        { skillId: 'test.basic', acquiredAt: 123, level: 1 },
      ]);
      expect(result).toBe(true);
    });
  });

  describe('SkillRegistry', () => {
    it('should provide access to all skills', () => {
      const skills = SkillRegistry.getAllSkills();
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should filter skills by thread', () => {
      const bodySkills = SkillRegistry.getSkillsByThread(LifePathThread.BODY);
      const mindSkills = SkillRegistry.getSkillsByThread(LifePathThread.MIND);

      expect(bodySkills.length).toBeGreaterThan(0);
      expect(mindSkills.length).toBeGreaterThan(0);

      bodySkills.forEach((skill) => {
        expect(skill.thread).toBe(LifePathThread.BODY);
      });

      mindSkills.forEach((skill) => {
        expect(skill.thread).toBe(LifePathThread.MIND);
      });
    });

    it('should look up skills by ID', () => {
      const skill = SkillRegistry.getSkillById('body.stamina');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('body.stamina');
      expect(skill?.thread).toBe(LifePathThread.BODY);
    });
  });

  describe('SkillManager', () => {
    let manager: SkillManager;
    let initialState: SkillState;

    beforeEach(() => {
      manager = new SkillManager();
      initialState = {
        acquiredSkills: [],
        skillPoints: 100,
        totalPointsEarned: 100,
        lastUpdate: Date.now(),
      };
    });

    it('should acquire a skill when requirements are met', () => {
      const result = manager.acquireSkill('body.stamina', initialState);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.acquiredSkills.length).toBe(1);
        expect(result.acquiredSkills[0].skillId).toBe('body.stamina');
        expect(result.skillPoints).toBe(90); // 100 - 10 (cost of body.stamina)
      }
    });

    it('should not acquire a skill when requirements are not met', () => {
      // Attempt to acquire a tier 2 skill without prerequisites
      const result = manager.acquireSkill('body.athleticism', initialState);

      expect(result).toBeNull();
    });

    it('should not acquire a skill if already owned', () => {
      const stateWithSkill: SkillState = {
        ...initialState,
        acquiredSkills: [{ skillId: 'body.stamina', acquiredAt: 123, level: 1 }],
      };

      const result = manager.acquireSkill('body.stamina', stateWithSkill);
      expect(result).toBeNull();
    });

    it('should not acquire a skill without enough points', () => {
      const poorState: SkillState = {
        ...initialState,
        skillPoints: 5, // Not enough for any skill
      };

      const result = manager.acquireSkill('body.stamina', poorState);
      expect(result).toBeNull();
    });

    it('should generate skill points based on elapsed time', () => {
      const result = manager.generateSkillPoints(24, initialState);

      expect(result.skillPoints).toBe(124); // 100 + 24 hours
      expect(result.totalPointsEarned).toBe(124); // 100 + 24
    });

    it('should calculate available skills correctly', () => {
      // With no skills, all tier 1 skills should be available
      let available = manager.getAvailableSkills(initialState);
      const tier1Count = SkillRegistry.getAllSkills().filter((s) => s.tier === 1).length;
      expect(available.length).toBe(tier1Count);

      // With a tier 1 skill, its tier 2 descendant should become available
      const stateWithStamina: SkillState = {
        ...initialState,
        acquiredSkills: [{ skillId: 'body.stamina', acquiredAt: 123, level: 1 }],
      };

      available = manager.getAvailableSkills(stateWithStamina);
      // Should include body.athleticism now
      const athleticismAvailable = available.some((s) => s.id === 'body.athleticism');
      expect(athleticismAvailable).toBe(true);
    });

    it('should calculate skill effects correctly', () => {
      // With stamina skill which adds energy.max and multiplies energy.regen
      const stateWithStamina: SkillState = {
        ...initialState,
        acquiredSkills: [{ skillId: 'body.stamina', acquiredAt: 123, level: 1 }],
      };

      const effects = manager.calculateSkillEffects(stateWithStamina);

      // Should have energy.max += 10 and energy.regen *= 1.1
      expect(effects['energy.max']).toBe(10);
      expect(effects['energy.regen']).toBe(1.1);
    });
  });
});
