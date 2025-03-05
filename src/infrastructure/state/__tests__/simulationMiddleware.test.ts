/**
 * /src/infrastructure/state/__tests__/simulationMiddleware.test.ts
 *
 * Tests for simulation middleware
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  createSimulationMiddleware,
  setupSimulationSync,
} from '../middleware/simulation/simulationMiddleware';
import { tick, pauseTime, resumeTime, togglePause } from '../slices/timeSlice';
import { updateResources } from '../slices/resourcesSlice';
import { updateTimeAllocation } from '../slices/useOfTimeSlice';
import { addEvents, resolveEvent } from '../slices/eventSlice';
import { discoverClue, advanceArc } from '../slices/narrativeSlice';

// Mock simulation service
const createMockSimulationService = () => {
  return {
    pauseTime: vi.fn(),
    resumeTime: vi.fn(),
    togglePause: vi.fn(),
    setResources: vi.fn(),
    setTimeAllocation: vi.fn(),
    setActiveEvents: vi.fn(),
    processEventChoice: vi.fn(),
    getDiscoveredClues: vi.fn().mockReturnValue([]),
    setDiscoveredClues: vi.fn(),
    getNarrativeProgress: vi.fn().mockReturnValue({}),
    setNarrativeProgress: vi.fn(),
    getActiveEvents: vi.fn().mockReturnValue([]),
    subscribe: vi.fn().mockImplementation((callback) => {
      // Store the callback for testing
      (createMockSimulationService as any).lastCallback = callback;
      return vi.fn(); // Return unsubscribe function
    }),
  };
};

// Mock store
const createMockStore = () => {
  const actions: any[] = [];
  const state = {
    resources: {
      energy: { current: 50, max: 100 },
    },
    useOfTime: {
      managerState: {
        currentAllocation: { study: 4, work: 4, rest: 8, social: 8 },
      },
    },
    events: {
      queue: {
        active: [],
      },
    },
    narrative: {
      discoveredClues: [],
    },
  };

  const getState = vi.fn().mockReturnValue(state);
  const dispatch = vi.fn((action) => {
    actions.push(action);
    return action;
  });

  return {
    getState,
    dispatch,
    actions,
    state,
    clearActions: () => {
      actions.length = 0;
    },
  };
};

// Mock next function
const next = vi.fn((action) => action);

describe('simulationMiddleware', () => {
  let middleware: any;
  let simulationService: ReturnType<typeof createMockSimulationService>;
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    simulationService = createMockSimulationService();
    store = createMockStore();

    middleware = createSimulationMiddleware({
      simulationService,
    })(store)(next);

    vi.clearAllMocks();
    store.clearActions();
  });

  test('should pass all actions through to next', () => {
    const action = { type: 'TEST_ACTION' };
    middleware(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  test('should handle time actions properly', () => {
    // Test pauseTime
    middleware(pauseTime());
    expect(simulationService.pauseTime).toHaveBeenCalled();

    // Test resumeTime
    middleware(resumeTime());
    expect(simulationService.resumeTime).toHaveBeenCalled();

    // Test togglePause
    middleware(togglePause());
    expect(simulationService.togglePause).toHaveBeenCalled();
  });

  test('should handle resource actions properly', () => {
    // Test updateResources
    const resources = { energy: { current: 60 } };
    middleware(updateResources(resources));

    expect(simulationService.setResources).toHaveBeenCalled();
  });

  test('should handle time allocation actions properly', () => {
    // Test updateTimeAllocation
    middleware(
      updateTimeAllocation({
        study: 6,
        work: 6,
        rest: 6,
        social: 6,
      })
    );

    expect(simulationService.setTimeAllocation).toHaveBeenCalled();
  });

  test('should handle event actions properly', () => {
    // Test addEvents
    const events = [
      { id: 'event1', title: 'Test Event' },
      { id: 'event2', title: 'Another Event' },
    ];
    middleware(addEvents(events));

    expect(simulationService.setActiveEvents).toHaveBeenCalled();

    // Test resolveEvent
    middleware(resolveEvent({ eventId: 'event1', choiceId: 'choice1' }));

    expect(simulationService.processEventChoice).toHaveBeenCalledWith('event1', 'choice1');
  });

  test('should handle narrative actions properly', () => {
    // Test discoverClue
    middleware(discoverClue({ clueId: 'clue1' }));

    expect(simulationService.getDiscoveredClues).toHaveBeenCalled();
    expect(simulationService.setDiscoveredClues).toHaveBeenCalledWith(['clue1']);

    // Test advanceArc
    middleware(advanceArc({ arcId: 'arc1', level: 3 }));

    expect(simulationService.getNarrativeProgress).toHaveBeenCalled();
    expect(simulationService.setNarrativeProgress).toHaveBeenCalledWith({
      arc1: 3,
    });
  });
});

describe('setupSimulationSync', () => {
  let simulationService: ReturnType<typeof createMockSimulationService>;
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    simulationService = createMockSimulationService();
    store = createMockStore();

    vi.clearAllMocks();
    store.clearActions();
  });

  test('should initialize simulation with store state', () => {
    setupSimulationSync(store, simulationService);

    expect(simulationService.setResources).toHaveBeenCalledWith(store.state.resources);
    expect(simulationService.setTimeAllocation).toHaveBeenCalledWith(
      store.state.useOfTime.managerState.currentAllocation
    );
    expect(simulationService.setActiveEvents).toHaveBeenCalledWith(store.state.events.queue.active);
    expect(simulationService.setDiscoveredClues).toHaveBeenCalledWith(
      store.state.narrative.discoveredClues
    );
  });

  test('should dispatch actions when simulation updates', () => {
    // Setup sync and get callback
    setupSimulationSync(store, simulationService);
    const updateCallback = (createMockSimulationService as any).lastCallback;

    // Simulate an update from the simulation
    updateCallback({
      resourceUpdate: {
        energy: { current: 75 },
        money: 1500,
      },
      timeUpdate: {
        isPaused: false,
      },
      newEvents: [{ id: 'event3', title: 'New Event', choices: [{ id: 'choice1' }] }],
    });

    // Verify actions dispatched
    expect(store.dispatch).toHaveBeenCalledWith(tick(expect.any(Number)));
    expect(store.dispatch).toHaveBeenCalledWith(
      updateResources({
        energy: { current: 75 },
        money: 1500,
      })
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      addEvents([{ id: 'event3', title: 'New Event', choices: [{ id: 'choice1' }] }])
    );
  });
});
