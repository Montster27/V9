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
}));

describe('App Integration Tests', () => {
  it('renders the main game UI with integrated components', () => {
    render(<App />);

    // Check that all main sections are rendered
    expect(screen.getByText('Weekly Time Allocation')).toBeDefined();
    expect(screen.getByText('Time Distribution')).toBeDefined();
    expect(screen.getByText('Resource Impact Preview')).toBeDefined();
    expect(screen.getByText('Resources')).toBeDefined();
    expect(screen.getByText('Current Situation')).toBeDefined();
    expect(screen.getByText('News & Events')).toBeDefined();

    // Check that all component mocks are rendered
    expect(screen.getByTestId('time-display')).toBeDefined();
    expect(screen.getByTestId('time-controls')).toBeDefined();
    expect(screen.getByTestId('news-stream')).toBeDefined();
    expect(screen.getByTestId('time-allocation-sliders')).toBeDefined();
    expect(screen.getByTestId('time-distribution-view')).toBeDefined();
    expect(screen.getByTestId('resource-impact-preview')).toBeDefined();
  });

  it('displays resource statistics', () => {
    render(<App />);

    // Check for resource elements
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
