// Game related types

export enum ResourceType {
  ENERGY = 'energy',
  STRESS = 'stress',
  BELONGING = 'belonging',
  HEALTH = 'health',
  KNOWLEDGE_POINTS = 'knowledgePoints',
  MONEY = 'money',
  SOCIAL_POINTS = 'socialPoints',
}

export enum SkillThread {
  BODY = 'body',
  MIND = 'mind',
  HEART = 'heart',
  WORLD = 'world',
  MASTERY = 'mastery',
}

export enum ActivityType {
  STUDY = 'study',
  WORK = 'work',
  SOCIAL = 'social',
  REST = 'rest',
  EXERCISE = 'exercise',
}

// Time-related types
export interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
}

// Event-related types
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  trigger: EventTrigger;
  isActive: boolean;
  isResolved: boolean;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'resource' | 'skill' | 'event' | 'narrative';
  target: string;
  value: number | string | boolean;
}

export interface EventTrigger {
  type: 'time' | 'resource' | 'skill' | 'random';
  condition: string;
  value: number | string | boolean;
}
