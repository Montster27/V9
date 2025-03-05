/**
 * /src/interface/components/news/NewsStreamEnhanced.tsx
 *
 * Enhanced NewsStream component with improved visual design and usability
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import { selectNewsItems } from '../../../infrastructure/state/slices/newsSlice';
import { Tooltip, HelpPanel } from '../help';
import './NewsStreamEnhanced.css';

interface NewsStreamEnhancedProps {
  /** Maximum number of news items to display (default: 10) */
  maxItems?: number;
  /** Custom CSS class */
  className?: string;
}

/**
 * Enhanced News Stream component for displaying game events and updates
 */
const NewsStreamEnhanced: React.FC<NewsStreamEnhancedProps> = ({
  maxItems = 10,
  className = '',
}) => {
  // Get news items from Redux store
  const newsItems = useAppSelector(selectNewsItems);

  // Local state
  const [showHelp, setShowHelp] = useState(false);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());

  // Ref for auto-scrolling
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // Tracked news items for animation
  const previousItemsRef = useRef<string[]>([]);

  // Check for new items and animate them
  useEffect(() => {
    if (newsItems.length === 0) return;

    const currentItemIds = newsItems.map((item) => item.id);
    const previousItemIds = previousItemsRef.current;

    // Find new items
    const newItems = currentItemIds.filter((id) => !previousItemIds.includes(id));
    setNewItemsCount(newItems.length);

    // Set animating items
    if (newItems.length > 0) {
      setAnimatingItems(new Set(newItems));

      // Auto-scroll to top
      if (newsContainerRef.current) {
        newsContainerRef.current.scrollTop = 0;
      }

      // Clear animation after delay
      setTimeout(() => {
        setAnimatingItems(new Set());
        setNewItemsCount(0);
      }, 5000);
    }

    // Update previous items reference
    previousItemsRef.current = currentItemIds;
  }, [newsItems]);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return timestamp;
    }
  };

  /**
   * Determine if an item is important based on its content
   */
  const isImportantNews = (content: string): boolean => {
    const importantKeywords = [
      'conspiracy',
      'discovered',
      'opportunity',
      'critical',
      'emergency',
      'deadline',
      'achievement',
      'milestone',
      'breakthrough',
      'warning',
    ];

    return importantKeywords.some((keyword) => content.toLowerCase().includes(keyword));
  };

  /**
   * Get CSS class for news item based on its properties
   */
  const getItemClassNames = (item: any): string => {
    const classes = ['news-stream-enhanced__item'];

    if (isImportantNews(item.content)) {
      classes.push('news-stream-enhanced__item--important');
    }

    if (animatingItems.has(item.id)) {
      classes.push('news-stream-enhanced__item--new');
    }

    return classes.join(' ');
  };

  return (
    <div className={`news-stream-enhanced ${className}`}>
      <div className="news-stream-enhanced__header">
        <div className="news-stream-enhanced__title-group">
          <h2>News & Events</h2>
          {newItemsCount > 0 && (
            <div className="news-stream-enhanced__new-badge">{newItemsCount} New</div>
          )}
          <Tooltip
            content="Updates about how your actions affect the world and events happening around you"
            position="bottom"
          >
            <span className="news-stream-enhanced__help-icon">ⓘ</span>
          </Tooltip>
        </div>
        <button
          className="news-stream-enhanced__help-button"
          onClick={() => setShowHelp(!showHelp)}
          aria-expanded={showHelp}
          aria-controls="news-help-panel"
        >
          {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>

      {showHelp && (
        <div id="news-help-panel" className="news-stream-enhanced__help-panel">
          <HelpPanel
            title="About the News Stream"
            content={
              <>
                <p>
                  The News Stream shows you how your actions impact the world around you and
                  important events happening in the game.
                </p>
                <p>
                  <strong>Key features:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Important updates</strong> are highlighted in yellow
                  </li>
                  <li>
                    <strong>New items</strong> appear with a blue highlight
                  </li>
                  <li>News is organized from newest to oldest</li>
                  <li>Pay attention to news for clues and opportunities</li>
                </ul>
                <p>
                  The news provides valuable feedback on your choices and can reveal hidden plot
                  elements and conspiracy clues.
                </p>
              </>
            }
            defaultOpen={true}
          />
        </div>
      )}

      <div className="news-stream-enhanced__container" ref={newsContainerRef}>
        {newsItems.length === 0 ? (
          <div className="news-stream-enhanced__empty">
            <p>No news yet. As you progress through the game, updates will appear here.</p>
          </div>
        ) : (
          newsItems.slice(0, maxItems).map((item) => (
            <div key={item.id} className={getItemClassNames(item)}>
              <div className="news-stream-enhanced__item-header">
                <div className="news-stream-enhanced__source">{item.source}</div>
                <div className="news-stream-enhanced__timestamp">
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <div className="news-stream-enhanced__title">{item.title}</div>
              <div className="news-stream-enhanced__content">{item.content}</div>
            </div>
          ))
        )}
      </div>

      {newsItems.length > maxItems && (
        <div className="news-stream-enhanced__footer">
          <button className="news-stream-enhanced__view-more">
            View More News ({newsItems.length - maxItems})
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsStreamEnhanced;
