/**
 * /src/infrastructure/state/slices/useOfTimeSlice.ts
 * 
 * Use_of_Time Redux Slice
 * 
 * This Redux slice manages the state for time allocation across different activities
 * using sliders. It integrates with the UseOfTimeManager service to handle the business
 * logic for time distribution, resource impacts, and stress calculations.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  ActivityType, 
  WeeklyTimeAllocation, 
  ResourceImpact,
  createDefaultTimeAllocation
} from '../../../domain/models/UseOfTime';
import { 
  UseOfTimeManager, 
  UseOfTimeManagerState, 
  UseOfTimeManagerConfig 
} from '../../../domain/services/UseOfTimeManager';
import { TimeManager } from '../../../domain/services/TimeManager';

/**
 * State interface for the Use_of_Time slice
 */
export interface UseOfTimeState {
  managerState: UseOfTimeManagerState;
  config: UseOfTimeManagerConfig;
  isInitialized: boolean;
  lastUpdated: number;
}

/**
 * Create a UseOfTimeManager instance for the Redux slice
 */
const createDefaultUseOfTimeManager = (): UseOfTimeManager => {
  return new UseOfTimeManager({
    baseSkillCost: 10,
    tierScalingFactor: 2,
    threadProgressionFactor: 0.1
  });
};

/**
 * Default config for the use_of_time manager
 */
const defaultConfig: UseOfTimeManagerConfig = {
  baseSkillCost: 10,
  tierScalingFactor: 2,
  threadProgressionFactor: 0.1
};

/**
 * Default UseOfTimeManager instance
 */
const defaultUseOfTimeManager = createDefaultUseOfTimeManager();

/**
 * Initial state for the use_of_time slice
 */
const initialState: UseOfTimeState = {
  managerState: defaultUseOfTimeManager.getState(),
  config: { ...defaultConfig },
  isInitialized: false,
  lastUpdated: Date.now()
};

/**
 * Use_of_Time slice with actions and reducers
 */
const useOfTimeSlice = createSlice({
  name: 'useOfTime',
  initialState,
  reducers: {
    /**
     * Initialize the use_of_time manager
     * @param state Current state
     * @param action Payload with config options
     */
    initializeUseOfTimeManager: (state, action: PayloadAction<{
      config?: Partial<UseOfTimeManagerConfig>;
      timeManager?: TimeManager;
      initialAllocation?: WeeklyTimeAllocation;
    }>) => {
      // Create a new UseOfTimeManager with the combined config
      const config = {
        ...state.config,
        ...action.payload.config,
      };
      
      // Create a fresh UseOfTimeManager
      const useOfTimeManager = new UseOfTimeManager({
        ...config,
        timeManager: action.payload.timeManager,
        initialAllocation: action.payload.initialAllocation || createDefaultTimeAllocation()
      });
      
      // Update state with the new manager state
      state.managerState = useOfTimeManager.getState();
      state.config = config;
      state.isInitialized = true;
      state.lastUpdated = Date.now();
    },
    
    /**
     * Update time allocation for a specific activity
     * @param state Current state
     * @param action Payload with activity type and new hours per day
     */
    updateTimeAllocation: (state, action: PayloadAction<{
      activityType: ActivityType;
      hoursPerDay: number;
    }>) => {
      // Create a new UseOfTimeManager with current state
      const useOfTimeManager = new UseOfTimeManager({
        ...state.config,
        initialAllocation: state.managerState.currentAllocation
      });
      
      // Update allocation
      const updatedState = useOfTimeManager.updateAllocation(
        action.payload.activityType,
        action.payload.hoursPerDay
      );
      
      // Update state with the new manager state
      state.managerState = updatedState;
      state.lastUpdated = Date.now();
    },
    
    /**
     * Reset time allocations to default
     * @param state Current state
     */
    resetTimeAllocations: (state) => {
      // Create a new UseOfTimeManager
      const useOfTimeManager = new UseOfTimeManager({
        ...state.config
      });
      
      // Reset to default
      const updatedState = useOfTimeManager.resetToDefault();
      
      // Update state
      state.managerState = updatedState;
      state.lastUpdated = Date.now();
    },
    
    /**
     * Calculate resource impacts for elapsed time
     * @param state Current state
     * @param action Payload with elapsed game hours
     */
    calculateResourceImpacts: (state, action: PayloadAction<number>) => {
      // Create a new UseOfTimeManager with current state
      const useOfTimeManager = new UseOfTimeManager({
        ...state.config,
        initialAllocation: state.managerState.currentAllocation
      });
      
      // Calculate resource impacts for elapsed time
      const impacts = useOfTimeManager.calculateHourlyResourceImpact(action.payload);
      
      // No need to update state as this is just a calculation
      // The actual state changes will be handled by the resources slice
    },
    
    /**
     * Update the manager configuration
     * @param state Current state
     * @param action Payload with new config
     */
    updateConfig: (state, action: PayloadAction<Partial<UseOfTimeManagerConfig>>) => {
      state.config = {
        ...state.config,
        ...action.payload,
      };
    },
    
    /**
     * Connect the use_of_time manager to a time manager
     * @param state Current state
     * @param action Payload with time manager
     */
    connectTimeManager: (state, action: PayloadAction<TimeManager>) => {
      // Create a new UseOfTimeManager with current state
      const useOfTimeManager = new UseOfTimeManager({
        ...state.config,
        initialAllocation: state.managerState.currentAllocation,
        timeManager: action.payload
      });
      
      // Update state
      state.managerState = useOfTimeManager.getState();
      state.lastUpdated = Date.now();
    },
    
    /**
     * Calculate skill cost
     * @param state Current state
     * @param action Payload with skill information
     */
    calculateSkillCost: (state, action: PayloadAction<{
      baseSkillCost: number;
      tier: number;
      previousSkillsInThread: number;
      threadName: string;
    }>) => {
      // Create a new UseOfTimeManager with current state
      const useOfTimeManager = new UseOfTimeManager({
        ...state.config,
        initialAllocation: state.managerState.currentAllocation
      });
      
      // Calculate skill cost
      useOfTimeManager.calculateSkillCost(
        action.payload.baseSkillCost,
        action.payload.tier,
        action.payload.previousSkillsInThread,
        action.payload.threadName
      );
      
      // No need to update state here, this is a calculation only
      // The actual cost will be used by the skills slice
    }
  },
});

// Export actions
export const {
  initializeUseOfTimeManager,
  updateTimeAllocation,
  resetTimeAllocations,
  calculateResourceImpacts,
  updateConfig,
  connectTimeManager,
  calculateSkillCost,
} = useOfTimeSlice.actions;

// Export selectors
export const selectUseOfTimeState = (state: { useOfTime: UseOfTimeState }) => state.useOfTime;
export const selectCurrentAllocation = (state: { useOfTime: UseOfTimeState }) => 
  state.useOfTime.managerState.currentAllocation;
export const selectResourceImpacts = (state: { useOfTime: UseOfTimeState }) => 
  state.useOfTime.managerState.resourceImpacts;
export const selectStressPenalties = (state: { useOfTime: UseOfTimeState }) => 
  state.useOfTime.managerState.stressPenalties;
export const selectAllocationValidity = (state: { useOfTime: UseOfTimeState }) => ({
  isValid: state.useOfTime.managerState.isValid,
  validationErrors: state.useOfTime.managerState.validationErrors
});
export const selectIsInitialized = (state: { useOfTime: UseOfTimeState }) => 
  state.useOfTime.isInitialized;
export const selectSpecificAllocation = (activityType: ActivityType) => 
  (state: { useOfTime: UseOfTimeState }) => 
    state.useOfTime.managerState.currentAllocation.allocations[activityType];

// Export reducer
export default useOfTimeSlice.reducer;