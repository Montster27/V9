/**
 * /src/infrastructure/state/slices/realTimeGameLoopSlice.ts
 *
 * Redux slice for managing the real-time game loop
 * Handles loop state, performance metrics, and event processing
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import {
  RealTimeGameLoop,
  GameLoopState,
  GameLoopEventType,
  GameLoopEventData,
} from '../../../domain/services/RealTimeGameLoop';

import { ServiceRegistry, defaultServiceRegistry } from '../middleware/simulation';

/**
 * UI specific state properties
 */
interface RealTimeGameLoopUIState {
  initialized: boolean;
  lastFrameTime: number;
  lastTickTime: number;
  fpsDisplay: number;
  ticksPerSecond: number;
  performanceWarning: boolean;
  performanceWarningMessage?: string;
}

/**
 * Combined state for Redux slice
 */
interface RealTimeGameLoopSliceState extends RealTimeGameLoopUIState {
  gameLoopState: GameLoopState;
}

/**
 * Game loop singleton instance
 */
let gameLoopInstance: RealTimeGameLoop | null = null;

/**
 * Get or create the game loop instance
 */
export function getGameLoop(): RealTimeGameLoop {
  if (!gameLoopInstance) {
    const registry = defaultServiceRegistry;
    const simulationService = registry.getSimulationService();

    gameLoopInstance = new RealTimeGameLoop(simulationService, {
      targetFPS: 60,
      maxTicksPerFrame: 5,
      simulationTickRateMs: 100,
      autoStart: false,
    });
  }

  return gameLoopInstance;
}

/**
 * Initial state
 */
const initialState: RealTimeGameLoopSliceState = {
  initialized: false,
  lastFrameTime: 0,
  lastTickTime: 0,
  fpsDisplay: 0,
  ticksPerSecond: 0,
  performanceWarning: false,
  gameLoopState: {
    isRunning: false,
    isPaused: true,
    startTime: 0,
    lastFrameTime: 0,
    frameCount: 0,
    tickCount: 0,
    fps: 0,
    ticksThisFrame: 0,
    simulationTime: 0,
    realTime: 0,
  },
};

/**
 * Real-time game loop slice
 */
const realTimeGameLoopSlice = createSlice({
  name: 'realTimeGameLoop',
  initialState,
  reducers: {
    /**
     * Set initialization status
     */
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },

    /**
     * Update game loop state
     */
    updateGameLoopState: (state, action: PayloadAction<GameLoopState>) => {
      state.gameLoopState = action.payload;
    },

    /**
     * Update UI state properties
     */
    updateUIState: (state, action: PayloadAction<Partial<RealTimeGameLoopUIState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics: (
      state,
      action: PayloadAction<{
        fpsDisplay: number;
        ticksPerSecond: number;
        performanceWarning: boolean;
        performanceWarningMessage?: string;
      }>
    ) => {
      state.fpsDisplay = action.payload.fpsDisplay;
      state.ticksPerSecond = action.payload.ticksPerSecond;
      state.performanceWarning = action.payload.performanceWarning;
      state.performanceWarningMessage = action.payload.performanceWarningMessage;
    },

    /**
     * Update frame time
     */
    updateFrameTime: (state, action: PayloadAction<number>) => {
      state.lastFrameTime = action.payload;
    },

    /**
     * Update tick time
     */
    updateTickTime: (state, action: PayloadAction<number>) => {
      state.lastTickTime = action.payload;
    },
  },
});

// Export actions
export const {
  setInitialized,
  updateGameLoopState,
  updateUIState,
  updatePerformanceMetrics,
  updateFrameTime,
  updateTickTime,
} = realTimeGameLoopSlice.actions;

// Thunks

/**
 * Initialize the game loop
 */
export const initializeRealTimeGameLoop = (): AppThunk => async (dispatch) => {
  try {
    const gameLoop = getGameLoop();

    // Set up event listeners
    gameLoop.addEventListener(GameLoopEventType.FRAME, (data) => {
      dispatch(updateFrameTime(data.timestamp));
      dispatch(updateGameLoopState(gameLoop.getState()));
    });

    gameLoop.addEventListener(GameLoopEventType.TICK, (data) => {
      dispatch(updateTickTime(data.timestamp));

      // Update performance metrics every second
      if (data.timestamp % 1000 < 100) {
        const state = gameLoop.getState();
        dispatch(
          updatePerformanceMetrics({
            fpsDisplay: state.fps,
            ticksPerSecond: Math.round(state.tickCount / (state.realTime / 1000)),
            performanceWarning: state.fps < 30,
            performanceWarningMessage:
              state.fps < 30 ? 'Performance is degraded. Try reducing game speed.' : undefined,
          })
        );
      }
    });

    gameLoop.addEventListener(GameLoopEventType.ERROR, (data) => {
      console.error('Game loop error:', data.error);
    });

    // Mark as initialized
    dispatch(setInitialized(true));
    dispatch(updateGameLoopState(gameLoop.getState()));

    return true;
  } catch (error) {
    console.error('Error initializing game loop:', error);
    return false;
  }
};

/**
 * Start the game loop
 */
export const startRealTimeGameLoop = (): AppThunk => async (dispatch, getState) => {
  try {
    // Initialize if needed
    if (!getState().realTimeGameLoop.initialized) {
      console.log('Initializing game loop before starting');
      await dispatch(initializeRealTimeGameLoop());
    }

    console.log('Getting game loop instance');
    const gameLoop = getGameLoop();

    // Ensure the gameLoop is properly configured before starting
    console.log('Starting game loop, current state:', gameLoop.getState());
    gameLoop.start();

    // Ensure simulation service is properly connected
    if (gameLoop.getSimulation().getCurrentGameTime().getIsPaused()) {
      console.log('Simulation service is paused, resuming');
      gameLoop.getSimulation().resumeTime();
    }

    const newState = gameLoop.getState();
    console.log('Game loop started, new state:', newState);
    dispatch(updateGameLoopState(newState));
    return true;
  } catch (error) {
    console.error('Error starting game loop:', error);
    return false;
  }
};

/**
 * Stop the game loop
 */
export const stopRealTimeGameLoop = (): AppThunk => (dispatch) => {
  try {
    const gameLoop = getGameLoop();
    gameLoop.stop();

    dispatch(updateGameLoopState(gameLoop.getState()));
    return true;
  } catch (error) {
    console.error('Error stopping game loop:', error);
    return false;
  }
};

/**
 * Pause the game loop
 */
export const pauseRealTimeGameLoop = (): AppThunk => (dispatch) => {
  try {
    const gameLoop = getGameLoop();
    gameLoop.pause();

    dispatch(updateGameLoopState(gameLoop.getState()));
    return true;
  } catch (error) {
    console.error('Error pausing game loop:', error);
    return false;
  }
};

/**
 * Resume the game loop
 */
export const resumeRealTimeGameLoop = (): AppThunk => (dispatch) => {
  try {
    console.log('Resuming game loop');
    const gameLoop = getGameLoop();

    // Start if not running
    if (!gameLoop.getState().isRunning) {
      console.log('Game loop not running, starting first');
      gameLoop.start();
    }

    // Resume both the game loop and the simulation
    gameLoop.resume();

    // Make sure the simulation service is also resumed
    const simulation = gameLoop.getSimulation();
    if (simulation.getCurrentGameTime().getIsPaused()) {
      console.log('Also resuming simulation service');
      simulation.resumeTime();
    }

    const newState = gameLoop.getState();
    console.log('Game loop resumed, new state:', newState);
    dispatch(updateGameLoopState(newState));
    return true;
  } catch (error) {
    console.error('Error resuming game loop:', error);
    return false;
  }
};

/**
 * Toggle pause state
 */
export const toggleRealTimeGameLoop = (): AppThunk => (dispatch) => {
  try {
    console.log('Toggling game loop pause state');
    const gameLoop = getGameLoop();

    // Start if not running
    if (!gameLoop.getState().isRunning) {
      console.log('Game loop not running, starting first');
      gameLoop.start();
    }

    // Toggle game loop pause state
    const isPaused = gameLoop.togglePause();
    console.log('New pause state:', isPaused);

    // Make sure simulation service is synchronized
    const simulation = gameLoop.getSimulation();
    if (simulation.getCurrentGameTime().getIsPaused() !== isPaused) {
      console.log('Synchronizing simulation service pause state');
      if (isPaused) {
        simulation.pauseTime();
      } else {
        simulation.resumeTime();
      }
    }

    const newState = gameLoop.getState();
    console.log('Game loop toggled, new state:', newState);
    dispatch(updateGameLoopState(newState));
    return isPaused;
  } catch (error) {
    console.error('Error toggling game loop:', error);
    return null;
  }
};

/**
 * Update game loop configuration
 */
export const updateRealTimeGameLoopConfig =
  (config: {
    targetFPS?: number;
    maxTicksPerFrame?: number;
    simulationTickRateMs?: number;
  }): AppThunk =>
  (dispatch) => {
    try {
      const gameLoop = getGameLoop();
      gameLoop.updateConfig(config);

      dispatch(updateGameLoopState(gameLoop.getState()));
      return true;
    } catch (error) {
      console.error('Error updating game loop config:', error);
      return false;
    }
  };

// Selectors

// Base selector
const selectRealTimeGameLoopState = (state: RootState) => state.realTimeGameLoop;

// Get game loop state
export const selectGameLoopState = createSelector(
  [selectRealTimeGameLoopState],
  (gameLoop) => gameLoop.gameLoopState
);

// Check if game loop is running
export const selectIsGameLoopRunning = createSelector(
  [selectGameLoopState],
  (state) => state.isRunning
);

// Check if game loop is paused
export const selectIsGameLoopPaused = createSelector(
  [selectGameLoopState],
  (state) => state.isPaused
);

// Get FPS
export const selectFPS = createSelector(
  [selectRealTimeGameLoopState],
  (gameLoop) => gameLoop.fpsDisplay
);

// Get ticks per second
export const selectTicksPerSecond = createSelector(
  [selectRealTimeGameLoopState],
  (gameLoop) => gameLoop.ticksPerSecond
);

// Check for performance warning
export const selectPerformanceWarning = createSelector(
  [selectRealTimeGameLoopState],
  (gameLoop) => ({
    warning: gameLoop.performanceWarning,
    message: gameLoop.performanceWarningMessage,
  })
);

// Check if initialized
export const selectIsGameLoopInitialized = createSelector(
  [selectRealTimeGameLoopState],
  (gameLoop) => gameLoop.initialized
);

// Export reducer
export default realTimeGameLoopSlice.reducer;
