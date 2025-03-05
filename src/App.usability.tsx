/**
 * /src/App.usability.tsx
 *
 * Enhanced version of App.tsx with improved usability features:
 * - Contextual tooltips and help panels
 * - Visual feedback for user actions
 * - Onboarding tutorial system
 * - Integrated feedback collection
 */

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './infrastructure/state/store';
import { initializeTimeManager } from './infrastructure/state/slices/timeSlice';
import { initializeUseOfTimeManager } from './infrastructure/state/slices/useOfTimeSlice';
import { TimeDisplay, TimeControlsEnhanced } from './interface/components/time';
import { NewsStreamEnhanced } from './interface/components/news';
import {
  TimeAllocationSlidersEnhanced,
  TimeDistributionView,
  ResourceImpactPreview,
} from './interface/components/useOfTime';
import { ResourceDisplayEnhanced } from './interface/components/resources';
import { FeedbackButton } from './interface/components/feedback';
import { TutorialOverlay, HelpPanel, Tooltip } from './interface/components/help';
import { helpSystem, Tutorial, TutorialStep } from './domain/services/help/HelpSystem';
import { finalizeHelpSystem } from './interface/components/help/finalize-help-system';
import './App.enhanced.css';

// Initialize the help system with enhanced content
finalizeHelpSystem();

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

// Enhanced Narrative Panel
const NarrativePanel: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="narrative-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3 className="panel-title">Current Situation</h3>
          <Tooltip content="Your current storyline progress and discoveries" position="bottom">
            <span className="help-icon">ⓘ</span>
          </Tooltip>
        </div>
        <button
          className="narrative-help-button"
          onClick={() => setShowHelp(!showHelp)}
          aria-expanded={showHelp}
          aria-controls="narrative-help-panel"
        >
          {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>

      {showHelp && (
        <div id="narrative-help-panel" className="narrative-help-panel">
          <HelpPanel
            title="About the Narrative System"
            content={
              <>
                <p>
                  The narrative panel shows your current progress in the game's storyline and
                  provides context for your choices.
                </p>
                <p>
                  <strong>Key features:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Situation updates</strong> inform you about the current state of the
                    world
                  </li>
                  <li>
                    <strong>Clue discoveries</strong> reveal hidden elements of the conspiracy
                  </li>
                  <li>
                    <strong>Character relationships</strong> show how your interactions affect NPCs
                  </li>
                  <li>
                    <strong>Timeline developments</strong> indicate how your choices alter history
                  </li>
                </ul>
                <p>
                  Pay close attention to narrative clues as they can lead to unique opportunities
                  and insights.
                </p>
              </>
            }
            defaultOpen={true}
          />
        </div>
      )}

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
          <div className="clue-icon">🔍</div>
          <p>
            The Dean's calendar shows regular meetings with representatives from a company called
            "MobileTech Ventures".
          </p>
          <div className="clue-actions">
            <button className="clue-action-button">Investigate Further</button>
            <Tooltip content="Record this clue for future reference" position="top">
              <button className="clue-action-button secondary">Save to Notes</button>
            </Tooltip>
          </div>
        </div>
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
  const [activeTutorial, setActiveTutorial] = useState<string>('welcome');
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);

  // Get tutorial steps on mount
  useEffect(() => {
    const tutorial = helpSystem.getTutorial(activeTutorial);
    if (tutorial) {
      setTutorialSteps(tutorial.steps);
    }
  }, [activeTutorial]);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setTutorialActive(false);
    helpSystem.completeTutorial(activeTutorial);
  };

  // Start a specific tutorial
  const startTutorial = (tutorialId: string) => {
    const tutorial = helpSystem.getTutorial(tutorialId);
    if (tutorial) {
      setActiveTutorial(tutorialId);
      setTutorialActive(true);
    }
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
        <div className="game-title">Middle Age Multiverse</div>
        <div className="game-controls">
          <TimeDisplay format="detailed" />
          <TimeControlsEnhanced />
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="game-layout">
        {/* Left Panel - Time Allocation */}
        <div className="game-panel left-panel">
          <TimeAllocationSlidersEnhanced />
          <ResourceImpactPreview />
        </div>

        {/* Center Panel - Main Content */}
        <div className="game-panel center-panel">
          <div data-testid="resource-display">
            <ResourceDisplayEnhanced />
          </div>
          <NarrativePanel />
        </div>

        {/* Right Panel - News and Events */}
        <div className="game-panel right-panel" data-testid="news-stream">
          <NewsStreamEnhanced />
        </div>
      </div>

      {/* Tutorial Help Drawer */}
      <div className="help-drawer">
        <div className="help-drawer-header">
          <h3>Game Tutorials</h3>
        </div>
        <div className="help-drawer-content">
          <div className="tutorial-list">
            {helpSystem.getAllTutorials().map((tutorial) => (
              <button
                key={tutorial.id}
                className={`tutorial-button ${
                  helpSystem.isTutorialCompleted(tutorial.id) ? 'completed' : ''
                }`}
                onClick={() => startTutorial(tutorial.id)}
              >
                {tutorial.name}
                {helpSystem.isTutorialCompleted(tutorial.id) && (
                  <span className="completed-icon">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
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
      <div data-testid="feedback-button" className="feedback-container">
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
