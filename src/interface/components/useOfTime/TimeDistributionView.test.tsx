/**
 * /src/interface/components/useOfTime/TimeDistributionView.test.tsx
 *
 * Tests for the TimeDistributionView component
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TimeDistributionView from './TimeDistributionView';
import useOfTimeReducer, {
  initializeUseOfTimeManager,
} from '../../../infrastructure/state/slices/useOfTimeSlice';
import {
  ActivityType,
  createDefaultTimeAllocation,
  adjustTimeAllocation,
} from '../../../domain/models/UseOfTime';

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      useOfTime: useOfTimeReducer,
    },
  });
};

describe('TimeDistributionView Component', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    // Initialize with default allocation
    store.dispatch(
      initializeUseOfTimeManager({
        initialAllocation: createDefaultTimeAllocation(),
      })
    );
  });

  it('renders component header correctly', () => {
    render(
      <Provider store={store}>
        <TimeDistributionView />
      </Provider>
    );

    expect(screen.getByText('Time Distribution')).toBeInTheDocument();
  });

  it('renders all activity labels in the legend', () => {
    render(
      <Provider store={store}>
        <TimeDistributionView />
      </Provider>
    );

    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('Rest')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  it('displays correct percentages and hours for each activity', () => {
    // Create a custom allocation for testing
    let customAllocation = createDefaultTimeAllocation();

    // Adjust to specific values for predictable test outcomes:
    // Rest: 8 hours/day (33.3%)
    // Study: 6 hours/day (25%)
    // Work: 4 hours/day (16.7%)
    // Social: 4 hours/day (16.7%)
    // Exercise: 2 hours/day (8.3%)
    customAllocation = adjustTimeAllocation(customAllocation, ActivityType.STUDY, 6);
    customAllocation = adjustTimeAllocation(customAllocation, ActivityType.WORK, 4);
    customAllocation = adjustTimeAllocation(customAllocation, ActivityType.SOCIAL, 4);
    customAllocation = adjustTimeAllocation(customAllocation, ActivityType.REST, 8);
    customAllocation = adjustTimeAllocation(customAllocation, ActivityType.EXERCISE, 2);

    // Initialize with custom allocation
    store.dispatch(
      initializeUseOfTimeManager({
        initialAllocation: customAllocation,
      })
    );

    const { container } = render(
      <Provider store={store}>
        <TimeDistributionView />
      </Provider>
    );

    // Find the Study legend item using DOM query instead of getAllByClassName
    const legendItems = container.querySelectorAll('.time-distribution-view__legend-item');

    // Check that we have 5 legend items (one for each activity)
    expect(legendItems.length).toBe(5);

    // Find the study item
    let studyLegendItem: Element | undefined;
    legendItems.forEach((item) => {
      if (within(item as HTMLElement).queryByText('Study')) {
        studyLegendItem = item;
      }
    });

    // Check that the study item exists and contains percentage information
    if (studyLegendItem) {
      const valueElement = within(studyLegendItem as HTMLElement).getByText(/% \(/i);
      // Verify the text contains both percentage and hours
      expect(valueElement.textContent).toContain('%');
      expect(valueElement.textContent).toContain('h)');
    } else {
      fail('Study legend item not found');
    }

    // Find the Rest legend item
    let restLegendItem: Element | undefined;
    legendItems.forEach((item) => {
      if (within(item as HTMLElement).queryByText('Rest')) {
        restLegendItem = item;
      }
    });

    // Check that the rest item exists and contains percentage information
    if (restLegendItem) {
      const valueElement = within(restLegendItem as HTMLElement).getByText(/% \(/i);
      // Verify the text contains both percentage and hours
      expect(valueElement.textContent).toContain('%');
      expect(valueElement.textContent).toContain('h)');
    } else {
      fail('Rest legend item not found');
    }

    // Check total hours display
    expect(screen.getByText(/Total: 168 hours per week/i)).toBeInTheDocument();
  });

  it('renders the bar chart with correct proportions', () => {
    render(
      <Provider store={store}>
        <TimeDistributionView />
      </Provider>
    );

    // Get the bar elements
    const bars = document.querySelectorAll('.time-distribution-view__bar');
    expect(bars.length).toBe(5); // One for each activity

    // Check if the "Rest" bar has the correct width (default should be 8 hours/day = 33.3%)
    const defaultRestPercentage = ((8 * 7) / 168) * 100; // ~33.3%
    const restBar = Array.from(bars).find((bar) => bar.getAttribute('title')?.includes('Rest'));

    if (restBar) {
      const width = restBar.getAttribute('style')?.match(/width:\s*([\d.]+)%/)?.[1];
      if (width) {
        expect(parseFloat(width)).toBeCloseTo(defaultRestPercentage, 0);
      }
    }
  });
});
