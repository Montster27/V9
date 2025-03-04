/**
 * /src/interface/components/useOfTime/ResourceImpactPreview.test.tsx
 *
 * Tests for the ResourceImpactPreview component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ResourceImpactPreview from './ResourceImpactPreview';
import useOfTimeReducer, {
  initializeUseOfTimeManager,
  updateTimeAllocation,
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

describe('ResourceImpactPreview Component', () => {
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
        <ResourceImpactPreview />
      </Provider>
    );

    expect(screen.getByText('Weekly Resource Impact')).toBeInTheDocument();
  });

  it('displays all resource categories', () => {
    render(
      <Provider store={store}>
        <ResourceImpactPreview />
      </Provider>
    );

    expect(screen.getByText('Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Money')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('Stress')).toBeInTheDocument();
  });

  it('shows positive values in green and negative values in red', () => {
    // Create a custom store for this test with no penalties
    const testStore = createMockStore();

    // Start with a clean slate
    testStore.dispatch(
      initializeUseOfTimeManager({
        initialAllocation: createDefaultTimeAllocation(),
      })
    );

    // First render with initial state
    const { rerender } = render(
      <Provider store={testStore}>
        <ResourceImpactPreview />
      </Provider>
    );

    // Then update the allocation (wrap in act)
    act(() => {
      testStore.dispatch(
        updateTimeAllocation({
          activityType: ActivityType.STUDY,
          hoursPerDay: 10, // Increase study time to generate more knowledge
        })
      );
    });

    // Re-render to reflect state changes
    rerender(
      <Provider store={testStore}>
        <ResourceImpactPreview />
      </Provider>
    );

    // Use getAllByText to handle multiple matches and find one with the correct class
    const knowledgeValues = screen.getAllByText(/\+\d+\.\d+ points/);
    const positiveValue = knowledgeValues.find((el) => el.classList.contains('positive'));
    expect(positiveValue).toHaveClass('positive');

    // Energy should be negative (consumed by activities)
    const energyValue = screen.getByText(/-\d+\.\d+ points/);
    expect(energyValue).toHaveClass('negative');
  });

  it('displays stress penalties when applicable', () => {
    // We need to create a very specific allocation where rest is high enough
    // to not trigger penalties
    const noStressPenaltiesAllocation = createDefaultTimeAllocation();

    // Ensure REST is set to exactly 10 hours (more than 8 minimum to avoid penalties)
    const adjustedAllocation = adjustTimeAllocation(
      noStressPenaltiesAllocation,
      ActivityType.REST,
      10
    );

    // Create a fresh store for this test
    const testStore = createMockStore();

    // Initialize with the no-penalties allocation
    testStore.dispatch(
      initializeUseOfTimeManager({
        initialAllocation: adjustedAllocation,
      })
    );

    // Render with the initial no-stress-penalty state
    const { rerender, unmount } = render(
      <Provider store={testStore}>
        <ResourceImpactPreview />
      </Provider>
    );

    // Unmount and check if the component is actually showing penalties in the default state
    unmount();

    // Create another custom store with an allocation that will definitely show penalties
    const penaltyStore = createMockStore();

    // Create allocation with insufficient rest (4 hours)
    const stressPenaltyAllocation = adjustTimeAllocation(
      createDefaultTimeAllocation(),
      ActivityType.REST,
      4 // Far below 8 hours minimum, should trigger penalties
    );

    // Initialize this store with the penalty allocation
    penaltyStore.dispatch(
      initializeUseOfTimeManager({
        initialAllocation: stressPenaltyAllocation,
      })
    );

    // Render with the penalty store
    render(
      <Provider store={penaltyStore}>
        <ResourceImpactPreview />
      </Provider>
    );

    // Now check that penalties section is visible
    const penaltiesSection = screen.getByText('Stress Penalties');
    expect(penaltiesSection).toBeInTheDocument();
    expect(screen.getByText(/additional stress/i)).toBeInTheDocument();
  });

  it('displays the total stress impact', () => {
    render(
      <Provider store={store}>
        <ResourceImpactPreview />
      </Provider>
    );

    expect(screen.getByText('Total Stress Impact:')).toBeInTheDocument();
  });

  it('shows explanatory note about projections', () => {
    render(
      <Provider store={store}>
        <ResourceImpactPreview />
      </Provider>
    );

    expect(screen.getByText(/These projections show weekly resource changes/i)).toBeInTheDocument();
  });
});
