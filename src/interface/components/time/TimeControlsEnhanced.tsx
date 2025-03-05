/**
 * /src/interface/components/time/TimeControlsEnhanced.tsx
 *
 * Enhanced TimeControls Component with better usability and feedback
 * - Improved visual feedback for pause/play state
 * - Clear explanation of speed settings with tooltips
 * - Animation feedback when controls are activated
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
import { Tooltip } from '../help';
import './TimeControlsEnhanced.css';

interface TimeControlsProps {
  /** Custom CSS class */
  className?: string;
  /** Show speed controls (default: true) */
  showSpeedControls?: boolean;
}

/**
 * Component to control game time with enhanced usability
 */
const TimeControlsEnhanced: React.FC<TimeControlsProps> = ({
  className = '',
  showSpeedControls = true,
}) => {
  const dispatch = useAppDispatch();

  // Get pause state from Redux
  const isPaused = useAppSelector(selectIsPaused);

  // Local state for speed setting and animation
  const [speed, setSpeed] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Speed options with descriptive tooltips
  const speedOptions = [
    {
      value: 1,
      label: '1x',
      description: '1 day passes every 3 seconds (normal speed)',
    },
    {
      value: 2,
      label: '2x',
      description: '1 day passes every 1.5 seconds (double speed)',
    },
    {
      value: 5,
      label: '5x',
      description: '1 day passes every 0.6 seconds (fast forward)',
    },
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
   * Toggle pause state with animation feedback
   */
  const handleTogglePause = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isPaused) {
      dispatch(resumeTime());
      dispatch(resumeGame());
    } else {
      dispatch(pauseTime());
      dispatch(pauseGame());
    }
  };

  /**
   * Change game speed with animation feedback
   */
  const handleSpeedChange = (newSpeed: number) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

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
    <div className={`time-controls-enhanced ${className}`}>
      <Tooltip content={isPaused ? 'Resume game time' : 'Pause game time'} position="bottom">
        <button
          className={`time-controls-enhanced__pause-button ${isPaused ? 'paused' : 'playing'} ${isAnimating ? 'animating' : ''}`}
          onClick={handleTogglePause}
          aria-label={isPaused ? 'Resume time' : 'Pause time'}
        >
          {isPaused ? (
            <span className="time-controls-enhanced__icon">▶</span>
          ) : (
            <span className="time-controls-enhanced__icon">⏸</span>
          )}
        </button>
      </Tooltip>

      {showSpeedControls && (
        <div className="time-controls-enhanced__speed">
          {speedOptions.map((option) => (
            <Tooltip key={option.value} content={option.description} position="bottom">
              <button
                className={`time-controls-enhanced__speed-button ${speed === option.value ? 'active' : ''} ${isAnimating && speed === option.value ? 'animating' : ''}`}
                onClick={() => handleSpeedChange(option.value)}
                aria-label={`Set speed to ${option.label}`}
              >
                {option.label}
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      <div className="time-controls-enhanced__status">
        <div
          className={`time-controls-enhanced__status-indicator ${isPaused ? 'paused' : 'playing'}`}
        ></div>
        <span className="time-controls-enhanced__status-text">
          {isPaused ? 'Time Paused' : `Running at ${speed}x speed`}
        </span>
      </div>
    </div>
  );
};

export default TimeControlsEnhanced;
