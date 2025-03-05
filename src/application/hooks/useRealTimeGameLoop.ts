/**
 * /src/application/hooks/useRealTimeGameLoop.ts
 *
 * Hook for controlling the real-time game loop
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../infrastructure/state/store';
import {
  initializeRealTimeGameLoop,
  startRealTimeGameLoop,
  stopRealTimeGameLoop,
  pauseRealTimeGameLoop,
  resumeRealTimeGameLoop,
  toggleRealTimeGameLoop,
  updateRealTimeGameLoopConfig,
  selectIsGameLoopRunning,
  selectIsGameLoopPaused,
  selectFPS,
  selectTicksPerSecond,
  selectPerformanceWarning,
  selectIsGameLoopInitialized,
} from '../../infrastructure/state/slices/realTimeGameLoopSlice';

/**
 * Hook for real-time game loop control
 * @param autoInitialize Whether to automatically initialize the game loop
 * @returns Game loop controls and state
 */
export function useRealTimeGameLoop(autoInitialize = true) {
  const dispatch = useAppDispatch();

  // Select state from Redux
  const isRunning = useAppSelector(selectIsGameLoopRunning);
  const isPaused = useAppSelector(selectIsGameLoopPaused);
  const fps = useAppSelector(selectFPS);
  const ticksPerSecond = useAppSelector(selectTicksPerSecond);
  const performanceWarning = useAppSelector(selectPerformanceWarning);
  const isInitialized = useAppSelector(selectIsGameLoopInitialized);

  // Initialize game loop
  const initialize = useCallback(() => {
    return dispatch(initializeRealTimeGameLoop());
  }, [dispatch]);

  // Start game loop
  const start = useCallback(() => {
    return dispatch(startRealTimeGameLoop());
  }, [dispatch]);

  // Stop game loop
  const stop = useCallback(() => {
    return dispatch(stopRealTimeGameLoop());
  }, [dispatch]);

  // Pause game loop
  const pause = useCallback(() => {
    return dispatch(pauseRealTimeGameLoop());
  }, [dispatch]);

  // Resume game loop
  const resume = useCallback(() => {
    return dispatch(resumeRealTimeGameLoop());
  }, [dispatch]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    return dispatch(toggleRealTimeGameLoop());
  }, [dispatch]);

  // Update configuration
  const updateConfig = useCallback(
    (config: { targetFPS?: number; maxTicksPerFrame?: number; simulationTickRateMs?: number }) => {
      return dispatch(updateRealTimeGameLoopConfig(config));
    },
    [dispatch]
  );

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  return {
    // State
    isRunning,
    isPaused,
    fps,
    ticksPerSecond,
    performanceWarning,
    isInitialized,

    // Controls
    initialize,
    start,
    stop,
    pause,
    resume,
    togglePause,
    updateConfig,
  };
}

export default useRealTimeGameLoop;
