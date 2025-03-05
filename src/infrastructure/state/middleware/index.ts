/**
 * /src/infrastructure/state/middleware/index.ts
 *
 * Export all middleware from a single file
 */

// Basic middleware
export { createMonitoringMiddleware } from './monitoringMiddleware';
export { createEventMiddleware } from './eventMiddleware';

// Simulation middleware
export {
  createSimulationMiddleware,
  setupSimulationSync,
  ServiceRegistry,
  defaultServiceRegistry,
} from './simulation';

export type { ServiceRegistryConfig } from './simulation';
