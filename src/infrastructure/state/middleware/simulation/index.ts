/**
 * /src/infrastructure/state/middleware/simulation/index.ts
 *
 * Export all simulation middleware components
 */

export { createSimulationMiddleware, setupSimulationSync } from './simulationMiddleware';

export { ServiceRegistry, defaultServiceRegistry } from './serviceRegistry';

export type { ServiceRegistryConfig } from './serviceRegistry';
