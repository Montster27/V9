/**
 * /src/interface/components/news/NewsStream.tsx
 *
 * NewsStream Component
 *
 * Displays a stream of news updates, events, and player feedback.
 * News items are displayed in reverse chronological order (newest at the top).
 * The component automatically scrolls to show new items.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../infrastructure/state/store';
import { selectGameTime } from '../../../infrastructure/state/slices/timeSlice';
import './NewsStream.css';

// News item interface
interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: Date;
  category: 'campus' | 'world' | 'personal' | 'event';
  read: boolean;
}

interface NewsStreamProps {
  /** Maximum number of items to display (default: 10) */
  maxItems?: number;
  /** Custom CSS class */
  className?: string;
  /** Filter by category (optional) */
  category?: 'campus' | 'world' | 'personal' | 'event';
}

/**
 * Component to display a stream of news and updates
 */
const NewsStream: React.FC<NewsStreamProps> = ({ maxItems = 10, className = '', category }) => {
  // Get current game time from Redux
  const timeValue = useAppSelector(selectGameTime);

  // Reference to the container for auto-scrolling
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state for news items (in a real implementation, this would come from Redux)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Welcome to College!',
      content:
        'Your journey at Westfield University begins today. Orientation starts at 10 AM in the Main Hall.',
      source: 'Administration',
      timestamp: new Date(1983, 8, 1, 8, 0), // Sept 1, 1983, 8:00 AM
      category: 'campus',
      read: false,
    },
    {
      id: '2',
      title: 'Technology Insight: IBM Plans PC Jr Launch',
      content:
        'IBM is rumored to be working on a home computer called the PCjr, targeting the consumer market.',
      source: 'Tech Weekly',
      timestamp: new Date(1983, 8, 1, 10, 0), // Sept 1, 1983, 10:00 AM
      category: 'world',
      read: false,
    },
    {
      id: '3',
      title: 'Dormitory Assignment',
      content:
        'You have been assigned to Thompson Hall, Room 215. Your roommate is waiting to meet you.',
      source: 'Housing Office',
      timestamp: new Date(1983, 8, 1, 9, 0), // Sept 1, 1983, 9:00 AM
      category: 'personal',
      read: false,
    },
  ]);

  // Add demo news items when time progresses
  useEffect(() => {
    const currentDate = timeValue.getGameDate();

    // Only add new items every few game hours to prevent spam
    if (currentDate.getHours() % 4 === 0 && currentDate.getMinutes() === 0) {
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: `News Update: ${currentDate.toLocaleDateString()}`,
        content: `This is a simulated news update for ${currentDate.toLocaleString()}.`,
        source: 'Campus Herald',
        timestamp: new Date(currentDate),
        category: 'campus',
        read: false,
      };

      setNewsItems((prevItems) => [newItem, ...prevItems]);
    }
  }, [timeValue]);

  // Auto-scroll to the top when new items are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [newsItems.length]);

  /**
   * Mark a news item as read
   */
  const handleMarkAsRead = (id: string) => {
    setNewsItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  // Filter items by category if specified
  const filteredItems = category
    ? newsItems.filter((item) => item.category === category)
    : newsItems;

  // Limit to maxItems
  const displayedItems = filteredItems.slice(0, maxItems);

  return (
    <div className={`news-stream ${className}`} ref={containerRef}>
      <div className="news-stream__header">
        <h3>News & Updates</h3>
      </div>

      <div className="news-stream__items">
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`news-stream__item ${item.read ? 'read' : 'unread'} category-${item.category}`}
              onClick={() => handleMarkAsRead(item.id)}
            >
              <div className="news-stream__item-header">
                <span className="news-stream__item-source">{item.source}</span>
                <span className="news-stream__item-timestamp">
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h4 className="news-stream__item-title">{item.title}</h4>
              <p className="news-stream__item-content">{item.content}</p>
            </div>
          ))
        ) : (
          <div className="news-stream__empty">No news updates yet.</div>
        )}
      </div>
    </div>
  );
};

export default NewsStream;
