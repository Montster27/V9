/**
 * /src/infrastructure/state/slices/timeSlice.optimized.ts
 *
 * Optimized Redux slice for time management
 *
 * Performance improvements:
 * - Memoized selectors
 * - Reduced state updates
 * - Optimized action processing
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';
import {
  TimeManager,
  TimeManagerState,
  TimeEventType,
  TimeManagerConfig,
} from '../../../domain/services/TimeManager';

/**
 * State interface for the time slice
 */
export interface TimeState {
  managerState: TimeManagerState;
  config: TimeManagerConfig;
  lastTickTimestamp: number;
  isInitialized: boolean;
  // Added for performance monitoring
  tickCount: number;
  lastUpdateDuration: number;
}

/**
 * Create a TimeManager instance for the Redux slice
 */
const createDefaultTimeManager = (): TimeManager => {
  return new TimeManager({
    realSecondsPerGameDay: 3,
    skillPointsPerGameHour: 1,
    newsUpdateFrequencyHours: 4,
    startPaused: true,
  });
};

/**
 * Default config for the time manager
 */
const defaultConfig: TimeManagerConfig = {
  realSecondsPerGameDay: 3,
  skillPointsPerGameHour: 1,
  newsUpdateFrequencyHours: 4,
  startPaused: true,
};

/**
 * Default TimeManager instance
 */
const defaultTimeManager = createDefaultTimeManager();

/**
 * Initial state for the time slice
 */
const initialState: TimeState = {
  managerState: defaultTimeManager.getState(),
  config: { ...defaultConfig },
  lastTickTimestamp: Date.now(),
  isInitialized: false,
  tickCount: 0,
  lastUpdateDuration: 0,
};

/**
 * Time slice with actions and reducers
 */
const timeSlice = createSlice({
  name: 'time',
  initialState,
  reducers: {
    /**
     * Initialize the time manager
     * @param state Current state
     * @param action Payload with config options
     */
    initializeTimeManager: (state, action: PayloadAction<Partial<TimeManagerConfig>>) => {
      // Create a new TimeManager with the combined config
      const config = {
        ...state.config,
        ...action.payload,
      };

      // Create a proper TimeValue instance for the initial date
      const initialDate = new Date(1983, 8, 1); // Sept 1, 1983
      const initialGameTime = new TimeValue(initialDate, config.startPaused || true);

      // Create a fresh TimeManager
      const timeManager = new TimeManager({
        ...config,
        initialGameTime,
      });

      // Update state with the new manager state
      state.managerState = timeManager.getState();
      state.config = config;
      state.isInitialized = true;
      state.lastTickTimestamp = Date.now();
      state.tickCount = 0;
    },

    /**
     * Process a tick of the time manager
     * @param state Current state
     * @param action Payload with current timestamp
     */
    tick: (state, action: PayloadAction<number | undefined>) => {
      // Performance tracking
      const startTime = performance.now();

      // Get current timestamp
      const currentTimestamp = action.payload !== undefined ? action.payload : Date.now();

      // Skip update if paused and no significant time has passed
      if (
        state.managerState.isPaused &&
        Math.abs(currentTimestamp - state.lastTickTimestamp) < 100
      ) {
        return;
      }

      // Get current game state
      const gameDate = state.managerState.currentTime.getGameDate();
      const isPaused = state.managerState.isPaused;

      // Only advance time if not paused and time has elapsed
      if (!state.managerState.isPaused) {
        // Calculate elapsed real time
        const elapsedMs = currentTimestamp - state.lastTickTimestamp;

        if (elapsedMs > 0) {
          // Calculate elapsed game time
          const elapsedSeconds = elapsedMs / 1000;
          const elapsedGameDays = elapsedSeconds / state.config.realSecondsPerGameDay;

          // Calculate new game date
          const msPerDay = 24 * 60 * 60 * 1000;
          const newGameDate = new Date(gameDate.getTime() + elapsedGameDays * msPerDay);

          // Create TimeManager with new game date
          const timeManager = new TimeManager({
            ...state.config,
            initialGameTime: new TimeValue(newGameDate, isPaused),
            startPaused: state.managerState.isPaused,
          });

          // Calculate skill points generated
          const elapsedGameHours = elapsedGameDays * 24;
          const skillPointsGenerated = Math.floor(
            elapsedGameHours * state.config.skillPointsPerGameHour
          );

          // Get updated state
          const updatedManagerState = timeManager.getState();

          // Update state with the new game time and additional skill points
          state.managerState = {
            ...updatedManagerState,
            totalGeneratedSkillPoints:
              state.managerState.totalGeneratedSkillPoints + skillPointsGenerated,
          };

          // Increment tick count
          state.tickCount++;
        }
      }

      // Update last tick timestamp
      state.lastTickTimestamp = currentTimestamp;

      // Performance tracking - update tick duration
      state.lastUpdateDuration = performance.now() - startTime;
    },

    /**
     * Pause the time manager
     * @param state Current state
     */
    pauseTime: (state) => {
      // Only update if not already paused
      if (!state.managerState.isPaused) {
        // Create a new TimeManager with the current config
        const gameDate = state.managerState.currentTime.getGameDate();
        const isPaused = state.managerState.currentTime.getIsPaused();

        const timeManager = new TimeManager({
          ...state.config,
          initialGameTime: new TimeValue(gameDate, isPaused),
          startPaused: state.managerState.isPaused,
        });

        // Pause time
        timeManager.pause();

        // Update state
        state.managerState = timeManager.getState();
      }
    },

    /**
     * Resume the time manager
     * @param state Current state
     */
    resumeTime: (state) => {
      // Only update if currently paused
      if (state.managerState.isPaused) {
        // Create a new TimeManager with the current config
        const gameDate = state.managerState.currentTime.getGameDate();
        const isPaused = state.managerState.currentTime.getIsPaused();

        const timeManager = new TimeManager({
          ...state.config,
          initialGameTime: new TimeValue(gameDate, isPaused),
          startPaused: state.managerState.isPaused,
        });

        // Resume time
        timeManager.resume();

        // Update state
        state.managerState = timeManager.getState();
        state.lastTickTimestamp = Date.now(); // Reset timestamp when resuming
      }
    },

    /**
     * Toggle the pause state
     * @param state Current state
     */
    togglePause: (state) => {
      // Create a new TimeManager with the current config
      const gameDate = state.managerState.currentTime.getGameDate();
      const isPaused = state.managerState.currentTime.getIsPaused();

      const timeManager = new TimeManager({
        ...state.config,
        initialGameTime: new TimeValue(gameDate, isPaused),
        startPaused: state.managerState.isPaused,
      });

      // Toggle pause state
      timeManager.togglePause();

      // Update state
      state.managerState = timeManager.getState();

      // Reset timestamp if resuming
      if (!state.managerState.isPaused) {
        state.lastTickTimestamp = Date.now();
      }
    },

    /**
     * Set the game time directly
     * @param state Current state
     * @param action Payload with new time
     */
    setGameTime: (state, action: PayloadAction<TimeValue>) => {
      // Create a new TimeManager with the current config
      const gameDate = state.managerState.currentTime.getGameDate();
      const isPaused = state.managerState.currentTime.getIsPaused();

      const timeManager = new TimeManager({
        ...state.config,
        initialGameTime: new TimeValue(gameDate, isPaused),
        startPaused: state.managerState.isPaused,
      });

      // Create a fresh TimeValue from the payload to ensure proper instance
      const newTimeValue = new TimeValue(
        action.payload.getGameDate(),
        action.payload.getIsPaused()
      );

      // Set time using the fresh TimeValue
      timeManager.setTime(newTimeValue);

      // Update state
      state.managerState = timeManager.getState();
    },

    /**
     * Update the time manager configuration
     * @param state Current state
     * @param action Payload with new config
     */
    updateConfig: (state, action: PayloadAction<Partial<TimeManagerConfig>>) => {
      state.config = {
        ...state.config,
        ...action.payload,
      };
    },

    /**
     * Reset the time manager
     * @param state Current state
     */
    resetTimeManager: (state) => {
      // Create a fresh default time manager
      const timeManager = createDefaultTimeManager();
      // Reset state to initial values
      state.managerState = timeManager.getState();
      state.config = { ...defaultConfig }; // Use a copy of defaultConfig
      state.lastTickTimestamp = Date.now();
      state.tickCount = 0;
      state.lastUpdateDuration = 0;
    },
  },
});

// Export actions
export const {
  initializeTimeManager,
  tick,
  pauseTime,
  resumeTime,
  togglePause,
  setGameTime,
  updateConfig,
  resetTimeManager,
} = timeSlice.actions;

// Base selector to get time state
const selectTimeStateBase = (state: { time: TimeState }) => state.time;

// Memoized selectors using createSelector
export const selectTimeState = createSelector([selectTimeStateBase], (timeState) => timeState);

export const selectGameTime = createSelector(
  [selectTimeState],
  (timeState) => timeState.managerState.currentTime
);

export const selectIsPaused = createSelector(
  [selectTimeState],
  (timeState) => timeState.managerState.isPaused
);

export const selectTotalSkillPoints = createSelector(
  [selectTimeState],
  (timeState) => timeState.managerState.totalGeneratedSkillPoints
);

export const selectConfig = createSelector([selectTimeState], (timeState) => timeState.config);

export const selectIsInitialized = createSelector(
  [selectTimeState],
  (timeState) => timeState.isInitialized
);

// New selectors for performance monitoring
export const selectTickCount = createSelector(
  [selectTimeState],
  (timeState) => timeState.tickCount
);

export const selectLastUpdateDuration = createSelector(
  [selectTimeState],
  (timeState) => timeState.lastUpdateDuration
);

// Derived selectors for frequently accessed data
export const selectFormattedGameTime = createSelector([selectGameTime], (gameTime) => {
  const date = gameTime.getGameDate();
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    formatted: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
  };
});

// Export reducer
export default timeSlice.reducer;
