/**
 * /src/infrastructure/state/__tests__/eventMiddleware.test.ts
 *
 * Tests for event middleware
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createEventMiddleware } from '../middleware/eventMiddleware';
import {
  EventType,
  TriggerType,
  EffectType,
  ConditionOperation,
} from '../../../domain/models/Event';
import { processEvents, activateEvent, resolveEvent } from '../slices/eventSlice';
import { updateEnergy, updateStress } from '../slices/resourcesSlice';
import { pauseTime } from '../slices/timeSlice';

// Mock store
const createMockStore = () => {
  const actions: any[] = [];
  const getState = vi.fn();
  const dispatch = vi.fn((action) => {
    actions.push(action);
    return action;
  });

  return {
    getState,
    dispatch,
    actions,
    clearActions: () => {
      actions.length = 0;
    },
  };
};

// Mock next function
const next = vi.fn((action) => action);

describe('eventMiddleware', () => {
  let middleware: any;
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    middleware = createEventMiddleware()(store)(next);
    vi.clearAllMocks();
    store.clearActions();
  });

  test('should pass through non-processEvents actions', () => {
    const action = { type: 'TEST_ACTION' };
    middleware(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  test('should pause game if an active event exists', () => {
    // Setup active event
    store.getState.mockReturnValue({
      events: {
        activeEventId: 'event1',
        queue: {
          active: [{ id: 'event1' }],
          pending: [],
        },
      },
    });

    middleware(processEvents());

    expect(next).toHaveBeenCalledWith(processEvents());
    expect(store.dispatch).toHaveBeenCalledWith(pauseTime());
  });

  test('should activate events that meet conditions', () => {
    // Setup pending event with trigger conditions that will pass
    const pendingEvent = {
      id: 'event1',
      type: EventType.TIME,
      trigger: {
        type: TriggerType.TIME,
        conditions: {
          time: 12,
          dayOfWeek: 1,
        },
      },
      effects: [
        {
          type: EffectType.MODIFY_RESOURCE,
          target: 'energy',
          value: 10,
        },
      ],
      choices: [{ id: 'choice1', text: 'Test Choice' }],
    };

    store.getState.mockReturnValue({
      events: {
        activeEventId: null,
        queue: {
          active: [],
          pending: [pendingEvent],
        },
      },
      time: {
        gameTime: {
          hour: 12,
          dayOfWeek: 1,
        },
      },
      resources: {
        energy: {
          current: 50,
          max: 100,
        },
      },
    });

    middleware(processEvents());

    expect(next).toHaveBeenCalledWith(processEvents());
    expect(store.dispatch).toHaveBeenCalledWith(activateEvent('event1'));
    expect(store.dispatch).toHaveBeenCalledWith(pauseTime());
  });

  test('should apply event effects', () => {
    // Setup event with effects
    const event = {
      id: 'event1',
      type: EventType.RANDOM,
      trigger: {
        type: TriggerType.RANDOM,
        conditions: {
          chance: 1, // 100% chance to trigger
        },
      },
      effects: [
        {
          type: EffectType.MODIFY_RESOURCE,
          target: 'energy',
          value: 10,
        },
        {
          type: EffectType.MODIFY_RESOURCE,
          target: 'stress',
          value: -5,
        },
      ],
      choices: [],
    };

    store.getState.mockReturnValue({
      events: {
        activeEventId: null,
        queue: {
          active: [],
          pending: [event],
        },
      },
      resources: {
        energy: {
          current: 50,
          max: 100,
        },
        stress: {
          current: 30,
          max: 100,
        },
      },
    });

    middleware(processEvents());

    expect(next).toHaveBeenCalledWith(processEvents());
    expect(store.dispatch).toHaveBeenCalledWith(activateEvent('event1'));

    // Verify effects were applied through updateEnergy and updateStress actions
    const energyAction = store.actions.find((a) => a.type === updateEnergy.type);
    const stressAction = store.actions.find((a) => a.type === updateStress.type);

    expect(energyAction).toBeDefined();
    expect(energyAction.payload.current).toBe(60); // 50 + 10

    expect(stressAction).toBeDefined();
    expect(stressAction.payload.current).toBe(25); // 30 - 5
  });

  test('should not activate events that do not meet conditions', () => {
    // Setup pending event with trigger conditions that will not pass
    const pendingEvent = {
      id: 'event1',
      type: EventType.TIME,
      trigger: {
        type: TriggerType.TIME,
        conditions: {
          time: 12,
          dayOfWeek: 1,
        },
      },
    };

    store.getState.mockReturnValue({
      events: {
        activeEventId: null,
        queue: {
          active: [],
          pending: [pendingEvent],
        },
      },
      time: {
        gameTime: {
          hour: 14, // Different hour
          dayOfWeek: 1,
        },
      },
    });

    middleware(processEvents());

    expect(next).toHaveBeenCalledWith(processEvents());
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
