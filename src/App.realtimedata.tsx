/**
 * /src/App.realtimedata.tsx
 *
 * App with real-time data integration for all UI components
 */

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './infrastructure/state/store.enhanced.realtime';
import { initializeTimeManager } from './infrastructure/state/slices/timeSlice';
import { initializeUseOfTimeManager } from './infrastructure/state/slices/useOfTimeSlice';
import MainGameLayout from './interface/components/MainGameLayout';
import './App.enhanced.css';

// Game initialization component
const GameInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const isTimeInitialized = useSelector((state: RootState) => state.time.isInitialized);
  const isUseOfTimeInitialized = useSelector((state: RootState) => state.useOfTime.isInitialized);

  useEffect(() => {
    // Initialize the time manager when the app loads
    dispatch(
      initializeTimeManager({
        realSecondsPerGameDay: 3,
        skillPointsPerGameHour: 1,
        newsUpdateFrequencyHours: 4,
        startPaused: true,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    // Initialize the use of time manager after time manager is ready
    if (isTimeInitialized && !isUseOfTimeInitialized) {
      dispatch(
        initializeUseOfTimeManager({
          config: {
            baseSkillCost: 10,
            tierScalingFactor: 2,
            threadProgressionFactor: 0.1,
          },
        })
      );
    }
  }, [dispatch, isTimeInitialized, isUseOfTimeInitialized]);

  return null;
};

// Main App component with real-time data integration
function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <GameInitializer />
        <MainGameLayout />
      </div>
    </Provider>
  );
}

export default App;
