/**
 * /src/interface/components/useOfTime/TimeAllocationSliders.tsx
 *
 * TimeAllocationSliders Component
 *
 * Provides UI sliders for allocating time to different activities.
 * Each slider represents hours per day for an activity type.
 * The component ensures that all allocations sum to 24 hours per day
 * by automatically adjusting other values when one is changed.
 */

import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../infrastructure/state/store';
import { ActivityType } from '../../../domain/models/UseOfTime';
import {
  selectCurrentAllocation,
  updateTimeAllocation,
  resetTimeAllocations,
} from '../../../infrastructure/state/slices/useOfTimeSlice';
import './TimeAllocationSliders.css';

interface TimeAllocationSlidersProps {
  /** Custom CSS class */
  className?: string;
}

/**
 * Activity display names for better UI presentation
 */
const ACTIVITY_DISPLAY_NAMES: Record<ActivityType, string> = {
  [ActivityType.STUDY]: 'Study',
  [ActivityType.WORK]: 'Work',
  [ActivityType.SOCIAL]: 'Social',
  [ActivityType.REST]: 'Rest',
  [ActivityType.EXERCISE]: 'Exercise',
};

/**
 * Activity descriptions for tooltips
 */
const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  [ActivityType.STUDY]: 'Time spent learning and developing academic knowledge',
  [ActivityType.WORK]: 'Time spent at a job earning money',
  [ActivityType.SOCIAL]: 'Time spent building relationships and social connections',
  [ActivityType.REST]: 'Time spent sleeping and recovering energy',
  [ActivityType.EXERCISE]: 'Time spent on physical fitness activities',
};

/**
 * Activity impact summaries
 */
const ACTIVITY_IMPACTS: Record<ActivityType, string> = {
  [ActivityType.STUDY]: '+Knowledge, -Energy',
  [ActivityType.WORK]: '+Money, -Energy',
  [ActivityType.SOCIAL]: '+Social, -Energy',
  [ActivityType.REST]: '+Energy, -Stress',
  [ActivityType.EXERCISE]: '+Social, -Stress, -Energy',
};

/**
 * Component for time allocation using sliders
 */
const TimeAllocationSliders: React.FC<TimeAllocationSlidersProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const currentAllocation = useAppSelector(selectCurrentAllocation);

  /**
   * Handle slider change for a specific activity
   */
  const handleSliderChange = (activityType: ActivityType, newHoursPerDay: number) => {
    // Validate input
    const validHours = Math.max(0, Math.min(24, newHoursPerDay));

    // Update allocation
    dispatch(
      updateTimeAllocation({
        activityType,
        hoursPerDay: validHours,
      })
    );
  };

  /**
   * Reset allocations to default values
   */
  const handleReset = () => {
    dispatch(resetTimeAllocations());
  };

  return (
    <div className={`time-allocation-sliders ${className}`}>
      <div className="time-allocation-sliders__header">
        <h2>Weekly Time Allocation</h2>
        <button
          className="time-allocation-sliders__reset-button"
          onClick={handleReset}
          aria-label="Reset time allocations"
        >
          Reset
        </button>
      </div>

      <div className="time-allocation-sliders__container">
        {Object.values(ActivityType).map((activityType) => {
          const allocation = currentAllocation.allocations[activityType];
          return (
            <div key={activityType} className="time-allocation-slider">
              <div className="time-allocation-slider__header">
                <span className="time-allocation-slider__label">
                  {ACTIVITY_DISPLAY_NAMES[activityType]}
                </span>
                <span className="time-allocation-slider__value">
                  {allocation.hoursPerDay.toFixed(1)} hours/day ({allocation.percentage.toFixed(1)}
                  %)
                </span>
              </div>

              <div className="time-allocation-slider__description">
                {ACTIVITY_DESCRIPTIONS[activityType]}
              </div>

              <div className="time-allocation-slider__impacts">
                {ACTIVITY_IMPACTS[activityType]}
              </div>

              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={allocation.hoursPerDay}
                onChange={(e) => handleSliderChange(activityType, parseFloat(e.target.value))}
                className="time-allocation-slider__input"
              />

              <div className="time-allocation-slider__weekly">
                {allocation.hoursPerWeek.toFixed(1)} hours/week
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeAllocationSliders;
