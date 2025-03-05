/**
 * /src/infrastructure/state/slices/eventSlice.ts
 *
 * Redux slice for managing game events
 * Handles event queue, event processing, and event responses
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  GameEvent,
  EventQueue,
  EventChoice,
  EventEffect,
  createDefaultEventQueue,
  NarrativeProgress,
  BaseGameEvent,
} from '../../../domain/models';

// Extended state with initialization flag
interface EventSliceState {
  queue: EventQueue;
  activeEventId: string | null;
  lastProcessed: number;
  initialized: boolean;
}

// Define proper type-safe payloads
export interface ResolveEventPayload {
  eventId: string;
  choiceId?: string;
}

export interface NarrativeArcPayload {
  arcId: string;
  level: number;
  clues: string[];
}

export interface UnlockEventPayload {
  arcId: string;
  eventId: string;
}

export interface CharacterKnowledgePayload {
  arcId: string;
  characterId: string;
  knows: boolean;
}

// Initial state
const initialState: EventSliceState = {
  queue: createDefaultEventQueue(),
  activeEventId: null,
  lastProcessed: Date.now(),
  initialized: false,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    initializeEvents: (state) => {
      state.initialized = true;
    },

    addEvent: (state, action: PayloadAction<GameEvent>) => {
      // Ensure we have a valid event with required fields
      const event = action.payload;
      if (!event.id || !event.trigger || !event.type) {
        console.error('Invalid event structure', event);
        return;
      }

      state.queue.pending.push(event);
    },

    addEvents: (state, action: PayloadAction<GameEvent[]>) => {
      // Filter out invalid events
      const validEvents = action.payload.filter((event) => event.id && event.trigger && event.type);

      if (validEvents.length !== action.payload.length) {
        console.warn('Some events were invalid and not added to the queue');
      }

      state.queue.pending.push(...validEvents);
    },

    activateEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventIndex = state.queue.pending.findIndex((e) => e.id === eventId);

      if (eventIndex !== -1) {
        // Move from pending to active
        const event = state.queue.pending[eventIndex];
        state.queue.pending.splice(eventIndex, 1);
        state.queue.active.push(event);
        state.activeEventId = eventId;
      } else {
        console.warn(`Event with ID ${eventId} not found in pending queue`);
      }
    },

    resolveEvent: (state, action: PayloadAction<ResolveEventPayload>) => {
      const { eventId, choiceId } = action.payload;
      const eventIndex = state.queue.active.findIndex((e) => e.id === eventId);

      if (eventIndex !== -1) {
        // Move from active to resolved
        const event = { ...state.queue.active[eventIndex] };

        // Create a new event object with the choice information
        const resolvedEvent: GameEvent = {
          ...event,
          resolvedWithChoice: choiceId,
        };

        state.queue.active.splice(eventIndex, 1);
        state.queue.resolved.push(resolvedEvent);

        // Clear active event if it was this one
        if (state.activeEventId === eventId) {
          state.activeEventId = null;
        }
      } else {
        console.warn(`Event with ID ${eventId} not found in active queue`);
      }
    },

    advanceNarrativeArc: (state, action: PayloadAction<NarrativeArcPayload>) => {
      const { arcId, level, clues } = action.payload;

      if (!arcId || typeof level !== 'number' || !Array.isArray(clues)) {
        console.error('Invalid narrative arc payload', action.payload);
        return;
      }

      // Get or create narrative arc with proper structure
      let narrativeArc = state.queue.narrativeArcs[arcId];

      if (!narrativeArc) {
        // Create a new narrative arc with required fields
        narrativeArc = {
          arcId,
          currentLevel: 0,
          discoveredClues: [],
          unlockedEvents: [],
          characterKnowledge: {},
        };
      }

      // Update narrative arc - create a new object to maintain immutability
      state.queue.narrativeArcs[arcId] = {
        ...narrativeArc,
        currentLevel: level,
        discoveredClues: [...new Set([...narrativeArc.discoveredClues, ...clues])],
      };
    },

    unlockEvent: (state, action: PayloadAction<UnlockEventPayload>) => {
      const { arcId, eventId } = action.payload;

      if (!arcId || !eventId) {
        console.error('Invalid unlock event payload', action.payload);
        return;
      }

      if (!state.queue.narrativeArcs[arcId]) {
        // Create narrative arc if it doesn't exist
        state.queue.narrativeArcs[arcId] = {
          arcId,
          currentLevel: 0,
          discoveredClues: [],
          unlockedEvents: [eventId], // Add the event immediately
          characterKnowledge: {},
        };
      } else {
        // Add event to existing narrative arc - create a new array to maintain immutability
        state.queue.narrativeArcs[arcId] = {
          ...state.queue.narrativeArcs[arcId],
          unlockedEvents: [...state.queue.narrativeArcs[arcId].unlockedEvents, eventId],
        };
      }
    },

    updateCharacterKnowledge: (state, action: PayloadAction<CharacterKnowledgePayload>) => {
      const { arcId, characterId, knows } = action.payload;

      if (!arcId || !characterId || typeof knows !== 'boolean') {
        console.error('Invalid character knowledge payload', action.payload);
        return;
      }

      if (!state.queue.narrativeArcs[arcId]) {
        // Create narrative arc if it doesn't exist
        state.queue.narrativeArcs[arcId] = {
          arcId,
          currentLevel: 0,
          discoveredClues: [],
          unlockedEvents: [],
          characterKnowledge: { [characterId]: knows }, // Initialize with this character's knowledge
        };
      } else {
        // Update character knowledge in existing narrative arc - create a new object to maintain immutability
        state.queue.narrativeArcs[arcId] = {
          ...state.queue.narrativeArcs[arcId],
          characterKnowledge: {
            ...state.queue.narrativeArcs[arcId].characterKnowledge,
            [characterId]: knows,
          },
        };
      }
    },

    processEvents: (state) => {
      // Just update the timestamp - actual processing happens in middleware/thunk
      state.lastProcessed = Date.now();
    },

    clearEvents: (state) => {
      state.queue = createDefaultEventQueue();
      state.activeEventId = null;
    },
  },
});

// Actions
export const {
  initializeEvents,
  addEvent,
  addEvents,
  activateEvent,
  resolveEvent,
  advanceNarrativeArc,
  unlockEvent,
  updateCharacterKnowledge,
  processEvents,
  clearEvents,
} = eventSlice.actions;

// Base selector
const selectEventsState = (state: RootState) => state.events;

// Memoized selectors
export const selectEventQueue = createSelector([selectEventsState], (events) => events.queue);

export const selectPendingEvents = createSelector([selectEventQueue], (queue) => queue.pending);

export const selectActiveEvents = createSelector([selectEventQueue], (queue) => queue.active);

export const selectResolvedEvents = createSelector([selectEventQueue], (queue) => queue.resolved);

export const selectActiveEventId = createSelector(
  [selectEventsState],
  (events) => events.activeEventId
);

export const selectActiveEvent = createSelector(
  [selectActiveEvents, selectActiveEventId],
  (activeEvents, activeEventId) =>
    activeEventId ? activeEvents.find((e) => e.id === activeEventId) : null
);

export const selectNarrativeArcs = createSelector(
  [selectEventQueue],
  (queue) => queue.narrativeArcs
);

export const selectNarrativeArc = (arcId: string) =>
  createSelector([selectNarrativeArcs], (arcs) => arcs[arcId]);

export const selectIsEventsInitialized = createSelector(
  [selectEventsState],
  (events) => events.initialized
);

export default eventSlice.reducer;
