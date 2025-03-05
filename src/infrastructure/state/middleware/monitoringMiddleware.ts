/**
 * /src/infrastructure/state/middleware/monitoringMiddleware.ts
 *
 * Redux middleware for monitoring state changes
 * Provides logging and performance tracking for debugging
 */

import { Middleware } from 'redux';

interface MonitoringOptions {
  logActions?: boolean;
  logState?: boolean;
  logPerformance?: boolean;
  ignoredActions?: string[];
}

/**
 * Create monitoring middleware with configurable options
 * @param options Configuration options for monitoring
 * @returns Redux middleware for state monitoring
 */
export const createMonitoringMiddleware = (options: MonitoringOptions = {}): Middleware => {
  const {
    logActions = false,
    logState = false,
    logPerformance = true,
    ignoredActions = [],
  } = options;

  return (store) => (next) => (action) => {
    // Skip ignored actions
    if (
      ignoredActions.some(
        (pattern) =>
          action.type === pattern ||
          (pattern.endsWith('*') && action.type.startsWith(pattern.slice(0, -1)))
      )
    ) {
      return next(action);
    }

    // Start performance measurement
    const startTime = performance.now();

    // Log action if enabled
    if (logActions) {
      console.group(`Action: ${action.type}`);
      console.log('Payload:', action.payload);
      console.groupEnd();
    }

    // Get current state if needed for logging
    const prevState = logState ? store.getState() : null;

    // Process the action
    const result = next(action);

    // Measure action processing time
    const duration = performance.now() - startTime;

    // Log performance if enabled and slower than threshold
    if (logPerformance && duration > 5) {
      // Log actions taking more than 5ms
      console.warn(`⚠️ Slow action: ${action.type} (${duration.toFixed(2)}ms)`);
    }

    // Log state change if enabled
    if (logState) {
      console.group(`State after: ${action.type}`);
      console.log('New state:', store.getState());
      console.log('Changed from previous state:', prevState);
      console.groupEnd();
    }

    return result;
  };
};

export default createMonitoringMiddleware;
