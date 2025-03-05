/**
 * /src/infrastructure/state/thunks/timeThunks.ts
 *
 * Redux thunks for complex time-related operations
 * Handles time progression, game speed control, and time-based events
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import {
  tick,
  pauseTime,
  resumeTime,
  togglePause,
  setGameTime,
  updateConfig,
} from '../slices/timeSlice';
import { processGameEvents } from './eventThunks';
import { simulateResourceChanges, generateSkillPoints } from './resourceThunks';
import { TimeValue } from '../../../domain/valueObjects/TimeValue';

/**
 * Handle a game tick with all related updates
 */
export const gameTick = createAsyncThunk(
  'time/gameTick',
  async (timestamp: number, { getState, dispatch }) => {
    try {
      const startTime = performance.now();
      const state = getState() as RootState;

      // Skip if paused
      if (state.time.managerState.isPaused) {
        return { elapsed: 0, skipped: true };
      }

      // Calculate elapsed real seconds since last tick
      const lastTimestamp = state.time.lastTickTimestamp;
      const elapsedMs = timestamp - lastTimestamp;
      const elapsedSeconds = elapsedMs / 1000;

      // Skip if too small (performance optimization)
      if (elapsedSeconds < 0.016) {
        // Less than one frame (60fps)
        return { elapsed: elapsedSeconds, skipped: true };
      }

      // Process time tick
      dispatch(tick(timestamp));

      // Calculate elapsed game time
      const secondsPerGameDay = state.time.config.realSecondsPerGameDay;
      const elapsedGameDays = elapsedSeconds / secondsPerGameDay;
      const elapsedGameHours = elapsedGameDays * 24;

      // If significant game time has passed
      if (elapsedGameHours > 0.1) {
        // At least 6 minutes of game time
        // Apply resource changes
        dispatch(simulateResourceChanges(elapsedGameHours));

        // Generate skill points
        dispatch(generateSkillPoints(elapsedGameHours));

        // Process events
        dispatch(processGameEvents());
      }

      // Performance monitoring
      const tickDuration = performance.now() - startTime;
      if (tickDuration > 16) {
        console.warn(`Slow game tick: ${tickDuration.toFixed(2)}ms`);
      }

      return {
        elapsed: elapsedSeconds,
        gameHours: elapsedGameHours,
        processed: true,
        duration: tickDuration,
      };
    } catch (error) {
      console.error('Error in game tick:', error);
      throw error;
    }
  }
);

/**
 * Change game speed
 */
export const changeGameSpeed = createAsyncThunk(
  'time/changeGameSpeed',
  async (speedFactor: number, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;

      // Calculate new seconds per game day
      // Lower value = faster game time
      const baseSpeed = 3; // Default: 3 seconds per game day
      const newSecondsPerDay = baseSpeed / speedFactor;

      // Update config
      dispatch(
        updateConfig({
          realSecondsPerGameDay: newSecondsPerDay,
        })
      );

      // Resume game if paused
      if (state.time.managerState.isPaused) {
        dispatch(resumeTime());
      }

      return { speedFactor, newSecondsPerDay };
    } catch (error) {
      console.error('Error changing game speed:', error);
      throw error;
    }
  }
);

/**
 * Jump to a specific game date
 */
export const jumpToGameDate = createAsyncThunk(
  'time/jumpToGameDate',
  async (targetDate: Date, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;

      // Create new time value
      const newTimeValue = new TimeValue(targetDate, state.time.managerState.isPaused);

      // Pause game during the jump
      dispatch(pauseTime());

      // Set new game time
      dispatch(setGameTime(newTimeValue));

      return { success: true, targetDate };
    } catch (error) {
      console.error('Error jumping to game date:', error);
      throw error;
    }
  }
);

/**
 * Advance game time by a specific amount
 */
export const advanceGameTime = createAsyncThunk(
  'time/advanceGameTime',
  async (payload: { days?: number; hours?: number; minutes?: number }, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const currentGameDate = state.time.managerState.currentTime.getGameDate();

      // Calculate total milliseconds to advance
      const totalMs =
        (payload.days || 0) * 24 * 60 * 60 * 1000 +
        (payload.hours || 0) * 60 * 60 * 1000 +
        (payload.minutes || 0) * 60 * 1000;

      // Calculate new date
      const newDate = new Date(currentGameDate.getTime() + totalMs);

      // Create new time value
      const newTimeValue = new TimeValue(newDate, state.time.managerState.isPaused);

      // Pause game during the advance
      dispatch(pauseTime());

      // Set new game time
      dispatch(setGameTime(newTimeValue));

      // Determine elapsed game hours for resource updates
      const elapsedGameHours = totalMs / (60 * 60 * 1000);

      // Apply resource changes
      dispatch(simulateResourceChanges(elapsedGameHours));

      // Generate skill points
      dispatch(generateSkillPoints(elapsedGameHours));

      // Process events
      dispatch(processGameEvents());

      return {
        success: true,
        advancedBy: {
          days: payload.days || 0,
          hours: payload.hours || 0,
          minutes: payload.minutes || 0,
        },
        elapsedGameHours,
      };
    } catch (error) {
      console.error('Error advancing game time:', error);
      throw error;
    }
  }
);
