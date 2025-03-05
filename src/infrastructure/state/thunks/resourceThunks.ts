/**
 * /src/infrastructure/state/thunks/resourceThunks.ts
 *
 * Redux thunks for complex resource operations
 * Manages asynchronous resource calculations and updates
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import {
  updateResources,
  updateEnergy,
  updateStress,
  updateHealth,
  updateBelonging,
  updateSkillPoints,
} from '../slices/resourcesSlice';
import { calculateResourceImpacts } from '../slices/useOfTimeSlice';
import { ResourcesState, ResourceImpact, calculateResourceChanges } from '../../../domain/models';

/**
 * Calculate and apply resource changes based on elapsed time
 */
export const simulateResourceChanges = createAsyncThunk(
  'resources/simulateChanges',
  async (elapsedHours: number, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;

      // Calculate resource impacts from current use_of_time allocation
      dispatch(calculateResourceImpacts(elapsedHours));

      // Get the calculated impacts (normally would come from calculated result)
      // Note: In a full implementation, this would properly get the calculated impact
      const resourceImpact: ResourceImpact = {
        energy: -0.2, // Example values - these would come from use_of_time calculations
        stress: 0.1,
        money: 3,
        knowledge: 2,
        social: 1,
        health: -0.05,
        belonging: 0.1,
      };

      // Calculate new resource state
      const currentResources = state.resources;
      const updatedResources = calculateResourceChanges(
        currentResources,
        resourceImpact,
        elapsedHours
      );

      // Dispatch update action with calculated changes
      dispatch(updateResources(updatedResources));

      return updatedResources;
    } catch (error) {
      console.error('Error in simulateResourceChanges:', error);
      throw error;
    }
  }
);

/**
 * Apply resource changes from an activity
 */
export const applyActivityImpact =
  (activityType: string, duration: number): AppThunk =>
  async (dispatch, getState) => {
    try {
      const state = getState();

      // In a real implementation, this would get the activity impact
      // from the activity definition based on activityType
      const activityImpact: ResourceImpact = {
        energy: -5, // Example values
        stress: 2,
        money: 0,
        knowledge: 10,
        social: 0,
        health: 0,
        belonging: 0,
      };

      // Calculate resource changes
      const currentResources = state.resources;
      const updatedResources = calculateResourceChanges(currentResources, activityImpact, duration);

      // Dispatch update
      dispatch(updateResources(updatedResources));

      return updatedResources;
    } catch (error) {
      console.error(`Error applying impact for activity ${activityType}:`, error);
      throw error;
    }
  };

/**
 * Generate skill points based on elapsed time
 */
export const generateSkillPoints = createAsyncThunk(
  'resources/generateSkillPoints',
  async (elapsedHours: number, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const currentSkillPoints = state.resources.skillPoints;

      // Calculate new skill points (1 per game hour)
      const pointsToGenerate = Math.floor(elapsedHours);

      // Update skill points
      dispatch(
        updateSkillPoints({
          current: currentSkillPoints.current + pointsToGenerate,
          generated: currentSkillPoints.generated + pointsToGenerate,
          spent: currentSkillPoints.spent,
          trend: 'increasing',
        })
      );

      return pointsToGenerate;
    } catch (error) {
      console.error('Error generating skill points:', error);
      throw error;
    }
  }
);

/**
 * Apply recovery effects during rest activities
 */
export const applyRestRecovery = createAsyncThunk(
  'resources/applyRestRecovery',
  async (restHours: number, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;

      // Calculate energy recovery (5 points per hour)
      const energyRecovery = Math.min(
        state.resources.energy.max - state.resources.energy.current,
        restHours * 5
      );

      // Calculate stress reduction (2 points per hour)
      const stressReduction = Math.min(state.resources.stress.current, restHours * 2);

      // Update energy
      dispatch(
        updateEnergy({
          current: state.resources.energy.current + energyRecovery,
          trend: 'increasing',
          rate: 'moderate',
        })
      );

      // Update stress
      dispatch(
        updateStress({
          current: state.resources.stress.current - stressReduction,
          trend: 'decreasing',
          rate: 'moderate',
        })
      );

      return {
        energyRecovered: energyRecovery,
        stressReduced: stressReduction,
      };
    } catch (error) {
      console.error('Error applying rest recovery:', error);
      throw error;
    }
  }
);
