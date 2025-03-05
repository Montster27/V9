/**
 * /src/domain/services/simulation/EventGenerationService.ts
 *
 * Service for generating and checking game events
 * Creates dynamic events based on game state and conditions
 */

import {
  GameEvent,
  EventTrigger,
  EventCondition,
  EventChoice,
  EventEffect,
  TriggerType,
} from '../../models/Event';
import { ResourcesState } from '../../models/Resource';
import { TimeValue } from '../../valueObjects/TimeValue';

/**
 * Configuration for EventGenerationService
 */
export interface EventGenerationConfig {
  randomEventChance: number; // Base chance for random events (0-1)
  timeEventFrequency: number; // Hours between time-based events
  stressEventThreshold: number; // Stress level to trigger stress events (0-100)
  maxActiveEvents: number; // Maximum number of active events
  eventTimeout: number; // Time in real seconds before event expires
}

/**
 * Default event generation config
 */
const DEFAULT_CONFIG: EventGenerationConfig = {
  randomEventChance: 0.1, // 10% chance per check
  timeEventFrequency: 8, // Time events every 8 game hours
  stressEventThreshold: 75, // Stress events at 75+ stress
  maxActiveEvents: 3, // Max 3 active events
  eventTimeout: 60, // Events expire after 60 seconds
};

/**
 * Game state for event checking
 */
export interface EventCheckState {
  resources: ResourcesState;
  gameTime: TimeValue;
  discoveredClues: string[];
  narrativeProgress: Record<string, number>; // Arc ID -> progress level
  lastEventTime?: Date;
}

/**
 * Service for generating and checking events
 */
export class EventGenerationService {
  private config: EventGenerationConfig;
  private eventTemplates: Map<string, GameEvent>;
  private eventGenerators: Map<TriggerType, (state: EventCheckState) => GameEvent[]>;

  /**
   * Create a new EventGenerationService
   * @param config Configuration options
   */
  constructor(config: Partial<EventGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize event templates
    this.eventTemplates = new Map();

    // Initialize event generators
    this.eventGenerators = new Map();

    // Set up default generators
    this.setupDefaultGenerators();
  }

  /**
   * Set up default event generators
   */
  private setupDefaultGenerators(): void {
    // Time-based events
    this.eventGenerators.set('time', (state: EventCheckState) => {
      return this.generateTimeBasedEvents(state);
    });

    // State-based events
    this.eventGenerators.set('state', (state: EventCheckState) => {
      return this.generateStateBasedEvents(state);
    });

    // Random events
    this.eventGenerators.set('random', (state: EventCheckState) => {
      return this.generateRandomEvents(state);
    });

    // Mystery events
    this.eventGenerators.set('mystery', (state: EventCheckState) => {
      return this.generateMysteryEvents(state);
    });

    // Narrative events
    this.eventGenerators.set('narrative', (state: EventCheckState) => {
      return this.generateNarrativeEvents(state);
    });
  }

  /**
   * Generate time-based events
   * @param state Current game state
   * @returns Array of generated events
   */
  private generateTimeBasedEvents(state: EventCheckState): GameEvent[] {
    const events: GameEvent[] = [];
    const currentDate = state.gameTime.getGameDate();

    // Skip if we don't have a last event time
    if (!state.lastEventTime) {
      return events;
    }

    // Check if enough time has passed
    const hoursSinceLastEvent =
      (currentDate.getTime() - state.lastEventTime.getTime()) / (60 * 60 * 1000);

    if (hoursSinceLastEvent < this.config.timeEventFrequency) {
      return events;
    }

    // Generate events based on day of week, time of day, etc.

    // Example: Weekend events
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend
      events.push(this.createWeekendEvent(state));
    }

    // Example: Late night event
    const hour = currentDate.getHours();
    if (hour >= 22 || hour <= 4) {
      // Late night
      events.push(this.createLateNightEvent(state));
    }

    return events;
  }

  /**
   * Generate state-based events
   * @param state Current game state
   * @returns Array of generated events
   */
  private generateStateBasedEvents(state: EventCheckState): GameEvent[] {
    const events: GameEvent[] = [];

    // High stress event
    if (state.resources.stress.current >= this.config.stressEventThreshold) {
      events.push(this.createHighStressEvent(state));
    }

    // Low energy event
    if (state.resources.energy.current <= 20) {
      events.push(this.createLowEnergyEvent(state));
    }

    // Low belonging event
    if (state.resources.belonging.current <= 30) {
      events.push(this.createLowBelongingEvent(state));
    }

    // High achievement event
    if (state.resources.knowledge >= 5000) {
      events.push(this.createHighAchievementEvent(state));
    }

    return events;
  }

  /**
   * Generate random events
   * @param state Current game state
   * @returns Array of generated events
   */
  private generateRandomEvents(state: EventCheckState): GameEvent[] {
    const events: GameEvent[] = [];

    // Random chance check
    if (Math.random() < this.config.randomEventChance) {
      // Choose a random event type
      const eventTypes = ['opportunity', 'challenge', 'social', 'academic'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      switch (randomType) {
        case 'opportunity':
          events.push(this.createRandomOpportunityEvent(state));
          break;
        case 'challenge':
          events.push(this.createRandomChallengeEvent(state));
          break;
        case 'social':
          events.push(this.createRandomSocialEvent(state));
          break;
        case 'academic':
          events.push(this.createRandomAcademicEvent(state));
          break;
      }
    }

    return events;
  }

  /**
   * Generate mystery events
   * @param state Current game state
   * @returns Array of generated events
   */
  private generateMysteryEvents(state: EventCheckState): GameEvent[] {
    const events: GameEvent[] = [];

    // Check for discovered clues that could trigger mystery events
    const clueCount = state.discoveredClues.length;

    // Mystery threshold based on clue count
    if (clueCount >= 3 && clueCount < 5) {
      events.push(this.createEarlyMysteryEvent(state));
    } else if (clueCount >= 5 && clueCount < 10) {
      events.push(this.createMidMysteryEvent(state));
    } else if (clueCount >= 10) {
      events.push(this.createLateMysteryEvent(state));
    }

    return events;
  }

  /**
   * Generate narrative events
   * @param state Current game state
   * @returns Array of generated events
   */
  private generateNarrativeEvents(state: EventCheckState): GameEvent[] {
    const events: GameEvent[] = [];

    // Check narrative progress to generate appropriate events
    for (const [arcId, progress] of Object.entries(state.narrativeProgress)) {
      if (arcId === 'gerontocracy') {
        if (progress === 3) {
          events.push(this.createGerontocracyEvent(state, progress));
        } else if (progress === 7) {
          events.push(this.createGerontocracyEvent(state, progress));
        }
      } else if (arcId === 'techMonopoly') {
        if (progress === 4) {
          events.push(this.createTechMonopolyEvent(state, progress));
        } else if (progress === 8) {
          events.push(this.createTechMonopolyEvent(state, progress));
        }
      }
    }

    return events;
  }

  /**
   * Check for events based on current game state
   * @param state Current game state
   * @param activeEvents Currently active events
   * @returns Array of new events to trigger
   */
  checkForEvents(state: EventCheckState, activeEvents: GameEvent[]): GameEvent[] {
    // Skip if maximum active events reached
    if (!activeEvents || activeEvents.length >= this.config.maxActiveEvents) {
      return [];
    }

    // Collect events from all generators
    const newEvents: GameEvent[] = [];

    try {
      for (const generator of this.eventGenerators.values()) {
        const events = generator(state);
        // Only try to spread if events is an array
        if (events && Array.isArray(events)) {
          newEvents.push(...events);
        } else {
          console.error('Event generator did not return an array:', events);
        }
      }
    } catch (error) {
      console.error('Error generating events:', error);
      return []; // Return empty array in case of error
    }

    // Limit number of new events
    const remainingSlots = this.config.maxActiveEvents - activeEvents.length;
    return newEvents.slice(0, remainingSlots);
  }

  /**
   * Register an event template
   * @param template Event template
   */
  registerEventTemplate(template: GameEvent): void {
    this.eventTemplates.set(template.id, { ...template });
  }

  /**
   * Get an event template by ID
   * @param id Event template ID
   * @returns Event template or undefined
   */
  getEventTemplate(id: string): GameEvent | undefined {
    return this.eventTemplates.get(id);
  }

  /**
   * Register a custom event generator
   * @param triggerType Trigger type
   * @param generator Event generator function
   */
  registerEventGenerator(
    triggerType: TriggerType,
    generator: (state: EventCheckState) => GameEvent[]
  ): void {
    this.eventGenerators.set(triggerType, generator);
  }

  /**
   * Get service configuration
   * @returns Current configuration
   */
  getConfig(): EventGenerationConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<EventGenerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Event creation helper methods

  private createWeekendEvent(state: EventCheckState): GameEvent {
    return {
      id: `weekend_event_${Date.now()}`,
      title: 'Weekend Plans',
      description: 'The weekend is here! What will you do with your free time?',
      trigger: { type: 'time' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'weekend_party',
          text: 'Go to a party',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -20 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -15 },
          ],
          stress: -15,
          energy: -20,
        },
        {
          id: 'weekend_study',
          text: 'Catch up on studies',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 40 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 10 },
          ],
          stress: 10,
          energy: -15,
        },
        {
          id: 'weekend_rest',
          text: 'Rest and recover',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 40 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -20 },
          ],
          stress: -20,
          energy: 40,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createLateNightEvent(state: EventCheckState): GameEvent {
    return {
      id: `late_night_event_${Date.now()}`,
      title: 'Late Night Decision',
      description: "It's late at night. What will you do?",
      trigger: { type: 'time' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'late_night_continue',
          text: 'Keep studying late',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -25 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
          ],
          stress: 15,
          energy: -25,
        },
        {
          id: 'late_night_sleep',
          text: 'Go to sleep',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -10 },
          ],
          stress: -10,
          energy: 30,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createHighStressEvent(state: EventCheckState): GameEvent {
    return {
      id: `high_stress_event_${Date.now()}`,
      title: 'Stress Overload',
      description:
        'Your stress levels have reached a critical point. You need to address this before it affects your health.',
      trigger: { type: 'state' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'stress_meditation',
          text: 'Take time to meditate',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -25 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 10 },
          ],
          stress: -25,
          energy: 10,
        },
        {
          id: 'stress_exercise',
          text: 'Go for a run',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -20 },
            { type: 'MODIFY_RESOURCE', target: 'health', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -10 },
          ],
          stress: -20,
          energy: -10,
        },
        {
          id: 'stress_ignore',
          text: 'Ignore it and keep working',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 10 },
            { type: 'MODIFY_RESOURCE', target: 'health', value: -15 },
          ],
          stress: 10,
          energy: -5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createLowEnergyEvent(state: EventCheckState): GameEvent {
    return {
      id: `low_energy_event_${Date.now()}`,
      title: 'Energy Crash',
      description: "You're exhausted and can barely keep your eyes open.",
      trigger: { type: 'state' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'energy_rest',
          text: 'Take a nap',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -10 },
          ],
          stress: -10,
          energy: 30,
        },
        {
          id: 'energy_coffee',
          text: 'Drink coffee',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 5 },
          ],
          stress: 5,
          energy: 15,
        },
        {
          id: 'energy_push',
          text: 'Push through it',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'health', value: -10 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
          ],
          stress: 15,
          energy: -5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createLowBelongingEvent(state: EventCheckState): GameEvent {
    return {
      id: `low_belonging_event_${Date.now()}`,
      title: 'Feeling Isolated',
      description:
        "You've been spending too much time alone, and it's starting to affect your wellbeing.",
      trigger: { type: 'state' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'belonging_party',
          text: 'Attend a social event',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 25 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -10 },
          ],
          stress: -5,
          energy: -10,
        },
        {
          id: 'belonging_call',
          text: 'Call an old friend',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 10 },
          ],
          stress: -10,
          energy: -5,
        },
        {
          id: 'belonging_ignore',
          text: 'Focus on work instead',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: -5 },
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 15 },
          ],
          stress: 10,
          energy: -10,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createHighAchievementEvent(state: EventCheckState): GameEvent {
    return {
      id: `high_achievement_event_${Date.now()}`,
      title: 'Academic Recognition',
      description: 'Your hard work has caught the attention of faculty members.',
      trigger: { type: 'state' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'achievement_research',
          text: 'Join a research project',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 50 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
          ],
          stress: 15,
          energy: -15,
        },
        {
          id: 'achievement_ta',
          text: 'Become a teaching assistant',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'money', value: 100 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 15 },
          ],
          stress: 10,
          energy: -10,
        },
        {
          id: 'achievement_decline',
          text: 'Politely decline for now',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -10 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 5 },
          ],
          stress: -10,
          energy: 5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createRandomOpportunityEvent(state: EventCheckState): GameEvent {
    return {
      id: `opportunity_event_${Date.now()}`,
      title: 'Unexpected Opportunity',
      description: "You've been offered a chance to join a startup project with some seniors.",
      trigger: { type: 'random' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'opportunity_join',
          text: 'Join the project',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 20 },
          ],
          stress: 15,
          energy: -15,
        },
        {
          id: 'opportunity_negotiate',
          text: 'Negotiate for better terms',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'money', value: 50 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 10 },
          ],
          stress: 10,
          energy: -10,
        },
        {
          id: 'opportunity_decline',
          text: 'Decline the offer',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -5 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 5 },
          ],
          stress: -5,
          energy: 5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createRandomChallengeEvent(state: EventCheckState): GameEvent {
    return {
      id: `challenge_event_${Date.now()}`,
      title: 'Unexpected Challenge',
      description: 'Your project deadline has been moved up unexpectedly.',
      trigger: { type: 'random' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'challenge_allnighter',
          text: 'Pull an all-nighter',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 40 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -40 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 25 },
          ],
          stress: 25,
          energy: -40,
        },
        {
          id: 'challenge_team',
          text: 'Form a study group',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 10 },
          ],
          stress: 10,
          energy: -20,
        },
        {
          id: 'challenge_extension',
          text: 'Ask for an extension',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -10 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: -5 },
          ],
          stress: -10,
          energy: 0,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createRandomSocialEvent(state: EventCheckState): GameEvent {
    return {
      id: `social_event_${Date.now()}`,
      title: 'Party Invitation',
      description: "You've been invited to a big party this weekend.",
      trigger: { type: 'random' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'social_attend',
          text: 'Go to the party',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'social', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -20 },
          ],
          stress: -15,
          energy: -20,
        },
        {
          id: 'social_brief',
          text: 'Make a brief appearance',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'social', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 10 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -10 },
          ],
          stress: -5,
          energy: -10,
        },
        {
          id: 'social_decline',
          text: 'Decline and study instead',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: -5 },
          ],
          stress: 5,
          energy: -15,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createRandomAcademicEvent(state: EventCheckState): GameEvent {
    return {
      id: `academic_event_${Date.now()}`,
      title: 'Special Lecture',
      description: 'A renowned professor is giving a special lecture on campus.',
      trigger: { type: 'random' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'academic_attend',
          text: 'Attend the lecture',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 25 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: -10 },
          ],
          stress: 0,
          energy: -10,
        },
        {
          id: 'academic_question',
          text: 'Attend and ask questions',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 35 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 10 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 10 },
          ],
          stress: 10,
          energy: -15,
        },
        {
          id: 'academic_skip',
          text: 'Skip the lecture',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: -5 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 5 },
          ],
          stress: -5,
          energy: 5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createEarlyMysteryEvent(state: EventCheckState): GameEvent {
    return {
      id: `early_mystery_event_${Date.now()}`,
      title: 'Strange Observations',
      description:
        "You've noticed some unusual patterns in the historical records you've been researching.",
      trigger: { type: 'mystery' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'mystery_investigate',
          text: 'Investigate further',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 20 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 10 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 1 },
          ],
          stress: 10,
          energy: -15,
        },
        {
          id: 'mystery_discuss',
          text: 'Discuss with a professor',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 10 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 1 },
          ],
          stress: 5,
          energy: -10,
        },
        {
          id: 'mystery_ignore',
          text: 'Ignore it for now',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -5 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 5 },
          ],
          stress: -5,
          energy: 5,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createMidMysteryEvent(state: EventCheckState): GameEvent {
    return {
      id: `mid_mystery_event_${Date.now()}`,
      title: 'Hidden Connections',
      description:
        'The research is revealing unexpected connections between certain influential families and historical events.',
      trigger: { type: 'mystery' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'mystery_deep_research',
          text: 'Research these connections',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 30 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 5 },
          ],
          stress: 15,
          energy: -20,
        },
        {
          id: 'mystery_seek_mentor',
          text: 'Seek a trustworthy mentor',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'social', value: 15 },
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 10 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 4 },
          ],
          stress: 10,
          energy: -15,
        },
        {
          id: 'mystery_cautious',
          text: 'Proceed cautiously',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 5 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 3 },
          ],
          stress: 5,
          energy: -10,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createLateMysteryEvent(state: EventCheckState): GameEvent {
    return {
      id: `late_mystery_event_${Date.now()}`,
      title: 'Conspiracy Uncovered',
      description:
        'Your research has uncovered what appears to be a hidden power structure controlling key institutions.',
      trigger: { type: 'mystery' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'mystery_expose',
          text: 'Work to expose the truth',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 50 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 30 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 8 },
          ],
          stress: 30,
          energy: -30,
        },
        {
          id: 'mystery_join',
          text: 'Try to join their ranks',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'money', value: 200 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 30 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 7 },
          ],
          stress: 20,
          energy: -25,
        },
        {
          id: 'mystery_secret',
          text: 'Keep the knowledge secret',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 15 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: 6 },
          ],
          stress: 15,
          energy: -15,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createGerontocracyEvent(state: EventCheckState, progress: number): GameEvent {
    return {
      id: `gerontocracy_event_${progress}_${Date.now()}`,
      title: 'The Gerontocracy Files',
      description: `You've discovered level ${progress} information about the hidden gerontocracy controlling societal wealth.`,
      trigger: { type: 'narrative' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'gerontocracy_pursue',
          text: 'Pursue this lead',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 40 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 20 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: progress + 1 },
          ],
          stress: 20,
          energy: -25,
        },
        {
          id: 'gerontocracy_allies',
          text: 'Find allies',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'social', value: 25 },
            { type: 'MODIFY_RESOURCE', target: 'belonging', value: 15 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'gerontocracy', level: progress + 1 },
          ],
          stress: 15,
          energy: -20,
        },
        {
          id: 'gerontocracy_pause',
          text: 'Take time to process',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -10 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 15 },
          ],
          stress: -10,
          energy: 15,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }

  private createTechMonopolyEvent(state: EventCheckState, progress: number): GameEvent {
    return {
      id: `tech_monopoly_event_${progress}_${Date.now()}`,
      title: 'Tech Monopoly Insights',
      description: `You've discovered level ${progress} information about emerging tech monopolies and their influence.`,
      trigger: { type: 'narrative' as TriggerType },
      conditions: [],
      effects: [],
      choices: [
        {
          id: 'tech_investigate',
          text: 'Investigate technical details',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'knowledge', value: 45 },
            { type: 'MODIFY_RESOURCE', target: 'stress', value: 20 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'techMonopoly', level: progress + 1 },
          ],
          stress: 20,
          energy: -25,
        },
        {
          id: 'tech_startup',
          text: 'Start your own tech project',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'money', value: -100 },
            { type: 'MODIFY_RESOURCE', target: 'social', value: 20 },
            { type: 'ADVANCE_NARRATIVE', arcId: 'techMonopoly', level: progress + 1 },
          ],
          stress: 25,
          energy: -30,
        },
        {
          id: 'tech_wait',
          text: 'Wait for more information',
          requirements: [],
          effects: [
            { type: 'MODIFY_RESOURCE', target: 'stress', value: -5 },
            { type: 'MODIFY_RESOURCE', target: 'energy', value: 10 },
          ],
          stress: -5,
          energy: 10,
        },
      ],
      timeLimit: this.config.eventTimeout,
    };
  }
}
