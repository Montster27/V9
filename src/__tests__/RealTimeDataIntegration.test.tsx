/**
 * /src/__tests__/RealTimeDataIntegration.test.tsx
 *
 * Tests for real-time data integration with UI components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ResourceDisplayConnected from '../interface/components/resources/ResourceDisplayEnhanced';
import NewsStreamConnected from '../interface/components/news/NewsStreamConnected';
import TimeControlsConnected from '../interface/components/time/TimeControlsConnected';
import { createDefaultResourcesState } from '../domain/models';
import { TimeValue } from '../domain/valueObjects/TimeValue';

// Mock Redux store with initial test state
const createMockStore = () => {
  // Create a real TimeValue instance for the test
  const initialGameTime = new TimeValue(new Date('1983-09-01T08:00:00'), true);

  return configureStore({
    reducer: {
      resources: (
        state = {
          ...createDefaultResourcesState(),
          initialized: true,
        },
        action
      ) => state,
      news: (
        state = {
          items: [
            {
              id: 'test-news-1',
              source: 'Test Source',
              title: 'Test News Title',
              content: 'Test news content for integration testing',
              timestamp: new Date().toISOString(),
              category: 'test',
            },
          ],
          initialized: true,
        },
        action
      ) => state,
      time: (
        state = {
          managerState: {
            currentTime: initialGameTime,
            isPaused: true,
            totalGeneratedSkillPoints: 0,
          },
          config: {
            realSecondsPerGameDay: 3,
            skillPointsPerGameHour: 1,
            newsUpdateFrequencyHours: 4,
            startPaused: true,
          },
          lastTickTimestamp: Date.now(),
          isInitialized: true,
          tickCount: 0,
          lastUpdateDuration: 0,
        },
        action
      ) => state,
      realTimeGameLoop: (
        state = {
          initialized: true,
          lastFrameTime: 0,
          lastTickTime: 0,
          fpsDisplay: 60,
          ticksPerSecond: 20,
          performanceWarning: false,
          gameLoopState: {
            isRunning: false,
            isPaused: true,
            startTime: 0,
            lastFrameTime: 0,
            frameCount: 0,
            tickCount: 0,
            fps: 60,
            ticksThisFrame: 0,
            simulationTime: 0,
            realTime: 0,
          },
        },
        action
      ) => state,
    },
  });
};

describe('Real-Time Data Integration', () => {
  test('ResourceDisplayConnected renders with Redux state data', () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <ResourceDisplayConnected />
      </Provider>
    );

    // Check for specific elements that should be present
    expect(screen.getByText(/Energy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Stress:/i)).toBeInTheDocument();
    expect(screen.getByText(/Knowledge:/i)).toBeInTheDocument();
    expect(screen.getByText(/Money:/i)).toBeInTheDocument();
  });

  test('NewsStreamConnected renders with Redux state data', () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <NewsStreamConnected />
      </Provider>
    );

    // Check for news content
    expect(screen.getByText('Test News Title')).toBeInTheDocument();
    expect(screen.getByText('Test news content for integration testing')).toBeInTheDocument();
    expect(screen.getByText('Test Source')).toBeInTheDocument();
  });

  test('TimeControlsConnected renders with Redux state data', () => {
    const mockStore = createMockStore();

    render(
      <Provider store={mockStore}>
        <TimeControlsConnected autoStart={false} />
      </Provider>
    );

    // Check for date display
    expect(screen.getByText(/Sep 1, 1983/i)).toBeInTheDocument();

    // Check for time display
    expect(screen.getByText('08:00')).toBeInTheDocument();

    // Check for speed controls
    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });
});
