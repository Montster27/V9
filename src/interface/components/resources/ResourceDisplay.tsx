/**
 * /src/interface/components/resources/ResourceDisplay.tsx
 *
 * Enhanced resource display component with visual feedback
 * and tooltips for better user understanding.
 */

import React from 'react';
import { Tooltip } from '../help';
import './ResourceDisplay.css';

// Define threshold levels for resources
const THRESHOLD_LEVELS = {
  ENERGY: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 90,
  },
  STRESS: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 90,
  },
};

interface ResourceTrend {
  direction: 'up' | 'down' | 'stable';
  rate: 'slow' | 'moderate' | 'fast';
}

export interface ResourceProps {
  /** Resource type */
  type: 'Energy' | 'Stress' | 'Knowledge' | 'Money' | 'Social' | 'Skill Points';
  /** Current value */
  value: number;
  /** Maximum value (if applicable) */
  max?: number;
  /** Trend direction and rate */
  trend?: ResourceTrend;
  /** Visual style (color) */
  style?: 'default' | 'warning' | 'danger' | 'success';
  /** Custom CSS class */
  className?: string;
}

/**
 * Resource component displays a single resource with visual feedback
 */
const Resource: React.FC<ResourceProps> = ({
  type,
  value,
  max,
  trend,
  style = 'default',
  className = '',
}) => {
  // Determine if we should show a progress bar (for resources with max values)
  const showProgressBar = max !== undefined;

  // Calculate percentage for progress bar
  const percentage = max ? (value / max) * 100 : 0;

  // Determine resource style based on thresholds
  const getResourceStyle = () => {
    if (style !== 'default') return style;

    if (type === 'Energy') {
      if (percentage <= THRESHOLD_LEVELS.ENERGY.LOW) return 'danger';
      if (percentage <= THRESHOLD_LEVELS.ENERGY.MEDIUM) return 'warning';
      return 'success';
    }

    if (type === 'Stress') {
      if (percentage >= THRESHOLD_LEVELS.STRESS.HIGH) return 'danger';
      if (percentage >= THRESHOLD_LEVELS.STRESS.MEDIUM) return 'warning';
      return 'success';
    }

    return 'default';
  };

  // Get resource descriptions for tooltips
  const getResourceDescription = () => {
    switch (type) {
      case 'Energy':
        return `Your physical and mental vitality. Low energy reduces efficiency of all activities. 
                Rest to recover energy.`;
      case 'Stress':
        return `Your mental pressure level. High stress reduces efficiency and can lead to negative events. 
                Rest and social activities reduce stress.`;
      case 'Knowledge':
        return `Academic achievement and learning. Gain knowledge through study and classes.`;
      case 'Money':
        return `Financial resources. Gain money through work and investments.`;
      case 'Social':
        return `Social capital and connections. Improve through social activities and networking.`;
      case 'Skill Points':
        return `Points used to unlock and upgrade skills. Gain 1 point per game hour.`;
      default:
        return '';
    }
  };

  // Get trend description
  const getTrendDescription = () => {
    if (!trend) return 'Stable';

    const directionText =
      trend.direction === 'up'
        ? 'Increasing'
        : trend.direction === 'down'
          ? 'Decreasing'
          : 'Stable';

    const rateText =
      trend.rate === 'fast' ? 'rapidly' : trend.rate === 'moderate' ? 'moderately' : 'slowly';

    return `${directionText} ${trend.direction !== 'stable' ? rateText : ''}`;
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.direction === 'up') return '↑';
    if (trend.direction === 'down') return '↓';
    return '→';
  };

  // Format the value (add commas for large numbers, etc.)
  const formatValue = () => {
    if (type === 'Money') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    }

    if (max) {
      return `${value.toLocaleString()}/${max.toLocaleString()}`;
    }

    return value.toLocaleString();
  };

  const resourceStyle = getResourceStyle();

  return (
    <Tooltip
      content={
        <div className="resource-tooltip">
          <p className="resource-tooltip-description">{getResourceDescription()}</p>
          {trend && (
            <p className="resource-tooltip-trend">
              <strong>Trend:</strong> {getTrendDescription()}
            </p>
          )}
        </div>
      }
      position="top"
      className={`resource ${className}`}
    >
      <div className="resource-content">
        <div className="resource-header">
          <span className="resource-label">{type}:</span>
          <span className={`resource-value resource-${resourceStyle}`}>
            {formatValue()}
            {trend && <span className="resource-trend-icon">{getTrendIcon()}</span>}
          </span>
        </div>

        {showProgressBar && (
          <div className="resource-bar">
            <div
              className={`resource-bar-fill resource-${resourceStyle}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export interface ResourceDisplayProps {
  /** Energy level */
  energy: { value: number; max: number; trend?: ResourceTrend };
  /** Stress level */
  stress: { value: number; max: number; trend?: ResourceTrend };
  /** Knowledge points */
  knowledge: { value: number; trend?: ResourceTrend };
  /** Money */
  money: { value: number; trend?: ResourceTrend };
  /** Social points */
  social: { value: number; trend?: ResourceTrend };
  /** Skill points */
  skillPoints: { value: number; trend?: ResourceTrend };
  /** Custom CSS class */
  className?: string;
}

/**
 * ResourceDisplay component shows all resources with enhanced visual feedback
 */
const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  energy,
  stress,
  knowledge,
  money,
  social,
  skillPoints,
  className = '',
}) => {
  return (
    <div className={`resource-display ${className}`}>
      <h3 className="resource-display-title">Resources</h3>
      <div className="resource-grid">
        <Resource type="Energy" value={energy.value} max={energy.max} trend={energy.trend} />
        <Resource type="Stress" value={stress.value} max={stress.max} trend={stress.trend} />
        <Resource type="Knowledge" value={knowledge.value} trend={knowledge.trend} />
        <Resource type="Money" value={money.value} trend={money.trend} />
        <Resource type="Social" value={social.value} trend={social.trend} />
        <Resource type="Skill Points" value={skillPoints.value} trend={skillPoints.trend} />
      </div>
    </div>
  );
};

export default ResourceDisplay;
