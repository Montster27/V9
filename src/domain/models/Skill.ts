/**
 * Skill System Implementation
 * 
 * Represents the Skill node structure for the game's Life Path Threads.
 * Skills are organized into threads (Body, Mind, Heart, World, Mastery),
 * with tier-based progression and exponential cost scaling.
 */

/**
 * Enum representing the five Life Path Threads
 */
export enum LifePathThread {
  BODY = 'body',        // Physical stamina, health, fitness
  MIND = 'mind',        // Critical thinking, problem solving, memory
  HEART = 'heart',      // Social, emotional, leadership
  WORLD = 'world',      // Resource management, finance, sustainability
  MASTERY = 'mastery'   // Specialized career and expertise
}

/**
 * Skill tier, representing the level of advancement
 * - Tier 1: Basic skills
 * - Tier 2: Intermediate skills
 * - Tier 3: Advanced skills
 */
export type SkillTier = 1 | 2 | 3;

/**
 * Types of effects a skill can have on player attributes
 */
export type EffectTarget = 
  | 'energy.max'
  | 'energy.regen'
  | 'stress.reduction'
  | 'knowledge.rate'
  | 'money.rate'
  | 'social.effectiveness'
  | 'health.resilience'
  | 'belonging.connections';

/**
 * Represents a single effect a skill has on the player
 */
export interface SkillEffect {
  target: EffectTarget;
  operation: 'ADD' | 'MULTIPLY' | 'SET';
  value: number;
}

/**
 * Represents a single skill node in the Life Path Thread
 */
export interface SkillNode {
  id: string;                   // Unique identifier for this skill
  name: string;                 // Display name
  description: string;          // Detailed description
  thread: LifePathThread;       // Which Life Path Thread this belongs to
  tier: SkillTier;              // Skill tier (1-3)
  baseCost: number;             // Base skill points required (before scaling)
  requires: string[];           // Prerequisite skill IDs
  effects: SkillEffect[];       // Effects this skill has when acquired
}

/**
 * Represents a player's acquisition of a skill
 */
export interface AcquiredSkill {
  skillId: string;              // Reference to the skill
  acquiredAt: number;           // Timestamp when acquired
  level: number;                // Current level (for skills with multiple levels)
}

/**
 * Player's skill progress state
 */
export interface SkillState {
  acquiredSkills: AcquiredSkill[];  // Skills the player has acquired
  skillPoints: number;              // Current available skill points
  totalPointsEarned: number;        // Total skill points earned over game
  lastUpdate: number;               // Timestamp of last update
}

/**
 * Calculator for skill point costs with exponential scaling
 */
export class SkillCostCalculator {
  /**
   * Calculates the actual cost of a skill based on its tier and progression
   * 
   * @param baseSkillCost Base cost in skill points
   * @param tier Skill tier (1-3)
   * @param previousSkillsInThread Number of skills already acquired in thread
   * @returns Final skill cost after scaling
   */
  calculateSkillCost(
    baseSkillCost: number,   
    tier: SkillTier,            
    previousSkillsInThread: number 
  ): number {
    // Apply exponential scaling based on tier
    // 1x for tier 1, 2x for tier 2, 4x for tier 3
    const tierMultiplier = Math.pow(2, tier - 1);
    
    // Apply additional scaling based on how many skills already acquired
    const progressionScaling = 1 + (previousSkillsInThread * 0.1);
    
    // Calculate final cost
    return Math.floor(baseSkillCost * tierMultiplier * progressionScaling);
  }
}

/**
 * Calculator for skill point generation over game time
 */
export class SkillPointsCalculator {
  /**
   * Calculates skill points earned based on elapsed time and modifiers
   * 
   * @param elapsed Time elapsed in hours
   * @param baseRate Base generation rate per hour (defaults to 1)
   * @param modifiers Activity and skill modifiers
   * @returns Number of skill points earned
   */
  calculateSkillPoints(
    elapsed: number,           
    baseRate: number = 1,      
    modifiers: Record<string, number> = {}  
  ): number {
    // Calculate base points from elapsed time
    const basePoints = elapsed * baseRate;
    
    // Apply bonuses from activities and skills
    const activityBonus = modifiers.activityBonus || 0;
    const skillSynergyMultiplier = modifiers.skillSynergy || 1;
    
    // Calculate total with bonuses
    return Math.floor(basePoints * skillSynergyMultiplier + activityBonus);
  }
}

/**
 * Service for checking skill requirements and availability
 */
export class SkillRequirementChecker {
  /**
   * Checks if a skill can be acquired based on prerequisites
   * 
   * @param skillNode The skill to check
   * @param acquiredSkills Array of currently acquired skills
   * @returns Whether all requirements are met
   */
  canAcquireSkill(skillNode: SkillNode, acquiredSkills: AcquiredSkill[]): boolean {
    // If there are no prerequisites, it can be acquired
    if (skillNode.requires.length === 0) {
      return true;
    }
    
    // Get list of acquired skill IDs
    const acquiredSkillIds = acquiredSkills.map(skill => skill.skillId);
    
    // Check if all required skill IDs are in the acquired list
    return skillNode.requires.every(requiredId => 
      acquiredSkillIds.includes(requiredId)
    );
  }
  
  /**
   * Gets the actual cost of acquiring a skill
   * 
   * @param skillNode The skill to acquire
   * @param acquiredSkills Currently acquired skills
   * @returns The final cost after scaling
   */
  getSkillCost(skillNode: SkillNode, acquiredSkills: AcquiredSkill[]): number {
    // Count how many skills are already acquired in this thread
    const previousSkillsInThread = acquiredSkills.filter(skill => {
      // Find the skill node definition to get its thread
      const skillDef = SkillRegistry.getSkillById(skill.skillId);
      return skillDef?.thread === skillNode.thread;
    }).length;
    
    // Calculate cost using the calculator
    const calculator = new SkillCostCalculator();
    return calculator.calculateSkillCost(
      skillNode.baseCost,
      skillNode.tier,
      previousSkillsInThread
    );
  }
}

/**
 * Registry of all available skills in the game
 */
export class SkillRegistry {
  private static skills: SkillNode[] = [];
  
  /**
   * Initialize the registry with predefined skills
   */
  static initialize(): void {
    this.skills = [
      // BODY Thread - Tier 1
      {
        id: 'body.stamina',
        name: 'Physical Stamina',
        description: 'Increases your maximum energy and recovery rate.',
        thread: LifePathThread.BODY,
        tier: 1,
        baseCost: 10,
        requires: [],
        effects: [
          { target: 'energy.max', operation: 'ADD', value: 10 },
          { target: 'energy.regen', operation: 'MULTIPLY', value: 1.1 }
        ]
      },
      {
        id: 'body.health',
        name: 'Health Awareness',
        description: 'Improves your health regeneration and reduces stress from physical activities.',
        thread: LifePathThread.BODY,
        tier: 1,
        baseCost: 15,
        requires: [],
        effects: [
          { target: 'health.resilience', operation: 'ADD', value: 5 },
          { target: 'stress.reduction', operation: 'ADD', value: 2 }
        ]
      },
      
      // MIND Thread - Tier 1
      {
        id: 'mind.focus',
        name: 'Mental Focus',
        description: 'Increases learning efficiency and study effectiveness.',
        thread: LifePathThread.MIND,
        tier: 1,
        baseCost: 10,
        requires: [],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 1.15 }
        ]
      },
      {
        id: 'mind.clarity',
        name: 'Mental Clarity',
        description: 'Reduces stress from academic activities and improves problem-solving.',
        thread: LifePathThread.MIND,
        tier: 1,
        baseCost: 15,
        requires: [],
        effects: [
          { target: 'stress.reduction', operation: 'ADD', value: 3 }
        ]
      },
      
      // HEART Thread - Tier 1
      {
        id: 'heart.empathy',
        name: 'Empathy',
        description: 'Improves social interactions and relationship building.',
        thread: LifePathThread.HEART,
        tier: 1,
        baseCost: 10,
        requires: [],
        effects: [
          { target: 'social.effectiveness', operation: 'MULTIPLY', value: 1.2 }
        ]
      },
      {
        id: 'heart.charisma',
        name: 'Charisma',
        description: 'Enhances your ability to influence others and form connections.',
        thread: LifePathThread.HEART,
        tier: 1,
        baseCost: 15,
        requires: [],
        effects: [
          { target: 'belonging.connections', operation: 'ADD', value: 5 }
        ]
      },
      
      // WORLD Thread - Tier 1
      {
        id: 'world.finances',
        name: 'Financial Awareness',
        description: 'Improves your earning potential and financial management.',
        thread: LifePathThread.WORLD,
        tier: 1,
        baseCost: 10,
        requires: [],
        effects: [
          { target: 'money.rate', operation: 'MULTIPLY', value: 1.1 }
        ]
      },
      {
        id: 'world.networking',
        name: 'Networking',
        description: 'Improves your ability to make professional connections.',
        thread: LifePathThread.WORLD,
        tier: 1,
        baseCost: 15,
        requires: [],
        effects: [
          { target: 'belonging.connections', operation: 'ADD', value: 3 },
          { target: 'social.effectiveness', operation: 'MULTIPLY', value: 1.1 }
        ]
      },
      
      // MASTERY Thread - Tier 1
      {
        id: 'mastery.specialization',
        name: 'Specialization',
        description: 'Begin developing expertise in a specific area.',
        thread: LifePathThread.MASTERY,
        tier: 1,
        baseCost: 20,
        requires: [],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 1.2 }
        ]
      },
      
      // Tier 2 examples (requires tier 1 skills)
      
      // BODY Thread - Tier 2
      {
        id: 'body.athleticism',
        name: 'Athleticism',
        description: 'Advanced physical capabilities and energy efficiency.',
        thread: LifePathThread.BODY,
        tier: 2,
        baseCost: 30,
        requires: ['body.stamina'],
        effects: [
          { target: 'energy.max', operation: 'ADD', value: 20 },
          { target: 'health.resilience', operation: 'ADD', value: 10 }
        ]
      },
      
      // MIND Thread - Tier 2
      {
        id: 'mind.critical_thinking',
        name: 'Critical Thinking',
        description: 'Advanced problem-solving and analytical capabilities.',
        thread: LifePathThread.MIND,
        tier: 2,
        baseCost: 30,
        requires: ['mind.focus'],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 1.3 }
        ]
      },
      
      // HEART Thread - Tier 2
      {
        id: 'heart.leadership',
        name: 'Leadership',
        description: 'Ability to inspire and guide others effectively.',
        thread: LifePathThread.HEART,
        tier: 2,
        baseCost: 30,
        requires: ['heart.charisma'],
        effects: [
          { target: 'social.effectiveness', operation: 'MULTIPLY', value: 1.5 }
        ]
      },
      
      // WORLD Thread - Tier 2
      {
        id: 'world.investing',
        name: 'Investment Acumen',
        description: 'Advanced financial knowledge and investment skills.',
        thread: LifePathThread.WORLD,
        tier: 2,
        baseCost: 30,
        requires: ['world.finances'],
        effects: [
          { target: 'money.rate', operation: 'MULTIPLY', value: 1.4 }
        ]
      },
      
      // MASTERY Thread - Tier 2
      {
        id: 'mastery.expertise',
        name: 'Domain Expertise',
        description: 'Developed expertise in your specialization.',
        thread: LifePathThread.MASTERY,
        tier: 2,
        baseCost: 40,
        requires: ['mastery.specialization'],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 1.5 }
        ]
      },
      
      // Tier 3 examples (requires tier 2 skills)
      
      // BODY Thread - Tier 3
      {
        id: 'body.peak_performance',
        name: 'Peak Physical Performance',
        description: 'Mastery of physical capabilities and efficiency.',
        thread: LifePathThread.BODY,
        tier: 3,
        baseCost: 60,
        requires: ['body.athleticism'],
        effects: [
          { target: 'energy.max', operation: 'ADD', value: 30 },
          { target: 'energy.regen', operation: 'MULTIPLY', value: 1.5 },
          { target: 'health.resilience', operation: 'ADD', value: 20 }
        ]
      },
      
      // MIND Thread - Tier 3
      {
        id: 'mind.genius',
        name: 'Cognitive Mastery',
        description: 'Expert-level thinking and learning capabilities.',
        thread: LifePathThread.MIND,
        tier: 3,
        baseCost: 60,
        requires: ['mind.critical_thinking'],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 2.0 },
          { target: 'stress.reduction', operation: 'ADD', value: 10 }
        ]
      },
      
      // HEART Thread - Tier 3
      {
        id: 'heart.inspiration',
        name: 'Inspirational Presence',
        description: 'Profound ability to connect with and motivate others.',
        thread: LifePathThread.HEART,
        tier: 3,
        baseCost: 60,
        requires: ['heart.leadership'],
        effects: [
          { target: 'social.effectiveness', operation: 'MULTIPLY', value: 2.0 },
          { target: 'belonging.connections', operation: 'ADD', value: 20 }
        ]
      },
      
      // WORLD Thread - Tier 3
      {
        id: 'world.mogul',
        name: 'Financial Mogul',
        description: 'Master-level financial and business acumen.',
        thread: LifePathThread.WORLD,
        tier: 3,
        baseCost: 60,
        requires: ['world.investing'],
        effects: [
          { target: 'money.rate', operation: 'MULTIPLY', value: 2.0 }
        ]
      },
      
      // MASTERY Thread - Tier 3
      {
        id: 'mastery.authority',
        name: 'Field Authority',
        description: 'Recognized expert with breakthrough capabilities.',
        thread: LifePathThread.MASTERY,
        tier: 3,
        baseCost: 80,
        requires: ['mastery.expertise'],
        effects: [
          { target: 'knowledge.rate', operation: 'MULTIPLY', value: 2.5 },
          { target: 'money.rate', operation: 'MULTIPLY', value: 1.5 }
        ]
      }
    ];
  }
  
  /**
   * Get all skills
   * @returns Array of all skill nodes
   */
  static getAllSkills(): SkillNode[] {
    if (this.skills.length === 0) {
      this.initialize();
    }
    return [...this.skills];
  }
  
  /**
   * Get skills for a specific Life Path Thread
   * @param thread The thread to get skills for
   * @returns Array of skill nodes for that thread
   */
  static getSkillsByThread(thread: LifePathThread): SkillNode[] {
    if (this.skills.length === 0) {
      this.initialize();
    }
    return this.skills.filter(skill => skill.thread === thread);
  }
  
  /**
   * Get a specific skill by ID
   * @param id The skill ID to look up
   * @returns The skill node or undefined if not found
   */
  static getSkillById(id: string): SkillNode | undefined {
    if (this.skills.length === 0) {
      this.initialize();
    }
    return this.skills.find(skill => skill.id === id);
  }
}

/**
 * Service for managing skill acquisition and skill point generation
 */
export class SkillManager {
  private requirementChecker: SkillRequirementChecker;
  private pointsCalculator: SkillPointsCalculator;
  
  constructor() {
    this.requirementChecker = new SkillRequirementChecker();
    this.pointsCalculator = new SkillPointsCalculator();
    
    // Ensure the registry is initialized
    SkillRegistry.initialize();
  }
  
  /**
   * Attempt to acquire a skill
   * 
   * @param skillId ID of the skill to acquire
   * @param state Current skill state
   * @returns Updated skill state or null if requirements not met
   */
  acquireSkill(skillId: string, state: SkillState): SkillState | null {
    // Get the skill definition
    const skillNode = SkillRegistry.getSkillById(skillId);
    if (!skillNode) {
      return null; // Skill doesn't exist
    }
    
    // Check if skill is already acquired
    if (state.acquiredSkills.some(skill => skill.skillId === skillId)) {
      return null; // Already have this skill
    }
    
    // Check if requirements are met
    if (!this.requirementChecker.canAcquireSkill(skillNode, state.acquiredSkills)) {
      return null; // Requirements not met
    }
    
    // Calculate the actual cost
    const cost = this.requirementChecker.getSkillCost(skillNode, state.acquiredSkills);
    
    // Check if player has enough skill points
    if (state.skillPoints < cost) {
      return null; // Not enough skill points
    }
    
    // Create new acquired skill
    const newSkill: AcquiredSkill = {
      skillId,
      acquiredAt: Date.now(),
      level: 1
    };
    
    // Return updated state
    return {
      ...state,
      acquiredSkills: [...state.acquiredSkills, newSkill],
      skillPoints: state.skillPoints - cost
    };
  }
  
  /**
   * Generate skill points based on elapsed game time
   * 
   * @param elapsed Time elapsed in hours
   * @param state Current skill state
   * @param modifiers Modifiers from activities and skills
   * @returns Updated skill state with new points
   */
  generateSkillPoints(
    elapsed: number,
    state: SkillState,
    modifiers: Record<string, number> = {}
  ): SkillState {
    // Calculate points to add
    const pointsToAdd = this.pointsCalculator.calculateSkillPoints(elapsed, 1, modifiers);
    
    // Return updated state
    return {
      ...state,
      skillPoints: state.skillPoints + pointsToAdd,
      totalPointsEarned: state.totalPointsEarned + pointsToAdd,
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Get all skills that are available to acquire
   * 
   * @param state Current skill state
   * @returns Array of skill nodes that can be acquired
   */
  getAvailableSkills(state: SkillState): SkillNode[] {
    // Get all skills
    const allSkills = SkillRegistry.getAllSkills();
    
    // Filter to skills that:
    // 1. Haven't been acquired yet
    // 2. Have their requirements met
    return allSkills.filter(skill => {
      // Check if already acquired
      const alreadyAcquired = state.acquiredSkills.some(
        acquired => acquired.skillId === skill.id
      );
      
      if (alreadyAcquired) {
        return false;
      }
      
      // Check if requirements met
      return this.requirementChecker.canAcquireSkill(skill, state.acquiredSkills);
    });
  }
  
  /**
   * Calculate the total effect of all acquired skills
   * 
   * @param state Current skill state
   * @returns Combined effects of all acquired skills
   */
  calculateSkillEffects(state: SkillState): Record<EffectTarget, number> {
    // Initialize effects object with default values
    const effects: Partial<Record<EffectTarget, number>> = {
      'energy.max': 0,
      'energy.regen': 1,
      'stress.reduction': 0,
      'knowledge.rate': 1,
      'money.rate': 1,
      'social.effectiveness': 1,
      'health.resilience': 0,
      'belonging.connections': 0
    };
    
    // Process each acquired skill
    state.acquiredSkills.forEach(acquiredSkill => {
      // Get the skill definition
      const skillNode = SkillRegistry.getSkillById(acquiredSkill.skillId);
      if (!skillNode) return;
      
      // Apply each effect
      skillNode.effects.forEach(effect => {
        const currentValue = effects[effect.target] || 0;
        
        // Apply the effect based on operation type
        switch (effect.operation) {
          case 'ADD':
            effects[effect.target] = currentValue + effect.value;
            break;
          case 'MULTIPLY':
            effects[effect.target] = currentValue * effect.value;
            break;
          case 'SET':
            effects[effect.target] = effect.value;
            break;
        }
      });
    });
    
    // Return the complete effects
    return effects as Record<EffectTarget, number>;
  }
}
