/**
 * /src/application/providers/SimulationProvider.tsx
 *
 * React context provider for game simulation services
 * Makes simulation services available throughout the component tree
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ServiceRegistry,
  GameSimulationService,
  ResourceCalculationService,
  ActivityImpactService,
  TimeProgressionService,
  EventGenerationService,
} from '../../domain/services/simulation';
import { setupSimulationSync } from '../../infrastructure/state/middleware/simulation';
import { useStore } from 'react-redux';

// Define context shape
interface SimulationContextType {
  registry: ServiceRegistry;
  simulationService: GameSimulationService;
  resourceService: ResourceCalculationService;
  activityService: ActivityImpactService;
  timeService: TimeProgressionService;
  eventService: EventGenerationService;
  isInitialized: boolean;
  isRunning: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
}

// Create context with default values
const SimulationContext = createContext<SimulationContextType | null>(null);

interface SimulationProviderProps {
  children: React.ReactNode;
  registry?: ServiceRegistry;
}

/**
 * Provider component for simulation services
 */
export const SimulationProvider: React.FC<SimulationProviderProps> = ({
  children,
  registry = new ServiceRegistry(),
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const store = useStore();
  const dispatch = useDispatch();

  // Get services from registry
  const simulationService = registry.getSimulationService();
  const resourceService = registry.getResourceService();
  const activityService = registry.getActivityService();
  const timeService = registry.getTimeService();
  const eventService = registry.getEventService();

  // Initialize simulation sync on mount
  useEffect(() => {
    // Set up bidirectional sync between Redux and simulation
    const cleanup = setupSimulationSync(store, simulationService);

    // Mark as initialized
    setIsInitialized(true);

    // Clean up on unmount
    return () => {
      cleanup();
      if (isRunning) {
        simulationService.stop();
      }
    };
  }, [store, simulationService]);

  // Start simulation
  const startSimulation = () => {
    if (isInitialized && !isRunning) {
      const success = simulationService.start();
      if (success) {
        setIsRunning(true);
      }
    }
  };

  // Stop simulation
  const stopSimulation = () => {
    if (isInitialized && isRunning) {
      const success = simulationService.stop();
      if (success) {
        setIsRunning(false);
      }
    }
  };

  // Context value
  const contextValue: SimulationContextType = {
    registry,
    simulationService,
    resourceService,
    activityService,
    timeService,
    eventService,
    isInitialized,
    isRunning,
    startSimulation,
    stopSimulation,
  };

  return <SimulationContext.Provider value={contextValue}>{children}</SimulationContext.Provider>;
};

/**
 * Hook for accessing simulation services
 * @returns Simulation context
 */
export const useSimulation = () => {
  const context = useContext(SimulationContext);

  if (context === null) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }

  return context;
};

/**
 * Higher-order component for wrapping components with simulation provider
 * @param Component Component to wrap
 * @returns Wrapped component with simulation context
 */
export function withSimulation<P>(Component: React.ComponentType<P>): React.FC<P> {
  return (props) => (
    <SimulationProvider>
      <Component {...props} />
    </SimulationProvider>
  );
}

export default SimulationProvider;
