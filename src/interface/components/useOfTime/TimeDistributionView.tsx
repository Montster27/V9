/**
 * /src/interface/components/useOfTime/TimeDistributionView.tsx
 *
 * TimeDistributionView Component
 *
 * Provides a visual representation of how time is distributed
 * across different activities. Shows the percentage breakdowns
 * and visual indicators for each activity type.
 */

import React from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import { ActivityType } from '../../../domain/models/UseOfTime';
import { selectCurrentAllocation } from '../../../infrastructure/state/slices/useOfTimeSlice';
import './TimeDistributionView.css';

interface TimeDistributionViewProps {
  /** Custom CSS class */
  className?: string;
}

/**
 * Activity colors for visualization
 */
const ACTIVITY_COLORS: Record<ActivityType, string> = {
  [ActivityType.STUDY]: '#4285F4', // Blue
  [ActivityType.WORK]: '#EA4335', // Red
  [ActivityType.SOCIAL]: '#FBBC05', // Yellow
  [ActivityType.REST]: '#34A853', // Green
  [ActivityType.EXERCISE]: '#AA46BC', // Purple
};

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
 * Component for visualizing time distribution
 */
const TimeDistributionView: React.FC<TimeDistributionViewProps> = ({ className = '' }) => {
  const currentAllocation = useAppSelector(selectCurrentAllocation);

  return (
    <div className={`time-distribution-view ${className}`}>
      <h2>Time Distribution</h2>

      {/* Bar chart visualization */}
      <div className="time-distribution-view__bar-chart">
        {Object.values(ActivityType).map((activityType) => {
          const allocation = currentAllocation.allocations[activityType];
          return (
            <div
              key={activityType}
              className="time-distribution-view__bar"
              style={{
                width: `${allocation.percentage}%`,
                backgroundColor: ACTIVITY_COLORS[activityType],
              }}
              title={`${ACTIVITY_DISPLAY_NAMES[activityType]}: ${allocation.percentage.toFixed(1)}% (${allocation.hoursPerWeek.toFixed(1)} hours/week)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="time-distribution-view__legend">
        {Object.values(ActivityType).map((activityType) => {
          const allocation = currentAllocation.allocations[activityType];
          return (
            <div
              key={activityType}
              className="time-distribution-view__legend-item"
              data-testid="legend-item"
            >
              <div
                className="time-distribution-view__color-box"
                style={{ backgroundColor: ACTIVITY_COLORS[activityType] }}
              />
              <div className="time-distribution-view__legend-text">
                <div className="time-distribution-view__legend-label">
                  {ACTIVITY_DISPLAY_NAMES[activityType]}
                </div>
                <div className="time-distribution-view__legend-value">
                  {allocation.percentage.toFixed(1)}% ({allocation.hoursPerWeek.toFixed(1)}h)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly total */}
      <div className="time-distribution-view__total">
        Total: {currentAllocation.totalHours} hours per week
      </div>
    </div>
  );
};

export default TimeDistributionView;
