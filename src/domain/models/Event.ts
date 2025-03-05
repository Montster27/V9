/**
 * /src/domain/models/Event.ts
 *
 * Standardized model for the game event system
 * Defines events, triggers, effects, and conditions
 */

/**
 * Types of events in the game
 */
export enum EventType {
  TIME = 'time',
  STATE = 'state',
  RANDOM = 'random',
  MYSTERY = 'mystery',
  CONSPIRACY = 'conspiracy',
  NARRATIVE = 'narrative',
}

/**
 * Types of event triggers
 */
export enum TriggerType {
  TIME = 'time',
  STATE = 'state',
  RANDOM = 'random',
  MYSTERY = 'mystery',
  CONSPIRACY = 'conspiracy',
  NARRATIVE = 'narrative',
}

/**
 * Types of effects that events can have
 */
export enum EffectType {
  MODIFY_RESOURCE = 'modify_resource',
  MODIFY_STRESS = 'modify_stress',
  MODIFY_ENERGY = 'modify_energy',
  ADD_MODIFIER = 'add_modifier',
  TRIGGER_EVENT = 'trigger_event',
}

/**
 * Condition operations for event triggers
 */
export enum ConditionOperation {
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
}

/**
 * Base event trigger interface
 */
export interface EventTrigger {
  readonly type: TriggerType;
  readonly conditions: Record<string, any>;
}

/**
 * Effect that an event has on the game state
 */
export interface EventEffect {
  readonly type: EffectType;
  readonly target: string;
  readonly value: number | string;
  readonly duration?: number;
}

/**
 * A condition that must be met for an event to trigger
 */
export interface EventCondition {
  readonly type: string;
  readonly target: string;
  readonly operation: ConditionOperation;
  readonly value: any;
}

/**
 * A choice that players can make in response to an event
 */
export interface EventChoice {
  readonly id: string;
  readonly text: string;
  readonly requirements: readonly EventCondition[];
  readonly effects: readonly EventEffect[];
  readonly stress: number;
  readonly energy: number;
}

/**
 * Base game event interface with common properties
 */
export interface BaseGameEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: EventType;
  readonly conditions: readonly EventCondition[];
  readonly effects: readonly EventEffect[];
  readonly choices?: readonly EventChoice[];
  readonly timeLimit?: number;
  readonly resolvedWithChoice?: string; // Set when event is resolved
}

/**
 * The main game event interface
 */
export interface GameEvent extends BaseGameEvent {
  readonly trigger: EventTrigger;
}

/**
 * Time-based event with specific timing conditions
 */
export interface TimeEvent extends BaseGameEvent {
  readonly type: EventType.TIME;
  readonly trigger: {
    readonly type: TriggerType.TIME;
    readonly conditions: {
      readonly time?: number; // Specific time
      readonly dayOfWeek?: number; // 0-6
      readonly repeat?: boolean; // Whether event repeats
    };
  };
}

/**
 * State-based event with resource/state conditions
 */
export interface StateEvent extends BaseGameEvent {
  readonly type: EventType.STATE;
  readonly trigger: {
    readonly type: TriggerType.STATE;
    readonly conditions: {
      readonly resource?: {
        readonly type: string;
        readonly threshold: number;
        readonly operation: ConditionOperation;
      };
      readonly stress?: {
        readonly threshold: number;
        readonly operation: ConditionOperation;
      };
      readonly energy?: {
        readonly threshold: number;
        readonly operation: ConditionOperation;
      };
    };
  };
}

/**
 * Random event with chance-based trigger
 */
export interface RandomEvent extends BaseGameEvent {
  readonly type: EventType.RANDOM;
  readonly trigger: {
    readonly type: TriggerType.RANDOM;
    readonly conditions: {
      readonly chance: number; // 0-1 probability
      readonly cooldown: number; // Minimum time between occurrences
    };
  };
}

/**
 * Mystery event related to the conspiracy storyline
 */
export interface MysteryEvent extends BaseGameEvent {
  readonly type: EventType.MYSTERY;
  readonly trigger: {
    readonly type: TriggerType.MYSTERY;
    readonly conditions: {
      readonly conspiracyLevel: number; // Player's current level in conspiracy arc (1-10)
      readonly requiredClues: readonly string[]; // Clues that must be discovered first
      readonly skillRequirements?: Record<string, number>; // Skills needed to trigger
    };
  };
  readonly revealedContent: string; // New lore/conspiracy content revealed
  readonly futureBranches: readonly string[]; // Future storylines this unlocks
  readonly characterResponses: Record<string, string>; // How NPCs react to discoveries
}

/**
 * Conspiracy event that changes the game world
 */
export interface ConspiracyEvent extends BaseGameEvent {
  readonly type: EventType.CONSPIRACY;
  readonly trigger: {
    readonly type: TriggerType.CONSPIRACY;
    readonly conditions: {
      readonly worldTimeline: number; // Game world year/era (1983-1990)
      readonly playerInfluence: number; // Player's influence level (1-100)
      readonly discoveredEntities: readonly string[]; // Key figures/organizations discovered
    };
  };
  readonly conspiracyTier: number; // Depth of conspiracy revelation (1-5)
  readonly historicalDivergence: string; // How this changes historical timeline
  readonly powerShift: Record<string, number>; // How power dynamics change
  readonly newNarrativeBranches: readonly string[]; // New story paths unlocked
}

/**
 * Narrative event for story progression
 */
export interface NarrativeEvent extends BaseGameEvent {
  readonly type: EventType.NARRATIVE;
  readonly trigger: {
    readonly type: TriggerType.NARRATIVE;
    readonly conditions: {
      readonly storyProgress: number; // Story progression threshold
      readonly requiredEvents: readonly string[]; // Events that must have occurred
    };
  };
  readonly narrativeSegment: string; // Text/content to present
  readonly relationshipChanges: Record<string, number>; // NPC relationship changes
}

/**
 * Event queue management
 */
export interface EventQueue {
  readonly pending: GameEvent[]; // Events waiting to trigger
  readonly active: GameEvent[]; // Currently active events
  readonly resolved: GameEvent[]; // Completed events
  readonly narrativeArcs: Record<string, NarrativeProgress>; // Progress in storylines
}

/**
 * Progress tracking for narrative arcs
 */
export interface NarrativeProgress {
  readonly arcId: string; // Identifier for storyline (e.g., "gerontocracy", "tech-monopoly")
  readonly currentLevel: number; // Current progression (1-10)
  readonly discoveredClues: readonly string[]; // Clues player has found
  readonly unlockedEvents: readonly string[]; // Events triggered by progression
  readonly characterKnowledge: Record<string, boolean>; // Which NPCs know what player knows
}

/**
 * Type guard to check if an event is a TimeEvent
 * @param event The event to check
 * @returns True if the event is a TimeEvent
 */
export function isTimeEvent(event: GameEvent): event is TimeEvent {
  return event.type === EventType.TIME && event.trigger.type === TriggerType.TIME;
}

/**
 * Type guard to check if an event is a StateEvent
 * @param event The event to check
 * @returns True if the event is a StateEvent
 */
export function isStateEvent(event: GameEvent): event is StateEvent {
  return event.type === EventType.STATE && event.trigger.type === TriggerType.STATE;
}

/**
 * Type guard to check if an event is a RandomEvent
 * @param event The event to check
 * @returns True if the event is a RandomEvent
 */
export function isRandomEvent(event: GameEvent): event is RandomEvent {
  return event.type === EventType.RANDOM && event.trigger.type === TriggerType.RANDOM;
}

/**
 * Type guard to check if an event is a MysteryEvent
 * @param event The event to check
 * @returns True if the event is a MysteryEvent
 */
export function isMysteryEvent(event: GameEvent): event is MysteryEvent {
  return event.type === EventType.MYSTERY && event.trigger.type === TriggerType.MYSTERY;
}

/**
 * Type guard to check if an event is a ConspiracyEvent
 * @param event The event to check
 * @returns True if the event is a ConspiracyEvent
 */
export function isConspiracyEvent(event: GameEvent): event is ConspiracyEvent {
  return event.type === EventType.CONSPIRACY && event.trigger.type === TriggerType.CONSPIRACY;
}

/**
 * Type guard to check if an event is a NarrativeEvent
 * @param event The event to check
 * @returns True if the event is a NarrativeEvent
 */
export function isNarrativeEvent(event: GameEvent): event is NarrativeEvent {
  return event.type === EventType.NARRATIVE && event.trigger.type === TriggerType.NARRATIVE;
}

/**
 * Create a default event queue
 * @returns A new empty event queue
 */
export function createDefaultEventQueue(): EventQueue {
  return {
    pending: [],
    active: [],
    resolved: [],
    narrativeArcs: {},
  };
}
