# Data Model Documentation

## Overview

This document outlines the standardized data models used in the Middle Age Multiverse game. These models provide a consistent structure for all game data and help ensure type safety throughout the application.

## Core Resource Models

### ResourceValue

Basic structure for resources with current and maximum values.

```typescript
interface ResourceValue {
  current: number; // Current value
  max: number; // Maximum value
  trend?: 'increasing' | 'decreasing' | 'stable'; // Current trend
  rate?: 'slow' | 'moderate' | 'fast'; // Rate of change
}
```

### SkillPointsValue

Structure for tracking skill points.

```typescript
interface SkillPointsValue {
  current: number; // Available points
  generated: number; // Total generated
  spent: number; // Total spent
  trend?: 'increasing' | 'decreasing' | 'stable'; // Current trend
}
```

### ResourcesState

Complete game resources state.

```typescript
interface ResourcesState {
  energy: ResourceValue; // Physical and mental vitality
  stress: ResourceValue; // Stress levels
  health: ResourceValue; // Physical wellbeing
  belonging: ResourceValue; // Social connection
  knowledge: number; // Academic/practical knowledge
  money: number; // Financial resources
  social: number; // Social capital
  skillPoints: SkillPointsValue; // Points for skill upgrades
  lastUpdated: number; // Timestamp of last update
}
```

## Psychological Variables

### EnergyState

Detailed energy tracking with regeneration.

```typescript
interface EnergyState {
  current: number; // Current energy level
  max: number; // Maximum energy (affected by stress)
  regen: number; // Regeneration rate
  lastUpdate: number; // Timestamp of last update
}
```

### StressState

Tracking of stress levels and recovery.

```typescript
interface StressState {
  current: number; // Current stress level
  accumulation: number; // Rate of stress increase
  recovery: number; // Rate of stress decrease
  lastUpdate: number; // Timestamp of last update
}
```

### StressSource

Sources of stress in the game.

```typescript
interface StressSource {
  type: StressType; // Type of stress
  magnitude: number; // Intensity of stress
  duration: number; // Duration in game time
}

enum StressType {
  ACADEMIC = 'academic',
  FINANCIAL = 'financial',
  SOCIAL = 'social',
  PHYSICAL = 'physical',
  TIME = 'time',
}
```

### HealthState

Tracking of overall health with physical and mental components.

```typescript
interface HealthState {
  current: number; // Current health level
  physical: number; // Physical health component
  mental: number; // Mental health component
  lastUpdate: number; // Timestamp of last update
}
```

### BelongingState

Tracking of social connection and community involvement.

```typescript
interface BelongingState {
  current: number; // Current belonging level
  connections: number; // Number of active social connections
  community: number; // Involvement in community activities
  lastUpdate: number; // Timestamp of last update
}
```

## Event System

### GameEvent

Core event structure for all game events.

```typescript
interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  trigger: EventTrigger;
  conditions: EventCondition[];
  effects: EventEffect[];
  choices?: EventChoice[];
  timeLimit?: number;
}
```

### EventType

Types of events in the game.

```typescript
enum EventType {
  TIME = 'time',
  STATE = 'state',
  RANDOM = 'random',
  MYSTERY = 'mystery',
  CONSPIRACY = 'conspiracy',
  NARRATIVE = 'narrative',
}
```

### EventQueue

Management of event processing.

```typescript
interface EventQueue {
  pending: GameEvent[]; // Events waiting to trigger
  active: GameEvent[]; // Currently active events
  resolved: GameEvent[]; // Completed events
  narrativeArcs: Record<string, NarrativeProgress>; // Progress in storylines
}
```

### EventChoice

Player choices for events.

```typescript
interface EventChoice {
  id: string;
  text: string;
  requirements: EventCondition[];
  effects: EventEffect[];
  stress: number;
  energy: number;
}
```

## Time and Activity Models

### WeeklyTimeAllocation

Structure for tracking how the player allocates their time.

```typescript
interface WeeklyTimeAllocation {
  allocations: Record<ActivityType, TimeAllocation>;
  totalHours: number; // Should add up to 168 (24 * 7)
  lastUpdated: number; // Timestamp of last update
}
```

### ActivityType

Categories of activities for time allocation.

```typescript
enum ActivityType {
  STUDY = 'study',
  WORK = 'work',
  SOCIAL = 'social',
  REST = 'rest',
  EXERCISE = 'exercise',
}
```

## Type Validation

Type guard functions are provided to validate objects at runtime:

- `isResourcesState(obj)`
- `isGameEvent(obj)`
- `isWeeklyTimeAllocation(obj)`
- `isEnergyState(obj)`
- `isStressState(obj)`
- `isHealthState(obj)`
- `isBelongingState(obj)`
- `isEventQueue(obj)`

## Validation Service

The `ValidationService` provides functions to validate the integrity of game data:

- `validateResourceState(resources)`
- `validateEnergyState(energy)`
- `validateStressState(stress)`
- `validateHealthState(health)`
- `validateBelongingState(belonging)`
- `validateEvent(event)`
- `validateTimeAllocation(allocation)`

## Integration with Redux

All Redux slices now use these standardized models to ensure consistency throughout the application. The slices include:

- `resourcesSlice` - Manages all game resources
- `eventSlice` - Manages the event system
- `timeSlice` - Manages game time
- `useOfTimeSlice` - Manages time allocation

## Migration Guide

When working with existing components:

1. Import models from the central models directory:

   ```typescript
   import { ResourcesState, GameEvent } from '../../domain/models';
   ```

2. Use type guards when working with dynamic data:

   ```typescript
   if (isResourcesState(data)) {
     // Safe to use data as ResourcesState
   }
   ```

3. Validate data before using it:

   ```typescript
   const { isValid, errors } = ValidationService.validateResourceState(resources);
   if (!isValid) {
     console.error('Invalid resource state:', errors);
   }
   ```

4. Use the standard selectors from Redux slices:
   ```typescript
   const energy = useAppSelector(selectEnergy);
   const stress = useAppSelector(selectStress);
   ```
