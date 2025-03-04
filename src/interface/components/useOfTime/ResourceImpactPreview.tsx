/**
 * /src/interface/components/useOfTime/ResourceImpactPreview.tsx
 *
 * ResourceImpactPreview Component
 *
 * Displays the projected impact of the current time allocation on resources.
 * Shows weekly changes to knowledge, money, social points, energy, and stress.
 * Highlights potential stress penalties for poor allocation choices.
 */

import React from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import {
  selectResourceImpacts,
  selectStressPenalties,
} from '../../../infrastructure/state/slices/useOfTimeSlice';
import './ResourceImpactPreview.css';

interface ResourceImpactPreviewProps {
  /** Custom CSS class */
  className?: string;
}

/**
 * Component to display resource impacts from time allocation
 */
const ResourceImpactPreview: React.FC<ResourceImpactPreviewProps> = ({ className = '' }) => {
  const resourceImpacts = useAppSelector(selectResourceImpacts);
  const stressPenalties = useAppSelector(selectStressPenalties);

  // Calculate total stress including penalties
  const totalStress = resourceImpacts.stress + stressPenalties;

  // Helper function to determine if a value is positive, negative, or neutral
  const getValueClass = (value: number): string => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  // Format number with sign and precision
  const formatValue = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}`;
  };

  return (
    <div className={`resource-impact-preview ${className}`}>
      <h2>Weekly Resource Impact</h2>

      <div className="resource-impact-preview__grid">
        <div className="resource-impact-preview__item">
          <div className="resource-impact-preview__label">Knowledge</div>
          <div
            className={`resource-impact-preview__value ${getValueClass(resourceImpacts.knowledge)}`}
          >
            {formatValue(resourceImpacts.knowledge)} points
          </div>
        </div>

        <div className="resource-impact-preview__item">
          <div className="resource-impact-preview__label">Money</div>
          <div className={`resource-impact-preview__value ${getValueClass(resourceImpacts.money)}`}>
            {formatValue(resourceImpacts.money)} coins
          </div>
        </div>

        <div className="resource-impact-preview__item">
          <div className="resource-impact-preview__label">Social</div>
          <div
            className={`resource-impact-preview__value ${getValueClass(resourceImpacts.social)}`}
          >
            {formatValue(resourceImpacts.social)} points
          </div>
        </div>

        <div className="resource-impact-preview__item">
          <div className="resource-impact-preview__label">Energy</div>
          <div
            className={`resource-impact-preview__value ${getValueClass(resourceImpacts.energy)}`}
          >
            {formatValue(resourceImpacts.energy)} points
          </div>
        </div>

        <div className="resource-impact-preview__item">
          <div className="resource-impact-preview__label">Stress</div>
          <div
            className={`resource-impact-preview__value ${getValueClass(-resourceImpacts.stress)}`}
          >
            {formatValue(resourceImpacts.stress)} points
          </div>
        </div>
      </div>

      {stressPenalties > 0 && (
        <div className="resource-impact-preview__penalties">
          <div className="resource-impact-preview__penalties-label">Stress Penalties</div>
          <div className="resource-impact-preview__penalties-value negative">
            +{stressPenalties.toFixed(1)} additional stress
          </div>
          <div className="resource-impact-preview__penalties-explanation">
            You're experiencing penalties from insufficient rest or overexertion. Consider adjusting
            your schedule for better balance.
          </div>
        </div>
      )}

      <div className="resource-impact-preview__total">
        <div className="resource-impact-preview__total-label">Total Stress Impact:</div>
        <div className={`resource-impact-preview__total-value ${getValueClass(-totalStress)}`}>
          {formatValue(totalStress)} points
        </div>
      </div>

      <div className="resource-impact-preview__note">
        These projections show weekly resource changes based on your current time allocation.
      </div>
    </div>
  );
};

export default ResourceImpactPreview;
