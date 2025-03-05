/**
 * /src/interface/components/time/TimeControlsConnected.tsx
 *
 * TimeControls connected to real-time game loop for live data integration
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useRealTimeGameLoop } from '../../../application/hooks/useRealTimeGameLoop';
import { useAppSelector, useAppDispatch } from '../../../infrastructure/state/store';
import {
  selectFormattedGameTime,
  selectIsPaused,
} from '../../../infrastructure/state/slices/timeSlice';
import { getGameLoop } from '../../../infrastructure/state/slices/realTimeGameLoopSlice';
import { defaultServiceRegistry } from '../../../infrastructure/state/middleware/simulation';
import { syncPauseState } from '../../../infrastructure/state/middleware/simulation/syncTimeServices';
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
  const dispatch = useAppDispatch();

  // Get game loop state and controls
  const { isPaused, isRunning, fps, togglePause, start, stop, performanceWarning, updateConfig } =
    useRealTimeGameLoop(true);

  // Also get the Redux time state for synchronization
  const reduxIsPaused = useAppSelector(selectIsPaused);

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

  // Auto-start the game loop with improved error handling
  useEffect(() => {
    if (autoStart && !isRunning) {
      console.log('Auto-starting game loop...');
      start().then((result) => {
        if (result) {
          console.log('Game loop started successfully');
          // Force a resume to ensure the loop is running and not paused
          if (isPaused) {
            console.log('Auto-resuming paused game loop');
            // Resume is failing - using togglePause instead as a workaround
            togglePause();
          }
        } else {
          console.error('Failed to start game loop');
        }
      });
    }
  }, [autoStart, isRunning, isPaused, start, togglePause]);

  // Change game speed with improved handling
  const handleSpeedChange = useCallback(
    (index: number) => {
      setSpeedIndex(index);

      // Update game loop configuration based on speed
      const speedValue = speedOptions[index].value;
      console.log(`Changing speed to ${speedValue}x`);

      // Update simulation tick rate based on speed
      updateConfig({
        simulationTickRateMs: 100 / speedValue, // Base rate is 100ms, adjust by speed multiplier
      });

      // Ensure time is running after speed change
      if (isPaused) {
        console.log('Resuming after speed change');
        togglePause(); // Use togglePause instead of resume
      }
    },
    [speedOptions, updateConfig, isPaused, togglePause]
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
          onClick={() => {
            console.log('Toggle pause clicked, current isPaused:', isPaused);

            // Get the game loop and simulation service
            const gameLoop = getGameLoop();
            const simulationService = defaultServiceRegistry.getSimulationService();

            // Synchronize all time-related services
            syncPauseState(dispatch, !isPaused, gameLoop, simulationService);
          }}
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
