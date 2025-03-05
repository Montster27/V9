/**
 * /src/infrastructure/state/slices/gameLoopSlice.ts
 *
 * Redux slice for managing the game loop state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  GameLoop,
  GameLoopState,
  GameLoopEventType,
  ResourceUpdate,
} from '../../../domain/services/GameLoop';
import { TimeManager } from '../../../domain/services/TimeManager';
import { UseOfTimeManager } from '../../../domain/services/UseOfTimeManager';
import { NarrativeManager } from '../../../domain/services/NarrativeManager';
import { SkillManager } from '../../../domain/models/Skill';
import { GameEvent } from '../../../domain/types';
import { AppThunk } from '../store';

/**
 * State interface for the game loop slice
 */
interface GameLoopSliceState {
  // Game loop state from the service
  gameLoopState: GameLoopState;
  // Services initialized flag
  initialized: boolean;
  // Resource updates from the latest tick
  resourceUpdates: ResourceUpdate[];
  // Active events that need resolution
  activeEvents: GameEvent[];
}

/**
 * Initial state for the game loop slice
 */
const initialState: GameLoopSliceState = {
  gameLoopState: {
    isRunning: false,
    isPaused: false,
    lastTickTime: 0,
    tickCount: 0,
    daysPassed: 0,
    activeEvents: [],
    totalSkillPointsGenerated: 0,
  },
  initialized: false,
  resourceUpdates: [],
  activeEvents: [],
};

/**
 * Services singleton to avoid recreating services on state changes
 */
class GameServices {
  private static instance: {
    timeManager?: TimeManager;
    useOfTimeManager?: UseOfTimeManager;
    narrativeManager?: NarrativeManager;
    skillManager?: SkillManager;
    gameLoop?: GameLoop;
  } = {};

  /**
   * Get or create the TimeManager
   */
  static getTimeManager(): TimeManager {
    if (!this.instance.timeManager) {
      this.instance.timeManager = new TimeManager({
        realSecondsPerGameDay: 3, // 3 seconds = 1 day
        skillPointsPerGameHour: 1,
        startPaused: true, // Start paused until initialization is complete
      });
    }
    return this.instance.timeManager;
  }

  /**
   * Get or create the UseOfTimeManager
   */
  static getUseOfTimeManager(): UseOfTimeManager {
    if (!this.instance.useOfTimeManager) {
      const timeManager = this.getTimeManager();
      this.instance.useOfTimeManager = new UseOfTimeManager({
        timeManager,
      });
    }
    return this.instance.useOfTimeManager;
  }

  /**
   * Get or create the NarrativeManager
   */
  static getNarrativeManager(): NarrativeManager {
    if (!this.instance.narrativeManager) {
      this.instance.narrativeManager = new NarrativeManager();
    }
    return this.instance.narrativeManager;
  }

  /**
   * Get or create the SkillManager
   */
  static getSkillManager(): SkillManager {
    if (!this.instance.skillManager) {
      this.instance.skillManager = new SkillManager();
    }
    return this.instance.skillManager;
  }

  /**
   * Get or create the GameLoop
   */
  static getGameLoop(): GameLoop {
    if (!this.instance.gameLoop) {
      const timeManager = this.getTimeManager();
      const useOfTimeManager = this.getUseOfTimeManager();
      const narrativeManager = this.getNarrativeManager();
      const skillManager = this.getSkillManager();

      this.instance.gameLoop = new GameLoop({
        timeManager,
        useOfTimeManager,
        narrativeManager,
        skillManager,
        autoStart: false, // Don't start until explicitly told to
      });
    }
    return this.instance.gameLoop;
  }
}

/**
 * Game loop slice
 */
const gameLoopSlice = createSlice({
  name: 'gameLoop',
  initialState,
  reducers: {
    /**
     * Update the game loop state
     */
    setGameLoopState: (state, action: PayloadAction<GameLoopState>) => {
      state.gameLoopState = action.payload;
    },

    /**
     * Set the initialization status
     */
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },

    /**
     * Update resource values from the latest tick
     */
    setResourceUpdates: (state, action: PayloadAction<ResourceUpdate[]>) => {
      state.resourceUpdates = action.payload;
    },

    /**
     * Set active events
     */
    setActiveEvents: (state, action: PayloadAction<GameEvent[]>) => {
      state.activeEvents = action.payload;
    },

    /**
     * Add an active event
     */
    addActiveEvent: (state, action: PayloadAction<GameEvent>) => {
      state.activeEvents.push(action.payload);
    },

    /**
     * Remove an active event
     */
    removeActiveEvent: (state, action: PayloadAction<string>) => {
      state.activeEvents = state.activeEvents.filter((event) => event.id !== action.payload);
    },
  },
});

// Export actions
export const {
  setGameLoopState,
  setInitialized,
  setResourceUpdates,
  setActiveEvents,
  addActiveEvent,
  removeActiveEvent,
} = gameLoopSlice.actions;

// Thunk for initializing the game loop
export const initializeGameLoop = (): AppThunk => async (dispatch, getState) => {
  // Don't initialize twice
  if (getState().gameLoop.initialized) return;

  // Get services
  const gameLoop = GameServices.getGameLoop();
  const narrativeManager = GameServices.getNarrativeManager();

  // Set up event listeners
  gameLoop.addEventListener(GameLoopEventType.TICK, (data) => {
    // Update game loop state
    dispatch(setGameLoopState(gameLoop.getState()));

    // Update resource updates
    if (data.resourceUpdates) {
      dispatch(setResourceUpdates(data.resourceUpdates));
    }
  });

  gameLoop.addEventListener(GameLoopEventType.EVENT_TRIGGERED, (data) => {
    // Handle triggered events
    if (data.eventTriggered) {
      dispatch(addActiveEvent(data.eventTriggered as GameEvent));
    }
  });

  gameLoop.addEventListener(GameLoopEventType.EVENT_RESOLVED, (data) => {
    // Handle resolved events
    if (data.eventTriggered) {
      const { id } = data.eventTriggered as { id: string };
      dispatch(removeActiveEvent(id));
    }
  });

  // Initialize narrative content
  narrativeManager.createInitialContent();

  // Mark as initialized
  dispatch(setInitialized(true));
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for starting the game loop
export const startGameLoop = (): AppThunk => async (dispatch, getState) => {
  // Initialize if needed
  if (!getState().gameLoop.initialized) {
    await dispatch(initializeGameLoop());
  }

  // Get the game loop
  const gameLoop = GameServices.getGameLoop();

  // Start the loop
  gameLoop.start();

  // Update state
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for stopping the game loop
export const stopGameLoop = (): AppThunk => (dispatch) => {
  // Get the game loop
  const gameLoop = GameServices.getGameLoop();

  // Stop the loop
  gameLoop.stop();

  // Update state
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for pausing the game
export const pauseGame = (): AppThunk => (dispatch) => {
  // Get the game loop
  const gameLoop = GameServices.getGameLoop();

  // Pause the game
  gameLoop.pause();

  // Update state
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for resuming the game
export const resumeGame = (): AppThunk => (dispatch) => {
  // Get the game loop
  const gameLoop = GameServices.getGameLoop();

  // Resume the game
  gameLoop.resume();

  // Update state
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for toggling pause state
export const togglePause = (): AppThunk => (dispatch) => {
  // Get the game loop
  const gameLoop = GameServices.getGameLoop();

  // Toggle pause
  gameLoop.togglePause();

  // Update state
  dispatch(setGameLoopState(gameLoop.getState()));
};

// Thunk for resolving an event
export const resolveEvent =
  (eventId: string, choiceId?: string): AppThunk =>
  (dispatch) => {
    // Get the game loop
    const gameLoop = GameServices.getGameLoop();

    // Resolve the event
    gameLoop.resolveEvent(eventId, choiceId);

    // State will be updated by event listener
  };

// Thunk for updating the game state used for event processing
export const updateGameState =
  (state: Record<string, any>): AppThunk =>
  (dispatch) => {
    // Get the game loop
    const gameLoop = GameServices.getGameLoop();

    // Update game state
    gameLoop.updateGameState(state);
  };

// Export the reducer
export default gameLoopSlice.reducer;
