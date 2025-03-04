/**
 * /src/App.tsx
 *
 * Main application component that integrates all UI components
 * and provides the overall game layout.
 */

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './infrastructure/state/store';
import { initializeTimeManager } from './infrastructure/state/slices/timeSlice';
import { initializeUseOfTimeManager } from './infrastructure/state/slices/useOfTimeSlice';
import { TimeDisplay, TimeControls } from './interface/components/time';
import { NewsStream } from './interface/components/news';
import {
  TimeAllocationSliders,
  TimeDistributionView,
  ResourceImpactPreview,
} from './interface/components/useOfTime';
import './App.css';

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

// Resource Statistics Component
const ResourceStatistics: React.FC = () => {
  // This would normally pull from a resources slice, but for now it's a placeholder
  return (
    <div className="resource-statistics">
      <h3>Resources</h3>
      <div className="resource-grid">
        <div className="resource-item">
          <span className="resource-label">Energy:</span>
          <span className="resource-value">75/100</span>
          <div className="resource-bar">
            <div className="resource-bar-fill" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="resource-item">
          <span className="resource-label">Stress:</span>
          <span className="resource-value">30/100</span>
          <div className="resource-bar">
            <div className="resource-bar-fill stress" style={{ width: '30%' }}></div>
          </div>
        </div>
        <div className="resource-item">
          <span className="resource-label">Knowledge:</span>
          <span className="resource-value">1,250</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Money:</span>
          <span className="resource-value">$2,300</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Social:</span>
          <span className="resource-value">850</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Skill Points:</span>
          <span className="resource-value">45</span>
        </div>
      </div>
    </div>
  );
};

// Narrative Panel Component
const NarrativePanel: React.FC = () => {
  return (
    <div className="narrative-panel">
      <h3>Current Situation</h3>
      <div className="narrative-content">
        <p className="narrative-text">
          You've settled into your first semester at Evergreen State University. Your time
          management decisions are starting to show results, but you've noticed some strange
          connections forming between certain faculty members and local business leaders.
        </p>
        <p className="narrative-text">
          The Economics department seems particularly interested in a new technology concept called
          "cellular communications." With your future knowledge, you recognize this as a pivotal
          moment in tech history.
        </p>
        <div className="narrative-clue">
          <h4>New Clue Discovered</h4>
          <p>
            The Dean's calendar shows regular meetings with representatives from a company called
            "MobileTech Ventures".
          </p>
        </div>
      </div>
    </div>
  );
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
          <div className="main-grid">
            <div className="grid-item resources-section">
              <ResourceStatistics />
            </div>

            <div className="grid-item narrative-section">
              <NarrativePanel />
            </div>

            <div className="grid-item time-allocation-section">
              <h3>Weekly Time Allocation</h3>
              <TimeAllocationSliders />
            </div>

            <div className="grid-item time-distribution-section">
              <h3>Time Distribution</h3>
              <TimeDistributionView />
            </div>

            <div className="grid-item resource-impact-section">
              <h3>Resource Impact Preview</h3>
              <ResourceImpactPreview />
            </div>
          </div>
        </div>

        <aside className="game-sidebar">
          <h3 className="sidebar-title">News & Events</h3>
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
