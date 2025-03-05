# Game Loop Connection Issues Fix Plan

## Overview of Issues

After analysis of the codebase, I've identified four critical issues that are preventing the game loop from properly updating resources:

1. **Empty Simulation Subscription in Middleware**: The `simulationMiddleware.ts` has an empty callback for simulation updates, so updates from the simulation never reach Redux.

2. **Disconnected Game Loop Ticks**: In `RealTimeGameLoop.ts`, there's commented code for manually triggering simulation ticks, but it's not actually implemented.

3. **Initialization Order Problems**: The `setupSimulationSync` function exists but is never called during application startup.

4. **Dual Timing Systems**: The simulation service uses `setInterval` while the game loop uses `requestAnimationFrame`, creating timing confusion.

## Comprehensive Fix Plan

### 1. Update the Simulation Middleware

**File: `/Users/montysharma/Documents/v9/MMV09/src/infrastructure/state/middleware/simulation/simulationMiddleware.ts`**

```typescript
// Replace the empty subscription with proper dispatching
export const createSimulationMiddleware = (
  options: SimulationMiddlewareOptions
): Middleware<{}, RootState> => {
  const { simulationService } = options;

  return (store) => {
    // Subscribe to simulation updates
    simulationService.subscribe((update: SimulationUpdate) => {
      // Dispatch resource updates to Redux
      if (update.resourceUpdate) {
        store.dispatch(updateResources(update.resourceUpdate));
      }

      // Dispatch time updates
      store.dispatch(tick(Date.now()));

      // Handle new events if any
      if (update.newEvents && update.newEvents.length > 0) {
        store.dispatch(addEvents(update.newEvents));
      }
    });

    return (next) => (action: AnyAction) => {
      // Process the action first
      const result = next(action);

      // Rest of middleware code...

      return result;
    };
  };
};
```

### 2. Connect Game Loop to Simulation

**File: `/Users/montysharma/Documents/v9/MMV09/src/domain/services/RealTimeGameLoop.ts`**

```typescript
// Replace the commented-out tick processing code
// Process ticks
if (ticksToProcess > 0) {
  // Manually trigger simulation ticks
  for (let i = 0; i < ticksToProcess; i++) {
    this.simulation.tick();
  }

  // Reduce accumulator
  this.tickAccumulator -= ticksToProcess * this.config.simulationTickRateMs;

  // Update state
  this.state = {
    ...this.state,
    tickCount: this.state.tickCount + ticksToProcess,
    ticksThisFrame: ticksToProcess,
    simulationTime: this.state.simulationTime + ticksToProcess * this.config.simulationTickRateMs,
  };

  // Emit tick event
  this.emitEvent(GameLoopEventType.TICK, {
    timestamp,
    deltaTime,
    simulationUpdates: this.simulationUpdates,
    tickCount: ticksToProcess,
    fps: this.state.fps,
  });
}
```

### 3. Add Initialization Code

**File: `/Users/montysharma/Documents/v9/MMV09/src/infrastructure/state/store.ts`**

```typescript
// Add simulation middleware to the store setup
import { createSimulationMiddleware, defaultServiceRegistry } from './middleware/simulation';

export const store = configureStore({
  reducer: {
    // existing reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // existing serializable check options...
      },
    }).concat(
      createSimulationMiddleware({
        simulationService: defaultServiceRegistry.getSimulationService(),
      })
    ),
});
```

**File: `/Users/montysharma/Documents/v9/MMV09/src/App.tsx`**

```typescript
// In the GameInitializer component, add the simulation sync setup
const GameInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const isTimeInitialized = useSelector((state: RootState) => state.time.isInitialized);
  const isUseOfTimeInitialized = useSelector((state: RootState) => state.useOfTime.isInitialized);

  useEffect(() => {
    // Initialize the time manager when the app loads
    dispatch(
      initializeTimeManager({
        realSecondsPerGameDay: 3,
        skillPointsPerGameHour: 1,
        newsUpdateFrequencyHours: 4,
        startPaused: true,
      })
    );

    // Set up simulation sync
    const simulationService = defaultServiceRegistry.getSimulationService();
    const unsubscribe = setupSimulationSync(store, simulationService);

    return () => {
      // Clean up on unmount
      unsubscribe();
    };
  }, [dispatch]);

  // Rest of the component...
};
```

### 4. Clarify Timing Architecture

**File: `/Users/montysharma/Documents/v9/MMV09/src/domain/services/simulation/GameSimulationService.ts`**

```typescript
/**
 * Start the simulation
 * @returns Whether the simulation was started
 */
start(): boolean {
  if (this.isRunning) {
    return false;
  }

  this.isRunning = true;

  // REMOVE the tickInterval setup completely since we're going to drive this from the game loop
  // No more setInterval!

  return true;
}

/**
 * Stop the simulation
 * @returns Whether the simulation was stopped
 */
stop(): boolean {
  if (!this.isRunning) {
    return false;
  }

  this.isRunning = false;

  // REMOVE the interval clearing since we're not using intervals anymore

  return true;
}
```

### 5. Add Debugging Code

**File: `/Users/montysharma/Documents/v9/MMV09/src/domain/services/simulation/GameSimulationService.ts`**

```typescript
/**
 * Perform a simulation tick
 * @returns Simulation update
 */
tick(): SimulationUpdate {
  // Add debugging
  console.log('Simulation tick at:', new Date().toISOString());

  // Get current timestamp
  const currentTimestamp = Date.now();

  // Update time
  const timeUpdate = this.timeService.update(currentTimestamp);

  // Add debugging
  console.log('Time update:', timeUpdate);

  // Rest of the method...

  // Add debugging for resources
  if (update.resourceUpdate) {
    console.log('Resource update:', JSON.stringify(update.resourceUpdate));
  }

  // Add debugging for events
  if (update.newEvents.length > 0) {
    console.log('New events:', update.newEvents);
  }

  return update;
}
```

## Implementation Strategy

I'll implement the fixes in the following order:

1. **Update RealTimeGameLoop.ts** to correctly trigger simulation ticks
2. **Update simulationMiddleware.ts** to properly dispatch resource updates
3. **Modify GameSimulationService.ts** to remove the interval-based approach
4. **Update store.ts** to include the simulation middleware
5. **Modify App.tsx** to set up the simulation sync
6. **Add debugging logs** to track the update flow

This approach ensures that we maintain the clean architecture pattern while properly connecting all components for data flow.

## Testing Steps

After implementing these changes, we should test the following:

1. **Resource Updates**: Verify that resources change when time advances
2. **Time Flow**: Ensure the game time flows properly at different speed settings
3. **Event Generation**: Confirm that events are generated and displayed
4. **Pause/Resume**: Check that pausing and resuming works properly
5. **Performance**: Measure performance to ensure the game loop runs efficiently

## Expected Outcome

After these changes, the game should have:

1. A consistent timing system driven by the RealTimeGameLoop
2. Proper resource updates displayed in the UI when time advances
3. Accurate event timing and generation
4. Clear debugging information in the console to trace the data flow
5. No dual timing systems or disconnections between components
