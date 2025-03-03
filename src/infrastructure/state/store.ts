import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import timeReducer from './slices/timeSlice';
import useOfTimeReducer from './slices/useOfTimeSlice';
import narrativeReducer from './slices/narrativeSlice';
// Import other reducers as they are created
// import resourcesReducer from './slices/resourcesSlice';

export const store = configureStore({
  reducer: {
    time: timeReducer,
    useOfTime: useOfTimeReducer,
    narrative: narrativeReducer,
    // resources: resourcesReducer,
    // Add more reducers as they are created
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore TimeValue objects in actions and state
        ignoredActions: [
          'time/setGameTime', 
          'useOfTime/connectTimeManager',
          'useOfTime/initializeUseOfTimeManager',
          'narrative/discoverClue'  // Date objects need to be ignored
        ],
        ignoredPaths: [
          'time.managerState.currentTime',
          'useOfTime.managerState.currentAllocation',
          'narrative.discoveredClues', // Contains Date objects
        ],
      },
    }),
});

// Infer the RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks to use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
