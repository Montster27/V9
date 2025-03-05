// Narrative and conspiracy related types
import { NarrativeArc, Clue, TimelineBranch } from '../models/Narrative';

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
  NARRATIVE = 'narrative',
}

export interface MysteryEventTrigger {
  type: TriggerType.MYSTERY;
  conditions: {
    conspiracyLevel: number;
    requiredClues: string[];
    skillRequirements?: Record<string, number>;
  };
  // Adding compatibility with EventTrigger interface
  condition?: string;
  value?: any;
}

export interface ConspiracyEventTrigger {
  type: TriggerType.CONSPIRACY;
  conditions: {
    worldTimeline: number;
    playerInfluence: number;
    discoveredEntities: string[];
  };
  // Adding compatibility with EventTrigger interface
  condition?: string;
  value?: any;
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
