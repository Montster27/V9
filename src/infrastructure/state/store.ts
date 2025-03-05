/**
 * /src/infrastructure/state/store.ts
 *
 * Redux store configuration
 * Sets up the global state management with standardized slices
 */

import { configureStore, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import timeReducer from './slices/timeSlice';
import useOfTimeReducer from './slices/useOfTimeSlice';
import narrativeReducer from './slices/narrativeSlice';
import gameLoopReducer from './slices/gameLoopSlice';
import realTimeGameLoopReducer from './slices/realTimeGameLoopSlice';
import resourcesReducer from './slices/resourcesSlice';
import newsReducer from './slices/newsSlice';
import eventsReducer from './slices/eventSlice';

// Import simulation middleware
import { createSimulationMiddleware, defaultServiceRegistry } from './middleware/simulation';

export const store = configureStore({
  reducer: {
    time: timeReducer,
    useOfTime: useOfTimeReducer,
    narrative: narrativeReducer,
    gameLoop: gameLoopReducer,
    realTimeGameLoop: realTimeGameLoopReducer,
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
          'realTimeGameLoop/initializeRealTimeGameLoop', // RealTimeGameLoop service is not serializable
          'realTimeGameLoop/startRealTimeGameLoop',
          'realTimeGameLoop/stopRealTimeGameLoop',
          'realTimeGameLoop/pauseRealTimeGameLoop',
          'realTimeGameLoop/resumeRealTimeGameLoop',
          'realTimeGameLoop/toggleRealTimeGameLoop',
          'realTimeGameLoop/updateRealTimeGameLoopConfig',
          'news/addNewsItem', // Contains timestamp objects
          'news/setNewsItems',
          'events/processEvents', // May contain complex event objects
          'events/addEvent',
          'events/addEvents',
          'events/activateEvent',
          'events/resolveEvent',
          'resources/updateResources', // May contain resource objects with references
        ],
        ignoredPaths: [
          'time.managerState.currentTime',
          'useOfTime.managerState.currentAllocation',
          'narrative.discoveredClues', // Contains Date objects
          'gameLoop.gameLoopState.activeEvents', // Contains complex event objects
          'realTimeGameLoop.gameLoopState', // Contains complex objects and timestamps
          'news.items', // Contains timestamp objects
          'events.queue', // Contains complex event objects
          'resources', // Add resources to ignored paths for serialization checks
        ],
      },
    }).concat(
      // Add simulation middleware
      createSimulationMiddleware({
        simulationService: defaultServiceRegistry.getSimulationService(),
      })
    ),
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
