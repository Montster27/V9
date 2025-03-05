/**
 * /src/infrastructure/state/thunks/eventThunks.ts
 *
 * Redux thunks for complex event operations
 * Handles event processing, choice resolution, and narrative advancement
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../store';
import {
  addEvent,
  activateEvent,
  resolveEvent,
  processEvents,
  advanceNarrativeArc,
} from '../slices/eventSlice';
import { pauseTime, resumeTime } from '../slices/timeSlice';
import { updateResources, updateEnergy, updateStress } from '../slices/resourcesSlice';
import { GameEvent, EventChoice } from '../../../domain/models';

/**
 * Process all pending events based on current game state
 */
export const processGameEvents = createAsyncThunk(
  'events/processGameEvents',
  async (_, { getState, dispatch }) => {
    try {
      // Process events - the actual event checking logic is in the middleware
      dispatch(processEvents());

      return true;
    } catch (error) {
      console.error('Error processing game events:', error);
      throw error;
    }
  }
);

/**
 * Resolve an event with the chosen option
 */
export const resolveGameEvent = createAsyncThunk(
  'events/resolveGameEvent',
  async (payload: { eventId: string; choiceId: string }, { getState, dispatch }) => {
    try {
      const { eventId, choiceId } = payload;
      const state = getState() as RootState;

      // Find the event and choice
      const event = state.events.queue.active.find((e) => e.id === eventId);

      if (!event) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // Find the selected choice
      const choice = event.choices?.find((c) => c.id === choiceId);

      if (!choice) {
        throw new Error(`Choice not found: ${choiceId}`);
      }

      // Apply choice effects
      await applyChoiceEffects(choice, dispatch, state);

      // Resolve the event
      dispatch(resolveEvent({ eventId, choiceId }));

      // Resume game time if it was paused
      if (state.time.managerState.isPaused) {
        dispatch(resumeTime());
      }

      return true;
    } catch (error) {
      console.error('Error resolving game event:', error);
      throw error;
    }
  }
);

/**
 * Add a new event to the game
 */
export const createGameEvent = createAsyncThunk(
  'events/createGameEvent',
  async (eventData: Partial<GameEvent>, { dispatch }) => {
    try {
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

      // Add event to queue
      dispatch(addEvent(newEvent));

      return newEvent;
    } catch (error) {
      console.error('Error creating game event:', error);
      throw error;
    }
  }
);

/**
 * Discover a clue and advance narrative arc
 */
export const discoverClue = createAsyncThunk(
  'events/discoverClue',
  async (
    payload: { arcId: string; clueId: string; clueContent: string },
    { getState, dispatch }
  ) => {
    try {
      const { arcId, clueId, clueContent } = payload;
      const state = getState() as RootState;

      // Get current arc progress
      const arc = state.events.queue.narrativeArcs[arcId] || {
        arcId,
        currentLevel: 0,
        discoveredClues: [],
        unlockedEvents: [],
        characterKnowledge: {},
      };

      // Check if already discovered
      if (arc.discoveredClues.includes(clueId)) {
        return { alreadyDiscovered: true, arcId, clueId };
      }

      // Add to discovered clues
      const updatedClues = [...arc.discoveredClues, clueId];

      // Determine if this should advance the arc level
      // This is a simple implementation - a real one would be more complex
      const newLevel = Math.min(10, arc.currentLevel + 1);

      // Update arc progress
      dispatch(
        advanceNarrativeArc({
          arcId,
          level: newLevel,
          clues: updatedClues,
        })
      );

      // Check if this unlocks any events
      // In a real implementation, this would check event conditions

      return {
        arcId,
        clueId,
        newLevel,
        totalClues: updatedClues.length,
      };
    } catch (error) {
      console.error('Error discovering clue:', error);
      throw error;
    }
  }
);

/**
 * Apply effects from a chosen event option
 * @param choice The selected choice
 * @param dispatch Redux dispatch function
 * @param state Current Redux state
 */
async function applyChoiceEffects(
  choice: EventChoice,
  dispatch: any,
  state: RootState
): Promise<void> {
  // Apply all effects from the choice
  if (choice.effects && choice.effects.length > 0) {
    for (const effect of choice.effects) {
      switch (effect.type) {
        case 'MODIFY_RESOURCE':
          // Apply resource modifications
          if (effect.target === 'energy') {
            const newEnergy = Math.max(
              0,
              Math.min(state.resources.energy.max, state.resources.energy.current + effect.value)
            );
            dispatch(updateEnergy({ current: newEnergy }));
          } else if (effect.target === 'stress') {
            const newStress = Math.max(
              0,
              Math.min(state.resources.stress.max, state.resources.stress.current + effect.value)
            );
            dispatch(updateStress({ current: newStress }));
          }
          // Add other resources as needed
          break;

        case 'TRIGGER_EVENT':
          // Trigger another event
          if (effect.eventId) {
            dispatch(activateEvent(effect.eventId));
          }
          break;

        case 'ADVANCE_NARRATIVE':
          // Advance narrative arc
          if (effect.arcId) {
            dispatch(
              advanceNarrativeArc({
                arcId: effect.arcId,
                level: effect.level || 1,
                clues: effect.clues || [],
              })
            );
          }
          break;

        // Add more effect handlers as needed

        default:
          console.warn(`Unhandled effect type: ${effect.type}`);
      }
    }
  }
}
