/**
 * /src/application/hooks/useTimeSimulation.ts
 *
 * Hook for using time simulation services in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { useSimulation } from '../providers/SimulationProvider';
import { useAppDispatch } from '../../infrastructure/state/store';
import {
  pauseTime,
  resumeTime,
  togglePause,
  updateConfig,
} from '../../infrastructure/state/slices/timeSlice';

/**
 * Hook for time simulation
 * @returns Time simulation controls and state
 */
export const useTimeSimulation = () => {
  const { timeService, isRunning } = useSimulation();
  const dispatch = useAppDispatch();
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(
    timeService.getCurrentSpeedMultiplier()
  );

  // Pause game time
  const pause = useCallback(() => {
    timeService.pause();
    dispatch(pauseTime());
  }, [timeService, dispatch]);

  // Resume game time
  const resume = useCallback(() => {
    timeService.resume();
    dispatch(resumeTime());
  }, [timeService, dispatch]);

  // Toggle pause state
  const toggle = useCallback(() => {
    const isPaused = timeService.togglePause();
    dispatch(togglePause());
    return !isPaused;
  }, [timeService, dispatch]);

  // Increase game speed
  const increaseSpeed = useCallback(() => {
    const newSpeed = timeService.increaseSpeed();
    setSpeedMultiplier(newSpeed);

    // Update Redux config
    dispatch(
      updateConfig({
        realSecondsPerGameDay: 3 / newSpeed,
      })
    );

    return newSpeed;
  }, [timeService, dispatch]);

  // Decrease game speed
  const decreaseSpeed = useCallback(() => {
    const newSpeed = timeService.decreaseSpeed();
    setSpeedMultiplier(newSpeed);

    // Update Redux config
    dispatch(
      updateConfig({
        realSecondsPerGameDay: 3 / newSpeed,
      })
    );

    return newSpeed;
  }, [timeService, dispatch]);

  // Set specific speed
  const setSpeed = useCallback(
    (speedIndex: number) => {
      const newSpeed = timeService.setSpeed(speedIndex);
      setSpeedMultiplier(newSpeed);

      // Update Redux config
      dispatch(
        updateConfig({
          realSecondsPerGameDay: 3 / newSpeed,
        })
      );

      return newSpeed;
    },
    [timeService, dispatch]
  );

  // Check pause state
  const isPaused = useCallback(() => {
    return timeService.isPaused();
  }, [timeService]);

  // Get current game date
  const getCurrentDate = useCallback(() => {
    return timeService.getCurrentGameDate();
  }, [timeService]);

  // Jump to specific date
  const jumpToDate = useCallback(
    (newDate: Date) => {
      timeService.setGameDate(newDate);

      // For Redux we'd need a separate action
      // This would typically be handled through a thunk
    },
    [timeService]
  );

  // Advance time by specific amount
  const advanceTime = useCallback(
    (days = 0, hours = 0, minutes = 0) => {
      return timeService.advanceGameTime(days, hours, minutes);
    },
    [timeService]
  );

  // Update current speed multiplier when it changes in the service
  useEffect(() => {
    setSpeedMultiplier(timeService.getCurrentSpeedMultiplier());
  }, [timeService]);

  return {
    pause,
    resume,
    toggle,
    increaseSpeed,
    decreaseSpeed,
    setSpeed,
    isPaused,
    getCurrentDate,
    jumpToDate,
    advanceTime,
    speedMultiplier,
    isRunning,
  };
};

export default useTimeSimulation;
