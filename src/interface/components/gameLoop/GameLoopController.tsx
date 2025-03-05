/**
 * /src/interface/components/gameLoop/GameLoopController.tsx
 *
 * Component to control the game loop
 * Manages real-time game loop lifecycle and provides controls
 */

import React, { useEffect } from 'react';
import { useRealTimeGameLoop } from '../../../application/hooks';

/**
 * GameLoopController props
 */
interface GameLoopControllerProps {
  /**
   * Whether to auto-start the game loop after initialization
   */
  autoStart?: boolean;

  /**
   * Children components
   */
  children?: React.ReactNode;

  /**
   * Render prop for controls
   */
  renderControls?: (controls: {
    isRunning: boolean;
    isPaused: boolean;
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    togglePause: () => void;
  }) => React.ReactNode;

  /**
   * Render prop for performance display
   */
  renderPerformance?: (performance: {
    fps: number;
    ticksPerSecond: number;
    warning: boolean;
    warningMessage?: string;
  }) => React.ReactNode;
}

/**
 * GameLoopController component
 * @param props Component props
 * @returns React component
 */
const GameLoopController: React.FC<GameLoopControllerProps> = ({
  autoStart = false,
  children,
  renderControls,
  renderPerformance,
}) => {
  // Initialize game loop
  const {
    isInitialized,
    isRunning,
    isPaused,
    fps,
    ticksPerSecond,
    performanceWarning,
    start,
    stop,
    pause,
    resume,
    togglePause,
  } = useRealTimeGameLoop(true); // Always auto-initialize

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && isInitialized && !isRunning) {
      start();
    }
  }, [autoStart, isInitialized, isRunning, start]);

  // Control handlers
  const handleStart = () => {
    if (!isRunning) {
      start();
    }
  };

  const handleStop = () => {
    if (isRunning) {
      stop();
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      pause();
    }
  };

  const handleResume = () => {
    if (isRunning && isPaused) {
      resume();
    }
  };

  const handleTogglePause = () => {
    if (isRunning) {
      togglePause();
    }
  };

  // Render controls if provided
  const controls = renderControls
    ? renderControls({
        isRunning,
        isPaused,
        start: handleStart,
        stop: handleStop,
        pause: handlePause,
        resume: handleResume,
        togglePause: handleTogglePause,
      })
    : null;

  // Render performance display if provided
  const performance = renderPerformance
    ? renderPerformance({
        fps,
        ticksPerSecond,
        warning: performanceWarning.warning,
        warningMessage: performanceWarning.message,
      })
    : null;

  return (
    <>
      {controls}
      {performance}
      {children}
    </>
  );
};

export default GameLoopController;
