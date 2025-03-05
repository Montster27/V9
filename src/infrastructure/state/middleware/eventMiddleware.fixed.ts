/**
 * /src/infrastructure/state/middleware/eventMiddleware.ts
 *
 * Redux middleware for processing game events
 * Handles event triggers, conditions, and effects
 */

import { Middleware, AnyAction } from 'redux';
import { RootState } from '../store';
import {
  activateEvent,
  processEvents,
  selectPendingEvents,
  selectActiveEvents,
  selectActiveEventId,
  resolveEvent,
  ResolveEventPayload,
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
  ConditionOperation,
  isTimeEvent,
  isStateEvent,
  isRandomEvent,
  isMysteryEvent,
  isConspiracyEvent,
  isNarrativeEvent,
} from '../../../domain/models/Event';

// Import validators and helpers
import {
  validateGameEvent,
  validateEventTrigger,
  validateEventEffect,
  createValidEventTrigger,
  createValidEventEffect,
} from '../../../domain/utils/validationHelpers';

import {
  isValidTriggerType,
  isValidEffectType,
  isValidConditionOperation,
  toTriggerType,
  toEffectType,
  toConditionOperation,
} from '../../../domain/utils/enumHelpers';

/**
 * Type guard to check if an action matches a specific type
 * @param action The action to check
 * @param actionCreator The action creator object with a type property
 * @returns True if the action matches the type
 */
function isActionOf<T extends AnyAction>(
  action: AnyAction,
  actionCreator: { type: string }
): action is T {
  return action.type === actionCreator.type;
}

/**
 * Create middleware for event processing
 * @returns Redux middleware for event processing
 */
export const createEventMiddleware = (): Middleware<{}, RootState> => {
  return (store) => (next) => (action: AnyAction) => {
    // Process the action first
    const result = next(action);

    // Process events when event processing is triggered
    if (isActionOf<AnyAction>(action, processEvents)) {
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
        // Validate the event first
        const validation = validateGameEvent(event);
        if (!validation.isValid) {
          console.warn(`Skipping invalid event (${event.id}):`, validation.errors);
          continue;
        }

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
    } else if (isActionOf<AnyAction & { payload: ResolveEventPayload }>(action, resolveEvent)) {
      // Handle event resolution
      const { eventId, choiceId } = action.payload;

      if (eventId) {
        // Process choice effects if a choice was made
        if (choiceId) {
          const state = store.getState();
          const activeEvents = selectActiveEvents(state);
          const event = activeEvents.find((e) => e.id === eventId);

          if (event && event.choices) {
            const choice = event.choices.find((c) => c.id === choiceId);

            if (choice && choice.effects) {
              applyEventEffects(choice.effects, store);
            }
          }
        }

        // Resume time if there are no more active events
        const state = store.getState();
        const activeEvents = selectActiveEvents(state);

        if (activeEvents.length <= 1) {
          // <= 1 because we haven't removed the current one yet
          store.dispatch(resumeTime());
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
  if (!event.trigger || !isValidTriggerType(event.trigger.type)) {
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

    // Convert operation string to enum safely
    const conditionOp = toConditionOperation(operation);
    if (!conditionOp) {
      console.warn(`Invalid condition operation: ${operation}`);
      return false;
    }

    if (!checkConditionOperation(resourceValue, threshold, conditionOp)) {
      return false;
    }
  }

  // Check stress conditions
  if (trigger.conditions.stress) {
    const { threshold, operation } = trigger.conditions.stress;
    const stressValue = state.resources.stress.current;

    // Convert operation string to enum safely
    const conditionOp = toConditionOperation(operation);
    if (!conditionOp) {
      console.warn(`Invalid condition operation: ${operation}`);
      return false;
    }

    if (!checkConditionOperation(stressValue, threshold, conditionOp)) {
      return false;
    }
  }

  // Check energy conditions
  if (trigger.conditions.energy) {
    const { threshold, operation } = trigger.conditions.energy;
    const energyValue = state.resources.energy.current;

    // Convert operation string to enum safely
    const conditionOp = toConditionOperation(operation);
    if (!conditionOp) {
      console.warn(`Invalid condition operation: ${operation}`);
      return false;
    }

    if (!checkConditionOperation(energyValue, threshold, conditionOp)) {
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
function checkConditionOperation(
  value: number,
  threshold: number,
  operation: ConditionOperation
): boolean {
  switch (operation) {
    case ConditionOperation.EQUAL:
      return value === threshold;
    case ConditionOperation.NOT_EQUAL:
      return value !== threshold;
    case ConditionOperation.GREATER_THAN:
      return value > threshold;
    case ConditionOperation.LESS_THAN:
      return value < threshold;
    case ConditionOperation.GREATER_THAN_OR_EQUAL:
      return value >= threshold;
    case ConditionOperation.LESS_THAN_OR_EQUAL:
      return value <= threshold;
    case ConditionOperation.CONTAINS:
      // Not applicable for numerical values
      return false;
    case ConditionOperation.NOT_CONTAINS:
      // Not applicable for numerical values
      return false;
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
    // Validate the effect
    const validation = validateEventEffect(effect);
    if (!validation.isValid) {
      console.warn('Skipping invalid effect:', validation.errors);
      continue;
    }

    // Ensure we have a valid effect type
    if (!isValidEffectType(effect.type)) {
      console.warn(`Invalid effect type: ${effect.type}`);
      continue;
    }

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
