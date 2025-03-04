import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NarrativeProgress } from '../../../domain/types/narrative';
import { NarrativeArc, TimelineBranch, Clue } from '../../../domain/models/Narrative';
import { GameEvent } from '../../../domain/types/index';

// Define the initial state
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

// Create the slice
export const narrativeSlice = createSlice({
  name: 'narrative',
  initialState,
  reducers: {
    // Initialize narrative arcs
    initializeArcs: (state, action: PayloadAction<NarrativeArc[]>) => {
      const arcsRecord: Record<string, NarrativeArc> = {};

      for (const arc of action.payload) {
        arcsRecord[arc.id] = arc;
      }

      state.arcs = arcsRecord;
    },

    // Add a new narrative arc
    addNarrativeArc: (state, action: PayloadAction<NarrativeArc>) => {
      state.arcs[action.payload.id] = action.payload;
    },

    // Update a narrative arc
    updateNarrativeArc: (state, action: PayloadAction<NarrativeArc>) => {
      if (state.arcs[action.payload.id]) {
        state.arcs[action.payload.id] = action.payload;
      }
    },

    // Add an available clue
    addAvailableClue: (state, action: PayloadAction<Clue>) => {
      state.availableClues[action.payload.id] = action.payload;
    },

    // Discover a clue (move from available to discovered)
    discoverClue: (state, action: PayloadAction<string>) => {
      const clueId = action.payload;
      const clue = state.availableClues[clueId];

      if (clue) {
        clue.discovered = true;
        clue.discoveryDate = new Date();

        state.discoveredClues[clueId] = clue;
        delete state.availableClues[clueId];
      }
    },

    // Add an active event
    addActiveEvent: (state, action: PayloadAction<string>) => {
      if (!state.activeEvents.includes(action.payload)) {
        state.activeEvents.push(action.payload);
      }
    },

    // Complete an event (move from active to completed)
    completeEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const index = state.activeEvents.indexOf(eventId);

      if (index !== -1) {
        state.activeEvents.splice(index, 1);
        state.completedEvents.push(eventId);
      }
    },

    // Update conspiracy tier
    updateConspiracyTier: (state, action: PayloadAction<number>) => {
      state.conspiracyTier = action.payload;
    },

    // Choose a timeline branch
    chooseTimelineBranch: (state, action: PayloadAction<TimelineBranch>) => {
      const branch = action.payload;

      // Update branch state
      for (const arcId in state.arcs) {
        const arc = state.arcs[arcId];

        for (let i = 0; i < arc.timelineBranches.length; i++) {
          if (arc.timelineBranches[i].id === branch.id) {
            arc.timelineBranches[i].chosen = true;
          }
        }
      }

      // Add to timeline alterations
      state.timelineAlterations.push(branch);
    },

    // Unlock a timeline branch
    unlockTimelineBranch: (state, action: PayloadAction<string>) => {
      const branchId = action.payload;

      for (const arcId in state.arcs) {
        const arc = state.arcs[arcId];

        for (let i = 0; i < arc.timelineBranches.length; i++) {
          if (arc.timelineBranches[i].id === branchId) {
            arc.timelineBranches[i].unlocked = true;
          }
        }
      }
    },

    // Update character knowledge
    updateCharacterKnowledge: (
      state,
      action: PayloadAction<{ characterId: string; clueId: string; knows: boolean }>
    ) => {
      const { characterId, clueId, knows } = action.payload;

      if (!state.characterKnowledge[characterId]) {
        state.characterKnowledge[characterId] = {};
      }

      state.characterKnowledge[characterId][clueId] = knows;
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
  addActiveEvent,
  completeEvent,
  updateConspiracyTier,
  chooseTimelineBranch,
  unlockTimelineBranch,
  updateCharacterKnowledge,
  resetNarrative,
} = narrativeSlice.actions;

// Export reducer
export default narrativeSlice.reducer;
