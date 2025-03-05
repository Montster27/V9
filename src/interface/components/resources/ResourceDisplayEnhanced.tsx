/**
 * /src/interface/components/resources/ResourceDisplayEnhanced.tsx
 *
 * Enhanced resource display component with real-time data integration
 * Connected to Redux store for live updates
 */

import React, { useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import {
  selectEnergy,
  selectStress,
  selectHealth,
  selectBelonging,
  selectKnowledge,
  selectMoney,
  selectSocial,
  selectSkillPoints,
} from '../../../infrastructure/state/slices/resourcesSlice';
import { Tooltip } from '../help';
import './ResourceDisplayEnhanced.css';

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
  HEALTH: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 90,
  },
  BELONGING: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 90,
  },
};

// Create consistent types for resource trends
export type TrendDirection = 'up' | 'down' | 'stable';
export type TrendRate = 'slow' | 'moderate' | 'fast';

export interface ResourceTrend {
  direction: TrendDirection;
  rate: TrendRate;
}

export interface ResourceProps {
  /** Resource type */
  type:
    | 'Energy'
    | 'Stress'
    | 'Health'
    | 'Belonging'
    | 'Knowledge'
    | 'Money'
    | 'Social'
    | 'Skill Points';
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
  /** Animation enabled */
  animationEnabled?: boolean;
}

/**
 * Type-safe mapper for converting Redux state trends to component props
 * @param trend The trend from Redux state ('increasing', 'decreasing', 'stable')
 * @param rate The rate from Redux state ('slow', 'moderate', 'fast')
 * @returns A ResourceTrend object for the component
 */
export const mapTrendToResourceTrend = (
  trend?: 'increasing' | 'decreasing' | 'stable',
  rate?: 'slow' | 'moderate' | 'fast'
): ResourceTrend | undefined => {
  if (!trend) return undefined;

  // Map the direction
  let direction: TrendDirection;
  switch (trend) {
    case 'increasing':
      direction = 'up';
      break;
    case 'decreasing':
      direction = 'down';
      break;
    default:
      direction = 'stable';
  }

  // Use the provided rate or default to 'moderate'
  const trendRate: TrendRate = (rate as TrendRate) || 'moderate';

  return {
    direction,
    rate: trendRate,
  };
};

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
  animationEnabled = true,
}) => {
  // Determine if we should show a progress bar (for resources with max values)
  const showProgressBar = max !== undefined;

  // Calculate percentage for progress bar
  const percentage = max ? (value / max) * 100 : 0;

  // Determine resource style based on thresholds
  const getResourceStyle = useCallback(() => {
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

    if (type === 'Health') {
      if (percentage <= THRESHOLD_LEVELS.HEALTH.LOW) return 'danger';
      if (percentage <= THRESHOLD_LEVELS.HEALTH.MEDIUM) return 'warning';
      return 'success';
    }

    if (type === 'Belonging') {
      if (percentage <= THRESHOLD_LEVELS.BELONGING.LOW) return 'danger';
      if (percentage <= THRESHOLD_LEVELS.BELONGING.MEDIUM) return 'warning';
      return 'success';
    }

    return 'default';
  }, [type, percentage, style]);

  // Get resource descriptions for tooltips
  const getResourceDescription = useCallback(() => {
    switch (type) {
      case 'Energy':
        return `Your physical and mental vitality. Low energy reduces efficiency of all activities. 
                Rest to recover energy.`;
      case 'Stress':
        return `Your mental pressure level. High stress reduces efficiency and can lead to negative events. 
                Rest and social activities reduce stress.`;
      case 'Health':
        return `Your physical wellbeing. Affects energy regeneration and stress resistance.
                Exercise and rest improve health.`;
      case 'Belonging':
        return `Your sense of connection and community. Improves stress resistance and social effectiveness.
                Social activities increase belonging.`;
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
  }, [type]);

  // Get trend description
  const getTrendDescription = useCallback(() => {
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
  }, [trend]);

  // Get trend icon
  const getTrendIcon = useCallback(() => {
    if (!trend) return null;

    if (trend.direction === 'up') return '↑';
    if (trend.direction === 'down') return '↓';
    return '→';
  }, [trend]);

  // Format the value (add commas for large numbers, etc.)
  const formatValue = useCallback(() => {
    if (type === 'Money') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    }

    if (max) {
      return `${Math.round(value).toLocaleString()}/${max.toLocaleString()}`;
    }

    return Math.round(value).toLocaleString();
  }, [type, value, max]);

  const resourceStyle = getResourceStyle();

  // Animation class determination
  const getAnimationClass = useCallback(() => {
    if (!animationEnabled || !trend) return '';

    if (trend.direction === 'up') return 'resource-increasing';
    if (trend.direction === 'down') return 'resource-decreasing';
    return '';
  }, [animationEnabled, trend]);

  const animationClass = getAnimationClass();

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
          <span className={`resource-value resource-${resourceStyle} ${animationClass}`}>
            {formatValue()}
            {trend && <span className="resource-trend-icon">{getTrendIcon()}</span>}
          </span>
        </div>

        {showProgressBar && (
          <div className="resource-bar">
            <div
              className={`resource-bar-fill resource-${resourceStyle} ${animationClass}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>
    </Tooltip>
  );
};

/**
 * ResourceDisplayConnected component connected to Redux for real-time updates
 */
const ResourceDisplayConnected: React.FC<{
  className?: string;
  animationEnabled?: boolean;
}> = ({ className = '', animationEnabled = true }) => {
  // Select resource data from Redux store
  const energy = useAppSelector(selectEnergy);
  const stress = useAppSelector(selectStress);
  const health = useAppSelector(selectHealth);
  const belonging = useAppSelector(selectBelonging);
  const knowledge = useAppSelector(selectKnowledge);
  const money = useAppSelector(selectMoney);
  const social = useAppSelector(selectSocial);
  const skillPoints = useAppSelector(selectSkillPoints);

  // Memoize the trend mappings to prevent unnecessary rerenders
  const energyTrend = useMemo(
    () => mapTrendToResourceTrend(energy.trend, energy.rate),
    [energy.trend, energy.rate]
  );

  const stressTrend = useMemo(
    () => mapTrendToResourceTrend(stress.trend, stress.rate),
    [stress.trend, stress.rate]
  );

  const healthTrend = useMemo(
    () => mapTrendToResourceTrend(health.trend, health.rate),
    [health.trend, health.rate]
  );

  const belongingTrend = useMemo(
    () => mapTrendToResourceTrend(belonging.trend, belonging.rate),
    [belonging.trend, belonging.rate]
  );

  // We don't have trend information for numerical resources
  // so we'll leave those undefined

  return (
    <div className={`resource-display ${className}`}>
      <h3 className="resource-display-title">Resources</h3>
      <div className="resource-grid">
        <Resource
          type="Energy"
          value={energy.current}
          max={energy.max}
          trend={energyTrend}
          animationEnabled={animationEnabled}
        />
        <Resource
          type="Stress"
          value={stress.current}
          max={stress.max}
          trend={stressTrend}
          animationEnabled={animationEnabled}
        />
        <Resource
          type="Health"
          value={health.current}
          max={health.max}
          trend={healthTrend}
          animationEnabled={animationEnabled}
        />
        <Resource
          type="Belonging"
          value={belonging.current}
          max={belonging.max}
          trend={belongingTrend}
          animationEnabled={animationEnabled}
        />
        <Resource type="Knowledge" value={knowledge} animationEnabled={animationEnabled} />
        <Resource type="Money" value={money} animationEnabled={animationEnabled} />
        <Resource type="Social" value={social} animationEnabled={animationEnabled} />
        <Resource
          type="Skill Points"
          value={skillPoints.current}
          animationEnabled={animationEnabled}
        />
      </div>
    </div>
  );
};

export default ResourceDisplayConnected;
