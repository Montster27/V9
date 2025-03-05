/**
 * /src/infrastructure/state/store.enhanced.ts
 *
 * Enhanced Redux store configuration
 * Incorporates middleware, thunks, and optimized state management
 */

import { configureStore, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import timeReducer from './slices/timeSlice';
import useOfTimeReducer from './slices/useOfTimeSlice';
import narrativeReducer from './slices/narrativeSlice';
import gameLoopReducer from './slices/gameLoopSlice';
import resourcesReducer from './slices/resourcesSlice';
import newsReducer from './slices/newsSlice';
import eventsReducer from './slices/eventSlice';

// Import custom middleware
import { createMonitoringMiddleware, createEventMiddleware } from './middleware';

// Configure monitoring middleware with options
const monitoringMiddleware = createMonitoringMiddleware({
  logActions: process.env.NODE_ENV === 'development',
  logState: false,
  logPerformance: true,
  ignoredActions: [
    'time/tick', // High frequency action
    'gameLoop/updateFrame', // High frequency action
  ],
});

// Create event middleware
const eventMiddleware = createEventMiddleware();

// Configure store with enhanced middleware
export const store = configureStore({
  reducer: {
    time: timeReducer,
    useOfTime: useOfTimeReducer,
    narrative: narrativeReducer,
    gameLoop: gameLoopReducer,
    resources: resourcesReducer,
    news: newsReducer,
    events: eventsReducer,
    // Add more reducers as they are created
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in actions and state
        ignoredActions: [
          'time/setGameTime',
          'useOfTime/connectTimeManager',
          'useOfTime/initializeUseOfTimeManager',
          'narrative/discoverClue', // Date objects need to be ignored
          'gameLoop/initializeGameLoop', // GameLoop services are not serializable
          'gameLoop/startGameLoop',
          'gameLoop/stopGameLoop',
          'gameLoop/pauseGame',
          'gameLoop/resumeGame',
          'gameLoop/togglePause',
          'gameLoop/resolveEvent',
          'news/addNewsItem', // Contains timestamp objects
          'news/setNewsItems',
          'events/processEvents', // May contain complex event objects
          'events/addEvent',
          'events/addEvents',
          'events/activateEvent',
          'events/resolveEvent',
          // Thunk actions
          'resources/simulateChanges/pending',
          'resources/simulateChanges/fulfilled',
          'resources/simulateChanges/rejected',
          'resources/generateSkillPoints/pending',
          'resources/generateSkillPoints/fulfilled',
          'resources/generateSkillPoints/rejected',
          'resources/applyRestRecovery/pending',
          'resources/applyRestRecovery/fulfilled',
          'resources/applyRestRecovery/rejected',
          'events/processGameEvents/pending',
          'events/processGameEvents/fulfilled',
          'events/processGameEvents/rejected',
          'events/resolveGameEvent/pending',
          'events/resolveGameEvent/fulfilled',
          'events/resolveGameEvent/rejected',
          'events/createGameEvent/pending',
          'events/createGameEvent/fulfilled',
          'events/createGameEvent/rejected',
          'events/discoverClue/pending',
          'events/discoverClue/fulfilled',
          'events/discoverClue/rejected',
          'time/gameTick/pending',
          'time/gameTick/fulfilled',
          'time/gameTick/rejected',
          'time/changeGameSpeed/pending',
          'time/changeGameSpeed/fulfilled',
          'time/changeGameSpeed/rejected',
          'time/jumpToGameDate/pending',
          'time/jumpToGameDate/fulfilled',
          'time/jumpToGameDate/rejected',
          'time/advanceGameTime/pending',
          'time/advanceGameTime/fulfilled',
          'time/advanceGameTime/rejected',
        ],
        ignoredPaths: [
          'time.managerState.currentTime',
          'useOfTime.managerState.currentAllocation',
          'narrative.discoveredClues', // Contains Date objects
          'gameLoop.gameLoopState.activeEvents', // Contains complex event objects
          'news.items', // Contains timestamp objects
          'events.queue', // Contains complex event objects
        ],
      },
    }).concat(monitoringMiddleware, eventMiddleware),
});

// Infer the RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom type for thunks
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Typed hooks to use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export pre-typed versions of common hooks
export { useSelector, useDispatch };
