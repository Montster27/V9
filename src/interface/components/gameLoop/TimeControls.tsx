/**
 * /src/interface/components/gameLoop/TimeControls.tsx
 *
 * Component for controlling game time
 * Provides play, pause, and speed controls for the game loop
 */

import React, { useCallback } from 'react';
import { useRealTimeGameLoop, useTimeSimulation } from '../../../application/hooks';

/**
 * TimeControls props
 */
interface TimeControlsProps {
  /**
   * CSS class for the container
   */
  className?: string;

  /**
   * Whether to show the restart button
   */
  showRestart?: boolean;

  /**
   * Whether to show the stop button
   */
  showStop?: boolean;

  /**
   * Whether to show speed controls
   */
  showSpeed?: boolean;

  /**
   * Whether to show current game time
   */
  showTime?: boolean;

  /**
   * Callback when play state changes
   */
  onPlayStateChange?: (isPlaying: boolean) => void;

  /**
   * Available speed multipliers
   */
  speedOptions?: number[];
}

/**
 * TimeControls component
 * @param props Component props
 * @returns React component
 */
const TimeControls: React.FC<TimeControlsProps> = ({
  className = 'time-controls',
  showRestart = false,
  showStop = false,
  showSpeed = true,
  showTime = true,
  onPlayStateChange,
  speedOptions = [1, 2, 4, 8],
}) => {
  // Get game loop controls
  const { isRunning, isPaused, start, stop, togglePause } = useRealTimeGameLoop(false); // Don't auto-initialize

  // Get time simulation controls
  const { getCurrentDate, speedMultiplier, setSpeed } = useTimeSimulation();

  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    if (!isRunning) {
      start();
      if (onPlayStateChange) onPlayStateChange(true);
    } else {
      togglePause();
      if (onPlayStateChange) onPlayStateChange(!isPaused);
    }
  }, [isRunning, isPaused, start, togglePause, onPlayStateChange]);

  // Stop game loop
  const handleStop = useCallback(() => {
    stop();
    if (onPlayStateChange) onPlayStateChange(false);
  }, [stop, onPlayStateChange]);

  // Restart game loop
  const handleRestart = useCallback(() => {
    if (isRunning) {
      stop();
    }
    start();
    if (onPlayStateChange) onPlayStateChange(true);
  }, [isRunning, stop, start, onPlayStateChange]);

  // Change speed
  const handleSpeedChange = useCallback(
    (multiplier: number) => {
      setSpeed(speedOptions.indexOf(multiplier));
    },
    [setSpeed, speedOptions]
  );

  // Format game date for display
  const formatGameDate = useCallback(() => {
    const date = getCurrentDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [getCurrentDate]);

  // Button style
  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    margin: '0 4px',
    background: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  // Active button style
  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#007bff',
    color: 'white',
    borderColor: '#0062cc',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        background: '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        style={buttonStyle}
        title={isRunning && !isPaused ? 'Pause' : 'Play'}
      >
        {isRunning && !isPaused ? '⏸️' : '▶️'}
      </button>

      {/* Stop Button */}
      {showStop && (
        <button onClick={handleStop} style={buttonStyle} title="Stop" disabled={!isRunning}>
          ⏹️
        </button>
      )}

      {/* Restart Button */}
      {showRestart && (
        <button onClick={handleRestart} style={buttonStyle} title="Restart">
          🔄
        </button>
      )}

      {/* Speed Controls */}
      {showSpeed && (
        <div style={{ display: 'flex', marginLeft: '12px' }}>
          {speedOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleSpeedChange(option)}
              style={option === speedMultiplier ? activeButtonStyle : buttonStyle}
              title={`Speed: ${option}x`}
              disabled={!isRunning}
            >
              {option}x
            </button>
          ))}
        </div>
      )}

      {/* Time Display */}
      {showTime && (
        <div style={{ marginLeft: '16px', fontFamily: 'monospace' }}>{formatGameDate()}</div>
      )}
    </div>
  );
};

export default TimeControls;
