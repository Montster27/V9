/**
 * /src/performance/PerformanceMonitor.tsx
 *
 * Performance monitoring component for the UI
 *
 * Displays FPS counter and performance metrics for critical operations
 */

import React, { useState, useEffect, useRef } from 'react';
import { runBenchmark } from './performanceTests';
import { TimeValue } from '../domain/valueObjects/TimeValue';
import { TimeManager } from '../domain/services/TimeManager';
import { UseOfTimeManager } from '../domain/services/UseOfTimeManager';
import { ActivityType } from '../domain/models/UseOfTime';

// Styles for performance monitor
const styles = {
  container: {
    position: 'fixed' as 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#00ff00',
    padding: '10px',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '12px',
    zIndex: 1000,
    minWidth: '200px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold' as 'bold',
    marginBottom: '5px',
  },
  metric: {
    margin: '2px 0',
  },
  fps: {
    color: '#ffff00',
  },
  good: {
    color: '#00ff00',
  },
  warning: {
    color: '#ffff00',
  },
  critical: {
    color: '#ff3333',
  },
  button: {
    backgroundColor: '#444',
    border: 'none',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '3px',
    marginTop: '5px',
    cursor: 'pointer',
  },
};

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    good: number;
    warning: number;
  };
}

/**
 * Performance Monitor Component
 * Displays FPS and real-time performance metrics
 */
export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [fps, setFps] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(performance.now());
  const animationFrameId = useRef<number | null>(null);

  // FPS counter
  useEffect(() => {
    const updateFps = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastFpsUpdate.current;

      if (elapsed >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastFpsUpdate.current = now;

        // Run benchmarks periodically
        updateMetrics();
      }

      animationFrameId.current = requestAnimationFrame(updateFps);
    };

    animationFrameId.current = requestAnimationFrame(updateFps);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Run quick benchmarks to measure current performance
  const updateMetrics = () => {
    const timeValue = new TimeValue();
    const timeManager = new TimeManager();
    const useOfTimeManager = new UseOfTimeManager();

    // Run lightweight benchmarks (fewer iterations)
    const timeUpdateResult = runBenchmark(
      'TimeValue.update',
      () => timeValue.update(Date.now()),
      50
    );

    const timeManagerResult = runBenchmark('TimeManager.tick', () => timeManager.tick(), 20);

    const resourceImpactResult = runBenchmark(
      'ResourceImpact',
      () => useOfTimeManager.calculateHourlyResourceImpact(1),
      20
    );

    const allocationResult = runBenchmark(
      'UpdateAllocation',
      () => useOfTimeManager.updateAllocation(ActivityType.STUDY, 4),
      10
    );

    // Update metrics
    setMetrics([
      {
        name: 'TimeValue.update',
        value: timeUpdateResult.averageMs,
        unit: 'ms',
        threshold: { good: 0.1, warning: 0.5 },
      },
      {
        name: 'TimeManager.tick',
        value: timeManagerResult.averageMs,
        unit: 'ms',
        threshold: { good: 0.5, warning: 2 },
      },
      {
        name: 'ResourceImpact',
        value: resourceImpactResult.averageMs,
        unit: 'ms',
        threshold: { good: 0.2, warning: 1 },
      },
      {
        name: 'UpdateAllocation',
        value: allocationResult.averageMs,
        unit: 'ms',
        threshold: { good: 1, warning: 5 },
      },
    ]);
  };

  // Get color for metric based on thresholds
  const getMetricColor = (metric: PerformanceMetric) => {
    if (metric.value <= metric.threshold.good) return styles.good;
    if (metric.value <= metric.threshold.warning) return styles.warning;
    return styles.critical;
  };

  // Get color for FPS
  const getFpsColor = () => {
    if (fps >= 55) return styles.good;
    if (fps >= 30) return styles.warning;
    return styles.critical;
  };

  // Run full benchmarks
  const runFullBenchmarks = () => {
    console.log('Running full performance benchmarks...');
    // Import dynamically to avoid loading all tests during normal operation
    import('./performanceTests').then((module) => {
      const results = module.runAllPerformanceTests();
      console.table(results);
    });
  };

  if (!isVisible) {
    return (
      <button
        style={{ ...styles.container, padding: '5px', minWidth: 'auto' }}
        onClick={() => setIsVisible(true)}
      >
        Show Perf
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        Performance Monitor
        <button style={{ float: 'right', padding: '0 5px' }} onClick={() => setIsVisible(false)}>
          ✕
        </button>
      </div>

      <div style={{ ...styles.metric, ...styles.fps, ...getFpsColor() }}>FPS: {fps}</div>

      {metrics.map((metric, index) => (
        <div key={index} style={{ ...styles.metric, ...getMetricColor(metric) }}>
          {metric.name}: {metric.value.toFixed(3)}
          {metric.unit}
        </div>
      ))}

      <button style={styles.button} onClick={runFullBenchmarks}>
        Run Full Benchmarks
      </button>
    </div>
  );
};

export default PerformanceMonitor;
