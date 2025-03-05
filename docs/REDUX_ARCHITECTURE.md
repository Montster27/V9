# Redux Architecture Documentation

## Overview

This document outlines the enhanced Redux architecture for The Middle Age Multiverse, detailing the state management patterns, middleware, thunks, and data flow. The architecture follows Redux best practices with TypeScript for type safety and Redux Toolkit for simplified implementation.

## Key Components

### Store

The central Redux store is configured using Redux Toolkit's `configureStore` in `src/infrastructure/state/store.enhanced.ts`. The store manages all game state through dedicated slices, with middleware for side effects and performance monitoring.

```typescript
export const store = configureStore({
  reducer: {
    time: timeReducer,
    useOfTime: useOfTimeReducer,
    narrative: narrativeReducer,
    gameLoop: gameLoopReducer,
    resources: resourcesReducer,
    news: newsReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        /* configuration */
      },
    }).concat(monitoringMiddleware, eventMiddleware),
});
```

### Slices

Each domain concept has a dedicated slice using Redux Toolkit's `createSlice`:

1. **timeSlice** - Manages game time, pausing, and progression
2. **useOfTimeSlice** - Manages player time allocations for activities
3. **resourcesSlice** - Manages player resources (energy, stress, money, etc.)
4. **eventsSlice** - Manages game events, triggers, and resolutions
5. **narrativeSlice** - Manages the story progression and narrative arcs
6. **newsSlice** - Manages game world updates and feedback
7. **gameLoopSlice** - Manages the core game loop and animation state

Each slice follows the pattern:

- Initial state
- Reducers for state transitions
- Action creators export
- Memoized selectors with `createSelector`

### Middleware

Custom middleware handles complex side effects and cross-cutting concerns:

#### Monitoring Middleware

```typescript
// src/infrastructure/state/middleware/monitoringMiddleware.ts
export const createMonitoringMiddleware = (options: MonitoringOptions = {}) => {
  // ... implementation
};
```

Key features:

- Performance monitoring for slow actions
- Optional action and state logging
- Configurable ignored actions

#### Event Middleware

```typescript
// src/infrastructure/state/middleware/eventMiddleware.ts
export const createEventMiddleware = () => {
  // ... implementation
};
```

Key features:

- Event processing and condition checking
- Event queue management
- Event effect application

### Thunks

Complex asynchronous operations are handled with Redux Toolkit's `createAsyncThunk`:

#### Resource Thunks

```typescript
// src/infrastructure/state/thunks/resourceThunks.ts
export const simulateResourceChanges = createAsyncThunk(
  'resources/simulateChanges',
  async (elapsedHours: number, { getState, dispatch }) => {
    // ... implementation
  }
);
```

#### Event Thunks

```typescript
// src/infrastructure/state/thunks/eventThunks.ts
export const processGameEvents = createAsyncThunk(
  'events/processGameEvents',
  async (_, { getState, dispatch }) => {
    // ... implementation
  }
);
```

#### Time Thunks

```typescript
// src/infrastructure/state/thunks/timeThunks.ts
export const gameTick = createAsyncThunk(
  'time/gameTick',
  async (timestamp: number, { getState, dispatch }) => {
    // ... implementation
  }
);
```

### Selectors

Memoized selectors using `createSelector` optimize performance by preventing unnecessary re-renders:

```typescript
// Example from resourcesSlice.ts
export const selectEnergy = createSelector([selectResourcesState], (resources) => resources.energy);

// Derived selectors for frequently used combinations
export const selectNumericalResources = createSelector([selectResourcesState], (resources) => ({
  knowledge: resources.knowledge,
  money: resources.money,
  social: resources.social,
}));
```

## Data Flow

1. **Game Tick**

   - Time progresses via `gameTick` thunk
   - Resources update based on elapsed time
   - Events process based on current state

2. **User Actions**

   - UI dispatches actions (e.g., time allocation)
   - Relevant slices update state
   - Side effects handled via middleware/thunks

3. **Resource Changes**

   - Resources updated through time progression
   - Activity impacts applied through thunks
   - Recovery mechanics through dedicated functions

4. **Event Processing**
   - Events triggered by time or state conditions
   - Event choices resolved with associated effects
   - Narrative arcs progress based on discoveries

## Performance Considerations

1. **Memoized Selectors**

   - Prevent unnecessary component re-renders
   - Cache results until dependencies change

2. **Middleware Optimizations**

   - Skip processing for high-frequency actions
   - Batch updates for performance

3. **Type Safety**

   - TypeScript ensures type correctness
   - Custom hook types prevent errors

4. **State Immutability**
   - All state updates maintain immutability
   - Redux Toolkit's `createSlice` simplifies this

## Usage Examples

### Accessing State

```typescript
// In a React component
import { useAppSelector } from '../../infrastructure/state/store';
import { selectEnergy, selectStress } from '../../infrastructure/state/slices/resourcesSlice';

function PlayerStats() {
  const energy = useAppSelector(selectEnergy);
  const stress = useAppSelector(selectStress);

  return (
    <div>
      <ProgressBar value={energy.current} max={energy.max} label="Energy" />
      <ProgressBar value={stress.current} max={stress.max} label="Stress" />
    </div>
  );
}
```

### Dispatching Actions

```typescript
// In a React component
import { useAppDispatch } from '../../infrastructure/state/store';
import { updateTimeAllocation } from '../../infrastructure/state/slices/useOfTimeSlice';

function TimeAllocationSlider({ activity }) {
  const dispatch = useAppDispatch();

  const handleChange = (value) => {
    dispatch(updateTimeAllocation({
      activityType: activity,
      hoursPerDay: value
    }));
  };

  return <Slider onChange={handleChange} />;
}
```

### Using Thunks

```typescript
// In a game loop component
import { useEffect } from 'react';
import { useAppDispatch } from '../../infrastructure/state/store';
import { gameTick } from '../../infrastructure/state/thunks/timeThunks';

function GameLoop() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let animationId;

    const tick = (timestamp) => {
      dispatch(gameTick(timestamp));
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dispatch]);

  return null;
}
```

## Debugging

The monitoring middleware facilitates debugging by:

1. Logging slow actions (taking > 5ms to process)
2. Providing optional action and state logging in development
3. Tracking performance metrics for optimization

To enable detailed debugging:

```typescript
const monitoringMiddleware = createMonitoringMiddleware({
  logActions: true,
  logState: true,
  logPerformance: true,
});
```

## Conclusion

This enhanced Redux architecture provides a solid foundation for the game's state management needs, with clear separation of concerns, optimized performance, and type safety. The combination of properly structured slices, custom middleware, and thunks allows for complex game logic while maintaining clean and maintainable code.
