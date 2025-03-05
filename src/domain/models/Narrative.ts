import {
  NarrativeType,
  TriggerType,
  MysteryEventTrigger,
  ConspiracyEventTrigger,
} from '../types/narrative';
import { GameEvent, EventChoice, EventEffect } from '../types/index';

/**
 * Represents a clue in the narrative system
 */
export interface Clue {
  id: string;
  name: string;
  description: string;
  narrativeType: NarrativeType;
  conspiracyTier: number; // 1-5, indicates how deep in the conspiracy this clue is
  discovered: boolean;
  discoveryDate?: Date;
  relatedClues: string[]; // IDs of related clues
}

/**
 * Represents a timeline branch that can alter game history
 */
export interface TimelineBranch {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  chosen: boolean;
  requirements: {
    clues: string[];
    skills: Record<string, number>;
    resources: Record<string, number>;
  };
  effects: Array<{
    type: 'resource' | 'skill' | 'event' | 'narrative';
    target: string;
    value: number | string | boolean;
  }>;
  powerShifts: Record<string, number>; // How power dynamics change
}

/**
 * Represents a narrative arc in the game
 */
export interface NarrativeArc {
  id: string;
  name: string;
  description: string;
  type: NarrativeType;
  currentLevel: number; // Progress through this arc (1-10)
  maxLevel: number; // Maximum level for this arc
  clues: string[]; // IDs of clues associated with this arc
  events: string[]; // IDs of events associated with this arc
  timelineBranches: TimelineBranch[];
  active: boolean;
  completed: boolean;
}

/**
 * Mystery event specific to narrative/conspiracy system
 */
export interface MysteryEvent extends GameEvent {
  trigger: MysteryEventTrigger;
  revealedContent: string; // New lore/conspiracy content revealed
  futureBranches: string[]; // Future storylines this unlocks
  characterResponses: Record<string, string>; // How NPCs react to discoveries
  clueRewards: string[]; // Clues discovered through this event
}

/**
 * Conspiracy event for major timeline alterations
 */
export interface ConspiracyEvent extends GameEvent {
  trigger: ConspiracyEventTrigger;
  conspiracyTier: number; // Depth of conspiracy revelation (1-5)
  historicalDivergence: string; // How this changes historical timeline
  powerShift: Record<string, number>; // How power dynamics change
  newNarrativeBranches: string[]; // New story paths unlocked
  timelineBranches: TimelineBranch[]; // Possible timeline alterations
}

/**
 * Factory methods for creating narrative elements
 */
export class NarrativeFactory {
  /**
   * Create a new narrative arc
   */
  static createNarrativeArc(
    id: string,
    name: string,
    description: string,
    type: NarrativeType,
    maxLevel: number = 10,
    clues: string[] = [],
    events: string[] = [],
    timelineBranches: TimelineBranch[] = []
  ): NarrativeArc {
    return {
      id,
      name,
      description,
      type,
      currentLevel: 1,
      maxLevel,
      clues,
      events,
      timelineBranches,
      active: true,
      completed: false,
    };
  }

  /**
   * Create a new clue
   */
  static createClue(
    id: string,
    name: string,
    description: string,
    narrativeType: NarrativeType,
    conspiracyTier: number = 1,
    relatedClues: string[] = []
  ): Clue {
    return {
      id,
      name,
      description,
      narrativeType,
      conspiracyTier,
      discovered: false,
      relatedClues,
    };
  }

  /**
   * Create a new timeline branch
   */
  static createTimelineBranch(
    id: string,
    name: string,
    description: string,
    requirements: {
      clues: string[];
      skills: Record<string, number>;
      resources: Record<string, number>;
    },
    effects: EventEffect[],
    powerShifts: Record<string, number>
  ): TimelineBranch {
    return {
      id,
      name,
      description,
      unlocked: false,
      chosen: false,
      requirements,
      effects,
      powerShifts,
    };
  }

  /**
   * Create a new mystery event
   */
  static createMysteryEvent(
    id: string,
    title: string,
    description: string,
    choices: EventChoice[],
    conspiracyLevel: number,
    requiredClues: string[],
    skillRequirements: Record<string, number>,
    revealedContent: string,
    futureBranches: string[],
    characterResponses: Record<string, string>,
    clueRewards: string[]
  ): MysteryEvent {
    return {
      id,
      title,
      description,
      choices,
      trigger: {
        type: TriggerType.MYSTERY,
        conditions: {
          conspiracyLevel,
          requiredClues,
          skillRequirements,
        },
        // Add compatibility with base EventTrigger interface
        condition: 'mystery',
        value: conspiracyLevel,
      },
      revealedContent,
      futureBranches,
      characterResponses,
      clueRewards,
      isActive: false,
      isResolved: false,
    };
  }

  /**
   * Create a new conspiracy event
   */
  static createConspiracyEvent(
    id: string,
    title: string,
    description: string,
    choices: EventChoice[],
    worldTimeline: number,
    playerInfluence: number,
    discoveredEntities: string[],
    conspiracyTier: number,
    historicalDivergence: string,
    powerShift: Record<string, number>,
    newNarrativeBranches: string[],
    timelineBranches: TimelineBranch[]
  ): ConspiracyEvent {
    return {
      id,
      title,
      description,
      choices,
      trigger: {
        type: TriggerType.CONSPIRACY,
        conditions: {
          worldTimeline,
          playerInfluence,
          discoveredEntities,
        },
        // Add compatibility with base EventTrigger interface
        condition: 'conspiracy',
        value: conspiracyTier,
      },
      conspiracyTier,
      historicalDivergence,
      powerShift,
      newNarrativeBranches,
      timelineBranches,
      isActive: false,
      isResolved: false,
    };
  }
}
