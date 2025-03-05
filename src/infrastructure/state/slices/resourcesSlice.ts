/**
 * /src/infrastructure/state/slices/resourcesSlice.ts
 *
 * Redux slice for managing player resources in the game
 * Uses standardized domain models for consistency
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
  ResourcesState,
  ResourceValue,
  SkillPointsValue,
  createDefaultResourcesState,
} from '../../../domain/models';

// UI-specific state properties separated from domain model
interface ResourcesUIState {
  initialized: boolean;
}

// Combined state for Redux slice
interface ResourcesSliceState extends ResourcesState, ResourcesUIState {}

// Initial state using the factory function from domain models
const initialState: ResourcesSliceState = {
  ...createDefaultResourcesState(),
  initialized: true,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    // Properly handle immutable updates for resource values
    updateEnergy: (state, action: PayloadAction<Partial<ResourceValue>>) => {
      // Create a new energy object by merging the current one with the update
      state.energy = {
        ...state.energy,
        ...action.payload,
        // Ensure we don't exceed max value
        current:
          action.payload.current !== undefined
            ? Math.min(Math.max(0, action.payload.current), state.energy.max)
            : state.energy.current,
      };
    },
    updateStress: (state, action: PayloadAction<Partial<ResourceValue>>) => {
      state.stress = {
        ...state.stress,
        ...action.payload,
        // Ensure we don't exceed max value
        current:
          action.payload.current !== undefined
            ? Math.min(Math.max(0, action.payload.current), state.stress.max)
            : state.stress.current,
      };
    },
    updateHealth: (state, action: PayloadAction<Partial<ResourceValue>>) => {
      state.health = {
        ...state.health,
        ...action.payload,
        // Ensure we don't exceed max value
        current:
          action.payload.current !== undefined
            ? Math.min(Math.max(0, action.payload.current), state.health.max)
            : state.health.current,
      };
    },
    updateBelonging: (state, action: PayloadAction<Partial<ResourceValue>>) => {
      state.belonging = {
        ...state.belonging,
        ...action.payload,
        // Ensure we don't exceed max value
        current:
          action.payload.current !== undefined
            ? Math.min(Math.max(0, action.payload.current), state.belonging.max)
            : state.belonging.current,
      };
    },
    updateKnowledge: (state, action: PayloadAction<number>) => {
      state.knowledge = Math.max(0, action.payload);
    },
    // Add a delta version for incremental updates
    addKnowledge: (state, action: PayloadAction<number>) => {
      state.knowledge = Math.max(0, state.knowledge + action.payload);
    },
    updateMoney: (state, action: PayloadAction<number>) => {
      state.money = Math.max(0, action.payload);
    },
    // Add a delta version for incremental updates
    addMoney: (state, action: PayloadAction<number>) => {
      state.money = Math.max(0, state.money + action.payload);
    },
    updateSocial: (state, action: PayloadAction<number>) => {
      state.social = Math.max(0, action.payload);
    },
    // Add a delta version for incremental updates
    addSocial: (state, action: PayloadAction<number>) => {
      state.social = Math.max(0, state.social + action.payload);
    },
    updateSkillPoints: (state, action: PayloadAction<Partial<SkillPointsValue>>) => {
      state.skillPoints = {
        ...state.skillPoints,
        ...action.payload,
        // Ensure we don't go below 0
        current:
          action.payload.current !== undefined
            ? Math.max(0, action.payload.current)
            : state.skillPoints.current,
      };
    },
    // Add a delta version for incremental updates
    addSkillPoints: (state, action: PayloadAction<number>) => {
      const delta = action.payload;
      const currentPoints = state.skillPoints.current;

      if (delta >= 0) {
        // Adding points
        state.skillPoints = {
          ...state.skillPoints,
          current: currentPoints + delta,
          generated: state.skillPoints.generated + delta,
        };
      } else {
        // Spending points (delta is negative)
        const absAmount = Math.abs(delta);
        // Limit spending to available points
        const actualSpent = Math.min(currentPoints, absAmount);

        state.skillPoints = {
          ...state.skillPoints,
          current: currentPoints - actualSpent,
          spent: state.skillPoints.spent + actualSpent,
        };
      }
    },
    // Combined update for simulation ticks with proper immutability handling
    updateResources: (state, action: PayloadAction<Partial<ResourcesState>>) => {
      // Handle each resource property individually to ensure proper immutability
      if (action.payload.energy) {
        state.energy = { ...state.energy, ...action.payload.energy };
      }

      if (action.payload.stress) {
        state.stress = { ...state.stress, ...action.payload.stress };
      }

      if (action.payload.health) {
        state.health = { ...state.health, ...action.payload.health };
      }

      if (action.payload.belonging) {
        state.belonging = { ...state.belonging, ...action.payload.belonging };
      }

      if (action.payload.knowledge !== undefined) {
        state.knowledge = Math.max(0, action.payload.knowledge);
      }

      if (action.payload.money !== undefined) {
        state.money = Math.max(0, action.payload.money);
      }

      if (action.payload.social !== undefined) {
        state.social = Math.max(0, action.payload.social);
      }

      if (action.payload.skillPoints) {
        state.skillPoints = { ...state.skillPoints, ...action.payload.skillPoints };
      }

      // Always update the timestamp
      state.lastUpdated = Date.now();
    },
    // UI state update
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
  },
});

// Actions
export const {
  updateEnergy,
  updateStress,
  updateHealth,
  updateBelonging,
  updateKnowledge,
  addKnowledge,
  updateMoney,
  addMoney,
  updateSocial,
  addSocial,
  updateSkillPoints,
  addSkillPoints,
  updateResources,
  setInitialized,
} = resourcesSlice.actions;

// Base selector
const selectResourcesState = (state: RootState) => state.resources;

// Memoized selectors using createSelector for performance
export const selectEnergy = createSelector([selectResourcesState], (resources) => resources.energy);

export const selectStress = createSelector([selectResourcesState], (resources) => resources.stress);

export const selectHealth = createSelector([selectResourcesState], (resources) => resources.health);

export const selectBelonging = createSelector(
  [selectResourcesState],
  (resources) => resources.belonging
);

export const selectKnowledge = createSelector(
  [selectResourcesState],
  (resources) => resources.knowledge
);

export const selectMoney = createSelector([selectResourcesState], (resources) => resources.money);

export const selectSocial = createSelector([selectResourcesState], (resources) => resources.social);

export const selectSkillPoints = createSelector(
  [selectResourcesState],
  (resources) => resources.skillPoints
);

// Grouped resources selector
export const selectNumericalResources = createSelector([selectResourcesState], (resources) => ({
  knowledge: resources.knowledge,
  money: resources.money,
  social: resources.social,
}));

// Grouped status resources selector
export const selectStatusResources = createSelector([selectResourcesState], (resources) => ({
  energy: resources.energy,
  stress: resources.stress,
  health: resources.health,
  belonging: resources.belonging,
}));

// UI state selectors
export const selectIsResourcesInitialized = createSelector(
  [selectResourcesState],
  (resources) => resources.initialized
);

export const selectLastUpdated = createSelector(
  [selectResourcesState],
  (resources) => resources.lastUpdated
);

export default resourcesSlice.reducer;
