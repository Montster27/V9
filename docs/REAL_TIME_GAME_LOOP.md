# Real-Time Game Loop Integration

## Overview

The Real-Time Game Loop system provides an efficient, performance-optimized integration between the game simulation services and the user interface. It enables smooth animation frame-based updates, time scaling, performance monitoring, and consistent resource updates.

## Architecture

The Real-Time Game Loop architecture consists of:

1. **Core Domain Service**: The `RealTimeGameLoop` class manages game loop timing, simulation ticks, and event propagation.
2. **Redux Integration**: The `realTimeGameLoopSlice` connects the game loop to Redux state.
3. **React Hooks**: The `useRealTimeGameLoop` hook provides a simple interface for UI components.
4. **UI Components**: Pre-built control and display components for the game loop.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Game UI        │     │  Redux State    │     │ RealTimeGameLoop│
│  Components     │◄────┤  Management     │◄────┤ Service         │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ GameSimulation  │
                                                │ Service         │
                                                └─────────────────┘
```

## Core Components

### RealTimeGameLoop Service

The central service that manages the game loop timing and integration with simulation services.

**Key Features:**

- Uses `requestAnimationFrame` for efficient rendering cycle
- Implements tick accumulation for consistent simulation updates
- Monitors performance metrics and FPS
- Supports pause, resume, and variable time scaling
- Provides a comprehensive event system

**Example:**

```typescript
const gameLoop = new RealTimeGameLoop(simulationService, {
  targetFPS: 60,
  maxTicksPerFrame: 5,
  simulationTickRateMs: 100,
  autoStart: false,
});

gameLoop.addEventListener(GameLoopEventType.FRAME, (data) => {
  console.log(`Frame processed: ${data.deltaTime}ms`);
});

gameLoop.start();
```

### Redux Integration

A dedicated Redux slice connects the game loop to the application state.

**Key Features:**

- Manages game loop state in Redux
- Provides thunks for controlling the game loop
- Handles initialization, start/stop, and pause/resume
- Tracks performance metrics and warnings
- Provides selectors for accessing game loop state

**Example:**

```typescript
// Dispatch actions to control game loop
dispatch(startRealTimeGameLoop());
dispatch(pauseRealTimeGameLoop());
dispatch(toggleRealTimeGameLoop());

// Select state
const isRunning = useSelector(selectIsGameLoopRunning);
const fps = useSelector(selectFPS);
```

### React Hooks

The `useRealTimeGameLoop` hook provides a simple interface for React components.

**Key Features:**

- Initializes the game loop automatically
- Provides controls for start, stop, pause, resume
- Exposes state like isRunning, isPaused, fps
- Handles performance warnings

**Example:**

```typescript
const { isRunning, isPaused, fps, start, stop, togglePause } = useRealTimeGameLoop();

// Use controls
const handleStart = () => {
  if (!isRunning) start();
};
```

### UI Components

Pre-built components for controlling and displaying the game loop:

1. **GameLoopController**: Manages game loop lifecycle and provides controls
2. **TimeControls**: UI for play/pause and speed controls
3. **PerformanceDisplay**: Shows FPS, tick rate, and performance warnings

**Example:**

```tsx
<GameLoopController autoStart={true}>
  <TimeControls showSpeed={true} showTime={true} />
  <PerformanceDisplay detailed={true} />
  <GameContent />
</GameLoopController>
```

## Key Concepts

### Separation of Concerns

The Real-Time Game Loop system maintains clear separation between:

- **Animation Timing**: Handled by the game loop using requestAnimationFrame
- **Simulation Logic**: Delegated to the simulation services
- **State Management**: Managed through Redux
- **UI Rendering**: Handled by React components

### Performance Optimization

Several performance optimization strategies are employed:

- **Tick Accumulation**: Ensures consistent simulation updates regardless of frame rate
- **Tick Limiting**: Prevents overloading with too many simulation updates in a single frame
- **Update Batching**: Minimizes state updates and re-renders
- **Performance Monitoring**: Tracks FPS and provides warnings when performance degrades

### Configurable Time Scaling

The game loop supports configurable time scaling:

- Different speed multipliers for faster/slower gameplay
- Consistent resource updates regardless of speed
- Smooth transitions between speeds

## Integration With Game Simulation

The Real-Time Game Loop connects with the Game Simulation Services:

1. **Tick Synchronization**: The game loop generates ticks which drive simulation updates
2. **Bidirectional Communication**: Simulation updates flow back to the game loop
3. **Resource Updates**: Resource calculations happen within the simulation but are driven by the game loop's timing
4. **Event Processing**: Events are processed and resolved through the game loop's timing system

## Configuration Options

The game loop can be configured with various options:

### RealTimeGameLoop Configuration

- `targetFPS`: Target frames per second (default: 60)
- `maxTicksPerFrame`: Maximum simulation ticks per frame (default: 5)
- `simulationTickRateMs`: Milliseconds between simulation ticks (default: 100)
- `autoStart`: Whether to start automatically (default: false)

### TimeControls Configuration

- `showRestart`: Whether to show restart button
- `showStop`: Whether to show stop button
- `showSpeed`: Whether to show speed controls
- `showTime`: Whether to show current game time
- `speedOptions`: Available speed multipliers

### PerformanceDisplay Configuration

- `detailed`: Whether to show detailed metrics
- `alwaysShow`: Whether to always show metrics
- `className`: CSS class for the container
- `warningClassName`: CSS class for warning state

## Usage Examples

### Basic Setup

```tsx
import { SimulationProvider } from './providers';
import { GameLoopController, TimeControls, PerformanceDisplay } from './components/gameLoop';

function App() {
  return (
    <SimulationProvider>
      <GameLoopController autoStart={true}>
        <TimeControls />
        <PerformanceDisplay />
        <GameContent />
      </GameLoopController>
    </SimulationProvider>
  );
}
```

### Custom Game Loop Controls

```tsx
import { useRealTimeGameLoop } from './hooks';

function CustomControls() {
  const { isRunning, isPaused, start, stop, togglePause } = useRealTimeGameLoop();

  return (
    <div>
      <button onClick={isRunning ? togglePause : start}>
        {isRunning && !isPaused ? 'Pause' : 'Play'}
      </button>
      {isRunning && <button onClick={stop}>Stop</button>}
    </div>
  );
}
```

### With Performance Monitoring

```tsx
import { useRealTimeGameLoop } from './hooks';

function PerformanceMonitor() {
  const { fps, performanceWarning } = useRealTimeGameLoop();

  // Adjust quality settings based on performance
  useEffect(() => {
    if (performanceWarning.warning) {
      // Reduce quality settings
      setQualityLevel('low');
    } else if (fps > 55) {
      // Increase quality if performance is good
      setQualityLevel('high');
    }
  }, [fps, performanceWarning]);

  return null;
}
```

## Best Practices

1. **Initialize Early**: Initialize the game loop as early as possible in your application lifecycle.

2. **Control Updates**: Use the provided hooks and components rather than accessing the game loop service directly.

3. **Performance Monitoring**: Always include the PerformanceDisplay during development to monitor FPS.

4. **Tick Rate**: Adjust the simulationTickRateMs based on your game's needs - lower values give more frequent updates but consume more resources.

5. **Max Ticks**: Set a reasonable maxTicksPerFrame to prevent "spiral of death" when the game falls behind.

6. **Component Design**: Design UI components to be efficient and avoid unnecessary re-renders.

7. **UseCallback for Event Handlers**: Always use useCallback for event handlers to prevent unnecessary re-creations.

## Troubleshooting

### Low FPS

- Reduce the number of active entities/calculations
- Increase simulationTickRateMs to reduce simulation frequency
- Check for expensive UI rendering operations
- Ensure memoization is used for complex components

### Update Lags

- Verify maxTicksPerFrame is set appropriately
- Check for long-running operations in event handlers
- Ensure simulation services are optimized

### Inconsistent Behavior

- Check if components are properly connected to the game loop
- Verify that pause/resume actions are working correctly
- Ensure time scaling is properly applied

## Conclusion

The Real-Time Game Loop integration provides a robust foundation for The Middle Age Multiverse's time-based gameplay. By separating animation timing from simulation logic and providing optimized performance, it enables a smooth and consistent player experience while maintaining the complexity needed for rich game mechanics.
