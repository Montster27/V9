import { 
  NarrativeArc, 
  Clue, 
  TimelineBranch, 
  MysteryEvent, 
  ConspiracyEvent, 
  NarrativeFactory 
} from '../models/Narrative';

import {
  NarrativeProgress,
  NarrativeType,
  TriggerType
} from '../types/narrative';

import { GameEvent, EventEffect } from '../types/index';

/**
 * Manages the narrative progression, conspiracy discovery, and timeline alterations
 */
export class NarrativeManager {
  private narrativeProgress: NarrativeProgress;
  private eventQueue: GameEvent[];
  private eventCallback: (event: GameEvent) => void;
  
  /**
   * Create a new NarrativeManager
   */
  constructor(
    initialProgress?: NarrativeProgress, 
    eventCallback?: (event: GameEvent) => void
  ) {
    this.narrativeProgress = initialProgress || this.createInitialProgress();
    this.eventQueue = [];
    this.eventCallback = eventCallback || (() => {});
  }
  
  /**
   * Create initial narrative progress state
   */
  private createInitialProgress(): NarrativeProgress {
    return {
      arcs: {},
      discoveredClues: {},
      availableClues: {},
      activeEvents: [],
      completedEvents: [],
      conspiracyTier: 1,
      timelineAlterations: [],
      characterKnowledge: {}
    };
  }
  
  /**
   * Get current narrative progress
   */
  public getProgress(): NarrativeProgress {
    return { ...this.narrativeProgress };
  }
  
  /**
   * Initialize narrative arcs for a new game
   */
  public initializeArcs(arcs: NarrativeArc[]): void {
    const arcsRecord: Record<string, NarrativeArc> = {};
    
    for (const arc of arcs) {
      arcsRecord[arc.id] = { ...arc };
    }
    
    this.narrativeProgress.arcs = arcsRecord;
  }
  
  /**
   * Add events to the queue
   */
  public addEvents(events: GameEvent[]): void {
    this.eventQueue.push(...events);
  }
  
  /**
   * Process events based on current game state
   */
  public processEvents(gameState: Record<string, any>): GameEvent[] {
    const triggeredEvents: GameEvent[] = [];
    
    for (const event of this.eventQueue) {
      if (event.isActive || event.isResolved) continue;
      
      if (this.checkEventTrigger(event, gameState)) {
        event.isActive = true;
        triggeredEvents.push(event);
        
        // Add to active events
        if (!this.narrativeProgress.activeEvents.includes(event.id)) {
          this.narrativeProgress.activeEvents.push(event.id);
        }
        
        // Notify via callback
        this.eventCallback(event);
      }
    }
    
    return triggeredEvents;
  }
  
  /**
   * Check if an event's trigger conditions are met
   */
  private checkEventTrigger(event: GameEvent, gameState: Record<string, any>): boolean {
    // Implementation would check specific trigger types
    // This is a simplified version
    
    if ((event as any).trigger.type === TriggerType.MYSTERY) {
      const mysteryEvent = event as MysteryEvent;
      const conditions = mysteryEvent.trigger.conditions;
      
      // Check conspiracy level
      if (this.narrativeProgress.conspiracyTier < conditions.conspiracyLevel) {
        return false;
      }
      
      // Check required clues
      for (const clueId of conditions.requiredClues) {
        if (!this.narrativeProgress.discoveredClues[clueId]) {
          return false;
        }
      }
      
      // Check skill requirements
      if (conditions.skillRequirements) {
        for (const [skillId, level] of Object.entries(conditions.skillRequirements)) {
          if (!gameState.skills || !gameState.skills[skillId] || gameState.skills[skillId] < level) {
            return false;
          }
        }
      }
      
      return true;
    }
    
    if ((event as any).trigger.type === TriggerType.CONSPIRACY) {
      const conspiracyEvent = event as ConspiracyEvent;
      const conditions = conspiracyEvent.trigger.conditions;
      
      // Check world timeline (game year)
      if (gameState.time && gameState.time.year < conditions.worldTimeline) {
        return false;
      }
      
      // Check player influence
      if (gameState.playerInfluence < conditions.playerInfluence) {
        return false;
      }
      
      // Check discovered entities
      for (const entityId of conditions.discoveredEntities) {
        // Would need to check if player has discovered these entities
        // This is a placeholder check
        if (!this.hasDiscoveredEntity(entityId)) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if the player has discovered a specific entity
   * This is a placeholder implementation
   */
  private hasDiscoveredEntity(entityId: string): boolean {
    // Implementation would check if player has discovered this entity
    // For now, return true for testing
    return true;
  }
  
  /**
   * Discover a new clue
   * @param clueId ID of the clue to discover
   * @returns The discovered clue, or undefined if not found
   */
  public discoverClue(clueId: string): Clue | undefined {
    const clue = this.narrativeProgress.availableClues[clueId];
    
    if (!clue) {
      return undefined;
    }
    
    // Mark the clue as discovered
    clue.discovered = true;
    clue.discoveryDate = new Date();
    
    // Move from available to discovered
    this.narrativeProgress.discoveredClues[clueId] = clue;
    delete this.narrativeProgress.availableClues[clueId];
    
    // Check for arc advancement
    this.checkArcProgression();
    
    // Check for new events based on this clue
    this.checkClueTriggeredEvents(clueId);
    
    return clue;
  }
  
  /**
   * Add a new clue to available clues
   * @param clue The clue to add
   */
  public addAvailableClue(clue: Clue): void {
    this.narrativeProgress.availableClues[clue.id] = clue;
  }
  
  /**
   * Check if narrative arcs should advance based on discovered clues
   */
  private checkArcProgression(): void {
    const arcs = this.narrativeProgress.arcs;
    const discoveredClues = Object.keys(this.narrativeProgress.discoveredClues);
    
    for (const arcId in arcs) {
      const arc = arcs[arcId];
      if (!arc.active || arc.completed) continue;
      
      // Calculate how many clues for this arc have been discovered
      const discoveredArcClues = arc.clues.filter(clueId => 
        discoveredClues.includes(clueId)
      );
      
      // Calculate new level based on discovered clues percentage
      const newLevel = Math.floor((discoveredArcClues.length / arc.clues.length) * arc.maxLevel) + 1;
      
      // Update if progression occurred
      if (newLevel > arc.currentLevel) {
        arc.currentLevel = Math.min(newLevel, arc.maxLevel);
        this.checkConspiracyTier();
        
        // Check if arc is completed
        if (arc.currentLevel >= arc.maxLevel) {
          arc.completed = true;
        }
      }
    }
  }
  
  /**
   * Update conspiracy tier based on arc progression
   */
  private checkConspiracyTier(): void {
    const arcs = Object.values(this.narrativeProgress.arcs);
    const conspiracyArcs = arcs.filter(arc => arc.type === NarrativeType.CONSPIRACY);
    
    if (conspiracyArcs.length === 0) return;
    
    // Calculate average conspiracy arc progress
    const totalLevels = conspiracyArcs.reduce((sum, arc) => sum + arc.currentLevel, 0);
    const averageLevel = totalLevels / conspiracyArcs.length;
    
    // Map to conspiracy tier (1-5)
    const newTier = Math.ceil(averageLevel / 2);
    
    if (newTier > this.narrativeProgress.conspiracyTier) {
      this.narrativeProgress.conspiracyTier = newTier;
      this.unlockConspiracyTierContent(newTier);
    }
  }
  
  /**
   * Unlock content for a specific conspiracy tier
   */
  private unlockConspiracyTierContent(tier: number): void {
    // Implementation would trigger events appropriate for this conspiracy tier
    console.log(`Unlocked conspiracy tier ${tier} content`);
  }
  
  /**
   * Check for events triggered by discovering a clue
   */
  private checkClueTriggeredEvents(clueId: string): void {
    // Find mystery events that might be triggered by this clue
    const mysteryEvents = this.eventQueue.filter(
      event => (event as any).trigger?.type === TriggerType.MYSTERY
    ) as MysteryEvent[];
    
    // Find events triggered by this clue
    for (const event of mysteryEvents) {
      if (event.trigger.conditions.requiredClues.includes(clueId)) {
        // Check if all required clues are discovered
        const allCluesDiscovered = event.trigger.conditions.requiredClues.every(
          requiredClueId => !!this.narrativeProgress.discoveredClues[requiredClueId]
        );
        
        if (allCluesDiscovered && 
            event.trigger.conditions.conspiracyLevel <= this.narrativeProgress.conspiracyTier) {
          // Trigger the event
          this.triggerEvent(event.id);
        }
      }
    }
  }
  
  /**
   * Trigger a narrative event
   */
  public triggerEvent(eventId: string): void {
    const event = this.findEventById(eventId);
    
    if (!event) {
      console.error(`Event ${eventId} not found`);
      return;
    }
    
    // Mark as active
    event.isActive = true;
    
    // Add to active events if not already there
    if (!this.narrativeProgress.activeEvents.includes(eventId)) {
      this.narrativeProgress.activeEvents.push(eventId);
    }
    
    // If it's a Mystery event, handle clue rewards
    if ((event as any).trigger?.type === TriggerType.MYSTERY) {
      const mysteryEvent = event as MysteryEvent;
      
      // Add clue rewards
      for (const clueId of mysteryEvent.clueRewards) {
        // We would need a way to get clue by ID
        // For now, we'll use a simple approach
        const clue = this.getClueById(clueId);
        if (clue) {
          this.addAvailableClue(clue);
        }
      }
    }
    
    // If it's a Conspiracy event, handle timeline branches
    if ((event as any).trigger?.type === TriggerType.CONSPIRACY) {
      const conspiracyEvent = event as ConspiracyEvent;
      
      // Make timeline branches available for selection
      for (const branch of conspiracyEvent.timelineBranches) {
        this.unlockTimelineBranch(branch.id);
      }
    }
    
    // Notify via callback
    this.eventCallback(event);
  }
  
  /**
   * Complete an event with a specific choice
   */
  public completeEvent(eventId: string, choiceId?: string): void {
    const event = this.findEventById(eventId);
    
    if (!event) {
      console.error(`Event ${eventId} not found`);
      return;
    }
    
    // Mark as resolved
    event.isActive = false;
    event.isResolved = true;
    
    // Move from active to completed
    const activeIndex = this.narrativeProgress.activeEvents.indexOf(eventId);
    
    if (activeIndex !== -1) {
      this.narrativeProgress.activeEvents.splice(activeIndex, 1);
      this.narrativeProgress.completedEvents.push(eventId);
      
      // Apply effects from the chosen option
      if (choiceId) {
        const choice = event.choices.find(c => c.id === choiceId);
        
        if (choice) {
          // Apply choice effects
          this.applyEffects(choice.effects);
        }
      }
    }
  }
  
  /**
   * Apply event effects
   * In a real implementation, this would dispatch actions to update the game state
   */
  private applyEffects(effects: EventEffect[]): void {
    console.log(`Applying ${effects.length} effects`);
    
    // Implementation would apply various effects based on type
    for (const effect of effects) {
      switch (effect.type) {
        case 'resource':
          console.log(`Modifying resource ${effect.target} by ${effect.value}`);
          break;
        case 'skill':
          console.log(`Modifying skill ${effect.target} by ${effect.value}`);
          break;
        case 'event':
          console.log(`Triggering event ${effect.value}`);
          break;
        case 'narrative':
          console.log(`Narrative effect on ${effect.target}: ${effect.value}`);
          break;
      }
    }
  }
  
  /**
   * Choose a timeline branch
   */
  public chooseTimelineBranch(branchId: string): TimelineBranch | undefined {
    // Find the branch among all arcs
    for (const arcId in this.narrativeProgress.arcs) {
      const arc = this.narrativeProgress.arcs[arcId];
      
      for (const branch of arc.timelineBranches) {
        if (branch.id === branchId && branch.unlocked) {
          // Mark this branch as chosen
          branch.chosen = true;
          
          // Apply timeline effects
          this.applyEffects(branch.effects);
          
          // Add to timeline alterations
          this.narrativeProgress.timelineAlterations.push(branch);
          
          return branch;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Unlock a timeline branch
   */
  private unlockTimelineBranch(branchId: string): void {
    // Find the branch among all arcs
    for (const arcId in this.narrativeProgress.arcs) {
      const arc = this.narrativeProgress.arcs[arcId];
      
      for (const branch of arc.timelineBranches) {
        if (branch.id === branchId) {
          branch.unlocked = true;
          return;
        }
      }
    }
  }
  
  /**
   * Get a clue by ID (placeholder implementation)
   */
  private getClueById(clueId: string): Clue | undefined {
    return (
      this.narrativeProgress.discoveredClues[clueId] ||
      this.narrativeProgress.availableClues[clueId]
    );
  }
  
  /**
   * Helper to find event by ID
   */
  private findEventById(eventId: string): GameEvent | undefined {
    return this.eventQueue.find(event => event.id === eventId);
  }
  
  /**
   * Update NPC knowledge about player discoveries
   */
  public updateCharacterKnowledge(characterId: string, clueId: string, knows: boolean): void {
    if (!this.narrativeProgress.characterKnowledge[characterId]) {
      this.narrativeProgress.characterKnowledge[characterId] = {};
    }
    
    this.narrativeProgress.characterKnowledge[characterId][clueId] = knows;
  }
  
  /**
   * Check if character knows about a specific clue
   */
  public doesCharacterKnow(characterId: string, clueId: string): boolean {
    return this.narrativeProgress.characterKnowledge[characterId]?.[clueId] || false;
  }
  
  /**
   * Create initial narrative content for a new game
   */
  public createInitialContent(): void {
    // Example narrative arcs
    const gerontocracyArc = NarrativeFactory.createNarrativeArc(
      'gerontocracy',
      'The Gerontocracy',
      'Uncover the secret society of elderly power brokers controlling the economic system',
      NarrativeType.CONSPIRACY,
      10
    );
    
    const techMonopolyArc = NarrativeFactory.createNarrativeArc(
      'tech-monopoly',
      'The Coming Monopoly',
      'Discover how technology companies will consolidate power in the coming decades',
      NarrativeType.CONSPIRACY,
      10
    );
    
    const personalJourneyArc = NarrativeFactory.createNarrativeArc(
      'personal-journey',
      'Second Chance',
      'Your personal journey of self-rediscovery and growth',
      NarrativeType.PERSONAL,
      10
    );
    
    // Initialize with arcs
    this.initializeArcs([gerontocracyArc, techMonopolyArc, personalJourneyArc]);
    
    // Create some initial clues
    const initialClues = [
      NarrativeFactory.createClue(
        'strange-memories',
        'Strange Memories',
        'You have memories of events that haven\'t happened yet and of being much older',
        NarrativeType.PERSONAL,
        1
      ),
      NarrativeFactory.createClue(
        'retirement-fund',
        'Mysterious Retirement Fund',
        'A campus news article mentions a secretive retirement investment group buying local properties',
        NarrativeType.CONSPIRACY,
        1,
        ['strange-memories']
      ),
      NarrativeFactory.createClue(
        'tech-prediction',
        'Emerging Technologies',
        'Your economics professor dismisses the future importance of personal computers',
        NarrativeType.CONSPIRACY,
        1,
        ['strange-memories']
      )
    ];
    
    // Add initial clues as available
    for (const clue of initialClues) {
      this.addAvailableClue(clue);
    }
    
    // Create some initial events
    const initialEvents = [
      NarrativeFactory.createMysteryEvent(
        'memory-flash',
        'A Flash of Memory',
        'While sitting in class, you suddenly have a vivid memory of using a small touchscreen device to video call someone',
        [
          {
            id: 'embrace',
            text: 'Embrace the memory and try to recall more details',
            effects: [
              {
                type: 'skill',
                target: 'mind',
                value: 2
              }
            ]
          },
          {
            id: 'dismiss',
            text: 'Dismiss it as daydreaming',
            effects: [
              {
                type: 'resource',
                target: 'stress',
                value: -5
              }
            ]
          }
        ],
        1, // conspiracy level
        ['strange-memories'], // required clues
        {}, // skill requirements
        'You remember something called a "smartphone" and how everyone in the future will have one',
        ['tech-future'], // future branches
        {
          'professor': 'Your professor notices your distraction and seems concerned',
          'roommate': 'Your roommate thinks you\'re just daydreaming again'
        },
        ['tech-evolution'] // clue rewards
      ),
      
      NarrativeFactory.createMysteryEvent(
        'elderly-meeting',
        'Secret Campus Meeting',
        'You notice a group of elderly individuals entering the economics building late at night',
        [
          {
            id: 'follow',
            text: 'Follow them discreetly',
            effects: [
              {
                type: 'skill',
                target: 'world',
                value: 3
              },
              {
                type: 'resource',
                target: 'stress',
                value: 10
              }
            ]
          },
          {
            id: 'research',
            text: 'Make a note to research who they might be',
            effects: [
              {
                type: 'skill',
                target: 'mind',
                value: 1
              }
            ]
          }
        ],
        1, // conspiracy level
        ['retirement-fund'], // required clues
        {}, // skill requirements
        'These elderly visitors seem to be evaluating investment opportunities decades before they become valuable',
        ['gerontocracy-arc'], // future branches
        {
          'economics-professor': 'Your economics professor seems nervous when you mention the late-night visitors',
          'security-guard': 'The security guard pretends not to have seen anything unusual'
        },
        ['wealth-transfer', 'early-investors'] // clue rewards
      )
    ];
    
    // Add events to queue
    this.addEvents(initialEvents);
  }
  
  /**
   * Add a new narrative arc
   */
  public addNarrativeArc(arc: NarrativeArc): void {
    this.narrativeProgress.arcs[arc.id] = arc;
  }
  
  /**
   * Get all active events
   */
  public getActiveEvents(): GameEvent[] {
    return this.eventQueue.filter(event => 
      this.narrativeProgress.activeEvents.includes(event.id)
    );
  }
  
  /**
   * Get all available clues
   */
  public getAvailableClues(): Clue[] {
    return Object.values(this.narrativeProgress.availableClues);
  }
  
  /**
   * Get all discovered clues
   */
  public getDiscoveredClues(): Clue[] {
    return Object.values(this.narrativeProgress.discoveredClues);
  }
  
  /**
   * Get active narrative arcs
   */
  public getActiveArcs(): NarrativeArc[] {
    return Object.values(this.narrativeProgress.arcs).filter(arc => arc.active);
  }
  
  /**
   * Connect an event to news feed
   * This would create a news item based on an event or clue discovery
   */
  public createNewsItem(source: GameEvent | Clue, discoveryDate: Date): Record<string, unknown> {
    // This is a placeholder implementation
    // In a real implementation, this would create a news item
    // and add it to the news feed
    
    if ('discovered' in source) {
      // It's a clue
      return {
        id: `news-${source.id}`,
        title: `New information about ${source.name}`,
        content: `You've discovered something interesting: ${source.description}`,
        date: discoveryDate,
        type: 'clue-discovery',
        relatedId: source.id
      };
    } else {
      // It's an event
      return {
        id: `news-${source.id}`,
        title: source.title,
        content: source.description,
        date: discoveryDate,
        type: 'event-occurrence',
        relatedId: source.id
      };
    }
  }
}
