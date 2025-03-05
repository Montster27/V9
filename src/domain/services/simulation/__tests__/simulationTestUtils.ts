/**
 * /src/domain/services/simulation/__tests__/simulationTestUtils.ts
 *
 * Utilities for testing simulation services
 */

import {
  GameSimulationService,
  ResourceCalculationService,
  ActivityImpactService,
  TimeProgressionService,
  EventGenerationService,
} from '../';
import { createDefaultResourcesState, ResourcesState } from '../../../models/Resource';
import { createDefaultTimeAllocation, WeeklyTimeAllocation } from '../../../models/UseOfTime';
import { GameEvent } from '../../../models/Event';

/**
 * Create a mock simulation setup for testing
 * @returns Test simulation setup
 */
export function createTestSimulation() {
  // Create individual services with test configurations
  const resourceService = new ResourceCalculationService({
    baseEnergyRegen: 5,
    baseStressAccumulation: 1,
    baseStressRecovery: 2,
    skillPointsPerHour: 1,
    knowledgePerStudyHour: 5,
    moneyPerWorkHour: 3,
    socialPerSocialHour: 3,
  });

  const activityService = new ActivityImpactService({
    efficiencyFloor: 0.5,
    highStressPenalty: 0.3,
    lowEnergyPenalty: 0.4,
    skillBonus: 0.5,
  });

  const timeService = new TimeProgressionService({
    realSecondsPerGameDay: 0.01, // Fast for testing
    startDate: new Date(1983, 8, 1),
    startPaused: false, // Not paused for testing
    speedMultipliers: [1, 10, 100],
  });

  const eventService = new EventGenerationService({
    randomEventChance: 1.0, // Always generate for testing
    timeEventFrequency: 1, // Every hour for testing
    stressEventThreshold: 50,
    maxActiveEvents: 10, // High for testing
    eventTimeout: 3600, // Long timeout for testing
  });

  // Create main simulation service
  const simulationService = new GameSimulationService(
    {
      simulationTickRate: 10, // Fast ticks for testing
      maxEventsPerTick: 5, // More events for testing
      resourceUpdateInterval: 0.1, // Frequent updates for testing
    },
    resourceService,
    activityService,
    timeService,
    eventService
  );

  // Create initial test state
  const resources = createDefaultResourcesState();
  const allocation = createDefaultTimeAllocation();
  const testEvent = createTestEvent();

  // Set initial state
  simulationService.setResources(resources);
  simulationService.setTimeAllocation(allocation);

  return {
    simulationService,
    resourceService,
    activityService,
    timeService,
    eventService,
    initialResources: resources,
    initialAllocation: allocation,
    testEvent,
  };
}

/**
 * Create a test event for simulation testing
 * @returns Test event
 */
export function createTestEvent(): GameEvent {
  return {
    id: 'test_event_1',
    title: 'Test Event',
    description: 'This is a test event for simulation testing',
    trigger: { type: 'manual' },
    conditions: [],
    effects: [],
    choices: [
      {
        id: 'choice_1',
        text: 'Test Choice 1',
        requirements: [],
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'energy', value: -10 },
          { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 20 },
        ],
        stress: 5,
        energy: -10,
      },
      {
        id: 'choice_2',
        text: 'Test Choice 2',
        requirements: [],
        effects: [
          { type: 'MODIFY_RESOURCE', target: 'stress', value: -15 },
          { type: 'MODIFY_RESOURCE', target: 'social', value: 10 },
        ],
        stress: -15,
        energy: -5,
      },
    ],
    timeLimit: 60,
  } as GameEvent;
}

/**
 * Run a simulation for a specific number of ticks
 * @param simulation Simulation service
 * @param ticks Number of ticks to run
 * @returns Final simulation state
 */
export async function runSimulationTicks(
  simulation: GameSimulationService,
  ticks: number
): Promise<{
  resources: ResourcesState | null;
  events: GameEvent[];
  gameDate: Date;
}> {
  // Create a promise that resolves after the simulation runs
  return new Promise((resolve) => {
    let ticksRun = 0;
    let latestResources: ResourcesState | null = null;
    let latestEvents: GameEvent[] = [];

    // Set up a subscription to capture state
    const unsubscribe = simulation.subscribe((update) => {
      if (update.resourceUpdate) {
        latestResources = update.resourceUpdate;
      }

      if (update.newEvents.length > 0) {
        latestEvents = [...latestEvents, ...update.newEvents];
      }

      ticksRun++;

      if (ticksRun >= ticks) {
        // Unsubscribe and resolve
        unsubscribe();

        resolve({
          resources: latestResources,
          events: latestEvents,
          gameDate: simulation.getCurrentGameTime().getGameDate(),
        });
      }
    });

    // Start the simulation
    simulation.start();

    // Ensure we resolve even if not enough ticks happen
    setTimeout(() => {
      unsubscribe();
      simulation.stop();

      resolve({
        resources: latestResources,
        events: latestEvents,
        gameDate: simulation.getCurrentGameTime().getGameDate(),
      });
    }, 1000); // 1 second timeout
  });
}

/**
 * Apply a specific test scenario to a simulation
 * @param simulation Simulation service
 * @param scenario Scenario to apply
 */
export function applyTestScenario(
  simulation: GameSimulationService,
  scenario: 'highStress' | 'lowEnergy' | 'academicSuccess' | 'socialButterfly' | 'financialTrouble'
): void {
  const resources = simulation.getResources();
  if (!resources) return;

  switch (scenario) {
    case 'highStress':
      resources.stress.current = 85;
      resources.energy.current = 40;
      break;

    case 'lowEnergy':
      resources.energy.current = 15;
      resources.stress.current = 60;
      break;

    case 'academicSuccess':
      resources.knowledge = 5000;
      resources.energy.current = 60;
      resources.stress.current = 45;
      break;

    case 'socialButterfly':
      resources.social = 5000;
      resources.belonging.current = 90;
      resources.money = 1000;
      break;

    case 'financialTrouble':
      resources.money = 100;
      resources.stress.current = 70;
      break;
  }

  // Update simulation with modified resources
  simulation.setResources(resources);
}

/**
 * Create a test allocation for a specific activity focus
 * @param focus Activity to focus on
 * @returns Time allocation with focus
 */
export function createFocusedAllocation(
  focus: 'study' | 'work' | 'social' | 'exercise' | 'rest'
): WeeklyTimeAllocation {
  const allocation = createDefaultTimeAllocation();

  // Reset all allocations
  Object.keys(allocation.allocations).forEach((key) => {
    allocation.allocations[key as keyof typeof allocation.allocations] = 0;
  });

  // Set focused activity high, and distribute remaining hours
  switch (focus) {
    case 'study':
      allocation.allocations.study = 10;
      allocation.allocations.rest = 8;
      allocation.allocations.work = 2;
      allocation.allocations.social = 2;
      allocation.allocations.exercise = 2;
      break;

    case 'work':
      allocation.allocations.work = 10;
      allocation.allocations.rest = 8;
      allocation.allocations.study = 2;
      allocation.allocations.social = 2;
      allocation.allocations.exercise = 2;
      break;

    case 'social':
      allocation.allocations.social = 10;
      allocation.allocations.rest = 8;
      allocation.allocations.study = 2;
      allocation.allocations.work = 2;
      allocation.allocations.exercise = 2;
      break;

    case 'exercise':
      allocation.allocations.exercise = 8;
      allocation.allocations.rest = 8;
      allocation.allocations.study = 3;
      allocation.allocations.work = 3;
      allocation.allocations.social = 2;
      break;

    case 'rest':
      allocation.allocations.rest = 12;
      allocation.allocations.study = 4;
      allocation.allocations.work = 4;
      allocation.allocations.social = 2;
      allocation.allocations.exercise = 2;
      break;
  }

  return allocation;
}
