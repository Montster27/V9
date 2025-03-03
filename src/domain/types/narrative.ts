// Narrative and conspiracy related types

export enum NarrativeType {
  MYSTERY = 'mystery',
  CONSPIRACY = 'conspiracy',
  PERSONAL = 'personal',
  HISTORICAL = 'historical',
}

export enum TriggerType {
  TIME = 'time',
  STATE = 'state',
  RANDOM = 'random',
  MYSTERY = 'mystery',
  CONSPIRACY = 'conspiracy',
  NARRATIVE = 'narrative'
}

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

export interface MysteryEventTrigger {
  type: TriggerType.MYSTERY;
  conditions: {
    conspiracyLevel: number;
    requiredClues: string[];
    skillRequirements?: Record<string, number>;
  };
}

export interface ConspiracyEventTrigger {
  type: TriggerType.CONSPIRACY;
  conditions: {
    worldTimeline: number;
    playerInfluence: number;
    discoveredEntities: string[];
  };
}

export interface NarrativeProgress {
  arcs: Record<string, NarrativeArc>;
  discoveredClues: Record<string, Clue>;
  availableClues: Record<string, Clue>;
  activeEvents: string[];
  completedEvents: string[];
  conspiracyTier: number; // 1-5, how deep the player is in the conspiracy
  timelineAlterations: TimelineBranch[];
  characterKnowledge: Record<string, Record<string, boolean>>; // Which NPCs know what player knows
}
