/**
 * /src/infrastructure/state/slices/__tests__/gameLoopSlice.test.ts
 *
 * Tests for the game loop Redux slice
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import gameLoopReducer, {
  setGameLoopState,
  setInitialized,
  setResourceUpdates,
  setActiveEvents,
  addActiveEvent,
  removeActiveEvent,
  initializeGameLoop,
  startGameLoop,
  stopGameLoop,
  pauseGame,
  resumeGame,
  togglePause,
  resolveEvent,
} from '../gameLoopSlice';
import { GameLoopState } from '../../../../domain/services/GameLoop';
import { ResourceType } from '../../../../domain/types';

// Global GameLoop mock for tests
const mockGameLoop = {
  getState: vi.fn().mockReturnValue({
    isRunning: false,
    isPaused: false,
    lastTickTime: 0,
    tickCount: 0,
    daysPassed: 0,
    activeEvents: [],
    totalSkillPointsGenerated: 0,
  }),
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  togglePause: vi.fn(),
  resolveEvent: vi.fn(),
  updateGameState: vi.fn(),
  addEventListener: vi.fn(),
  getActiveEvents: vi.fn().mockReturnValue([]),
  hasActiveEvents: vi.fn().mockReturnValue(false),
};

// Mock GameLoop and other services
vi.mock('../../../../domain/services/GameLoop', () => {
  return {
    GameLoop: vi.fn().mockImplementation(() => mockGameLoop),
    GameLoopEventType: {
      TICK: 'tick',
      PAUSED: 'paused',
      RESUMED: 'resumed',
      RESOURCES_UPDATED: 'resources_updated',
      SKILLS_UPDATED: 'skills_updated',
      EVENT_TRIGGERED: 'event_triggered',
      EVENT_RESOLVED: 'event_resolved',
      ERROR: 'error',
    },
  };
});

vi.mock('../../../../domain/services/TimeManager', () => ({
  TimeManager: vi.fn().mockImplementation(() => ({
    tick: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    togglePause: vi.fn(),
    isPaused: vi.fn().mockReturnValue(false),
    addEventListener: vi.fn(),
  })),
  TimeEventType: {
    TICK: 'tick',
    DAY_CHANGED: 'day_changed',
    HOUR_CHANGED: 'hour_changed',
    PAUSED: 'paused',
    RESUMED: 'resumed',
    SKILL_POINTS_GENERATED: 'skill_points_generated',
    NEWS_UPDATE: 'news_update',
  },
}));

vi.mock('../../../../domain/services/UseOfTimeManager', () => ({
  UseOfTimeManager: vi.fn().mockImplementation(() => ({
    calculateHourlyResourceImpact: vi.fn(),
    setTimeManager: vi.fn(),
  })),
}));

vi.mock('../../../../domain/services/NarrativeManager', () => ({
  NarrativeManager: vi.fn().mockImplementation(() => ({
    processEvents: vi.fn(),
    createInitialContent: vi.fn(),
    completeEvent: vi.fn(),
  })),
}));

vi.mock('../../../../domain/models/Skill', () => ({
  SkillManager: vi.fn().mockImplementation(() => ({
    acquireSkill: vi.fn(),
    generateSkillPoints: vi.fn(),
  })),
}));

// Type definition for our Redux store in tests
interface TestState {
  gameLoop: {
    gameLoopState: GameLoopState;
    initialized: boolean;
    resourceUpdates: any[];
    activeEvents: any[];
  };
}

describe('gameLoopSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create store with gameLoopReducer
    store = configureStore({
      reducer: {
        gameLoop: gameLoopReducer,
      },
    });
  });

  it('should handle setGameLoopState', () => {
    const gameLoopState: GameLoopState = {
      isRunning: true,
      isPaused: false,
      lastTickTime: 12345,
      tickCount: 10,
      daysPassed: 2,
      activeEvents: ['event-1'],
      totalSkillPointsGenerated: 48,
    };

    store.dispatch(setGameLoopState(gameLoopState));

    expect((store.getState() as TestState).gameLoop.gameLoopState).toEqual(gameLoopState);
  });

  it('should handle setInitialized', () => {
    store.dispatch(setInitialized(true));

    expect((store.getState() as TestState).gameLoop.initialized).toBe(true);
  });

  it('should handle setResourceUpdates', () => {
    const resourceUpdates = [
      {
        type: ResourceType.KNOWLEDGE_POINTS,
        value: 100,
        change: 10,
        source: 'study',
      },
      {
        type: ResourceType.MONEY,
        value: 50,
        change: 5,
        source: 'work',
      },
    ];

    store.dispatch(setResourceUpdates(resourceUpdates));

    expect((store.getState() as TestState).gameLoop.resourceUpdates).toEqual(resourceUpdates);
  });

  it('should handle setActiveEvents', () => {
    const activeEvents = [
      {
        id: 'event-1',
        title: 'Test Event 1',
        description: 'Description 1',
        choices: [],
        isActive: true,
        isResolved: false,
        trigger: { type: 'time' as const, condition: 'day', value: 1 },
      },
      {
        id: 'event-2',
        title: 'Test Event 2',
        description: 'Description 2',
        choices: [],
        isActive: true,
        isResolved: false,
        trigger: { type: 'time' as const, condition: 'day', value: 2 },
      },
    ];

    store.dispatch(setActiveEvents(activeEvents));

    expect((store.getState() as TestState).gameLoop.activeEvents).toEqual(activeEvents);
  });

  it('should handle addActiveEvent', () => {
    const event = {
      id: 'event-1',
      title: 'Test Event',
      description: 'Description',
      choices: [],
      isActive: true,
      isResolved: false,
      trigger: { type: 'time' as const, condition: 'day', value: 1 },
    };

    store.dispatch(addActiveEvent(event));

    expect((store.getState() as TestState).gameLoop.activeEvents).toContainEqual(event);
  });

  it('should handle removeActiveEvent', () => {
    const event1 = {
      id: 'event-1',
      title: 'Test Event 1',
      description: 'Description 1',
      choices: [],
      isActive: true,
      isResolved: false,
      trigger: { type: 'time' as const, condition: 'day', value: 1 },
    };

    const event2 = {
      id: 'event-2',
      title: 'Test Event 2',
      description: 'Description 2',
      choices: [],
      isActive: true,
      isResolved: false,
      trigger: { type: 'time' as const, condition: 'day', value: 2 },
    };

    store.dispatch(setActiveEvents([event1, event2]));
    store.dispatch(removeActiveEvent('event-1'));

    expect((store.getState() as TestState).gameLoop.activeEvents).toEqual([event2]);
  });

  // Thunk tests

  it('should initialize the game loop', async () => {
    await store.dispatch(initializeGameLoop() as any);

    expect((store.getState() as TestState).gameLoop.initialized).toBe(true);
  });

  it('should start the game loop', async () => {
    await store.dispatch(startGameLoop() as any);

    // Should initialize first
    expect((store.getState() as TestState).gameLoop.initialized).toBe(true);

    // Should call start on the game loop
    expect(mockGameLoop.start).toHaveBeenCalled();
  });

  it('should stop the game loop', async () => {
    await store.dispatch(stopGameLoop() as any);

    // Should call stop on the game loop
    expect(mockGameLoop.stop).toHaveBeenCalled();
  });

  it('should pause the game', async () => {
    await store.dispatch(pauseGame() as any);

    // Should call pause on the game loop
    expect(mockGameLoop.pause).toHaveBeenCalled();
  });

  it('should resume the game', async () => {
    await store.dispatch(resumeGame() as any);

    // Should call resume on the game loop
    expect(mockGameLoop.resume).toHaveBeenCalled();
  });

  it('should toggle pause state', async () => {
    await store.dispatch(togglePause() as any);

    // Should call togglePause on the game loop
    expect(mockGameLoop.togglePause).toHaveBeenCalled();
  });

  it('should resolve an event', async () => {
    await store.dispatch(resolveEvent('event-1', 'choice-1') as any);

    // Should call resolveEvent on the game loop with the correct parameters
    expect(mockGameLoop.resolveEvent).toHaveBeenCalledWith('event-1', 'choice-1');
  });
});
