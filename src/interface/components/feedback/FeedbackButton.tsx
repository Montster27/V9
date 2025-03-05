/**
 * /src/interface/components/feedback/FeedbackButton.tsx
 *
 * FeedbackButton component for collecting player feedback during testing
 */

import React, { useState } from 'react';
import './FeedbackButton.css';

export interface FeedbackButtonProps {
  /** Custom CSS class */
  className?: string;
  /** Callback when feedback is submitted */
  onSubmit?: (feedback: { type: string; message: string; metadata: any }) => void;
}

/**
 * FeedbackButton component allows players to provide feedback during gameplay
 */
const FeedbackButton: React.FC<FeedbackButtonProps> = ({ className = '', onSubmit = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');

  // Collect metadata about the current game state
  const collectMetadata = () => {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      // Add other relevant context info here
    };
  };

  // Submit feedback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const feedback = {
      type: feedbackType,
      message,
      metadata: collectMetadata(),
    };

    onSubmit(feedback);

    // Reset form and close panel
    setMessage('');
    setFeedbackType('general');
    setIsOpen(false);
  };

  return (
    <div className={`feedback-container ${className}`}>
      <button
        className="feedback-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="feedback-panel"
      >
        {isOpen ? 'Close Feedback' : 'Give Feedback'}
      </button>

      {isOpen && (
        <div id="feedback-panel" className="feedback-panel">
          <h3 className="feedback-title">Share Your Feedback</h3>
          <form onSubmit={handleSubmit}>
            <div className="feedback-field">
              <label htmlFor="feedback-type">Feedback Type:</label>
              <select
                id="feedback-type"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <option value="general">General Feedback</option>
                <option value="usability">Usability Issue</option>
                <option value="confusion">Something is Confusing</option>
                <option value="suggestion">Feature Suggestion</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div className="feedback-field">
              <label htmlFor="feedback-message">Your Feedback:</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your thoughts or the issue you're experiencing..."
                rows={4}
                required
              />
            </div>

            <div className="feedback-actions">
              <button
                type="button"
                className="feedback-cancel-button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="feedback-submit-button">
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackButton;
