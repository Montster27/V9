import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';
import { TimeManager, TimeManagerState, TimeEventType, TimeManagerConfig } from '../../../domain/services/TimeManager';

/**
 * State interface for the time slice
 */
export interface TimeState {
  managerState: TimeManagerState;
  config: TimeManagerConfig;
  lastTickTimestamp: number;
  isInitialized: boolean;
}

/**
 * Create a TimeManager instance for the Redux slice
 */
const createDefaultTimeManager = (): TimeManager => {
  return new TimeManager({
    realSecondsPerGameDay: 3,
    skillPointsPerGameHour: 1,
    newsUpdateFrequencyHours: 4,
    startPaused: true
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
        initialGameTime
      });
      
      // Update state with the new manager state
      state.managerState = timeManager.getState();
      state.config = config;
      state.isInitialized = true;
      state.lastTickTimestamp = Date.now();
    },
    
    /**
     * Process a tick of the time manager
     * @param state Current state
     * @param action Payload with current timestamp
     */
    tick: (state, action: PayloadAction<number | undefined>) => {
      // Get current timestamp
      const currentTimestamp = action.payload !== undefined 
        ? action.payload 
        : Date.now();
      
      // Get current game state
      const gameDate = state.managerState.currentTime.getGameDate();
      const isPaused = state.managerState.currentTime.getIsPaused();
      
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
          const newGameDate = new Date(gameDate.getTime() + (elapsedGameDays * msPerDay));
          
          // Create TimeManager with new game date
          const timeManager = new TimeManager({
            ...state.config,
            initialGameTime: new TimeValue(newGameDate, isPaused),
            startPaused: state.managerState.isPaused,
          });
          
          // Calculate skill points generated
          const elapsedGameHours = elapsedGameDays * 24;
          const skillPointsGenerated = Math.floor(elapsedGameHours * state.config.skillPointsPerGameHour);
          
          // Get updated state
          const updatedManagerState = timeManager.getState();
          
          // Update state with the new game time and additional skill points
          state.managerState = {
            ...updatedManagerState,
            totalGeneratedSkillPoints: state.managerState.totalGeneratedSkillPoints + skillPointsGenerated
          };
        }
      } else {
        // If paused, just create a TimeManager with current state (no advancement)
        const timeManager = new TimeManager({
          ...state.config,
          initialGameTime: new TimeValue(gameDate, isPaused),
          startPaused: state.managerState.isPaused,
        });
        
        // Update state without changing time or skill points
        state.managerState = timeManager.getState();
      }
      
      // Update last tick timestamp
      state.lastTickTimestamp = currentTimestamp;
    },
    
    /**
     * Pause the time manager
     * @param state Current state
     */
    pauseTime: (state) => {
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
    },
    
    /**
     * Resume the time manager
     * @param state Current state
     */
    resumeTime: (state) => {
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

// Export selectors
export const selectTimeState = (state: { time: TimeState }) => state.time;
export const selectGameTime = (state: { time: TimeState }) => state.time.managerState.currentTime;
export const selectIsPaused = (state: { time: TimeState }) => state.time.managerState.isPaused;
export const selectTotalSkillPoints = (state: { time: TimeState }) => 
  state.time.managerState.totalGeneratedSkillPoints;
export const selectConfig = (state: { time: TimeState }) => state.time.config;
export const selectIsInitialized = (state: { time: TimeState }) => state.time.isInitialized;

// Export reducer
export default timeSlice.reducer;
