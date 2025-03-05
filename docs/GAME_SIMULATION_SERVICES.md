# Game Simulation Services Documentation

## Overview

The Game Simulation Services provide a comprehensive framework for simulating the core gameplay mechanics of _The Middle Age Multiverse_. These services handle time progression, resource calculations, activity impacts, event generation, and overall game simulation in a modular, testable architecture.

## Architecture

The simulation system is built around the following components:

1. **Core Domain Services**: Implement the game logic independent of any UI or state management
2. **Redux Integration**: Middleware connects the services to the Redux state
3. **React Hooks**: Provide easy access to simulation features in UI components
4. **Service Registry**: Manages instances and dependencies between services

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React UI       │     │  Redux State    │     │  Domain Model   │
│  Components     │◄────┤  Management     │◄────┤  & Services     │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │                       ▲
         │                       │                       │
         ▼                       ▼                       │
┌────────────────────────────────────────────┐          │
│  Application Hooks & Providers             │          │
└────────────────────┬─────────────────────┬─┘          │
                     │                     │            │
                     ▼                     ▼            │
         ┌─────────────────────┐ ┌───────────────────┐ │
         │ Simulation          │ │ Service Registry  │ │
         │ Middleware          ├─┤ & Configuration   ├─┘
         └─────────────────────┘ └───────────────────┘
```

## Core Services

### GameSimulationService

The central service that coordinates all simulation components and manages the game loop.

**Key Features:**

- Maintains the game state for resources, time, and events
- Runs a continuous simulation loop with configurable tick rate
- Publishes updates to subscribers when state changes
- Processes event choices and their effects

**Usage Example:**

```typescript
const simulation = new GameSimulationService();
simulation.setResources(initialResources);
simulation.setTimeAllocation(currentAllocation);

// Start simulation
simulation.start();

// Process an event choice
simulation.processEventChoice('event_123', 'choice_1');

// Subscribe to updates
const unsubscribe = simulation.subscribe((update) => {
  console.log('Game updated:', update);
});
```

### ResourceCalculationService

Handles all resource-related calculations, including energy, stress, knowledge, money, and social resources.

**Key Features:**

- Calculates resource changes based on elapsed time and activities
- Applies effects for different activities with proper scaling
- Manages regeneration and depletion rates
- Handles skill points generation

**Usage Example:**

```typescript
const resourceService = new ResourceCalculationService();
const updatedResources = resourceService.calculateResourceChanges(
  currentResources,
  timeAllocation,
  elapsedGameHours
);
```

### ActivityImpactService

Determines how different activities affect player resources, with support for efficiency modifiers.

**Key Features:**

- Defines impacts of different activities (study, work, social, etc.)
- Calculates efficiency based on player state (energy, stress, skills)
- Provides activity definitions with requirements and effects
- Supports custom activity definitions

**Usage Example:**

```typescript
const activityService = new ActivityImpactService();
const impact = activityService.getActivityImpact(
  'study',
  2.5, // hours
  70, // energy level
  30 // stress level
);
```

### TimeProgressionService

Controls game time progression, pause/resume functionality, and time scaling.

**Key Features:**

- Manages the conversion between real time and game time
- Supports multiple game speed settings
- Handles pausing and resuming of game time
- Provides date manipulation for game events

**Usage Example:**

```typescript
const timeService = new TimeProgressionService();
timeService.togglePause();
timeService.increaseSpeed();
const update = timeService.update(Date.now());
```

### EventGenerationService

Generates game events based on conditions, time, and player state.

**Key Features:**

- Creates events of different types (time-based, state-based, random)
- Manages event triggers and conditions
- Supports narrative progression through events
- Provides event templates and generators

**Usage Example:**

```typescript
const eventService = new EventGenerationService();
const newEvents = eventService.checkForEvents(gameState, activeEvents);
```

## Integration with Redux

The simulation system integrates with Redux through dedicated middleware:

### SimulationMiddleware

Synchronizes the simulation services with the Redux state.

**Key Features:**

- Dispatches Redux actions based on simulation updates
- Updates simulation state based on Redux actions
- Manages bidirectional sync between systems
- Supports automatic event processing and resolution

**Usage Example:**

```typescript
const simulationMiddleware = createSimulationMiddleware({
  simulationService: serviceRegistry.getSimulationService(),
});

// Add to Redux middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(simulationMiddleware),
});

// Set up bidirectional sync
setupSimulationSync(store, serviceRegistry.getSimulationService());
```

## React Integration

### SimulationProvider

React context provider that makes simulation services available throughout the component tree.

**Key Features:**

- Initializes and configures simulation services
- Provides access to services via React context
- Manages simulation lifecycle (start/stop)
- Syncs with Redux store automatically

**Usage Example:**

```tsx
<SimulationProvider>
  <App />
</SimulationProvider>
```

### React Hooks

Custom hooks provide easy access to simulation features:

- **useSimulation**: Access to all simulation services
- **useTimeSimulation**: Time controls and state
- **useResourceSimulation**: Resource management
- **useEventSimulation**: Event handling and choices

**Usage Example:**

```tsx
function TimeControls() {
  const { pause, resume, increaseSpeed, speedMultiplier } = useTimeSimulation();

  return (
    <div>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <button onClick={increaseSpeed}>Speed Up (x{speedMultiplier})</button>
    </div>
  );
}
```

## Service Registry

Provides dependency injection and configuration for all simulation services.

**Key Features:**

- Creates and configures all services with appropriate dependencies
- Allows centralized configuration management
- Supports custom service implementations
- Provides access to individual services

**Usage Example:**

```typescript
const registry = new ServiceRegistry({
  simulationConfig: {
    simulationTickRate: 100,
    resourceUpdateInterval: 0.5,
  },
  timeConfig: {
    realSecondsPerGameDay: 3,
    startPaused: true,
  },
});

const simulationService = registry.getSimulationService();
const timeService = registry.getTimeService();
```

## Configuration Options

Each service supports extensive configuration:

### GameSimulationService

- `simulationTickRate`: Milliseconds between simulation ticks (default: 100)
- `maxEventsPerTick`: Maximum events to generate per tick (default: 1)
- `resourceUpdateInterval`: Game hours between resource updates (default: 0.5)

### ResourceCalculationService

- `baseEnergyRegen`: Energy regeneration per hour of rest (default: 5)
- `baseStressAccumulation`: Stress accumulation per active hour (default: 1)
- `skillPointsPerHour`: Skill points generated per game hour (default: 1)

### ActivityImpactService

- `efficiencyFloor`: Minimum efficiency multiplier (default: 0.5)
- `highStressPenalty`: Efficiency penalty for high stress (default: 0.3)
- `lowEnergyPenalty`: Efficiency penalty for low energy (default: 0.4)
- `skillBonus`: Maximum bonus from skills (default: 0.5)

### TimeProgressionService

- `realSecondsPerGameDay`: Real seconds per game day (default: 3)
- `startDate`: Starting game date (default: Sept 1, 1983)
- `startPaused`: Whether time starts paused (default: true)
- `speedMultipliers`: Available speed multipliers (default: [0.5, 1, 2, 4, 8])

### EventGenerationService

- `randomEventChance`: Base chance for random events (default: 0.1)
- `timeEventFrequency`: Hours between time-based events (default: 8)
- `stressEventThreshold`: Stress level to trigger stress events (default: 75)
- `maxActiveEvents`: Maximum number of active events (default: 3)

## Performance Considerations

1. **Tick Rate**: The simulation tick rate affects CPU usage. Higher tick rates provide smoother updates but consume more resources.

2. **Event Generation**: Generating too many events per tick can impact performance. Use `maxEventsPerTick` to limit this.

3. **Resource Updates**: Frequent resource updates can cause unnecessary Redux state changes. Use `resourceUpdateInterval` to control update frequency.

4. **Time Scaling**: Very high time scale multipliers can cause rapid game progression that might overwhelm the simulation system.

5. **Memoization**: UI components should use memoization to avoid unnecessary re-renders when simulation updates occur.

## Testing

The simulation system includes testing utilities for comprehensive validation:

- **simulationTestUtils.ts**: Provides utilities for creating test simulations, scenarios, and allocations
- **runSimulationTicks**: Run a controlled number of simulation ticks for testing
- **applyTestScenario**: Apply predefined scenarios to test specific game states
- **createFocusedAllocation**: Create time allocations with specific activity focus

## Extending the System

### Adding New Activities

To add new activities, extend the ActivityImpactService:

```typescript
const activityService = new ActivityImpactService();
activityService.setActivity({
  type: 'research',
  name: 'Research',
  energyCost: 7,
  stressChange: 1.2,
  moneyChange: 0,
  knowledgeChange: 8,
  socialChange: 0,
  healthChange: -0.2,
  belongingChange: 0.1,
  description: 'Conduct academic research',
});
```

### Adding New Event Types

To add new event types, register an event generator:

```typescript
const eventService = new EventGenerationService();
eventService.registerEventGenerator('custom', (state) => {
  // Create and return custom events based on state
  return [customEvent1, customEvent2];
});
```

### Creating Custom Services

You can replace any service with a custom implementation through the ServiceRegistry:

```typescript
const customResourceService = new CustomResourceCalculationService();
const registry = new ServiceRegistry();
registry.setResourceService(customResourceService);
```

## Conclusion

The Game Simulation Services provide a robust, extensible foundation for the gameplay mechanics of _The Middle Age Multiverse_. By separating core game logic from UI and state management, the system enables clean, testable code while supporting complex interactions between game systems.
