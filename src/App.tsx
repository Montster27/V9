import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './infrastructure/state/store';
import { initializeTimeManager } from './infrastructure/state/slices/timeSlice';
import { TimeDisplay, TimeControls } from './interface/components/time';
import { NewsStream } from './interface/components/news';
import './App.css';

// Game initialization component
const GameInitializer: React.FC = () => {
  const dispatch = useDispatch();

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

  return null;
};

// Main game container
const GameContainer: React.FC = () => {
  return (
    <div className="game-container">
      <div className="game-header">
        <TimeDisplay format="detailed" />
        <TimeControls />
      </div>

      <div className="game-content">
        <div className="game-main">
          {/* Main game content will go here */}
          <div className="placeholder-content">
            <h2>Middle Age Multiverse</h2>
            <p>Main game interface will be implemented in future sessions.</p>
            <p>This demonstrates the Time and News UI components from Session 11.</p>
          </div>
        </div>

        <aside className="game-sidebar">
          <NewsStream />
        </aside>
      </div>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <GameInitializer />
        <GameContainer />
      </div>
    </Provider>
  );
}

export default App;
