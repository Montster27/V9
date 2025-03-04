/**
 * /src/interface/components/time/TimeControls.tsx
 *
 * TimeControls Component
 *
 * Provides UI controls for manipulating game time progression including:
 * - Pause/Resume button
 * - Speed controls
 *
 * The component integrates with both the time slice and game loop slice
 * to provide synchronized control over the game's time flow.
 */

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../infrastructure/state/store';
import {
  selectIsPaused,
  pauseTime,
  resumeTime,
} from '../../../infrastructure/state/slices/timeSlice';
import {
  pauseGame,
  resumeGame,
  startGameLoop,
  stopGameLoop,
} from '../../../infrastructure/state/slices/gameLoopSlice';
import './TimeControls.css';

interface TimeControlsProps {
  /** Custom CSS class */
  className?: string;
  /** Show speed controls (default: true) */
  showSpeedControls?: boolean;
}

/**
 * Component to control game time (pause/resume, speed)
 */
const TimeControls: React.FC<TimeControlsProps> = ({
  className = '',
  showSpeedControls = true,
}) => {
  const dispatch = useAppDispatch();

  // Get pause state from Redux
  const isPaused = useAppSelector(selectIsPaused);

  // Local state for speed setting
  const [speed, setSpeed] = useState<number>(1);

  // Speed options
  const speedOptions = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' },
  ];

  // Start the game loop when the component mounts
  useEffect(() => {
    dispatch(startGameLoop());

    // Clean up when component unmounts
    return () => {
      dispatch(stopGameLoop());
    };
  }, [dispatch]);

  /**
   * Toggle pause state
   */
  const handleTogglePause = () => {
    if (isPaused) {
      dispatch(resumeTime());
      dispatch(resumeGame());
    } else {
      dispatch(pauseTime());
      dispatch(pauseGame());
    }
  };

  /**
   * Change game speed
   */
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);

    // In a real implementation, we would update the game speed
    // This would require adding speed control to the TimeManager and GameLoop
    console.log(`Changed speed to ${newSpeed}x`);

    // For now, let's make sure the game is running
    if (isPaused) {
      dispatch(resumeTime());
      dispatch(resumeGame());
    }
  };

  return (
    <div className={`time-controls ${className}`}>
      <button
        className={`time-controls__pause-button ${isPaused ? 'paused' : 'playing'}`}
        onClick={handleTogglePause}
        aria-label={isPaused ? 'Resume time' : 'Pause time'}
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>

      {showSpeedControls && (
        <div className="time-controls__speed">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              className={`time-controls__speed-button ${speed === option.value ? 'active' : ''}`}
              onClick={() => handleSpeedChange(option.value)}
              aria-label={`Set speed to ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeControls;
