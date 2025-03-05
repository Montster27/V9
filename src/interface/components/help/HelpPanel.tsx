/**
 * /src/interface/components/help/HelpPanel.tsx
 *
 * HelpPanel component for displaying contextual help information
 * about game mechanics and UI elements.
 */

import React, { useState } from 'react';
import './HelpPanel.css';

export interface HelpPanelProps {
  /** Title of the help panel */
  title: string;
  /** Content to display in the help panel */
  content: React.ReactNode;
  /** Initial open state */
  defaultOpen?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
}

/**
 * HelpPanel component displays contextual help in a collapsible panel
 */
const HelpPanel: React.FC<HelpPanelProps> = ({
  title,
  content,
  defaultOpen = false,
  className = '',
  icon = '❓',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`help-panel ${isOpen ? 'is-open' : ''} ${className}`}>
      <button
        className="help-panel-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="help-panel-content"
      >
        <span className="help-panel-icon">{icon}</span>
        <span className="help-panel-title">{title}</span>
        <span className="help-panel-toggle">{isOpen ? '▲' : '▼'}</span>
      </button>

      <div id="help-panel-content" className="help-panel-content" aria-hidden={!isOpen}>
        {content}
      </div>
    </div>
  );
};

export default HelpPanel;
