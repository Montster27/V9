/**
 * /src/interface/components/useOfTime/TimeAllocationSlidersEnhanced.tsx
 *
 * Enhanced version of TimeAllocationSliders with improved usability features:
 * - Dynamic visual feedback
 * - Contextual tooltips
 * - Immediate impact preview
 * - Stress warnings
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../infrastructure/state/store';
import { ActivityType } from '../../../domain/models/UseOfTime';
import {
  selectCurrentAllocation,
  updateTimeAllocation,
  resetTimeAllocations,
  selectResourceImpacts,
  selectStressPenalties,
} from '../../../infrastructure/state/slices/useOfTimeSlice';
import { Tooltip, HelpPanel } from '../help';
import './TimeAllocationSlidersEnhanced.css';

interface TimeAllocationSlidersEnhancedProps {
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
 * Activity detailed descriptions
 */
const ACTIVITY_DESCRIPTIONS: Record<ActivityType, React.ReactNode> = {
  [ActivityType.STUDY]: (
    <>
      <p>Time spent on academic learning and skill development.</p>
      <ul>
        <li>+5 Knowledge points per hour</li>
        <li>-5 Energy per hour</li>
        <li>+1 Stress per hour</li>
      </ul>
    </>
  ),
  [ActivityType.WORK]: (
    <>
      <p>Time spent at a job earning money.</p>
      <ul>
        <li>+$3 per hour</li>
        <li>-8 Energy per hour</li>
        <li>+1.5 Stress per hour</li>
      </ul>
    </>
  ),
  [ActivityType.SOCIAL]: (
    <>
      <p>Time spent building relationships and social connections.</p>
      <ul>
        <li>+3 Social points per hour</li>
        <li>-3 Energy per hour</li>
        <li>-1 Stress per hour</li>
      </ul>
    </>
  ),
  [ActivityType.REST]: (
    <>
      <p>Time spent sleeping and recovering energy.</p>
      <ul>
        <li>+5 Energy per hour</li>
        <li>-2 Stress per hour</li>
        <li>Minimum 6 hours recommended</li>
        <li>Optimal: 8 hours per day</li>
      </ul>
    </>
  ),
  [ActivityType.EXERCISE]: (
    <>
      <p>Time spent on physical fitness activities.</p>
      <ul>
        <li>+Health benefits</li>
        <li>-10 Energy per hour</li>
        <li>-3 Stress per hour</li>
        <li>+1 Social point per hour</li>
      </ul>
    </>
  ),
};

/**
 * Activity impact summaries
 */
const ACTIVITY_IMPACTS: Record<ActivityType, string> = {
  [ActivityType.STUDY]: '+Knowledge, -Energy',
  [ActivityType.WORK]: '+Money, -Energy',
  [ActivityType.SOCIAL]: '+Social, -Energy, -Stress',
  [ActivityType.REST]: '+Energy, -Stress',
  [ActivityType.EXERCISE]: '+Health, -Stress, -Energy',
};

/**
 * Enhanced component for time allocation using sliders
 */
const TimeAllocationSlidersEnhanced: React.FC<TimeAllocationSlidersEnhancedProps> = ({
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const currentAllocation = useAppSelector(selectCurrentAllocation);
  const resourceImpacts = useAppSelector(selectResourceImpacts);
  const stressPenalties = useAppSelector(selectStressPenalties);

  // Local state for animation
  const [animatingActivity, setAnimatingActivity] = useState<ActivityType | null>(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  // Check for balance issues
  useEffect(() => {
    const restHours = currentAllocation.allocations[ActivityType.REST].hoursPerDay;
    const totalActiveHours = 24 - restHours;

    // Show warning if rest is below 6 hours or active time is over 16 hours
    setShowBalanceWarning(restHours < 6 || totalActiveHours > 16);
  }, [currentAllocation]);

  /**
   * Handle slider change with animation feedback
   */
  const handleSliderChange = (activityType: ActivityType, newHoursPerDay: number) => {
    // Validate input
    const validHours = Math.max(0, Math.min(24, newHoursPerDay));

    // Set animating flag
    setAnimatingActivity(activityType);
    setTimeout(() => setAnimatingActivity(null), 500);

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

  /**
   * Get color class for slider based on activity type
   */
  const getSliderColorClass = (activityType: ActivityType): string => {
    switch (activityType) {
      case ActivityType.STUDY:
        return 'study-color';
      case ActivityType.WORK:
        return 'work-color';
      case ActivityType.SOCIAL:
        return 'social-color';
      case ActivityType.REST:
        return 'rest-color';
      case ActivityType.EXERCISE:
        return 'exercise-color';
      default:
        return '';
    }
  };

  return (
    <div className={`time-allocation-sliders-enhanced ${className}`}>
      <div className="time-allocation-sliders-enhanced__header">
        <div className="time-allocation-sliders-enhanced__title-group">
          <h2>Weekly Time Allocation</h2>
          <Tooltip
            content="Adjust how many hours per day you spend on each activity. Total must equal 24 hours."
            position="bottom"
          >
            <span className="time-allocation-sliders-enhanced__help-icon">ⓘ</span>
          </Tooltip>
        </div>
        <div className="time-allocation-sliders-enhanced__actions">
          <button
            className="time-allocation-sliders-enhanced__help-button"
            onClick={() => setShowHelpPanel(!showHelpPanel)}
            aria-expanded={showHelpPanel}
            aria-controls="time-allocation-help"
          >
            {showHelpPanel ? 'Hide Help' : 'Show Help'}
          </button>
          <button
            className="time-allocation-sliders-enhanced__reset-button"
            onClick={handleReset}
            aria-label="Reset time allocations"
          >
            Reset
          </button>
        </div>
      </div>

      {showHelpPanel && (
        <div id="time-allocation-help" className="time-allocation-sliders-enhanced__help-panel">
          <HelpPanel
            title="How Time Allocation Works"
            content={
              <>
                <p>You have 24 hours per day to allocate across different activities.</p>
                <p>Each activity affects your resources differently:</p>
                <ul>
                  <li>
                    <strong>Study</strong>: Increases knowledge but costs energy
                  </li>
                  <li>
                    <strong>Work</strong>: Earns money but costs more energy than studying
                  </li>
                  <li>
                    <strong>Social</strong>: Builds connections and reduces stress
                  </li>
                  <li>
                    <strong>Rest</strong>: Recovers energy and reduces stress
                  </li>
                  <li>
                    <strong>Exercise</strong>: Improves health and reduces stress but costs energy
                  </li>
                </ul>
                <p>
                  <strong>Important Balance Tips:</strong>
                </p>
                <ul>
                  <li>Aim for 7-8 hours of rest per day to avoid stress penalties</li>
                  <li>Balance high-energy activities with rest and social time</li>
                  <li>Too much of any one activity leads to diminishing returns</li>
                  <li>Your current skills can improve efficiency in some activities</li>
                </ul>
              </>
            }
            defaultOpen={true}
            icon="❓"
          />
        </div>
      )}

      {showBalanceWarning && (
        <div className="time-allocation-sliders-enhanced__warning">
          <div className="time-allocation-sliders-enhanced__warning-icon">⚠️</div>
          <div className="time-allocation-sliders-enhanced__warning-text">
            {currentAllocation.allocations[ActivityType.REST].hoursPerDay < 6 ? (
              <p>
                <strong>Low Rest Warning:</strong> Allocating less than 6 hours to rest will cause
                significant stress penalties and energy regeneration issues.
              </p>
            ) : (
              <p>
                <strong>Overexertion Warning:</strong> You're allocating too many hours to active
                pursuits. This will lead to burnout and stress problems.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="time-allocation-sliders-enhanced__container">
        {Object.values(ActivityType).map((activityType) => {
          const allocation = currentAllocation.allocations[activityType];
          const isAnimating = animatingActivity === activityType;
          const colorClass = getSliderColorClass(activityType);

          return (
            <div
              key={activityType}
              className={`time-allocation-slider-enhanced ${isAnimating ? 'animating' : ''}`}
            >
              <div className="time-allocation-slider-enhanced__header">
                <span className={`time-allocation-slider-enhanced__label ${colorClass}`}>
                  {ACTIVITY_DISPLAY_NAMES[activityType]}
                </span>
                <span className="time-allocation-slider-enhanced__value">
                  {allocation.hoursPerDay.toFixed(1)} hours/day
                  <span className="time-allocation-slider-enhanced__percentage">
                    ({allocation.percentage.toFixed(1)}%)
                  </span>
                </span>
              </div>

              <Tooltip
                content={ACTIVITY_DESCRIPTIONS[activityType]}
                position="right"
                showIcon={true}
              >
                <div className="time-allocation-slider-enhanced__description">
                  {ACTIVITY_IMPACTS[activityType]}
                </div>
              </Tooltip>

              <div className={`time-allocation-slider-enhanced__slider-container ${colorClass}`}>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={allocation.hoursPerDay}
                  onChange={(e) => handleSliderChange(activityType, parseFloat(e.target.value))}
                  className="time-allocation-slider-enhanced__input"
                  aria-label={`${ACTIVITY_DISPLAY_NAMES[activityType]} hours per day`}
                  aria-valuemin={0}
                  aria-valuemax={24}
                  aria-valuenow={allocation.hoursPerDay}
                />
                <div
                  className={`time-allocation-slider-enhanced__progress ${colorClass}`}
                  style={{ width: `${(allocation.hoursPerDay / 24) * 100}%` }}
                ></div>
              </div>

              <div className="time-allocation-slider-enhanced__weekly">
                <span className="time-allocation-slider-enhanced__weekly-label">Weekly:</span>
                <span className="time-allocation-slider-enhanced__weekly-value">
                  {allocation.hoursPerWeek.toFixed(1)} hours
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="time-allocation-sliders-enhanced__summary">
        <div className="time-allocation-sliders-enhanced__summary-header">
          <h3>Time Distribution</h3>
        </div>
        <div className="time-allocation-sliders-enhanced__distribution-bar">
          {Object.values(ActivityType).map((activityType) => {
            const allocation = currentAllocation.allocations[activityType];
            const colorClass = getSliderColorClass(activityType);

            return (
              <Tooltip
                key={activityType}
                content={`${ACTIVITY_DISPLAY_NAMES[activityType]}: ${allocation.hoursPerDay.toFixed(1)} hours/day`}
                position="top"
              >
                <div
                  className={`time-allocation-sliders-enhanced__distribution-segment ${colorClass}`}
                  style={{ width: `${allocation.percentage}%` }}
                  aria-label={`${ACTIVITY_DISPLAY_NAMES[activityType]} ${allocation.percentage.toFixed(1)}%`}
                ></div>
              </Tooltip>
            );
          })}
        </div>
        <div className="time-allocation-sliders-enhanced__legend">
          {Object.values(ActivityType).map((activityType) => {
            const colorClass = getSliderColorClass(activityType);

            return (
              <div key={activityType} className="time-allocation-sliders-enhanced__legend-item">
                <div className={`time-allocation-sliders-enhanced__color-box ${colorClass}`}></div>
                <span className="time-allocation-sliders-enhanced__legend-label">
                  {ACTIVITY_DISPLAY_NAMES[activityType]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeAllocationSlidersEnhanced;
