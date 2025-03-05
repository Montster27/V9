/**
 * /src/interface/components/gameLoop/PerformanceDisplay.tsx
 *
 * Component to display game loop performance metrics
 * Shows FPS, tick rate, and performance warnings
 */

import React, { useState, useEffect } from 'react';
import { useRealTimeGameLoop } from '../../../application/hooks';

/**
 * PerformanceDisplay props
 */
interface PerformanceDisplayProps {
  /**
   * Whether to show detailed metrics
   */
  detailed?: boolean;

  /**
   * Whether to always show metrics (if false, only shows warnings or when detailed)
   */
  alwaysShow?: boolean;

  /**
   * CSS class for the container
   */
  className?: string;

  /**
   * CSS class for warning state
   */
  warningClassName?: string;
}

/**
 * PerformanceDisplay component
 * @param props Component props
 * @returns React component
 */
const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  detailed = false,
  alwaysShow = false,
  className = 'performance-display',
  warningClassName = 'performance-warning',
}) => {
  // Get performance metrics from game loop
  const { fps, ticksPerSecond, performanceWarning, isRunning } = useRealTimeGameLoop(false); // Don't auto-initialize

  // State for display visibility
  const [expanded, setExpanded] = useState(detailed);

  // Show details if there's a warning
  useEffect(() => {
    if (performanceWarning.warning && !expanded) {
      setExpanded(true);
    }
  }, [performanceWarning.warning, expanded]);

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  // Don't show anything if not running and not forced to show
  if (!isRunning && !alwaysShow) {
    return null;
  }

  // Get container class based on warning state
  const containerClass = `${className} ${performanceWarning.warning ? warningClassName : ''}`;

  return (
    <div
      className={containerClass}
      onClick={toggleExpanded}
      title="Click to toggle details"
      style={{
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: performanceWarning.warning
          ? 'rgba(255, 0, 0, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        top: '8px',
        right: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: 'bold' }}>FPS: {fps}</div>

      {expanded && (
        <>
          <div>Ticks/s: {ticksPerSecond}</div>

          {performanceWarning.warning && performanceWarning.message && (
            <div style={{ color: 'red', marginTop: '4px' }}>{performanceWarning.message}</div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceDisplay;
