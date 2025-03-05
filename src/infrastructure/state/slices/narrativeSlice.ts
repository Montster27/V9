/**
 * /src/infrastructure/state/slices/narrativeSlice.ts
 *
 * Redux slice for managing the game's narrative system
 * Handles narrative arcs, clues, and timeline branches
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  NarrativeProgress,
  NarrativeArc,
  TimelineBranch,
  Clue,
} from '../../../domain/models/Narrative';
import { GameEvent } from '../../../domain/types/index';

// Type-safe payloads
export interface DiscoverCluePayload {
  clueId: string;
}

export interface AddCluePayload {
  clue: Clue;
}

export interface AdvanceArcPayload {
  arcId: string;
  level: number;
}

export interface UpdateCharacterKnowledgePayload {
  characterId: string;
  clueId: string;
  knows: boolean;
}

// Define the initial state with proper typing
const initialState: NarrativeProgress = {
  arcs: {},
  discoveredClues: {},
  availableClues: {},
  activeEvents: [],
  completedEvents: [],
  conspiracyTier: 1,
  timelineAlterations: [],
  characterKnowledge: {},
};

// Create the slice with proper type safety
export const narrativeSlice = createSlice({
  name: 'narrative',
  initialState,
  reducers: {
    // Initialize narrative arcs
    initializeArcs: (state, action: PayloadAction<NarrativeArc[]>) => {
      // Validate input
      if (!Array.isArray(action.payload)) {
        console.error('initializeArcs requires an array of arcs');
        return;
      }

      const arcsRecord: Record<string, NarrativeArc> = {};

      for (const arc of action.payload) {
        if (!arc.id) {
          console.warn('Skipping arc without id', arc);
          continue;
        }
        arcsRecord[arc.id] = arc;
      }

      state.arcs = arcsRecord;
    },

    // Add a new narrative arc
    addNarrativeArc: (state, action: PayloadAction<NarrativeArc>) => {
      const arc = action.payload;
      if (!arc.id) {
        console.error('Cannot add arc without id', arc);
        return;
      }
      state.arcs[arc.id] = arc;
    },

    // Update a narrative arc
    updateNarrativeArc: (state, action: PayloadAction<NarrativeArc>) => {
      const arc = action.payload;
      if (!arc.id) {
        console.error('Cannot update arc without id', arc);
        return;
      }

      if (state.arcs[arc.id]) {
        state.arcs[arc.id] = arc;
      } else {
        console.warn(`Arc with id ${arc.id} does not exist, adding it instead`);
        state.arcs[arc.id] = arc;
      }
    },

    // Add an available clue
    addAvailableClue: (state, action: PayloadAction<AddCluePayload>) => {
      const clue = action.payload.clue;
      if (!clue || !clue.id) {
        console.error('Cannot add clue without id', clue);
        return;
      }

      state.availableClues[clue.id] = clue;
    },

    // Discover a clue (move from available to discovered)
    discoverClue: (state, action: PayloadAction<DiscoverCluePayload>) => {
      const { clueId } = action.payload;

      if (!clueId) {
        console.error('Cannot discover clue without id');
        return;
      }

      const clue = state.availableClues[clueId];

      if (clue) {
        // Create a new clue object to maintain immutability
        const discoveredClue: Clue = {
          ...clue,
          discovered: true,
          discoveryDate: new Date(),
        };

        // Add to discovered and remove from available
        state.discoveredClues[clueId] = discoveredClue;
        delete state.availableClues[clueId];
      } else {
        console.warn(`Clue with id ${clueId} not found in available clues`);
      }
    },

    // Advance a narrative arc level
    advanceArc: (state, action: PayloadAction<AdvanceArcPayload>) => {
      const { arcId, level } = action.payload;

      if (!arcId || typeof level !== 'number') {
        console.error('Cannot advance arc without valid id and level', action.payload);
        return;
      }

      if (state.arcs[arcId]) {
        // Create a new arc object to maintain immutability
        state.arcs[arcId] = {
          ...state.arcs[arcId],
          currentLevel: level,
        };
      } else {
        console.warn(`Arc with id ${arcId} not found`);
      }
    },

    // Add an active event
    addActiveEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;

      if (!eventId) {
        console.error('Cannot add active event without id');
        return;
      }

      if (!state.activeEvents.includes(eventId)) {
        // Create a new array to maintain immutability
        state.activeEvents = [...state.activeEvents, eventId];
      }
    },

    // Complete an event (move from active to completed)
    completeEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;

      if (!eventId) {
        console.error('Cannot complete event without id');
        return;
      }

      const index = state.activeEvents.indexOf(eventId);

      if (index !== -1) {
        // Create new arrays to maintain immutability
        state.activeEvents = [
          ...state.activeEvents.slice(0, index),
          ...state.activeEvents.slice(index + 1),
        ];
        state.completedEvents = [...state.completedEvents, eventId];
      } else {
        console.warn(`Event with id ${eventId} not found in active events`);
      }
    },

    // Update conspiracy tier
    updateConspiracyTier: (state, action: PayloadAction<number>) => {
      const tier = action.payload;

      if (typeof tier !== 'number' || tier < 1 || tier > 5) {
        console.error('Invalid conspiracy tier value', tier);
        return;
      }

      state.conspiracyTier = tier;
    },

    // Choose a timeline branch
    chooseTimelineBranch: (state, action: PayloadAction<TimelineBranch>) => {
      const branch = action.payload;

      if (!branch || !branch.id) {
        console.error('Cannot choose timeline branch without id', branch);
        return;
      }

      // Update branch state in all arcs
      for (const arcId in state.arcs) {
        const arc = state.arcs[arcId];

        // Find the branch in this arc
        const branchIndex = arc.timelineBranches.findIndex((b) => b.id === branch.id);

        if (branchIndex !== -1) {
          // Create a new branch object
          const updatedBranch = {
            ...arc.timelineBranches[branchIndex],
            chosen: true,
          };

          // Create a new branches array
          const updatedBranches = [
            ...arc.timelineBranches.slice(0, branchIndex),
            updatedBranch,
            ...arc.timelineBranches.slice(branchIndex + 1),
          ];

          // Create a new arc object
          state.arcs[arcId] = {
            ...arc,
            timelineBranches: updatedBranches,
          };
        }
      }

      // Add to timeline alterations
      state.timelineAlterations = [...state.timelineAlterations, branch];
    },

    // Unlock a timeline branch
    unlockTimelineBranch: (state, action: PayloadAction<string>) => {
      const branchId = action.payload;

      if (!branchId) {
        console.error('Cannot unlock timeline branch without id');
        return;
      }

      for (const arcId in state.arcs) {
        const arc = state.arcs[arcId];

        // Find the branch in this arc
        const branchIndex = arc.timelineBranches.findIndex((b) => b.id === branchId);

        if (branchIndex !== -1) {
          // Create a new branch object
          const updatedBranch = {
            ...arc.timelineBranches[branchIndex],
            unlocked: true,
          };

          // Create a new branches array
          const updatedBranches = [
            ...arc.timelineBranches.slice(0, branchIndex),
            updatedBranch,
            ...arc.timelineBranches.slice(branchIndex + 1),
          ];

          // Create a new arc object
          state.arcs[arcId] = {
            ...arc,
            timelineBranches: updatedBranches,
          };
        }
      }
    },

    // Update character knowledge
    updateCharacterKnowledge: (state, action: PayloadAction<UpdateCharacterKnowledgePayload>) => {
      const { characterId, clueId, knows } = action.payload;

      if (!characterId || !clueId || typeof knows !== 'boolean') {
        console.error('Invalid character knowledge update payload', action.payload);
        return;
      }

      // Create new objects to maintain immutability
      if (!state.characterKnowledge[characterId]) {
        state.characterKnowledge = {
          ...state.characterKnowledge,
          [characterId]: { [clueId]: knows },
        };
      } else {
        state.characterKnowledge = {
          ...state.characterKnowledge,
          [characterId]: {
            ...state.characterKnowledge[characterId],
            [clueId]: knows,
          },
        };
      }
    },

    // Reset narrative state (for new game)
    resetNarrative: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  initializeArcs,
  addNarrativeArc,
  updateNarrativeArc,
  addAvailableClue,
  discoverClue,
  advanceArc,
  addActiveEvent,
  completeEvent,
  updateConspiracyTier,
  chooseTimelineBranch,
  unlockTimelineBranch,
  updateCharacterKnowledge,
  resetNarrative,
} = narrativeSlice.actions;

// Selectors
const selectNarrativeState = (state: RootState) => state.narrative;

export const selectArcs = createSelector([selectNarrativeState], (narrative) => narrative.arcs);

export const selectArc = (arcId: string) => createSelector([selectArcs], (arcs) => arcs[arcId]);

export const selectDiscoveredClues = createSelector(
  [selectNarrativeState],
  (narrative) => narrative.discoveredClues
);

export const selectAvailableClues = createSelector(
  [selectNarrativeState],
  (narrative) => narrative.availableClues
);

export const selectConspiracyTier = createSelector(
  [selectNarrativeState],
  (narrative) => narrative.conspiracyTier
);

export const selectTimelineAlterations = createSelector(
  [selectNarrativeState],
  (narrative) => narrative.timelineAlterations
);

export const selectCharacterKnowledge = createSelector(
  [selectNarrativeState],
  (narrative) => narrative.characterKnowledge
);

// Export reducer
export default narrativeSlice.reducer;
