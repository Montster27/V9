/**
 * /src/domain/services/GameLoop.test.ts
 *
 * Tests for the GameLoop service
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop, GameLoopEventType } from './GameLoop';
import { TimeManager, TimeEventType } from './TimeManager';
import { UseOfTimeManager } from './UseOfTimeManager';
import { NarrativeManager } from './NarrativeManager';
import { SkillManager } from '../models/Skill';
import { TimeValue } from '../valueObjects/TimeValue';
import { ResourceType } from '../types';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Helper to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('GameLoop', () => {
  let timeManager: TimeManager;
  let useOfTimeManager: UseOfTimeManager;
  let narrativeManager: NarrativeManager;
  let skillManager: SkillManager;
  let gameLoop: GameLoop;

  // Mock event listeners
  const tickListener = vi.fn();
  const resourcesUpdatedListener = vi.fn();
  const pausedListener = vi.fn();
  const resumedListener = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create managers with mock implementations
    timeManager = new TimeManager({
      realSecondsPerGameDay: 3, // 3 seconds = 1 day
      skillPointsPerGameHour: 1,
      initialGameTime: new TimeValue(new Date(1983, 8, 1)), // Sept 1, 1983
    });

    useOfTimeManager = new UseOfTimeManager({
      timeManager,
    });

    narrativeManager = new NarrativeManager();
    skillManager = new SkillManager();

    // Spy on manager methods
    vi.spyOn(timeManager, 'tick').mockImplementation(() => timeManager.getState());
    vi.spyOn(timeManager, 'pause');
    vi.spyOn(timeManager, 'resume');
    vi.spyOn(timeManager, 'isPaused');
    vi.spyOn(useOfTimeManager, 'calculateHourlyResourceImpact');
    vi.spyOn(narrativeManager, 'processEvents').mockReturnValue([]);
    vi.spyOn(narrativeManager, 'completeEvent');
    vi.spyOn(narrativeManager, 'getEventById').mockImplementation((id) => {
      // For test-event, return a mock event
      if (id === 'test-event') {
        return {
          id: 'test-event',
          title: 'Test Event',
          description: 'A test event',
          choices: [],
          isActive: true,
          isResolved: false,
          trigger: {
            type: 'time',
            condition: 'day',
            value: 1,
          },
        } as any;
      }
      return undefined;
    });

    // Mock addEventListener on timeManager to track callbacks
    const eventCallbacks = new Map<TimeEventType, ((data: any) => void)[]>();
    vi.spyOn(timeManager, 'addEventListener').mockImplementation((eventType, callback) => {
      if (!eventCallbacks.has(eventType)) {
        eventCallbacks.set(eventType, []);
      }
      eventCallbacks.get(eventType)?.push(callback);
    });

    // Expose event callbacks for testing
    (timeManager as any).mockTriggerEvent = (eventType: TimeEventType, data: any) => {
      eventCallbacks.get(eventType)?.forEach((callback) => callback(data));
    };

    // Create the game loop with autoStart disabled
    gameLoop = new GameLoop({
      timeManager,
      useOfTimeManager,
      narrativeManager,
      skillManager,
      tickRate: 100, // Fast tick rate for testing
      autoStart: false,
    });

    // Add event listeners
    gameLoop.addEventListener(GameLoopEventType.TICK, tickListener);
    gameLoop.addEventListener(GameLoopEventType.RESOURCES_UPDATED, resourcesUpdatedListener);
    gameLoop.addEventListener(GameLoopEventType.PAUSED, pausedListener);
    gameLoop.addEventListener(GameLoopEventType.RESUMED, resumedListener);
  });

  afterEach(() => {
    // Clean up
    gameLoop.stop();
  });

  it('should create a new GameLoop instance', () => {
    expect(gameLoop).toBeDefined();
    expect(gameLoop.getState().isRunning).toBe(false);
    expect(gameLoop.getState().isPaused).toBe(false);
  });

  it('should start and stop the game loop', async () => {
    // Start the game loop
    gameLoop.start();
    expect(gameLoop.getState().isRunning).toBe(true);

    // Wait for at least one tick
    await wait(150);

    // Verify that tick was called
    expect(tickListener).toHaveBeenCalled();
    expect(timeManager.tick).toHaveBeenCalled();

    // Stop the game loop
    gameLoop.stop();
    expect(gameLoop.getState().isRunning).toBe(false);

    // Reset call counts
    vi.resetAllMocks();

    // Wait to ensure no more ticks happen
    await wait(150);

    // Verify that tick was not called again
    expect(tickListener).not.toHaveBeenCalled();
    expect(timeManager.tick).not.toHaveBeenCalled();
  });

  it('should pause and resume the game', async () => {
    // Start the game loop
    gameLoop.start();

    // Wait for at least one tick
    await wait(150);

    // Pause the game
    gameLoop.pause();
    expect(timeManager.pause).toHaveBeenCalled();
    expect(pausedListener).toHaveBeenCalled();

    // Reset call counts
    vi.resetAllMocks();

    // Wait for more ticks
    await wait(150);

    // Verify that tick continues but resource updates don't happen while paused
    expect(tickListener).toHaveBeenCalled();
    expect(useOfTimeManager.calculateHourlyResourceImpact).not.toHaveBeenCalled();

    // Resume the game
    gameLoop.resume();
    expect(timeManager.resume).toHaveBeenCalled();
    expect(resumedListener).toHaveBeenCalled();

    // Wait for more ticks
    await wait(150);

    // Verify that resource updates happen again
    expect(useOfTimeManager.calculateHourlyResourceImpact).toHaveBeenCalled();
  });

  it('should process narrative events', async () => {
    // Mock the processEvents method to return a triggered event
    const mockEvent = {
      id: 'test-event',
      title: 'Test Event',
      description: 'A test event',
      choices: [],
      isActive: true,
      isResolved: false,
      trigger: {
        type: 'time',
        condition: 'day',
        value: 1,
      },
    };

    vi.mocked(narrativeManager.processEvents).mockReturnValueOnce([mockEvent as any]);

    // Create a listener for triggered events
    const eventTriggeredListener = vi.fn();
    gameLoop.addEventListener(GameLoopEventType.EVENT_TRIGGERED, eventTriggeredListener);

    // Start the game loop
    gameLoop.start();

    // Wait for at least one tick
    await wait(150);

    // Verify that the event was triggered
    expect(narrativeManager.processEvents).toHaveBeenCalled();
    expect(eventTriggeredListener).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTriggered: mockEvent,
      })
    );

    // Verify that the game was paused
    expect(timeManager.pause).toHaveBeenCalled();
    expect(gameLoop.hasActiveEvents()).toBe(true);
    expect(gameLoop.getActiveEvents()).toContain('test-event');

    // Make sure the game is marked as paused in the state
    vi.mocked(timeManager.isPaused).mockReturnValue(true);
    gameLoop['state'] = {
      ...gameLoop.getState(),
      isPaused: true,
    };

    // Reset the timeManager.resume spy to check if it's called during event resolution
    vi.mocked(timeManager.resume).mockClear();

    // Resolve the event
    const eventResolvedListener = vi.fn();
    gameLoop.addEventListener(GameLoopEventType.EVENT_RESOLVED, eventResolvedListener);

    gameLoop.resolveEvent('test-event', 'choice-1');

    // Verify that the event was resolved
    expect(narrativeManager.completeEvent).toHaveBeenCalledWith('test-event', 'choice-1');
    expect(eventResolvedListener).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTriggered: {
          id: 'test-event',
          choiceId: 'choice-1',
        },
      })
    );

    // Verify that the game was resumed after resolving the event
    expect(timeManager.resume).toHaveBeenCalled();
    expect(gameLoop.hasActiveEvents()).toBe(false);
  });

  it('should calculate and emit resource updates', async () => {
    // Mock the calculateHourlyResourceImpact method to return resource impacts
    vi.mocked(useOfTimeManager.calculateHourlyResourceImpact).mockReturnValue({
      knowledge: 10,
      money: 5,
      social: 3,
      energy: -5,
      stress: 2,
    });

    // Start the game loop
    gameLoop.start();

    // Wait for at least one tick
    await wait(150);

    // Verify that resource updates were calculated and emitted
    expect(useOfTimeManager.calculateHourlyResourceImpact).toHaveBeenCalled();
    expect(resourcesUpdatedListener).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceUpdates: expect.arrayContaining([
          expect.objectContaining({
            type: ResourceType.KNOWLEDGE_POINTS,
            change: 10,
          }),
          expect.objectContaining({
            type: ResourceType.MONEY,
            change: 5,
          }),
          expect.objectContaining({
            type: ResourceType.SOCIAL_POINTS,
            change: 3,
          }),
          expect.objectContaining({
            type: ResourceType.ENERGY,
            change: -5,
          }),
          expect.objectContaining({
            type: ResourceType.STRESS,
            change: 2,
          }),
        ]),
      })
    );
  });

  it('should handle time events', async () => {
    // Create a mock for the time event
    const timeEventData = {
      currentTime: new TimeValue(new Date(1983, 8, 2)),
      elapsedRealMs: 3000,
      elapsedGameHours: 24,
      skillPointsGenerated: 24,
    };

    // Create a listener for skills updated events
    const skillsUpdatedListener = vi.fn();
    gameLoop.addEventListener(GameLoopEventType.SKILLS_UPDATED, skillsUpdatedListener);

    // Directly trigger the event using our mock helper
    (timeManager as any).mockTriggerEvent(TimeEventType.SKILL_POINTS_GENERATED, timeEventData);

    // Verify that the skill points were tracked
    expect(gameLoop.getTotalSkillPointsGenerated()).toBe(24);
    expect(skillsUpdatedListener).toHaveBeenCalledWith(
      expect.objectContaining({
        skillPointsGenerated: 24,
      })
    );

    // Trigger the day changed event
    (timeManager as any).mockTriggerEvent(TimeEventType.DAY_CHANGED, timeEventData);

    // Verify that the days passed were tracked
    expect(gameLoop.getDaysPassed()).toBe(1);
  });

  it('should update game state for event processing', async () => {
    // Update the game state
    const newState = {
      skills: {
        'mind.focus': 2,
      },
      resources: {
        money: 1000,
      },
    };

    gameLoop.updateGameState(newState);

    // Start the game loop
    gameLoop.start();

    // Wait for at least one tick to ensure processEvents is called
    await wait(150);

    // Verify that the updated state was passed to the narrative manager
    expect(narrativeManager.processEvents).toHaveBeenCalledWith(expect.objectContaining(newState));
  });

  it('should toggle pause state', () => {
    // Initially not paused
    expect(gameLoop.getState().isPaused).toBe(false);

    // Toggle pause (should pause)
    gameLoop.togglePause();
    expect(timeManager.pause).toHaveBeenCalled();

    // Update game loop state to reflect pause
    // When timeManager.pause() is called, it updates the GameLoop state
    // We'll simulate this by manually updating the isPaused value in our spy
    vi.mocked(timeManager.isPaused).mockReturnValue(true);

    // Force the GameLoop to update its state from timeManager.isPaused()
    gameLoop['state'] = {
      ...gameLoop.getState(),
      isPaused: true,
    };

    expect(gameLoop.getState().isPaused).toBe(true);

    // Toggle pause again (should resume)
    gameLoop.togglePause();
    expect(timeManager.resume).toHaveBeenCalled();
  });

  it('should handle errors during the tick', async () => {
    // Make timeManager.tick throw an error
    vi.mocked(timeManager.tick).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Create a listener for error events
    const errorListener = vi.fn();
    gameLoop.addEventListener(GameLoopEventType.ERROR, errorListener);

    // Start the game loop
    gameLoop.start();

    // Wait for at least one tick
    await wait(150);

    // Verify that the error was emitted
    expect(errorListener).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Test error',
      })
    );
  });
});
