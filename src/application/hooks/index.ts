/**
 * /src/application/hooks/index.ts
 *
 * Export all simulation hooks from a single file
 */

export { default as useTimeSimulation } from './useTimeSimulation';
export { default as useResourceSimulation } from './useResourceSimulation';
export { default as useEventSimulation } from './useEventSimulation';
export { default as useRealTimeGameLoop } from './useRealTimeGameLoop';
export { useSimulation } from '../providers/SimulationProvider';
