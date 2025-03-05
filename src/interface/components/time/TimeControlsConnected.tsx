/**
 * /src/interface/components/time/TimeControlsConnected.tsx
 *
 * TimeControls connected to real-time game loop for live data integration
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useRealTimeGameLoop } from '../../../application/hooks/useRealTimeGameLoop';
import { useAppSelector } from '../../../infrastructure/state/store';
import { selectFormattedGameTime } from '../../../infrastructure/state/slices/timeSlice';
import './TimeControlsEnhanced.css';

interface TimeControlsProps {
  /** Custom CSS class */
  className?: string;
  /** Enable auto-start (default: true) */
  autoStart?: boolean;
}

/**
 * TimeControlsConnected component integrates with the real-time game loop
 * to provide time control functionality with visual feedback
 */
const TimeControlsConnected: React.FC<TimeControlsProps> = ({
  className = '',
  autoStart = true,
}) => {
  // Get game loop state and controls
  const { isPaused, isRunning, fps, togglePause, start, stop, performanceWarning, updateConfig } =
    useRealTimeGameLoop(true);

  // Get game date and time from formatted selector
  const formattedGameTime = useAppSelector(selectFormattedGameTime);

  // Speed state
  const [speedIndex, setSpeedIndex] = useState<number>(1); // 0: 0.5x, 1: 1x, 2: 2x, 3: 4x
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
  ];

  // Auto-start the game loop
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);

  // Change game speed
  const handleSpeedChange = useCallback(
    (index: number) => {
      setSpeedIndex(index);

      // Update game loop configuration based on speed
      const speedValue = speedOptions[index].value;
      updateConfig({
        simulationTickRateMs: 1000 / speedValue, // Adjust simulation tick rate based on speed
      });
    },
    [speedOptions, updateConfig]
  );

  // Format game date for display
  const formatGameDate = useCallback((year: number, month: number, day: number): string => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Format game time for display
  const formatGameTime = useCallback((hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className={`time-controls-connected ${className}`}>
      <div className="time-display">
        <div className="time-display__date">
          {formattedGameTime
            ? formatGameDate(formattedGameTime.year, formattedGameTime.month, formattedGameTime.day)
            : 'Date loading...'}
        </div>
        <div className="time-display__time">
          {formattedGameTime
            ? formatGameTime(formattedGameTime.hours, formattedGameTime.minutes)
            : 'Time loading...'}
        </div>

        {/* Show FPS and performance warning in dev mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`performance-indicator ${performanceWarning ? 'warning' : ''}`}>
            {fps.toFixed(1)} FPS
          </div>
        )}
      </div>

      <div className="time-controls">
        <button
          className={`pause-button ${isPaused ? 'paused' : 'playing'}`}
          onClick={togglePause}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
          title={isPaused ? 'Resume game' : 'Pause game'}
        >
          {isPaused ? (
            <span className="control-icon">▶</span>
          ) : (
            <span className="control-icon">⏸</span>
          )}
        </button>

        <div className="speed-controls">
          {speedOptions.map((option, index) => (
            <button
              key={index}
              className={`speed-button ${speedIndex === index ? 'active' : ''}`}
              onClick={() => handleSpeedChange(index)}
              aria-label={`Set speed to ${option.label}`}
              title={`Set speed to ${option.label}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeControlsConnected;
