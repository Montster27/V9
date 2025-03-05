/**
 * /src/__tests__/integration/redux/eventSlice.test.ts
 *
 * Integration tests for the events Redux slice
 */

import { configureStore } from '@reduxjs/toolkit';
import eventsReducer, {
  initializeEvents,
  addEvent,
  addEvents,
  activateEvent,
  resolveEvent,
  advanceNarrativeArc,
  unlockEvent,
  updateCharacterKnowledge,
  processEvents,
  clearEvents,
  selectEventQueue,
  selectPendingEvents,
  selectActiveEvents,
  selectResolvedEvents,
  selectActiveEventId,
  selectActiveEvent,
  selectNarrativeArcs,
  selectIsEventsInitialized,
} from '../../../infrastructure/state/slices/eventSlice';
import { GameEvent, EventType, TriggerType } from '../../../domain/models';

describe('eventSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        events: eventsReducer,
      },
    });
  });

  // Sample event for testing
  const sampleEvent: GameEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    type: EventType.TIME,
    trigger: {
      type: TriggerType.TIME,
      conditions: {},
    },
    conditions: [],
    effects: [
      {
        type: 'MODIFY_RESOURCE',
        target: 'energy',
        value: 10,
      },
    ],
  };

  describe('reducers', () => {
    it('should handle initializeEvents', () => {
      store.dispatch(initializeEvents());

      const state = store.getState().events;
      expect(state.initialized).toBe(true);
    });

    it('should handle addEvent', () => {
      store.dispatch(addEvent(sampleEvent));

      const state = store.getState().events;
      expect(state.queue.pending.length).toBe(1);
      expect(state.queue.pending[0].id).toBe('event-1');
    });

    it('should handle addEvents', () => {
      const anotherEvent = { ...sampleEvent, id: 'event-2' };
      store.dispatch(addEvents([sampleEvent, anotherEvent]));

      const state = store.getState().events;
      expect(state.queue.pending.length).toBe(2);
      expect(state.queue.pending[0].id).toBe('event-1');
      expect(state.queue.pending[1].id).toBe('event-2');
    });

    it('should handle activateEvent', () => {
      // Add an event first
      store.dispatch(addEvent(sampleEvent));

      // Activate it
      store.dispatch(activateEvent('event-1'));

      const state = store.getState().events;
      expect(state.queue.pending.length).toBe(0);
      expect(state.queue.active.length).toBe(1);
      expect(state.queue.active[0].id).toBe('event-1');
      expect(state.activeEventId).toBe('event-1');
    });

    it('should handle resolveEvent', () => {
      // Add and activate an event
      store.dispatch(addEvent(sampleEvent));
      store.dispatch(activateEvent('event-1'));

      // Resolve it with a choice
      store.dispatch(resolveEvent({ eventId: 'event-1', choiceId: 'choice-1' }));

      const state = store.getState().events;
      expect(state.queue.active.length).toBe(0);
      expect(state.queue.resolved.length).toBe(1);
      expect(state.queue.resolved[0].id).toBe('event-1');
      expect(state.queue.resolved[0].resolvedWithChoice).toBe('choice-1');
      expect(state.activeEventId).toBeNull();
    });

    it('should handle advanceNarrativeArc', () => {
      store.dispatch(
        advanceNarrativeArc({
          arcId: 'tech-monopoly',
          level: 3,
          clues: ['clue-1', 'clue-2'],
        })
      );

      const state = store.getState().events;
      expect(state.queue.narrativeArcs['tech-monopoly']).toBeDefined();
      expect(state.queue.narrativeArcs['tech-monopoly'].currentLevel).toBe(3);
      expect(state.queue.narrativeArcs['tech-monopoly'].discoveredClues).toContain('clue-1');
      expect(state.queue.narrativeArcs['tech-monopoly'].discoveredClues).toContain('clue-2');
    });

    it('should handle unlockEvent', () => {
      // Set up a narrative arc first
      store.dispatch(
        advanceNarrativeArc({
          arcId: 'tech-monopoly',
          level: 1,
          clues: [],
        })
      );

      // Unlock an event
      store.dispatch(
        unlockEvent({
          arcId: 'tech-monopoly',
          eventId: 'monopoly-event-1',
        })
      );

      const state = store.getState().events;
      expect(state.queue.narrativeArcs['tech-monopoly'].unlockedEvents).toContain(
        'monopoly-event-1'
      );
    });

    it('should handle updateCharacterKnowledge', () => {
      // Set up a narrative arc first
      store.dispatch(
        advanceNarrativeArc({
          arcId: 'tech-monopoly',
          level: 1,
          clues: [],
        })
      );

      // Update character knowledge
      store.dispatch(
        updateCharacterKnowledge({
          arcId: 'tech-monopoly',
          characterId: 'professor-smith',
          knows: true,
        })
      );

      const state = store.getState().events;
      expect(state.queue.narrativeArcs['tech-monopoly'].characterKnowledge['professor-smith']).toBe(
        true
      );
    });

    it('should handle processEvents', () => {
      const initialState = store.getState().events;
      store.dispatch(processEvents());

      const newState = store.getState().events;
      expect(newState.lastProcessed).toBeGreaterThan(initialState.lastProcessed);
    });

    it('should handle clearEvents', () => {
      // Add some events first
      store.dispatch(addEvents([sampleEvent, { ...sampleEvent, id: 'event-2' }]));

      // Clear events
      store.dispatch(clearEvents());

      const state = store.getState().events;
      expect(state.queue.pending.length).toBe(0);
      expect(state.queue.active.length).toBe(0);
      expect(state.queue.resolved.length).toBe(0);
      expect(state.activeEventId).toBeNull();
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      // Add some test data
      store.dispatch(addEvent(sampleEvent));
      store.dispatch(activateEvent('event-1'));
      store.dispatch(
        advanceNarrativeArc({
          arcId: 'tech-monopoly',
          level: 2,
          clues: ['clue-1'],
        })
      );
    });

    it('should select event queue', () => {
      const state = { events: store.getState().events };
      const queue = selectEventQueue(state);

      expect(queue).toBe(state.events.queue);
    });

    it('should select pending events', () => {
      const state = { events: store.getState().events };
      const pendingEvents = selectPendingEvents(state);

      expect(pendingEvents).toBe(state.events.queue.pending);
      expect(pendingEvents.length).toBe(0); // We moved it to active
    });

    it('should select active events', () => {
      const state = { events: store.getState().events };
      const activeEvents = selectActiveEvents(state);

      expect(activeEvents).toBe(state.events.queue.active);
      expect(activeEvents.length).toBe(1);
      expect(activeEvents[0].id).toBe('event-1');
    });

    it('should select active event ID', () => {
      const state = { events: store.getState().events };
      const activeEventId = selectActiveEventId(state);

      expect(activeEventId).toBe('event-1');
    });

    it('should select active event', () => {
      const state = { events: store.getState().events };
      const activeEvent = selectActiveEvent(state);

      expect(activeEvent).toBeDefined();
      expect(activeEvent?.id).toBe('event-1');
    });

    it('should select narrative arcs', () => {
      const state = { events: store.getState().events };
      const narrativeArcs = selectNarrativeArcs(state);

      expect(narrativeArcs).toBe(state.events.queue.narrativeArcs);
      expect(narrativeArcs['tech-monopoly']).toBeDefined();
      expect(narrativeArcs['tech-monopoly'].currentLevel).toBe(2);
    });

    it('should select initialization status', () => {
      // Initialize events
      store.dispatch(initializeEvents());

      const state = { events: store.getState().events };
      const isInitialized = selectIsEventsInitialized(state);

      expect(isInitialized).toBe(true);
    });
  });
});
