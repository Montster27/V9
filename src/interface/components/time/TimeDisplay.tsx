/**
 * /src/interface/components/time/TimeDisplay.tsx
 *
 * TimeDisplay Component
 *
 * Displays the current game time including date and hour in a user-friendly format.
 * This component is updated continuously as time progresses in the game.
 */

import React from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import { selectGameTime } from '../../../infrastructure/state/slices/timeSlice';
import './TimeDisplay.css';

interface TimeDisplayProps {
  /** Whether to show seconds (default: false) */
  showSeconds?: boolean;
  /** Display format (compact, full, or detailed) (default: 'full') */
  format?: 'compact' | 'full' | 'detailed';
  /** Custom CSS class */
  className?: string;
}

/**
 * Component to display the current game time
 */
const TimeDisplay: React.FC<TimeDisplayProps> = ({
  showSeconds = false,
  format = 'full',
  className = '',
}) => {
  // Get current game time from Redux
  const timeValue = useAppSelector(selectGameTime);

  // Get date object from time value
  const date = timeValue.getGameDate();

  /**
   * Format date as a string based on the format prop
   */
  const formatDate = (): string => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const dayName = dayNames[date.getDay()];

    // Format time with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Build time string
    let timeString = `${formattedHours}:${formattedMinutes}`;
    if (showSeconds) {
      timeString += `:${formattedSeconds}`;
    }

    // Build date string based on format
    switch (format) {
      case 'compact':
        return `${month + 1}/${day}/${year} ${timeString}`;

      case 'detailed':
        return `${dayName}, ${monthNames[month]} ${day}, ${year} at ${timeString}`;

      case 'full':
      default:
        return `${monthNames[month]} ${day}, ${year} ${timeString}`;
    }
  };

  /**
   * Format time period (morning, afternoon, evening, night)
   */
  const getTimePeriod = (): string => {
    const hours = date.getHours();

    if (hours >= 5 && hours < 12) {
      return 'Morning';
    } else if (hours >= 12 && hours < 17) {
      return 'Afternoon';
    } else if (hours >= 17 && hours < 21) {
      return 'Evening';
    } else {
      return 'Night';
    }
  };

  return (
    <div className={`time-display ${className}`}>
      <div className="time-display__date">{formatDate()}</div>
      {format === 'detailed' && <div className="time-display__period">{getTimePeriod()}</div>}
    </div>
  );
};

export default TimeDisplay;
