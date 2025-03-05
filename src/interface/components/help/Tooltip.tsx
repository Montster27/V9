/**
 * /src/interface/components/help/Tooltip.tsx
 *
 * Tooltip component that provides contextual information on hover.
 */

import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  title?: string;
  active?: boolean;
  className?: string;
  showIcon?: boolean;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  title,
  active = true,
  className = '',
  showIcon = false,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = -tooltipRect.height - 8;
        left = (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.width + 8;
        break;
      case 'bottom':
        top = targetRect.height + 8;
        left = (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = (targetRect.height - tooltipRect.height) / 2;
        left = -tooltipRect.width - 8;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      return () => window.removeEventListener('resize', calculatePosition);
    }
  }, [isVisible]);

  return (
    <div
      className={`tooltip-container ${className}`}
      ref={targetRef}
      onMouseEnter={() => active && setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => active && setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      title={title || ''}
    >
      {children}
      {showIcon && <span className="tooltip-icon">ⓘ</span>}
      {isVisible && (
        <div
          className={`tooltip tooltip-${position}`}
          ref={tooltipRef}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {content}
          <div className={`tooltip-arrow tooltip-arrow-${position}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
