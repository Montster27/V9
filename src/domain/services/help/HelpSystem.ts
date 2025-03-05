/**
 * /src/domain/services/help/HelpSystem.ts
 *
 * HelpSystem service manages contextual help content for the game
 */

export interface HelpEntry {
  /** Unique identifier for the help entry */
  id: string;
  /** Title of the help entry */
  title: string;
  /** Content of the help entry */
  content: string;
  /** Category for organizing help entries */
  category: HelpCategory;
  /** Tags for filtering and searching */
  tags: string[];
  /** Related help entry IDs */
  related?: string[];
}

export enum HelpCategory {
  TIME = 'time',
  RESOURCES = 'resources',
  USE_OF_TIME = 'use_of_time',
  SKILLS = 'skills',
  EVENTS = 'events',
  NARRATIVE = 'narrative',
  INTERFACE = 'interface',
}

export interface TutorialStep {
  /** Step identifier */
  id: string;
  /** Target element selector */
  target: string;
  /** Step title */
  title: string;
  /** Step content */
  content: string;
  /** Position for the tooltip */
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface Tutorial {
  /** Tutorial identifier */
  id: string;
  /** Tutorial name */
  name: string;
  /** Tutorial steps */
  steps: TutorialStep[];
}

/**
 * HelpSystem manages contextual help content
 */
export class HelpSystem {
  private entries: Map<string, HelpEntry> = new Map();
  private tutorials: Map<string, Tutorial> = new Map();
  private completedTutorials: Set<string> = new Set();
  private helpEnabled: boolean = true;
  private tutorialsEnabled: boolean = true;

  /**
   * Initialize the help system with default entries
   */
  constructor() {
    this.initializeHelpEntries();
    this.initializeTutorials();
  }

  /**
   * Initialize default help entries
   */
  private initializeHelpEntries(): void {
    // Time management help entries
    this.addHelpEntry({
      id: 'time-basics',
      title: 'Time Management Basics',
      content:
        'Game time passes at a rate of 1 day every 3 seconds in real time. You can pause time at any point to make decisions.',
      category: HelpCategory.TIME,
      tags: ['time', 'pause', 'basics'],
    });

    this.addHelpEntry({
      id: 'time-controls',
      title: 'Time Controls',
      content:
        'Use the play/pause button to control time flow. Speed controls let you adjust how quickly game time passes.',
      category: HelpCategory.TIME,
      tags: ['time', 'controls', 'speed'],
      related: ['time-basics'],
    });

    // Resource management help entries
    this.addHelpEntry({
      id: 'resources-overview',
      title: 'Resources Overview',
      content:
        "Resources represent your character's assets and capabilities. Key resources include Energy, Stress, Knowledge, Money, and Social points.",
      category: HelpCategory.RESOURCES,
      tags: ['resources', 'basics'],
    });

    this.addHelpEntry({
      id: 'energy-stress',
      title: 'Energy & Stress',
      content:
        'Energy represents your physical and mental vitality. Activities consume energy. Stress builds up from activities and affects your efficiency.',
      category: HelpCategory.RESOURCES,
      tags: ['energy', 'stress', 'resources'],
      related: ['resources-overview'],
    });

    // Use of Time help entries
    this.addHelpEntry({
      id: 'time-allocation',
      title: 'Time Allocation',
      content:
        'Allocate your weekly time using the sliders. Each activity affects your resources differently. Balance is key.',
      category: HelpCategory.USE_OF_TIME,
      tags: ['time', 'allocation', 'activities'],
    });

    this.addHelpEntry({
      id: 'time-sliders',
      title: 'Time Allocation Sliders',
      content:
        'Use the sliders to distribute your 24 hours per day across different activities. Watch the impact preview to see how your choices affect resources.',
      category: HelpCategory.USE_OF_TIME,
      tags: ['sliders', 'time', 'allocation'],
      related: ['time-allocation'],
    });

    // Skill system help entries
    this.addHelpEntry({
      id: 'skills-basics',
      title: 'Skill System Basics',
      content:
        'Skills develop as you spend time on activities. You earn 1 skill point per hour of game time, which can be spent to unlock new abilities.',
      category: HelpCategory.SKILLS,
      tags: ['skills', 'basics', 'growth'],
    });

    // Continue with other help entries...
  }

  /**
   * Initialize tutorial sequences
   */
  private initializeTutorials(): void {
    // Welcome tutorial
    this.addTutorial({
      id: 'welcome',
      name: 'Welcome to Middle Age Multiverse',
      steps: [
        {
          id: 'welcome-intro',
          target: '.game-container',
          title: 'Welcome to your second chance!',
          content:
            "You've awakened in your college years with knowledge from the future. Use this opportunity wisely!",
          position: 'bottom',
        },
        {
          id: 'welcome-time',
          target: '.time-controls-enhanced',
          title: 'Control Time',
          content:
            'Use these controls to pause, play, and adjust the speed of game time. Every 3 seconds in real time equals 1 day in the game.',
          position: 'bottom',
        },
        {
          id: 'welcome-resources',
          target: '.resource-display',
          title: 'Monitor Your Resources',
          content:
            "Keep an eye on your Energy, Stress, and other resources. They'll change based on your activities.",
          position: 'bottom',
        },
        {
          id: 'welcome-allocation',
          target: '.time-allocation-sliders',
          title: 'Allocate Your Time',
          content:
            'Use these sliders to decide how to spend your time each week. Different activities affect your resources in different ways.',
          position: 'top',
        },
        {
          id: 'welcome-narrative',
          target: '.narrative-panel',
          title: 'Follow Your Story',
          content:
            'This panel shows your current situation and narrative developments. Pay attention for clues and opportunities.',
          position: 'bottom',
        },
        {
          id: 'welcome-news',
          target: '.game-sidebar',
          title: 'News & Events',
          content:
            'The news stream provides feedback on how your choices affect the world around you.',
          position: 'left',
        },
      ],
    });

    // Time allocation tutorial
    this.addTutorial({
      id: 'time-allocation',
      name: 'Time Allocation Guide',
      steps: [
        {
          id: 'time-allocation-intro',
          target: '.time-allocation-sliders',
          title: 'Managing Your Weekly Schedule',
          content:
            "Time is your most valuable resource. Let's learn how to allocate it effectively.",
          position: 'top',
        },
        {
          id: 'time-allocation-study',
          target: '.time-allocation-slider:nth-child(1)',
          title: 'Study Time',
          content:
            'Studying increases your Knowledge but consumes Energy. Balance it with other activities.',
          position: 'right',
        },
        {
          id: 'time-allocation-work',
          target: '.time-allocation-slider:nth-child(2)',
          title: 'Work Time',
          content:
            'Working earns you Money but consumes more Energy than studying. Consider your financial needs.',
          position: 'right',
        },
        {
          id: 'time-allocation-social',
          target: '.time-allocation-slider:nth-child(3)',
          title: 'Social Time',
          content:
            'Social activities build connections and reduce Stress, but still require some Energy.',
          position: 'right',
        },
        {
          id: 'time-allocation-rest',
          target: '.time-allocation-slider:nth-child(4)',
          title: 'Rest Time',
          content:
            'Rest recovers Energy and reduces Stress. Aim for at least 8 hours per day to avoid penalties.',
          position: 'right',
        },
        {
          id: 'time-allocation-preview',
          target: '.resource-impact-section',
          title: 'Resource Impact Preview',
          content:
            'This panel shows how your time allocation will affect your resources each week.',
          position: 'top',
        },
      ],
    });

    // Continue with other tutorials...
  }

  /**
   * Add a help entry to the system
   * @param entry Help entry to add
   */
  public addHelpEntry(entry: HelpEntry): void {
    this.entries.set(entry.id, entry);
  }

  /**
   * Get a help entry by ID
   * @param id Help entry ID
   * @returns Help entry if found, undefined otherwise
   */
  public getHelpEntry(id: string): HelpEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all help entries
   * @returns Array of all help entries
   */
  public getAllHelpEntries(): HelpEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get help entries by category
   * @param category Help category
   * @returns Array of help entries in the category
   */
  public getHelpEntriesByCategory(category: HelpCategory): HelpEntry[] {
    return Array.from(this.entries.values()).filter((entry) => entry.category === category);
  }

  /**
   * Search help entries by text
   * @param searchText Text to search for
   * @returns Array of matching help entries
   */
  public searchHelpEntries(searchText: string): HelpEntry[] {
    const lowerCaseSearch = searchText.toLowerCase();
    return Array.from(this.entries.values()).filter(
      (entry) =>
        entry.title.toLowerCase().includes(lowerCaseSearch) ||
        entry.content.toLowerCase().includes(lowerCaseSearch) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerCaseSearch))
    );
  }

  /**
   * Add a tutorial to the system
   * @param tutorial Tutorial to add
   */
  public addTutorial(tutorial: Tutorial): void {
    this.tutorials.set(tutorial.id, tutorial);
  }

  /**
   * Get a tutorial by ID
   * @param id Tutorial ID
   * @returns Tutorial if found, undefined otherwise
   */
  public getTutorial(id: string): Tutorial | undefined {
    return this.tutorials.get(id);
  }

  /**
   * Get all tutorials
   * @returns Array of all tutorials
   */
  public getAllTutorials(): Tutorial[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Mark a tutorial as completed
   * @param id Tutorial ID
   */
  public completeTutorial(id: string): void {
    this.completedTutorials.add(id);
  }

  /**
   * Check if a tutorial has been completed
   * @param id Tutorial ID
   * @returns True if completed, false otherwise
   */
  public isTutorialCompleted(id: string): boolean {
    return this.completedTutorials.has(id);
  }

  /**
   * Enable or disable help system
   * @param enabled Whether help is enabled
   */
  public setHelpEnabled(enabled: boolean): void {
    this.helpEnabled = enabled;
  }

  /**
   * Check if help system is enabled
   * @returns True if enabled, false otherwise
   */
  public isHelpEnabled(): boolean {
    return this.helpEnabled;
  }

  /**
   * Enable or disable tutorials
   * @param enabled Whether tutorials are enabled
   */
  public setTutorialsEnabled(enabled: boolean): void {
    this.tutorialsEnabled = enabled;
  }

  /**
   * Check if tutorials are enabled
   * @returns True if enabled, false otherwise
   */
  public isTutorialsEnabled(): boolean {
    return this.tutorialsEnabled;
  }

  /**
   * Reset all tutorial completion status
   */
  public resetTutorialProgress(): void {
    this.completedTutorials.clear();
  }
}

// Export singleton instance
export const helpSystem = new HelpSystem();
