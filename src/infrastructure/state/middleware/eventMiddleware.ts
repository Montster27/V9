/**
 * /src/infrastructure/state/middleware/eventMiddleware.ts
 *
 * Redux middleware for processing game events
 * Handles event triggers, conditions, and effects
 */

import { Middleware } from 'redux';
import { RootState } from '../store';
import {
  activateEvent,
  processEvents,
  selectPendingEvents,
  selectActiveEvents,
  selectActiveEventId,
} from '../slices/eventSlice';

// Import actions that events can trigger
import { updateResources, updateEnergy, updateStress } from '../slices/resourcesSlice';

import { pauseTime, resumeTime } from '../slices/timeSlice';

// Import domain models and types
import {
  GameEvent,
  EventTrigger,
  EventEffect,
  TriggerType,
  EffectType,
  isTimeEvent,
  isStateEvent,
  isRandomEvent,
  isMysteryEvent,
  isConspiracyEvent,
  isNarrativeEvent,
} from '../../../domain/models/Event';

/**
 * Create middleware for event processing
 * @returns Redux middleware for event processing
 */
export const createEventMiddleware = (): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    // Process the action first
    const result = next(action);

    // Process events when event processing is triggered
    if (action.type === processEvents.type) {
      // Get current state
      const state = store.getState();

      // Get pending events from state
      const pendingEvents = selectPendingEvents(state);
      const activeEvents = selectActiveEvents(state);
      const activeEventId = selectActiveEventId(state);

      // Pause game if we have an active event already
      if (activeEventId && activeEvents.length > 0) {
        store.dispatch(pauseTime());
        return result;
      }

      // Check all pending events for trigger conditions
      for (const event of pendingEvents) {
        const shouldTrigger = checkEventTriggerConditions(event, state);

        if (shouldTrigger) {
          // Activate the event (moves from pending to active)
          store.dispatch(activateEvent(event.id));

          // Apply immediate effects if any
          if (event.effects && event.effects.length > 0) {
            applyEventEffects(event.effects, store);
          }

          // Pause game if event has choices
          if (event.choices && event.choices.length > 0) {
            store.dispatch(pauseTime());
          }

          // Only process one event at a time
          break;
        }
      }
    }

    return result;
  };
};

/**
 * Check if event trigger conditions are met
 * @param event The event to check
 * @param state Current redux state
 * @returns True if event should trigger
 */
function checkEventTriggerConditions(event: GameEvent, state: RootState): boolean {
  if (!event.trigger) {
    return false;
  }

  // Handle different trigger types
  switch (event.trigger.type) {
    case TriggerType.TIME:
      return isTimeEvent(event) && checkTimeBasedTrigger(event.trigger, state);

    case TriggerType.STATE:
      return isStateEvent(event) && checkStateBasedTrigger(event.trigger, state);

    case TriggerType.RANDOM:
      return isRandomEvent(event) && checkRandomTrigger(event.trigger);

    case TriggerType.MYSTERY:
      return isMysteryEvent(event) && checkNarrativeTrigger(event.trigger, state);

    case TriggerType.CONSPIRACY:
      return isConspiracyEvent(event) && checkNarrativeTrigger(event.trigger, state);

    case TriggerType.NARRATIVE:
      return isNarrativeEvent(event) && checkNarrativeTrigger(event.trigger, state);

    default:
      return false;
  }
}

/**
 * Check time-based trigger conditions
 */
function checkTimeBasedTrigger(trigger: EventTrigger, state: RootState): boolean {
  if (trigger.type !== TriggerType.TIME || !trigger.conditions) {
    return false;
  }

  const time = state.time.gameTime;

  // Check time conditions
  if (trigger.conditions.time !== undefined && trigger.conditions.time !== time.hour) {
    return false;
  }

  // Check day of week
  if (
    trigger.conditions.dayOfWeek !== undefined &&
    trigger.conditions.dayOfWeek !== time.dayOfWeek
  ) {
    return false;
  }

  return true;
}

/**
 * Check state-based trigger conditions
 */
function checkStateBasedTrigger(trigger: EventTrigger, state: RootState): boolean {
  if (trigger.type !== TriggerType.STATE || !trigger.conditions) {
    return false;
  }

  // Check resource conditions
  if (trigger.conditions.resource) {
    const { type, threshold, operation } = trigger.conditions.resource;
    const resourceValue = getResourceValue(type, state);

    if (!checkConditionOperation(resourceValue, threshold, operation)) {
      return false;
    }
  }

  // Check stress conditions
  if (trigger.conditions.stress) {
    const { threshold, operation } = trigger.conditions.stress;
    const stressValue = state.resources.stress.current;

    if (!checkConditionOperation(stressValue, threshold, operation)) {
      return false;
    }
  }

  // Check energy conditions
  if (trigger.conditions.energy) {
    const { threshold, operation } = trigger.conditions.energy;
    const energyValue = state.resources.energy.current;

    if (!checkConditionOperation(energyValue, threshold, operation)) {
      return false;
    }
  }

  return true;
}

/**
 * Get resource value from state
 */
function getResourceValue(resourceType: string, state: RootState): number {
  const resources = state.resources;

  switch (resourceType) {
    case 'energy':
      return resources.energy.current;
    case 'stress':
      return resources.stress.current;
    case 'health':
      return resources.health.current;
    case 'belonging':
      return resources.belonging.current;
    case 'knowledge':
      return resources.knowledge;
    case 'money':
      return resources.money;
    case 'social':
      return resources.social;
    case 'skillPoints':
      return resources.skillPoints.current;
    default:
      return 0;
  }
}

/**
 * Check condition with specified operation
 */
function checkConditionOperation(value: number, threshold: number, operation: string): boolean {
  switch (operation) {
    case 'equal':
      return value === threshold;
    case 'not_equal':
      return value !== threshold;
    case 'greater_than':
      return value > threshold;
    case 'less_than':
      return value < threshold;
    case 'greater_than_or_equal':
      return value >= threshold;
    case 'less_than_or_equal':
      return value <= threshold;
    default:
      return false;
  }
}

/**
 * Check random trigger conditions
 */
function checkRandomTrigger(trigger: EventTrigger): boolean {
  if (trigger.type !== TriggerType.RANDOM || !trigger.conditions) {
    return false;
  }

  // Simple random chance check
  const chance = trigger.conditions.chance;
  if (typeof chance === 'number') {
    return Math.random() < chance;
  }

  return false;
}

/**
 * Check narrative-based trigger conditions
 */
function checkNarrativeTrigger(trigger: EventTrigger, state: RootState): boolean {
  if (!trigger.conditions) {
    return false;
  }

  // Implementation would check narrative progress, clues, etc.
  // For now, return false as placeholder
  return false;
}

/**
 * Apply event effects to the game state
 * @param effects Array of event effects to apply
 * @param store Redux store
 */
function applyEventEffects(effects: EventEffect[], store: any): void {
  for (const effect of effects) {
    switch (effect.type) {
      case EffectType.MODIFY_RESOURCE:
        // Handle resource modification
        if (effect.target === 'energy') {
          const currentEnergy = store.getState().resources.energy.current;
          store.dispatch(
            updateEnergy({
              current: currentEnergy + Number(effect.value),
            })
          );
        } else if (effect.target === 'stress') {
          const currentStress = store.getState().resources.stress.current;
          store.dispatch(
            updateStress({
              current: currentStress + Number(effect.value),
            })
          );
        }
        // Add other resources as needed
        break;

      case EffectType.TRIGGER_EVENT:
        // Trigger another event
        if (typeof effect.value === 'string') {
          store.dispatch(activateEvent(effect.value));
        }
        break;

      // Add other effect types as needed

      default:
        console.warn(`Unhandled event effect type: ${effect.type}`);
        break;
    }
  }
}

export default createEventMiddleware;
