/**
 * /src/domain/utils/typeSafeUpdates/index.ts
 *
 * Type-safe immutable update utilities
 *
 * These utilities help handle updates to readonly properties in TypeScript
 * by creating new objects with updated values rather than attempting to
 * modify readonly properties directly.
 */

import { ResourcesState, ResourceValue, SkillPointsValue } from '../../models/Resource';
import { EventQueue, GameEvent, NarrativeProgress } from '../../models/Event';
import { WeeklyTimeAllocation, TimeAllocation, ActivityType } from '../../models/UseOfTime';

/**
 * Create a new ResourceValue with updated properties
 * @param resource Original resource value
 * @param updates Properties to update
 * @returns New ResourceValue with updates applied
 */
export function updateResourceValue(
  resource: ResourceValue,
  updates: Partial<ResourceValue>
): ResourceValue {
  // Create a new object with the original values
  const result: ResourceValue = {
    current: resource.current,
    max: resource.max,
    trend: resource.trend,
    rate: resource.rate,
  };

  // Apply updates
  if (updates.current !== undefined) {
    result.current = Math.min(Math.max(0, updates.current), result.max);
  }

  if (updates.max !== undefined) {
    result.max = updates.max;
    // Also bound current to the new max if needed
    if (result.current > result.max) {
      result.current = result.max;
    }
  }

  if (updates.trend !== undefined) {
    result.trend = updates.trend;
  }

  if (updates.rate !== undefined) {
    result.rate = updates.rate;
  }

  return result;
}

/**
 * Create a new SkillPointsValue with updated properties
 * @param skillPoints Original skill points value
 * @param updates Properties to update
 * @returns New SkillPointsValue with updates applied
 */
export function updateSkillPointsValue(
  skillPoints: SkillPointsValue,
  updates: Partial<SkillPointsValue>
): SkillPointsValue {
  // Create a new object with the original values
  const result: SkillPointsValue = {
    current: skillPoints.current,
    generated: skillPoints.generated,
    spent: skillPoints.spent,
    trend: skillPoints.trend,
  };

  // Apply updates
  if (updates.current !== undefined) {
    result.current = Math.max(0, updates.current);
  }

  if (updates.generated !== undefined) {
    result.generated = Math.max(0, updates.generated);
  }

  if (updates.spent !== undefined) {
    result.spent = Math.max(0, updates.spent);
  }

  if (updates.trend !== undefined) {
    result.trend = updates.trend;
  }

  return result;
}

/**
 * Add skill points (positive for gaining, negative for spending)
 * @param skillPoints Original skill points value
 * @param amount Amount to add (or subtract if negative)
 * @returns New SkillPointsValue with updated values
 */
export function addSkillPoints(skillPoints: SkillPointsValue, amount: number): SkillPointsValue {
  const result: SkillPointsValue = {
    current: skillPoints.current,
    generated: skillPoints.generated,
    spent: skillPoints.spent,
    trend: skillPoints.trend,
  };

  if (amount >= 0) {
    // Adding points
    result.current += amount;
    result.generated += amount;
  } else {
    // Spending points (amount is negative)
    const absAmount = Math.abs(amount);
    const actualSpent = Math.min(result.current, absAmount);

    result.current -= actualSpent;
    result.spent += actualSpent;
  }

  return result;
}

/**
 * Update the ResourcesState immutably
 * @param state Original resources state
 * @param updates Partial updates to apply
 * @returns New ResourcesState with updates applied
 */
export function updateResourcesState(
  state: ResourcesState,
  updates: Partial<ResourcesState>
): ResourcesState {
  // Create a new object with the original values
  const result: ResourcesState = {
    energy: state.energy,
    stress: state.stress,
    health: state.health,
    belonging: state.belonging,
    knowledge: state.knowledge,
    money: state.money,
    social: state.social,
    skillPoints: state.skillPoints,
    lastUpdated: state.lastUpdated,
  };

  // Apply updates for complex objects
  if (updates.energy) {
    result.energy = updateResourceValue(result.energy, updates.energy);
  }

  if (updates.stress) {
    result.stress = updateResourceValue(result.stress, updates.stress);
  }

  if (updates.health) {
    result.health = updateResourceValue(result.health, updates.health);
  }

  if (updates.belonging) {
    result.belonging = updateResourceValue(result.belonging, updates.belonging);
  }

  if (updates.skillPoints) {
    result.skillPoints = updateSkillPointsValue(result.skillPoints, updates.skillPoints);
  }

  // Apply updates for primitive properties
  if (updates.knowledge !== undefined) {
    result.knowledge = Math.max(0, updates.knowledge);
  }

  if (updates.money !== undefined) {
    result.money = Math.max(0, updates.money);
  }

  if (updates.social !== undefined) {
    result.social = Math.max(0, updates.social);
  }

  // Always update the timestamp
  result.lastUpdated = updates.lastUpdated !== undefined ? updates.lastUpdated : Date.now();

  return result;
}

/**
 * Update a time allocation immutably
 * @param allocation Original time allocation
 * @param activityType Activity to update
 * @param hoursPerDay New hours per day
 * @returns New TimeAllocation with updated hours
 */
export function updateTimeAllocation(
  allocation: TimeAllocation,
  hoursPerDay: number
): TimeAllocation {
  // Create a new object with updated values
  return {
    activityType: allocation.activityType,
    hoursPerDay: Math.max(0, Math.min(24, hoursPerDay)),
    hoursPerWeek: Math.max(0, Math.min(24, hoursPerDay)) * 7,
    percentage: ((Math.max(0, Math.min(24, hoursPerDay)) * 7) / 168) * 100,
  };
}

/**
 * Update weekly time allocation immutably
 * @param allocation Original weekly allocation
 * @param activityType Activity to update
 * @param hoursPerDay New hours per day
 * @returns New WeeklyTimeAllocation with balanced hours
 */
export function updateWeeklyTimeAllocation(
  allocation: WeeklyTimeAllocation,
  activityType: ActivityType,
  hoursPerDay: number
): WeeklyTimeAllocation {
  // Validate new hours are within range
  const validatedHours = Math.max(0, Math.min(24, hoursPerDay));

  // Calculate the change in hours from the current allocation
  const currentHours = allocation.allocations[activityType]?.hoursPerDay || 0;
  const hoursDelta = validatedHours - currentHours;

  // If no change, return original allocation
  if (hoursDelta === 0) {
    return allocation;
  }

  // Create a copy of the allocations
  const newAllocations: Record<ActivityType, TimeAllocation> = {} as Record<
    ActivityType,
    TimeAllocation
  >;

  // Copy all allocations
  Object.values(ActivityType).forEach((act) => {
    if (allocation.allocations[act]) {
      newAllocations[act] = { ...allocation.allocations[act] };
    }
  });

  // Update the target activity
  const newHoursPerWeek = validatedHours * 7;
  newAllocations[activityType] = {
    activityType,
    hoursPerDay: validatedHours,
    hoursPerWeek: newHoursPerWeek,
    percentage: (newHoursPerWeek / 168) * 100,
  };

  // For other activities, proportionally adjust their hours to maintain 24 hour total
  const otherActivities = Object.values(ActivityType).filter((act) => act !== activityType);

  if (hoursDelta !== 0 && otherActivities.length > 0) {
    // Calculate total hours for other activities
    const totalOtherHours = otherActivities.reduce(
      (total, act) => total + (allocation.allocations[act]?.hoursPerDay || 0),
      0
    );

    // If there are other activities with hours, adjust them proportionally
    if (totalOtherHours > 0) {
      otherActivities.forEach((act) => {
        const actHours = allocation.allocations[act]?.hoursPerDay || 0;
        // Calculate proportional reduction
        const proportion = actHours / totalOtherHours;
        const adjustment = -hoursDelta * proportion;

        // Ensure we don't go below zero
        const adjustedHours = Math.max(0, actHours + adjustment);
        const adjustedHoursPerWeek = adjustedHours * 7;

        newAllocations[act] = {
          activityType: act,
          hoursPerDay: adjustedHours,
          hoursPerWeek: adjustedHoursPerWeek,
          percentage: (adjustedHoursPerWeek / 168) * 100,
        };
      });
    }
  }

  return {
    allocations: newAllocations,
    totalHours: 168,
    lastUpdated: Date.now(),
  };
}

/**
 * Update an event queue immutably
 * @param queue Original event queue
 * @param updates Updates to apply (added events, changes to active/resolved)
 * @returns New EventQueue with updates applied
 */
export function updateEventQueue(
  queue: EventQueue,
  updates: {
    pending?: GameEvent[];
    active?: GameEvent[];
    resolved?: GameEvent[];
    narrativeArcs?: Record<string, NarrativeProgress>;
  }
): EventQueue {
  // Create a new event queue
  const result: EventQueue = {
    pending: [...queue.pending],
    active: [...queue.active],
    resolved: [...queue.resolved],
    narrativeArcs: { ...queue.narrativeArcs },
  };

  // Apply updates
  if (updates.pending) {
    result.pending = [...updates.pending];
  }

  if (updates.active) {
    result.active = [...updates.active];
  }

  if (updates.resolved) {
    result.resolved = [...updates.resolved];
  }

  if (updates.narrativeArcs) {
    result.narrativeArcs = { ...updates.narrativeArcs };
  }

  return result;
}

/**
 * Add an event to the queue immutably
 * @param queue Original event queue
 * @param event Event to add
 * @param queueType Queue to add to (pending, active, resolved)
 * @returns New EventQueue with event added
 */
export function addEventToQueue(
  queue: EventQueue,
  event: GameEvent,
  queueType: 'pending' | 'active' | 'resolved' = 'pending'
): EventQueue {
  // Create a new event queue
  const result: EventQueue = {
    pending: [...queue.pending],
    active: [...queue.active],
    resolved: [...queue.resolved],
    narrativeArcs: { ...queue.narrativeArcs },
  };

  // Add event to the specified queue
  switch (queueType) {
    case 'pending':
      result.pending.push(event);
      break;
    case 'active':
      result.active.push(event);
      break;
    case 'resolved':
      result.resolved.push(event);
      break;
  }

  return result;
}

/**
 * Move an event between queues immutably
 * @param queue Original event queue
 * @param eventId ID of event to move
 * @param fromQueue Source queue
 * @param toQueue Destination queue
 * @returns New EventQueue with event moved
 */
export function moveEventBetweenQueues(
  queue: EventQueue,
  eventId: string,
  fromQueue: 'pending' | 'active' | 'resolved',
  toQueue: 'pending' | 'active' | 'resolved'
): EventQueue {
  // Create a new event queue
  const result: EventQueue = {
    pending: [...queue.pending],
    active: [...queue.active],
    resolved: [...queue.resolved],
    narrativeArcs: { ...queue.narrativeArcs },
  };

  // Find the event in the source queue
  const sourceQueue = result[fromQueue];
  const eventIndex = sourceQueue.findIndex((event) => event.id === eventId);

  if (eventIndex >= 0) {
    // Remove from source queue
    const event = sourceQueue[eventIndex];
    result[fromQueue] = sourceQueue.filter((_, i) => i !== eventIndex);

    // Add to destination queue
    result[toQueue].push(event);
  }

  return result;
}
