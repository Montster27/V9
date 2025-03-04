import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NarrativeManager } from './NarrativeManager';
import { NarrativeFactory } from '../models/Narrative';
import { NarrativeType, TriggerType } from '../types/narrative';
import { GameEvent } from '../types/index';

describe('NarrativeManager', () => {
  let narrativeManager: NarrativeManager;
  let eventCallbackMock: (event: GameEvent) => void;

  beforeEach(() => {
    eventCallbackMock = vi.fn();
    narrativeManager = new NarrativeManager(undefined, eventCallbackMock);
  });

  it('should initialize with empty narrative progress', () => {
    const progress = narrativeManager.getProgress();

    expect(progress.arcs).toEqual({});
    expect(progress.discoveredClues).toEqual({});
    expect(progress.availableClues).toEqual({});
    expect(progress.activeEvents).toEqual([]);
    expect(progress.completedEvents).toEqual([]);
    expect(progress.conspiracyTier).toEqual(1);
    expect(progress.timelineAlterations).toEqual([]);
    expect(progress.characterKnowledge).toEqual({});
  });

  it('should correctly initialize narrative arcs', () => {
    const testArc = NarrativeFactory.createNarrativeArc(
      'test-arc',
      'Test Arc',
      'Test Description',
      NarrativeType.CONSPIRACY,
      10
    );

    narrativeManager.initializeArcs([testArc]);

    const progress = narrativeManager.getProgress();
    expect(progress.arcs['test-arc']).toBeDefined();
    expect(progress.arcs['test-arc'].name).toEqual('Test Arc');
  });

  it('should add available clues', () => {
    const testClue = NarrativeFactory.createClue(
      'test-clue',
      'Test Clue',
      'Test Description',
      NarrativeType.CONSPIRACY,
      1
    );

    narrativeManager.addAvailableClue(testClue);

    const progress = narrativeManager.getProgress();
    expect(progress.availableClues['test-clue']).toBeDefined();
    expect(progress.availableClues['test-clue'].name).toEqual('Test Clue');
  });

  it('should discover clues and move them from available to discovered', () => {
    const testClue = NarrativeFactory.createClue(
      'test-clue',
      'Test Clue',
      'Test Description',
      NarrativeType.CONSPIRACY,
      1
    );

    narrativeManager.addAvailableClue(testClue);
    const discoveredClue = narrativeManager.discoverClue('test-clue');

    expect(discoveredClue).toBeDefined();
    expect(discoveredClue?.discovered).toEqual(true);
    expect(discoveredClue?.discoveryDate).toBeInstanceOf(Date);

    const progress = narrativeManager.getProgress();
    expect(progress.availableClues['test-clue']).toBeUndefined();
    expect(progress.discoveredClues['test-clue']).toBeDefined();
  });

  it('should handle non-existent clue discovery gracefully', () => {
    const discoveredClue = narrativeManager.discoverClue('non-existent-clue');

    expect(discoveredClue).toBeUndefined();
  });

  it('should trigger events when conditions are met', () => {
    // Setup initial state
    const testClue = NarrativeFactory.createClue(
      'test-clue',
      'Test Clue',
      'Test Description',
      NarrativeType.CONSPIRACY,
      1
    );

    narrativeManager.addAvailableClue(testClue);
    narrativeManager.discoverClue('test-clue');

    // Create test event
    const testEvent = NarrativeFactory.createMysteryEvent(
      'test-event',
      'Test Event',
      'Test Description',
      [
        {
          id: 'test-choice',
          text: 'Test Choice',
          effects: [],
        },
      ],
      1, // conspiracy level
      ['test-clue'], // required clues
      {}, // skill requirements
      'Test revealed content',
      [], // future branches
      {}, // character responses
      [] // clue rewards
    );

    narrativeManager.addEvents([testEvent]);

    // Process events
    const gameState = {
      skills: {},
      time: { year: 1983 },
    };

    const triggeredEvents = narrativeManager.processEvents(gameState);

    expect(triggeredEvents.length).toEqual(1);
    expect(triggeredEvents[0].id).toEqual('test-event');
    expect(eventCallbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-event',
      })
    );
  });

  it('should advance narrative arcs when discovering clues', () => {
    // Create a test arc
    const testArc = NarrativeFactory.createNarrativeArc(
      'test-arc',
      'Test Arc',
      'Test Description',
      NarrativeType.CONSPIRACY,
      10,
      ['clue1', 'clue2', 'clue3', 'clue4', 'clue5']
    );

    narrativeManager.initializeArcs([testArc]);

    // Add and discover multiple clues
    const clue1 = NarrativeFactory.createClue(
      'clue1',
      'Clue 1',
      'Description 1',
      NarrativeType.CONSPIRACY,
      1
    );

    const clue2 = NarrativeFactory.createClue(
      'clue2',
      'Clue 2',
      'Description 2',
      NarrativeType.CONSPIRACY,
      1
    );

    narrativeManager.addAvailableClue(clue1);
    narrativeManager.addAvailableClue(clue2);

    // Discover first clue
    narrativeManager.discoverClue('clue1');

    let progress = narrativeManager.getProgress();
    expect(progress.arcs['test-arc'].currentLevel).toEqual(3); // 1/5 = 20% of 10 = 2, + 1 = 3

    // Discover second clue
    narrativeManager.discoverClue('clue2');

    progress = narrativeManager.getProgress();
    expect(progress.arcs['test-arc'].currentLevel).toEqual(5); // 2/5 = 40% of 10 = 4, + 1 = 5
  });

  it('should update conspiracy tier based on arc progression', () => {
    // Create conspiracy arcs
    const conspiracyArc1 = NarrativeFactory.createNarrativeArc(
      'conspiracy1',
      'Conspiracy 1',
      'Description 1',
      NarrativeType.CONSPIRACY,
      10,
      ['clue1', 'clue2', 'clue3', 'clue4', 'clue5']
    );

    const conspiracyArc2 = NarrativeFactory.createNarrativeArc(
      'conspiracy2',
      'Conspiracy 2',
      'Description 2',
      NarrativeType.CONSPIRACY,
      10,
      ['clue6', 'clue7', 'clue8', 'clue9', 'clue10']
    );

    narrativeManager.initializeArcs([conspiracyArc1, conspiracyArc2]);

    // Add and discover multiple clues
    const cluesArc1 = Array(5)
      .fill(null)
      .map((_, i) =>
        NarrativeFactory.createClue(
          `clue${i + 1}`,
          `Clue ${i + 1}`,
          `Description ${i + 1}`,
          NarrativeType.CONSPIRACY,
          1
        )
      );

    const cluesArc2 = Array(5)
      .fill(null)
      .map((_, i) =>
        NarrativeFactory.createClue(
          `clue${i + 6}`,
          `Clue ${i + 6}`,
          `Description ${i + 6}`,
          NarrativeType.CONSPIRACY,
          1
        )
      );

    // Add all clues
    [...cluesArc1, ...cluesArc2].forEach((clue) => narrativeManager.addAvailableClue(clue));

    // Discover clues from first arc - should increase conspiracy tier
    narrativeManager.discoverClue('clue1');
    narrativeManager.discoverClue('clue2');
    narrativeManager.discoverClue('clue3');

    // Check conspiracy tier
    let progress = narrativeManager.getProgress();
    expect(progress.conspiracyTier).toEqual(2); // Average level is 7/10, maps to tier 2

    // Discover clues from second arc - should further increase tier
    narrativeManager.discoverClue('clue6');
    narrativeManager.discoverClue('clue7');
    narrativeManager.discoverClue('clue8');
    narrativeManager.discoverClue('clue9');

    // Check conspiracy tier again
    progress = narrativeManager.getProgress();
    expect(progress.conspiracyTier).toEqual(4); // Average level is higher now
  });

  it('should complete events and apply choice effects', () => {
    // Create and trigger an event
    const testEvent = NarrativeFactory.createMysteryEvent(
      'test-event',
      'Test Event',
      'Test Description',
      [
        {
          id: 'test-choice',
          text: 'Test Choice',
          effects: [
            {
              type: 'resource',
              target: 'energy',
              value: 10,
            },
          ],
        },
      ],
      1, // conspiracy level
      [], // required clues
      {}, // skill requirements
      'Test revealed content',
      [], // future branches
      {}, // character responses
      [] // clue rewards
    );

    // Add and trigger the event
    narrativeManager.addEvents([testEvent]);
    narrativeManager.triggerEvent('test-event');

    // Complete the event with a choice
    narrativeManager.completeEvent('test-event', 'test-choice');

    // Check if event is moved to completed
    const progress = narrativeManager.getProgress();
    expect(progress.activeEvents).not.toContain('test-event');
    expect(progress.completedEvents).toContain('test-event');

    // Check if event is marked as resolved
    const eventSource = narrativeManager.getActiveEvents();
    expect(eventSource.find((e) => e.id === 'test-event')).toBeUndefined();
  });

  it('should handle timeline branches', () => {
    // Create an arc with timeline branches
    const timelineBranch = NarrativeFactory.createTimelineBranch(
      'branch1',
      'Branch 1',
      'Description 1',
      {
        clues: [],
        skills: {},
        resources: {},
      },
      [
        {
          type: 'resource',
          target: 'money',
          value: 1000,
        },
      ],
      { faction1: 10, faction2: -5 }
    );

    const testArc = NarrativeFactory.createNarrativeArc(
      'test-arc',
      'Test Arc',
      'Test Description',
      NarrativeType.CONSPIRACY,
      10
    );

    testArc.timelineBranches = [timelineBranch];

    narrativeManager.initializeArcs([testArc]);

    // Create a conspiracy event with timeline branches
    const testEvent = {
      id: 'test-event',
      title: 'Test Event',
      description: 'Test Description',
      choices: [],
      trigger: {
        type: TriggerType.CONSPIRACY as 'conspiracy',
        conditions: {
          worldTimeline: 1985,
          playerInfluence: 50,
          discoveredEntities: [],
        },
        // Add these properties to make it compatible with EventTrigger
        condition: 'conspiracy',
        value: 2,
      },
      conspiracyTier: 2,
      historicalDivergence: 'Test divergence',
      powerShift: {},
      newNarrativeBranches: [],
      timelineBranches: [timelineBranch],
      isActive: false,
      isResolved: false,
    };

    // Add event to queue
    narrativeManager.addEvents([testEvent as any]);

    // Trigger the event to unlock the timeline branch
    narrativeManager.triggerEvent('test-event');

    // Choose the timeline branch
    const chosenBranch = narrativeManager.chooseTimelineBranch('branch1');

    expect(chosenBranch).toBeDefined();
    expect(chosenBranch?.chosen).toBe(true);

    // Check if branch is added to timeline alterations
    const progress = narrativeManager.getProgress();
    expect(progress.timelineAlterations.length).toEqual(1);
    expect(progress.timelineAlterations[0].id).toEqual('branch1');
  });

  it('should update character knowledge about clues', () => {
    narrativeManager.updateCharacterKnowledge('professor', 'important-clue', true);

    const knows = narrativeManager.doesCharacterKnow('professor', 'important-clue');
    expect(knows).toBe(true);

    const doesNotKnow = narrativeManager.doesCharacterKnow('professor', 'other-clue');
    expect(doesNotKnow).toBe(false);
  });

  it('should create initial narrative content', () => {
    narrativeManager.createInitialContent();

    const progress = narrativeManager.getProgress();

    // Check that arcs were created
    expect(Object.keys(progress.arcs).length).toEqual(3);
    expect(progress.arcs['gerontocracy']).toBeDefined();
    expect(progress.arcs['tech-monopoly']).toBeDefined();
    expect(progress.arcs['personal-journey']).toBeDefined();

    // Check that initial clues were added
    expect(Object.keys(progress.availableClues).length).toEqual(3);
    expect(progress.availableClues['strange-memories']).toBeDefined();
    expect(progress.availableClues['retirement-fund']).toBeDefined();
    expect(progress.availableClues['tech-prediction']).toBeDefined();

    // Check that events were added
    const activeEvents = narrativeManager.getActiveEvents();
    expect(activeEvents.length).toEqual(0); // Events start inactive
  });

  it('should create news items from events and clues', () => {
    // Create a clue
    const testClue = NarrativeFactory.createClue(
      'test-clue',
      'Test Clue',
      'Test Description',
      NarrativeType.CONSPIRACY,
      1
    );

    // Create an event
    const testEvent = NarrativeFactory.createMysteryEvent(
      'test-event',
      'Test Event',
      'Test Description',
      [],
      1,
      [],
      {},
      'Test content',
      [],
      {},
      []
    );

    const discoveryDate = new Date();

    // Create news items
    const clueNews = narrativeManager.createNewsItem(testClue, discoveryDate);
    const eventNews = narrativeManager.createNewsItem(testEvent, discoveryDate);

    // Check clue news
    expect(clueNews.title).toContain('Test Clue');
    expect(clueNews.type).toEqual('clue-discovery');
    expect(clueNews.date).toEqual(discoveryDate);

    // Check event news
    expect(eventNews.title).toEqual('Test Event');
    expect(eventNews.type).toEqual('event-occurrence');
    expect(eventNews.date).toEqual(discoveryDate);
  });
});
