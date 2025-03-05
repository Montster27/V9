/**
 * /src/application/hooks/useEventSimulation.ts
 *
 * Hook for using event simulation services in React components
 */

import { useCallback } from 'react';
import { useSimulation } from '../providers/SimulationProvider';
import { useAppDispatch, useAppSelector } from '../../infrastructure/state/store';
import {
  selectActiveEvents,
  selectActiveEventId,
  selectPendingEvents,
  activateEvent,
  resolveEvent,
  processEvents,
} from '../../infrastructure/state/slices/eventSlice';
import { GameEvent, EventChoice } from '../../domain/models';

/**
 * Hook for event simulation
 * @returns Event simulation controls and state
 */
export const useEventSimulation = () => {
  const { eventService, simulationService, isRunning } = useSimulation();
  const dispatch = useAppDispatch();

  // Select events from Redux
  const activeEvents = useAppSelector(selectActiveEvents);
  const activeEventId = useAppSelector(selectActiveEventId);
  const pendingEvents = useAppSelector(selectPendingEvents);

  // Get active event
  const activeEvent = activeEventId ? activeEvents.find((e) => e.id === activeEventId) : null;

  // Trigger processing of events
  const checkForEvents = useCallback(() => {
    dispatch(processEvents());
  }, [dispatch]);

  // Create a new event
  const createEvent = useCallback(
    (eventData: Partial<GameEvent>): string => {
      // Generate ID if not provided
      const eventId = eventData.id || `event_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Create complete event
      const newEvent: GameEvent = {
        id: eventId,
        title: eventData.title || 'Untitled Event',
        description: eventData.description || '',
        trigger: eventData.trigger || { type: 'manual' },
        conditions: eventData.conditions || [],
        effects: eventData.effects || [],
        choices: eventData.choices || [],
        timeLimit: eventData.timeLimit,
        // Add other properties as needed
      } as GameEvent;

      // Add to simulation
      simulationService.setActiveEvents([...simulationService.getActiveEvents(), newEvent]);

      return eventId;
    },
    [simulationService]
  );

  // Activate a specific event
  const activateSpecificEvent = useCallback(
    (eventId: string) => {
      dispatch(activateEvent(eventId));
    },
    [dispatch]
  );

  // Make a choice for the current active event
  const makeChoice = useCallback(
    (choiceId: string): boolean => {
      if (!activeEvent || !activeEventId) {
        return false;
      }

      // Process choice in simulation
      const success = simulationService.processEventChoice(activeEventId, choiceId);

      // Update Redux
      if (success) {
        dispatch(
          resolveEvent({
            eventId: activeEventId,
            choiceId,
          })
        );
      }

      return success;
    },
    [activeEvent, activeEventId, simulationService, dispatch]
  );

  // Get choices for the active event
  const getChoices = useCallback((): EventChoice[] => {
    return activeEvent?.choices || [];
  }, [activeEvent]);

  // Check if there's an active event
  const hasActiveEvent = useCallback((): boolean => {
    return activeEvent !== null;
  }, [activeEvent]);

  return {
    activeEvent,
    activeEvents,
    pendingEvents,
    checkForEvents,
    createEvent,
    activateEvent: activateSpecificEvent,
    makeChoice,
    getChoices,
    hasActiveEvent,
    isRunning,
  };
};

export default useEventSimulation;
