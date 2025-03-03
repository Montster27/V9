# Time Redux Integration

## Overview
The Time Redux integration connects the game's time system to Redux state management. This allows for:
- Central management of time state
- Consistent time updates across components
- Time-based events and interactions

## Key Components

### TimeSlice
The `timeSlice.ts` provides the following functionality:
- State management for game time
- Actions for controlling time (pause, resume, tick)
- Integration with the TimeManager service
- Tracking of skill points generated from time passage
- Tracking of news updates

### Core State
```typescript
interface TimeState {
  managerState: TimeManagerState;  // From TimeManager
  config: TimeManagerConfig;       // Configuration
  lastTickTimestamp: number;       // For tracking updates
  isInitialized: boolean;          // Initialization state
}
```

### Available Actions
- `initializeTimeManager`: Set up the time manager with configuration
- `tick`: Process a time update (advances game time)
- `pauseTime`: Pause time progression
- `resumeTime`: Resume time progression
- `togglePause`: Toggle between paused and running states
- `setGameTime`: Directly set the game time
- `updateConfig`: Update time manager configuration
- `resetTimeManager`: Reset to initial state

### Selectors
- `selectTimeState`: Get the full time state
- `selectGameTime`: Get the current game time
- `selectIsPaused`: Check if time is paused
- `selectTotalSkillPoints`: Get total generated skill points
- `selectConfig`: Get current configuration
- `selectIsInitialized`: Check if time manager is initialized

## Usage Examples

### Initializing Time
```typescript
import { useAppDispatch } from '../infrastructure/state/store';
import { initializeTimeManager } from '../infrastructure/state/slices/timeSlice';

const dispatch = useAppDispatch();

// Initialize with custom config
dispatch(initializeTimeManager({
  realSecondsPerGameDay: 5,
  skillPointsPerGameHour: 2,
  startPaused: false
}));
```

### Controlling Time
```typescript
import { useAppDispatch, useAppSelector } from '../infrastructure/state/store';
import { pauseTime, resumeTime, togglePause, selectIsPaused } from '../infrastructure/state/slices/timeSlice';

const dispatch = useAppDispatch();
const isPaused = useAppSelector(selectIsPaused);

// Pause time
dispatch(pauseTime());

// Resume time
dispatch(resumeTime());

// Toggle pause state
dispatch(togglePause());
```

### Implementing a Game Tick
```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../infrastructure/state/store';
import { tick, selectIsPaused } from '../infrastructure/state/slices/timeSlice';

const GameLoop = () => {
  const dispatch = useAppDispatch();
  const isPaused = useAppSelector(selectIsPaused);
  
  useEffect(() => {
    // Setup game loop
    const tickInterval = setInterval(() => {
      // Only dispatch tick if not paused
      if (!isPaused) {
        dispatch(tick());
      }
    }, 100); // Tick every 100ms for smooth updates
    
    // Cleanup
    return () => clearInterval(tickInterval);
  }, [dispatch, isPaused]);
  
  return null; // This is a non-visual component
};
```

### Displaying Game Time
```typescript
import { useAppSelector } from '../infrastructure/state/store';
import { selectGameTime } from '../infrastructure/state/slices/timeSlice';

const TimeDisplay = () => {
  const gameTime = useAppSelector(selectGameTime);
  const date = gameTime.getGameDate();
  
  return (
    <div className="time-display">
      <div className="date">{date.toLocaleDateString()}</div>
      <div className="time">{date.toLocaleTimeString()}</div>
    </div>
  );
};
```

### Tracking Generated Skill Points
```typescript
import { useAppSelector } from '../infrastructure/state/store';
import { selectTotalSkillPoints } from '../infrastructure/state/slices/timeSlice';

const SkillPointsDisplay = () => {
  const totalSkillPoints = useAppSelector(selectTotalSkillPoints);
  
  return (
    <div className="skill-points">
      <h3>Skill Points</h3>
      <p>Available: {totalSkillPoints}</p>
    </div>
  );
};
```

## Integration with Other Systems
The time system integrates with other game systems:
- **Skills**: Generates skill points over time
- **Events**: Can pause time during important events
- **Resources**: Updates resource calculations based on elapsed time
- **News**: Triggers news updates at specific intervals

## Performance Considerations
- Time calculations are performed in the TimeManager service
- Redux updates should be scheduled at reasonable intervals (50-100ms)
- Time-intensive operations should be memoized
