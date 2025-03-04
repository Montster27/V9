/**
 * /src/interface/components/help/TutorialOverlay.tsx
 *
 * TutorialOverlay component for guiding new players through the UI.
 * Shows step-by-step instructions highlighting different UI elements.
 */

import React, { useState, useEffect } from 'react';
import './TutorialOverlay.css';

export interface TutorialStep {
  /** Target element selector */
  target: string;
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Position of the tooltip */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Title for this step */
  title?: string;
}

export interface TutorialOverlayProps {
  /** Array of tutorial steps */
  steps: TutorialStep[];
  /** Whether the tutorial is active */
  active: boolean;
  /** Callback when tutorial is completed or dismissed */
  onComplete: () => void;
  /** Callback when a step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Start at a specific step */
  initialStep?: number;
  /** Custom CSS class */
  className?: string;
}

/**
 * TutorialOverlay component guides new players through the UI
 */
const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  active,
  onComplete,
  onStepChange,
  initialStep = 0,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Find target element and position tooltip
  useEffect(() => {
    if (!active || steps.length === 0) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.target);
    setTargetElement(target);

    if (target) {
      positionTooltip(target, step.position || 'bottom');
    }

    if (onStepChange) {
      onStepChange(currentStep);
    }

    // Handle window resize
    const handleResize = () => {
      if (target) {
        positionTooltip(target, step.position || 'bottom');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active, currentStep, steps]);

  // Position tooltip relative to target element
  const positionTooltip = (target: Element, position: string) => {
    const rect = target.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Calculate tooltip position
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top + scrollTop - 10;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.right + scrollLeft + 10;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.left + scrollLeft - 10;
        break;
    }

    setTooltipPosition({ top, left });
  };

  // Go to next step or complete tutorial
  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip tutorial
  const handleSkip = () => {
    onComplete();
  };

  if (!active || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <div className={`tutorial-overlay ${className}`}>
      <div className="tutorial-backdrop" onClick={handleSkip} />

      {targetElement && (
        <div className="tutorial-highlight">
          {/* Clone the target element to highlight it */}
          <div
            className="tutorial-target-highlight"
            style={{
              width: targetElement.clientWidth,
              height: targetElement.clientHeight,
              top: targetElement.getBoundingClientRect().top,
              left: targetElement.getBoundingClientRect().left,
            }}
          />
        </div>
      )}

      <div
        className="tutorial-tooltip"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {step.title && <div className="tutorial-tooltip-title">{step.title}</div>}
        <div className="tutorial-tooltip-content">{step.content}</div>

        <div className="tutorial-controls">
          <div className="tutorial-step-counter">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="tutorial-buttons">
            {currentStep > 0 && (
              <button className="tutorial-button previous" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="tutorial-button next" onClick={handleNext}>
              {currentStep >= steps.length - 1 ? 'Finish' : 'Next'}
            </button>
            <button className="tutorial-button skip" onClick={handleSkip}>
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
