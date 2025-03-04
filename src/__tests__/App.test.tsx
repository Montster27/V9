/**
 * /src/__tests__/App.test.tsx
 *
 * Tests for the main App component integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the components we're integrating
vi.mock('../interface/components/time/TimeDisplay', () => ({
  default: () => <div data-testid="time-display">Time Display Mock</div>,
}));

vi.mock('../interface/components/time/TimeControls', () => ({
  default: () => <div data-testid="time-controls">Time Controls Mock</div>,
}));

vi.mock('../interface/components/time/TimeControlsEnhanced', () => ({
  default: () => <div data-testid="time-controls-enhanced">Time Controls Enhanced Mock</div>,
}));

vi.mock('../interface/components/news/NewsStream', () => ({
  default: () => <div data-testid="news-stream">News Stream Mock</div>,
}));

vi.mock('../interface/components/useOfTime/TimeAllocationSliders', () => ({
  default: () => <div data-testid="time-allocation-sliders">Time Allocation Sliders Mock</div>,
}));

vi.mock('../interface/components/useOfTime/TimeDistributionView', () => ({
  default: () => <div data-testid="time-distribution-view">Time Distribution View Mock</div>,
}));

vi.mock('../interface/components/useOfTime/ResourceImpactPreview', () => ({
  default: () => <div data-testid="resource-impact-preview">Resource Impact Preview Mock</div>,
}));

vi.mock('../interface/components/resources/ResourceDisplay', () => ({
  default: () => <div data-testid="resource-display">Resource Display Mock</div>,
}));

vi.mock('../interface/components/feedback/FeedbackButton', () => ({
  default: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <div data-testid="feedback-button">Feedback Button Mock</div>
  ),
}));

vi.mock('../interface/components/help/Tooltip', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

vi.mock('../interface/components/help/HelpPanel', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="help-panel">{children}</div>
  ),
}));

vi.mock('../interface/components/help/TutorialOverlay', () => ({
  default: () => <div data-testid="tutorial-overlay">Tutorial Overlay Mock</div>,
}));

// Mock Redux
vi.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => children,
  useDispatch: () => vi.fn(),
  useSelector: vi.fn().mockImplementation((selector) => {
    // Mock the state for useSelector calls
    const state = {
      time: {
        managerState: {
          currentTime: new Date(),
          isPaused: true,
          gameDaysPassed: 0,
        },
        isInitialized: true,
      },
      useOfTime: {
        managerState: {
          currentAllocation: {
            totalHours: 24,
            allocations: {},
          },
          resourceImpacts: {},
          stressPenalties: {},
        },
        isInitialized: true,
      },
    };
    return selector(state);
  }),
}));

// Mock the store
vi.mock('../infrastructure/state/store', () => ({
  store: {},
  RootState: {},
  // Add the missing hooks
  useAppDispatch: () => vi.fn(),
  useAppSelector: vi.fn().mockImplementation((selector) => {
    // Mock the state for useAppSelector calls
    const state = {
      time: {
        managerState: {
          currentTime: new Date(),
          isPaused: true,
          gameDaysPassed: 0,
        },
        isInitialized: true,
      },
      useOfTime: {
        managerState: {
          currentAllocation: {
            totalHours: 24,
            allocations: {},
          },
          resourceImpacts: {},
          stressPenalties: {},
        },
        isInitialized: true,
      },
      gameLoop: {
        isPaused: true,
      },
    };
    return selector(state);
  }),
}));

// Mock the HelpSystem service
vi.mock('../domain/services/help/HelpSystem', () => ({
  helpSystem: {
    isTutorialCompleted: vi.fn().mockReturnValue(true),
    getTutorial: vi.fn().mockReturnValue({
      steps: [],
    }),
    completeTutorial: vi.fn(),
  },
  TutorialStep: {},
}));

describe('App Integration Tests', () => {
  it('renders the main game UI with integrated components', () => {
    render(<App />);

    // Check for presence of our core mocked components
    expect(screen.getByTestId('time-display')).toBeDefined();
    expect(screen.getByTestId('time-controls-enhanced')).toBeDefined();

    // Look for Weekly Time Allocation in the actual rendered content
    // instead of looking for the mocked component that might not be there
    expect(screen.getByText('Weekly Time Allocation')).toBeDefined();

    // Check for narrative content directly
    expect(screen.getByText(/You've settled into your first semester/)).toBeDefined();
  });

  it('displays resource statistics', () => {
    render(<App />);

    // Check for Resources title
    expect(screen.getByText('Resources')).toBeDefined();

    // Look for specific resource labels
    expect(screen.getByText('Energy:')).toBeDefined();
    expect(screen.getByText('Stress:')).toBeDefined();
    expect(screen.getByText('Knowledge:')).toBeDefined();
    expect(screen.getByText('Money:')).toBeDefined();
    expect(screen.getByText('Social:')).toBeDefined();
    expect(screen.getByText('Skill Points:')).toBeDefined();
  });

  it('displays narrative content', () => {
    render(<App />);

    // Check for narrative elements
    expect(screen.getByText('Current Situation')).toBeDefined();
    expect(screen.getByText(/You've settled into your first semester/)).toBeDefined();
    expect(screen.getByText('New Clue Discovered')).toBeDefined();
  });
});
