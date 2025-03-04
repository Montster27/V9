/**
 * /src/interface/components/useOfTime/TimeAllocationSliders.test.tsx
 *
 * Tests for the TimeAllocationSliders component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TimeAllocationSliders from './TimeAllocationSliders';
import useOfTimeReducer, {
  updateTimeAllocation,
  resetTimeAllocations,
  initializeUseOfTimeManager,
} from '../../../infrastructure/state/slices/useOfTimeSlice';
import { ActivityType, createDefaultTimeAllocation } from '../../../domain/models/UseOfTime';

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      useOfTime: useOfTimeReducer,
    },
  });
};

describe('TimeAllocationSliders Component', () => {
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

  it('renders all activity sliders correctly', () => {
    render(
      <Provider store={store}>
        <TimeAllocationSliders />
      </Provider>
    );

    // Check that all activity types are rendered
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('Rest')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();

    // Check that sliders are present
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(5); // One for each activity type
  });

  it('handles slider changes correctly', () => {
    const { getAllByRole } = render(
      <Provider store={store}>
        <TimeAllocationSliders />
      </Provider>
    );

    // Get all sliders
    const sliders = getAllByRole('slider');

    // Change the value of the Study slider (first one)
    fireEvent.change(sliders[0], { target: { value: 10 } });

    // Check if the action was dispatched
    const state = store.getState();
    expect(
      state.useOfTime.managerState.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay
    ).toBeCloseTo(10);
  });

  it('resets allocations when reset button is clicked', () => {
    const { getByRole, getAllByRole } = render(
      <Provider store={store}>
        <TimeAllocationSliders />
      </Provider>
    );

    // First, change a slider value
    const sliders = getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: 10 } });

    // Then click the reset button
    const resetButton = getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // Check if values were reset to default
    const state = store.getState();
    expect(
      state.useOfTime.managerState.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay
    ).not.toBeCloseTo(10);
    // Default allocation for study should be restored
    expect(
      state.useOfTime.managerState.currentAllocation.allocations[ActivityType.STUDY].hoursPerDay
    ).toBeCloseTo(4);
  });

  it('displays correct weekly hours and percentages', () => {
    render(
      <Provider store={store}>
        <TimeAllocationSliders />
      </Provider>
    );

    // Default value for rest is 8 hours per day
    expect(screen.getByText(/56.0 hours\/week/i)).toBeInTheDocument(); // 8 hours * 7 days = 56 hours per week

    // Check if percentage is displayed
    expect(screen.getByText(/\(33.3%\)/i)).toBeInTheDocument(); // 33.3% = 56/168 hours
  });
});
