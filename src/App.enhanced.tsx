/**
 * /src/App.enhanced.tsx
 *
 * Enhanced version of App.tsx with redesigned layout to match mockup
 */

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './infrastructure/state/store';
import { initializeTimeManager } from './infrastructure/state/slices/timeSlice';
import { initializeUseOfTimeManager } from './infrastructure/state/slices/useOfTimeSlice';
import { TimeDisplay, TimeControlsEnhanced } from './interface/components/time';
import { NewsStream } from './interface/components/news';
import {
  TimeAllocationSliders,
  TimeDistributionView,
  ResourceImpactPreview,
} from './interface/components/useOfTime';
import { ResourceDisplay } from './interface/components/resources';
import { FeedbackButton } from './interface/components/feedback';
import { TutorialOverlay, HelpPanel, Tooltip } from './interface/components/help';
import { helpSystem, TutorialStep } from './domain/services/help/HelpSystem';
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

// Enhanced Time Allocation Panel (Left Side)
const TimeAllocationPanel: React.FC = () => {
  // Mock data for demonstration
  const timeAllocations = [
    { type: 'study', label: 'Study', value: 6, percentage: 25, impacts: '+Knowledge, -Energy' },
    { type: 'work', label: 'Work', value: 4.8, percentage: 20, impacts: '+Money, -Energy' },
    { type: 'social', label: 'Social', value: 3.6, percentage: 15, impacts: '+Social, -Energy' },
    { type: 'rest', label: 'Rest', value: 7.2, percentage: 30, impacts: '+Energy, -Stress' },
    {
      type: 'exercise',
      label: 'Exercise',
      value: 2.4,
      percentage: 10,
      impacts: '+Health, -Stress, -Energy',
    },
  ];

  const resourceImpacts = [
    { label: 'Knowledge', value: '+210', trend: 'up', type: 'positive' },
    { label: 'Money', value: '+$504', trend: 'up', type: 'positive' },
    { label: 'Energy', value: '-30', trend: 'down', type: 'negative' },
    { label: 'Social', value: '+75', trend: 'up', type: 'positive' },
    { label: 'Stress', value: '+15', trend: 'up', type: 'negative' },
    { label: 'Health', value: '+8', trend: 'up', type: 'positive' },
  ];

  return (
    <div className="time-allocation-panel">
      <div className="panel-header">
        <h3 className="panel-title">Weekly Time Allocation</h3>
        <Tooltip content="Adjust how you spend your time each day" position="bottom">
          <div className="help-icon">?</div>
        </Tooltip>
      </div>
      <div className="panel-body">
        <div className="time-sliders">
          {timeAllocations.map((allocation) => (
            <div key={allocation.type} className="slider-container">
              <div className="slider-header">
                <span className="slider-label">{allocation.label}</span>
                <span className="slider-value">
                  {allocation.value.toFixed(1)} hrs/day ({allocation.percentage}%)
                </span>
              </div>
              <div className="slider-impacts">{allocation.impacts}</div>
              <div className="slider-bar">
                <div
                  className={`slider-fill ${allocation.type}`}
                  style={{ width: `${allocation.percentage}%` }}
                ></div>
                <div
                  className={`slider-knob ${allocation.type}`}
                  style={{ left: `${allocation.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="time-distribution">
          <h4 className="impact-title">Time Distribution</h4>
          <div className="distribution-chart">
            {timeAllocations.map((allocation) => (
              <div
                key={allocation.type}
                className={`chart-segment ${allocation.type}`}
                style={{ width: `${allocation.percentage}%` }}
              ></div>
            ))}
          </div>
          <div className="chart-legend">
            {timeAllocations.map((allocation) => (
              <div key={allocation.type} className="legend-item">
                <div className={`color-dot ${allocation.type}`}></div>
                <span>{allocation.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="impact-preview">
          <h4 className="impact-title">Weekly Resource Impact</h4>
          <div className="impact-grid">
            {resourceImpacts.map((impact) => (
              <div key={impact.label} className="impact-item">
                <span className="impact-label">{impact.label}:</span>
                <span className={`impact-value ${impact.type}`}>
                  {impact.value}
                  <span className="trend-icon">{impact.trend === 'up' ? '↑' : '↓'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Narrative Panel
const NarrativePanel: React.FC = () => {
  return (
    <div className="narrative-panel">
      <div className="panel-header">
        <h3 className="panel-title">Current Situation</h3>
        <Tooltip content="Your current storyline progress and discoveries" position="left">
          <div className="help-icon">?</div>
        </Tooltip>
      </div>
      <div className="narrative-body">
        <div className="narrative-text">
          <p>
            You've settled into your first semester at Evergreen State University. Your time
            management decisions are starting to show results, but you've noticed some strange
            connections forming between certain faculty members and local business leaders.
          </p>
          <p>
            The Economics department seems particularly interested in a new technology concept
            called "cellular communications." With your future knowledge, you recognize this as a
            pivotal moment in tech history.
          </p>
        </div>
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

// Enhanced Resources Panel
const ResourcesPanel: React.FC = () => {
  // Mock resource data
  const resourceData = {
    energy: { value: 75, max: 100, trend: { direction: 'down', rate: 'slow' } },
    stress: { value: 30, max: 100, trend: { direction: 'up', rate: 'slow' } },
    knowledge: { value: 1250, trend: { direction: 'up', rate: 'moderate' } },
    money: { value: 2300, trend: { direction: 'stable', rate: 'slow' } },
    social: { value: 850, trend: { direction: 'up', rate: 'slow' } },
    skillPoints: { value: 45, trend: { direction: 'up', rate: 'moderate' } },
  };

  return (
    <div className="resources-panel">
      <div className="panel-header">
        <h3 className="panel-title">Resources</h3>
        <Tooltip content="Your current resources and their trends" position="left">
          <div className="help-icon">?</div>
        </Tooltip>
      </div>
      <div className="resources-body">
        <div className="resource-grid">
          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Energy:</span>
              <span className="resource-value">
                {resourceData.energy.value}/100
                <span className="trend-icon trend-down">↓</span>
              </span>
            </div>
            <div className="resource-bar">
              <div
                className="resource-fill energy"
                style={{ width: `${resourceData.energy.value}%` }}
              ></div>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Stress:</span>
              <span className="resource-value">
                {resourceData.stress.value}/100
                <span className="trend-icon trend-up">↑</span>
              </span>
            </div>
            <div className="resource-bar">
              <div
                className="resource-fill stress"
                style={{ width: `${resourceData.stress.value}%` }}
              ></div>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Knowledge:</span>
              <span className="resource-value">
                {resourceData.knowledge.value.toLocaleString()}
                <span className="trend-icon trend-up">↑</span>
              </span>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Money:</span>
              <span className="resource-value">
                ${resourceData.money.value.toLocaleString()}
                <span className="trend-icon">→</span>
              </span>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Social:</span>
              <span className="resource-value">
                {resourceData.social.value.toLocaleString()}
                <span className="trend-icon trend-up">↑</span>
              </span>
            </div>
          </div>

          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-label">Skill Points:</span>
              <span className="resource-value">
                {resourceData.skillPoints.value}
                <span className="trend-icon trend-up">↑</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced News Panel
const NewsPanel: React.FC = () => {
  const newsItems = [
    {
      source: 'Campus Herald',
      time: '12:00 AM',
      title: 'News Update: 9/1/1983',
      content: 'This is a simulated news update for 9/1/1983, 12:00:00 AM.',
    },
    {
      source: 'Campus Herald',
      time: '12:00 AM',
      title: 'News Update: 9/1/1983',
      content: 'This is a simulated news update for 9/1/1983, 12:00:00 AM.',
    },
    {
      source: 'Campus Herald',
      time: '12:00 AM',
      title: 'News Update: 9/1/1983',
      content: 'This is a simulated news update for 9/1/1983, 12:00:00 AM.',
    },
  ];

  return (
    <div className="news-panel">
      <div className="panel-header">
        <h3 className="panel-title">News & Events</h3>
        <Tooltip content="Updates on how your actions affect the world" position="left">
          <div className="help-icon">?</div>
        </Tooltip>
      </div>
      <div className="news-body">
        {newsItems.map((item, index) => (
          <div key={index} className="news-item">
            <div className="news-source">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
            <div className="news-title">{item.title}</div>
            <div className="news-content">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main game container with tutorial overlay
const GameContainer: React.FC = () => {
  // State for tutorial
  const [isTutorialActive, setTutorialActive] = useState(
    !helpSystem.isTutorialCompleted('welcome')
  );
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);

  // Get tutorial steps on mount
  useEffect(() => {
    const welcomeTutorial = helpSystem.getTutorial('welcome');
    if (welcomeTutorial) {
      setTutorialSteps(welcomeTutorial.steps);
    }
  }, []);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setTutorialActive(false);
    helpSystem.completeTutorial('welcome');
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (feedback: any) => {
    console.log('Feedback received:', feedback);
    // In a real implementation, this would send feedback to a server
    alert('Thank you for your feedback! It will help us improve the game.');
  };

  return (
    <div className="game-container">
      {/* Game Header */}
      <div className="game-header">
        <TimeDisplay format="detailed" />
        <TimeControlsEnhanced />
      </div>

      {/* Time Allocation Panel (Left Side) */}
      <TimeAllocationPanel />

      {/* Main Content (Center) */}
      <div className="main-content">
        {/* Resources Panel */}
        <div data-testid="resource-display">
          <ResourcesPanel />
        </div>

        {/* Narrative Panel */}
        <NarrativePanel />
      </div>

      {/* News Panel (Right Side) */}
      <div data-testid="news-stream" className="news-panel">
        <NewsPanel />
      </div>

      {/* Tutorial Overlay */}
      {isTutorialActive && tutorialSteps.length > 0 && (
        <TutorialOverlay
          steps={tutorialSteps}
          active={isTutorialActive}
          onComplete={handleTutorialComplete}
        />
      )}

      {/* Feedback Button */}
      <div data-testid="feedback-button">
        <FeedbackButton onSubmit={handleFeedbackSubmit} />
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
