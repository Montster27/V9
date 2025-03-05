/**
 * /src/infrastructure/state/slices/newsSlice.ts
 *
 * Redux slice for managing news and events in the game
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  content: string;
  timestamp: string;
  category?: string;
  isImportant?: boolean;
}

interface NewsState {
  items: NewsItem[];
  initialized: boolean;
}

// Sample news data for initial state
const initialState: NewsState = {
  items: [
    {
      id: 'news-1',
      source: 'Campus Herald',
      title: 'Economics Department Expands Tech Programs',
      content:
        'The Economics Department is launching new programs focusing on emerging technologies, with special emphasis on telecommunications.',
      timestamp: new Date('1983-09-01T08:30:00').toISOString(),
      category: 'academic',
      isImportant: true,
    },
    {
      id: 'news-2',
      source: 'Tech Weekly',
      title: 'MobileTech Ventures Donates Equipment',
      content:
        'MobileTech Ventures has donated state-of-the-art communications equipment to the university research lab.',
      timestamp: new Date('1983-09-01T10:15:00').toISOString(),
      category: 'technology',
      isImportant: true,
    },
    {
      id: 'news-3',
      source: 'Student Life',
      title: 'Fall Activities Fair Next Week',
      content:
        'The annual activities fair will take place next Wednesday on the quad. Over 50 clubs will be recruiting new members.',
      timestamp: new Date('1983-09-01T14:45:00').toISOString(),
      category: 'social',
    },
  ],
  initialized: true,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    addNewsItem: (state, action: PayloadAction<NewsItem>) => {
      state.items.unshift(action.payload);
    },
    clearNews: (state) => {
      state.items = [];
    },
    setNewsItems: (state, action: PayloadAction<NewsItem[]>) => {
      state.items = action.payload;
    },
  },
});

// Actions
export const { addNewsItem, clearNews, setNewsItems } = newsSlice.actions;

// Selectors
export const selectNewsItems = (state: RootState) => state.news.items;
export const selectIsNewsInitialized = (state: RootState) => state.news.initialized;

export default newsSlice.reducer;
