/**
 * /src/domain/models/UseOfTime.ts
 * 
 * UseOfTime Model
 * 
 * Defines the data structures for time allocation in the Middle Age Multiverse game.
 * Players distribute a week's worth of time (168 hours) among different activities
 * using sliders, which impacts various resources like energy, knowledge, money, and 
 * social connections.
 */

/**
 * Represents a specific activity that time can be allocated to
 */
export enum ActivityType {
  STUDY = 'study',
  WORK = 'work',
  SOCIAL = 'social',
  REST = 'rest',
  EXERCISE = 'exercise'
}

/**
 * Represents resource generation/consumption rates for an activity
 */
export interface ActivityImpact {
  knowledgeRate: number;  // Knowledge points gained per hour
  moneyRate: number;      // Money gained per hour
  socialRate: number;     // Social points gained per hour
  energyCost: number;     // Energy consumed per hour (negative for regeneration)
  stressChange: number;   // Stress added or reduced per hour
}

/**
 * Default impacts for each activity type
 * These are the base rates that can be modified by skills and other factors
 */
export const DEFAULT_ACTIVITY_IMPACTS: Record<ActivityType, ActivityImpact> = {
  [ActivityType.STUDY]: {
    knowledgeRate: 5,
    moneyRate: 0,
    socialRate: 0,
    energyCost: 5,
    stressChange: 1,
  },
  [ActivityType.WORK]: {
    knowledgeRate: 0,
    moneyRate: 3,
    socialRate: 0,
    energyCost: 8,
    stressChange: 1,
  },
  [ActivityType.SOCIAL]: {
    knowledgeRate: 0,
    moneyRate: 0,
    socialRate: 3,
    energyCost: 3,
    stressChange: -0.5, // Reduces stress
  },
  [ActivityType.REST]: {
    knowledgeRate: 0,
    moneyRate: 0,
    socialRate: 0,
    energyCost: -5, // Regenerates energy
    stressChange: -1, // Reduces stress
  },
  [ActivityType.EXERCISE]: {
    knowledgeRate: 0,
    moneyRate: 0,
    socialRate: 1,
    energyCost: 10,
    stressChange: -0.5, // Reduces stress
  },
};

/**
 * Represents an allocated time block for a specific activity
 */
export interface TimeAllocation {
  activityType: ActivityType;
  hoursPerDay: number;   // Hours allocated per day (0-24)
  hoursPerWeek: number;  // Hours allocated per week (0-168)
  percentage: number;    // Percentage of total weekly time (0-100)
}

/**
 * The complete time allocation schedule for a week
 */
export interface WeeklyTimeAllocation {
  allocations: Record<ActivityType, TimeAllocation>;
  totalHours: number;     // Should add up to 168 (24 * 7)
  lastUpdated: number;    // Timestamp of last update
}

/**
 * Resource impacts calculated from a time allocation
 */
export interface ResourceImpact {
  knowledge: number;     // Weekly knowledge gain
  money: number;         // Weekly money gain
  social: number;        // Weekly social gain
  energy: number;        // Weekly energy change (can be negative)
  stress: number;        // Weekly stress change (can be negative)
}

/**
 * Calculate resource impacts from a weekly time allocation
 * @param allocation The weekly time allocation
 * @param impacts Optional custom activity impacts (defaults to DEFAULT_ACTIVITY_IMPACTS)
 * @returns The calculated resource impacts
 */
export function calculateResourceImpact(
  allocation: WeeklyTimeAllocation,
  impacts: Record<ActivityType, ActivityImpact> = DEFAULT_ACTIVITY_IMPACTS
): ResourceImpact {
  // Initialize result
  const result: ResourceImpact = {
    knowledge: 0,
    money: 0,
    social: 0,
    energy: 0,
    stress: 0
  };
  
  // Calculate impact for each activity
  Object.values(allocation.allocations).forEach(timeAlloc => {
    const impact = impacts[timeAlloc.activityType];
    
    // Accumulate resource impacts
    result.knowledge += impact.knowledgeRate * timeAlloc.hoursPerWeek;
    result.money += impact.moneyRate * timeAlloc.hoursPerWeek;
    result.social += impact.socialRate * timeAlloc.hoursPerWeek;
    result.energy -= impact.energyCost * timeAlloc.hoursPerWeek; // Note: energyCost is consumption, so subtract
    result.stress += impact.stressChange * timeAlloc.hoursPerWeek;
  });
  
  return result;
}

/**
 * Calculate stress penalties from a weekly time allocation
 * @param allocation The weekly time allocation
 * @returns Additional stress from overwork or rest deficit
 */
export function calculateStressPenalties(allocation: WeeklyTimeAllocation): number {
  let additionalStress = 0;
  
  // Get rest hours
  const restHours = allocation.allocations[ActivityType.REST]?.hoursPerDay || 0;
  
  // Add stress for insufficient rest (below 8 hours per day)
  if (restHours < 8) {
    additionalStress += (8 - restHours) * 5 * 7; // 5 stress per missing hour per day for the week
  }
  
  // Calculate active hours per day (everything except REST)
  const activeHoursPerDay = 24 - restHours;
  
  // Add stress for overexertion (over 12 active hours per day)
  if (activeHoursPerDay > 12) {
    additionalStress += (activeHoursPerDay - 12) * 10 * 7; // 10 stress per excessive hour per day for the week
  }
  
  return additionalStress;
}

/**
 * Create a default weekly time allocation with equal distribution
 * @returns A default weekly time allocation
 */
export function createDefaultTimeAllocation(): WeeklyTimeAllocation {
  // Default to 8 hours of rest, 4 hours each for other activities
  const restHoursPerDay = 8;
  const otherActivitiesCount = Object.values(ActivityType).length - 1; // Exclude REST
  const hoursPerDayForOthers = (24 - restHoursPerDay) / otherActivitiesCount;
  
  const allocations: Record<ActivityType, TimeAllocation> = {} as Record<ActivityType, TimeAllocation>;
  
  // Set up initial allocations
  Object.values(ActivityType).forEach(activity => {
    const hoursPerDay = activity === ActivityType.REST ? restHoursPerDay : hoursPerDayForOthers;
    const hoursPerWeek = hoursPerDay * 7;
    
    allocations[activity] = {
      activityType: activity,
      hoursPerDay,
      hoursPerWeek,
      percentage: (hoursPerWeek / 168) * 100
    };
  });
  
  return {
    allocations,
    totalHours: 168, // 24 * 7
    lastUpdated: Date.now()
  };
}

/**
 * Adjust a weekly time allocation by changing the hours for a specific activity
 * @param allocation The current weekly time allocation
 * @param activityType The activity type to adjust
 * @param newHoursPerDay The new hours per day for the activity
 * @returns An updated weekly time allocation
 */
export function adjustTimeAllocation(
  allocation: WeeklyTimeAllocation,
  activityType: ActivityType,
  newHoursPerDay: number
): WeeklyTimeAllocation {
  // Validate new hours are within range
  const validatedHours = Math.max(0, Math.min(24, newHoursPerDay));
  
  // Calculate the change in hours from the current allocation
  const currentHours = allocation.allocations[activityType]?.hoursPerDay || 0;
  const hoursDelta = validatedHours - currentHours;
  
  // If no change, return original allocation
  if (hoursDelta === 0) {
    return allocation;
  }
  
  // Create a copy of the allocations
  const newAllocations = { ...allocation.allocations };
  
  // Update the target activity
  const newHoursPerWeek = validatedHours * 7;
  newAllocations[activityType] = {
    activityType,
    hoursPerDay: validatedHours,
    hoursPerWeek: newHoursPerWeek,
    percentage: (newHoursPerWeek / 168) * 100
  };
  
  // For other activities, proportionally adjust their hours to maintain 24 hour total
  const otherActivities = Object.values(ActivityType).filter(act => act !== activityType);
  
  if (hoursDelta !== 0 && otherActivities.length > 0) {
    // Calculate total hours for other activities
    const totalOtherHours = otherActivities.reduce(
      (total, act) => total + (allocation.allocations[act]?.hoursPerDay || 0),
      0
    );
    
    // If there are other activities with hours, adjust them proportionally
    if (totalOtherHours > 0) {
      otherActivities.forEach(act => {
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
          percentage: (adjustedHoursPerWeek / 168) * 100
        };
      });
    }
  }
  
  // Recalculate percentages and ensure total is 168 hours
  let totalWeeklyHours = 0;
  Object.values(newAllocations).forEach(alloc => {
    totalWeeklyHours += alloc.hoursPerWeek;
  });
  
  // Normalize to exactly 24 hours per day (168 per week) if we're slightly off due to rounding
  if (Math.abs(totalWeeklyHours - 168) < 0.1) {
    // Close enough, just set to exactly 168
    totalWeeklyHours = 168;
  } else {
    // We need to adjust to get exactly 24 hours per day
    const adjustmentFactor = 168 / totalWeeklyHours;
    
    Object.values(ActivityType).forEach(act => {
      const current = newAllocations[act];
      const adjusted = {
        ...current,
        hoursPerDay: current.hoursPerDay * adjustmentFactor,
        hoursPerWeek: current.hoursPerWeek * adjustmentFactor,
        percentage: current.percentage * adjustmentFactor
      };
      newAllocations[act] = adjusted;
    });
  }
  
  return {
    allocations: newAllocations,
    totalHours: 168,
    lastUpdated: Date.now()
  };
}

/**
 * Validate a weekly time allocation to ensure it meets constraints
 * @param allocation The weekly time allocation to validate
 * @returns An object with validation results
 */
export function validateTimeAllocation(
  allocation: WeeklyTimeAllocation
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if all activities are present
  const missingActivities = Object.values(ActivityType).filter(
    act => !allocation.allocations[act]
  );
  
  if (missingActivities.length > 0) {
    errors.push(`Missing activities: ${missingActivities.join(', ')}`);
  }
  
  // Check if total is 168 hours (24 * 7)
  let totalHours = 0;
  Object.values(allocation.allocations).forEach(alloc => {
    totalHours += alloc.hoursPerWeek;
  });
  
  if (Math.abs(totalHours - 168) > 0.1) {
    errors.push(`Total hours (${totalHours}) does not equal 168 (24 hours * 7 days)`);
  }
  
  // Check for negative hours
  const negativeHours = Object.values(allocation.allocations).filter(
    alloc => alloc.hoursPerDay < 0 || alloc.hoursPerWeek < 0
  );
  
  if (negativeHours.length > 0) {
    errors.push(`Negative hours found for: ${negativeHours.map(a => a.activityType).join(', ')}`);
  }
  
  // Check if hours per day match hours per week
  const mismatchedHours = Object.values(allocation.allocations).filter(
    alloc => Math.abs(alloc.hoursPerDay * 7 - alloc.hoursPerWeek) > 0.1
  );
  
  if (mismatchedHours.length > 0) {
    errors.push(`Hours per day and per week don't match for: ${mismatchedHours.map(a => a.activityType).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
