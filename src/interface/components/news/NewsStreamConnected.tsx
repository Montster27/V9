/**
 * /src/interface/components/news/NewsStreamConnected.tsx
 *
 * News stream component connected to Redux for real-time updates
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../../infrastructure/state/store';
import {
  selectNewsItems,
  NewsItem,
  addNewsItem,
} from '../../../infrastructure/state/slices/newsSlice';
import './NewsStreamEnhanced.css';

// Format date for display
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface NewsItemProps {
  item: NewsItem;
  isNew?: boolean;
}

// Individual news item component
const NewsItemComponent: React.FC<NewsItemProps> = ({ item, isNew = false }) => {
  return (
    <div
      className={`news-item ${isNew ? 'news-item-new' : ''} ${item.isImportant ? 'news-item-important' : ''}`}
    >
      <div className="news-item-header">
        <span className="news-item-source">{item.source}</span>
        <span className="news-item-time">{formatTimestamp(item.timestamp)}</span>
      </div>
      <h3 className="news-item-title">{item.title}</h3>
      <p className="news-item-content">{item.content}</p>
      {item.category && (
        <div className="news-item-category">
          <span className={`category-tag category-${item.category}`}>{item.category}</span>
        </div>
      )}
    </div>
  );
};

interface NewsStreamProps {
  maxItems?: number;
  title?: string;
  showAnimation?: boolean;
  className?: string;
}

/**
 * NewsStreamConnected component displays real-time news updates
 * from the game world, connected to Redux store
 */
const NewsStreamConnected: React.FC<NewsStreamProps> = ({
  maxItems = 5,
  title = 'News Stream',
  showAnimation = true,
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const newsItems = useAppSelector(selectNewsItems);
  const [newItemIds, setNewItemIds] = useState<string[]>([]);

  // Get the items to display, limited by maxItems
  const displayedItems = useMemo(() => {
    return newsItems.slice(0, maxItems);
  }, [newsItems, maxItems]);

  // When new items come in, mark them as "new" for animation
  useEffect(() => {
    // Check if there are any new items
    if (displayedItems.length > 0) {
      const latestItemId = displayedItems[0].id;

      // If this is a new item we haven't seen before
      if (!newItemIds.includes(latestItemId)) {
        // Add to the list of new items
        setNewItemIds((prev) => [latestItemId, ...prev]);

        // Remove the "new" status after animation completes
        setTimeout(() => {
          setNewItemIds((prev) => prev.filter((id) => id !== latestItemId));
        }, 3000);
      }
    }
  }, [displayedItems, newItemIds]);

  // Placeholder function to add a test news item
  // In a real implementation, this would be connected to game events
  const addTestNewsItem = useCallback(() => {
    const categories = ['academic', 'technology', 'social', 'financial', 'political'];
    const sources = [
      'Campus Herald',
      'Tech Weekly',
      'Student Life',
      'Financial Times',
      'City News',
    ];

    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      title: 'New Event Detected',
      content: 'This is a test news item to demonstrate real-time updates.',
      timestamp: new Date().toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      isImportant: Math.random() > 0.7,
    };

    dispatch(addNewsItem(newItem));
  }, [dispatch]);

  return (
    <div className={`news-stream ${className}`}>
      <div className="news-stream-header">
        <h2 className="news-stream-title">{title}</h2>
        {/* Dev-only test button, remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <button className="test-button" onClick={addTestNewsItem}>
            Test News
          </button>
        )}
      </div>

      <div className="news-items-container">
        {displayedItems.length === 0 ? (
          <div className="news-item news-item-placeholder">
            <p>No news at the moment. Events will appear here as they happen.</p>
          </div>
        ) : (
          displayedItems.map((item) => (
            <NewsItemComponent
              key={item.id}
              item={item}
              isNew={showAnimation && newItemIds.includes(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NewsStreamConnected;
