/**
 * /src/infrastructure/state/middleware/simulation/simulationMiddleware.ts
 *
 * Redux middleware for connecting to the game simulation service
 * Handles synchronization between Redux state and game simulation
 */

import { Middleware, AnyAction } from 'redux';
import { RootState } from '../../store';
import { GameSimulationService, SimulationUpdate } from '../../../../domain/services/simulation';

import { updateResources } from '../../slices/resourcesSlice';

import { tick, pauseTime, resumeTime, togglePause } from '../../slices/timeSlice';

import {
  addEvents,
  activateEvent,
  resolveEvent,
  ResolveEventPayload,
} from '../../slices/eventSlice';

import { updateTimeAllocation } from '../../slices/useOfTimeSlice';

import {
  discoverClue,
  advanceArc,
  DiscoverCluePayload,
  AdvanceArcPayload,
} from '../../slices/narrativeSlice';

/**
 * Type guard for checking if action is a specific action creator's action
 */
function isActionOf<T>(action: AnyAction, actionCreator: { type: string }): action is T {
  return action.type === actionCreator.type;
}

/**
 * Middleware options for simulation
 */
interface SimulationMiddlewareOptions {
  simulationService: GameSimulationService;
}

/**
 * Create middleware for game simulation
 * @param options Middleware options
 * @returns Redux middleware
 */
export const createSimulationMiddleware = (
  options: SimulationMiddlewareOptions
): Middleware<{}, RootState> => {
  const { simulationService } = options;

  return (store) => {
    // Subscribe to simulation updates
    // Make sure subscription is properly initialized
    console.log('Setting up simulation subscription');
    simulationService.subscribe((update: SimulationUpdate) => {
      console.log(
        'Received simulation update:',
        'resources:',
        update.resourceUpdate ? 'present' : 'null',
        'events:',
        update.newEvents.length,
        'time update:',
        update.timeUpdate.isPaused ? 'paused' : 'running'
      );
      // Dispatch resource updates to Redux
      if (update.resourceUpdate) {
        store.dispatch(updateResources(update.resourceUpdate));
        console.log('Dispatched resource update:', JSON.stringify(update.resourceUpdate));
      }

      // Dispatch time updates
      store.dispatch(tick(Date.now()));

      // Handle new events if any
      if (update.newEvents && update.newEvents.length > 0) {
        store.dispatch(addEvents(update.newEvents));

        // Activate the first event with choices
        const eventWithChoices = update.newEvents.find((e) => e.choices && e.choices.length > 0);
        if (eventWithChoices) {
          store.dispatch(activateEvent(eventWithChoices.id));

          // Pause time if not already paused
          if (!update.timeUpdate.isPaused) {
            store.dispatch(pauseTime());
          }
        }
      }
    });

    return (next) => (action: AnyAction) => {
      // Process the action first
      const result = next(action);

      // Get current state
      const state = store.getState();

      // Sync state with simulation service
      // Time actions
      if (isActionOf(action, tick)) {
        // Handle time tick - no additional action needed since action already processed
      } else if (isActionOf(action, pauseTime)) {
        simulationService.pauseTime();
      } else if (isActionOf(action, resumeTime)) {
        simulationService.resumeTime();
      } else if (isActionOf(action, togglePause)) {
        simulationService.togglePause();
      }
      // Resource actions
      else if (isActionOf(action, updateResources)) {
        // Update simulation resources
        simulationService.setResources(state.resources);
      }
      // Use_of_Time actions
      else if (isActionOf(action, updateTimeAllocation)) {
        // Update simulation time allocation
        if (state.useOfTime.managerState.currentAllocation) {
          simulationService.setTimeAllocation(state.useOfTime.managerState.currentAllocation);
        }
      }
      // Event actions
      else if (isActionOf(action, addEvents)) {
        // Update simulation active events
        const currentEvents = simulationService.getActiveEvents();
        const newEvents = Array.isArray(action.payload) ? action.payload : [action.payload];

        simulationService.setActiveEvents([...currentEvents, ...newEvents]);
      } else if (isActionOf<AnyAction & { payload: ResolveEventPayload }>(action, resolveEvent)) {
        // Process event choice in simulation
        const { eventId, choiceId } = action.payload;
        if (eventId && choiceId) {
          simulationService.processEventChoice(eventId, choiceId);
        }
      }
      // Narrative actions
      else if (isActionOf<AnyAction & { payload: DiscoverCluePayload }>(action, discoverClue)) {
        // Update simulation clues
        const { clueId } = action.payload;
        if (clueId) {
          const currentClues = simulationService.getDiscoveredClues();
          if (!currentClues.includes(clueId)) {
            simulationService.setDiscoveredClues([...currentClues, clueId]);
          }
        }
      } else if (isActionOf<AnyAction & { payload: AdvanceArcPayload }>(action, advanceArc)) {
        // Update simulation narrative progress
        const { arcId, level } = action.payload;
        if (arcId && typeof level === 'number') {
          const currentProgress = simulationService.getNarrativeProgress();
          simulationService.setNarrativeProgress({
            ...currentProgress,
            [arcId]: level,
          });
        }
      }

      return result;
    };
  };
};

/**
 * Create bidirectional sync between Redux and simulation service
 * @param store Redux store
 * @param simulationService Game simulation service
 * @returns Cleanup function
 */
export const setupSimulationSync = (
  store: any,
  simulationService: GameSimulationService
): (() => void) => {
  // Ensure store has valid getState method
  if (!store || typeof store.getState !== 'function') {
    console.error('Invalid Redux store provided to setupSimulationSync');
    return () => {};
  }
  console.log('Setting up simulation sync');

  // Safely initialize simulation with current state
  let state;
  try {
    state = store.getState();
    console.log(
      'Current state for simulation initialization:',
      'resources:',
      state.resources ? 'present' : 'missing',
      'useOfTime:',
      state.useOfTime ? 'present' : 'missing',
      'events:',
      state.events ? 'present' : 'missing',
      'narrative:',
      state.narrative ? 'present' : 'missing'
    );
  } catch (error) {
    console.error('Error getting state from store:', error);
    return () => {};
  }

  if (state.resources) {
    simulationService.setResources(state.resources);
    console.log('Initialized simulation with resources:', JSON.stringify(state.resources));
  }

  if (state.useOfTime.managerState.currentAllocation) {
    simulationService.setTimeAllocation(state.useOfTime.managerState.currentAllocation);
    console.log('Initialized simulation with time allocation');
  }

  if (state.events.queue.active) {
    simulationService.setActiveEvents(state.events.queue.active);
    console.log('Initialized simulation with active events');
  }

  if (state.narrative && state.narrative.discoveredClues) {
    simulationService.setDiscoveredClues(state.narrative.discoveredClues);
    console.log('Initialized simulation with discovered clues');
  }

  // Subscribe to simulation updates to dispatch Redux actions
  const unsubscribe = simulationService.subscribe((update: SimulationUpdate) => {
    // Dispatch time update
    store.dispatch(tick(Date.now()));

    // Dispatch resource update if available
    if (update.resourceUpdate) {
      store.dispatch(updateResources(update.resourceUpdate));
      console.log('Dispatched resource update from sync:', JSON.stringify(update.resourceUpdate));
    }

    // Dispatch new events if available
    if (update.newEvents.length > 0) {
      store.dispatch(addEvents(update.newEvents));
      console.log('Dispatched new events from sync:', update.newEvents.length);

      // Activate the first event with choices
      const eventWithChoices = update.newEvents.find((e) => e.choices && e.choices.length > 0);
      if (eventWithChoices) {
        store.dispatch(activateEvent(eventWithChoices.id));

        // Pause time if not already paused
        if (!update.timeUpdate.isPaused) {
          store.dispatch(pauseTime());
        }
      }
    }
  });

  console.log('Simulation sync setup complete');

  // Return cleanup function
  return unsubscribe;
};

export default createSimulationMiddleware;
