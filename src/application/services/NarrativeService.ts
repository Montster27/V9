import { store } from '../../infrastructure/state/store';
import { 
  initializeArcs,
  addNarrativeArc,
  addAvailableClue,
  discoverClue,
  addActiveEvent,
  completeEvent,
  updateConspiracyTier,
  chooseTimelineBranch,
  unlockTimelineBranch,
  updateCharacterKnowledge,
  resetNarrative
} from '../../infrastructure/state/slices/narrativeSlice';
import { NarrativeManager } from '../../domain/services/NarrativeManager';
import { NarrativeArc, TimelineBranch } from '../../domain/models/Narrative';
import { Clue } from '../../domain/types/narrative';
import { GameEvent } from '../../domain/types/index';

/**
 * Service to connect the NarrativeManager domain service with Redux state
 */
export class NarrativeService {
  private narrativeManager: NarrativeManager;
  
  constructor() {
    // Create NarrativeManager with event callback
    this.narrativeManager = new NarrativeManager(
      undefined,
      this.handleEventTriggered.bind(this)
    );
    
    // Initialize default content
    this.narrativeManager.createInitialContent();
    
    // Sync initial state to Redux
    this.syncStateToRedux();
  }
  
  /**
   * Sync the current NarrativeManager state to Redux
   */
  private syncStateToRedux(): void {
    const progress = this.narrativeManager.getProgress();
    
    // Initialize arcs
    store.dispatch(initializeArcs(Object.values(progress.arcs)));
    
    // Set conspiracy tier
    store.dispatch(updateConspiracyTier(progress.conspiracyTier));
    
    // Add available clues
    Object.values(progress.availableClues).forEach(clue => {
      store.dispatch(addAvailableClue(clue));
    });
  }
  
  /**
   * Handle event triggered callback from NarrativeManager
   */
  private handleEventTriggered(event: GameEvent): void {
    // Add to active events in Redux
    store.dispatch(addActiveEvent(event.id));
    
    // Create news item for the event
    // In a real implementation, this would dispatch an action to add to the news feed
    console.log(`News: ${event.title} has occurred!`);
  }
  
  /**
   * Discover a clue
   */
  public discoverClue(clueId: string): Clue | undefined {
    const discoveredClue = this.narrativeManager.discoverClue(clueId);
    
    if (discoveredClue) {
      // Update Redux state
      store.dispatch(discoverClue(clueId));
      
      // Create news item for the clue
      // In a real implementation, this would dispatch an action to add to the news feed
      console.log(`News: You discovered ${discoveredClue.name}!`);
    }
    
    return discoveredClue;
  }
  
  /**
   * Add a new narrative arc
   */
  public addNarrativeArc(arc: NarrativeArc): void {
    this.narrativeManager.addNarrativeArc(arc);
    store.dispatch(addNarrativeArc(arc));
  }
  
  /**
   * Complete an event with a specific choice
   */
  public completeEvent(eventId: string, choiceId?: string): void {
    this.narrativeManager.completeEvent(eventId, choiceId);
    store.dispatch(completeEvent(eventId));
  }
  
  /**
   * Choose a timeline branch
   */
  public chooseTimelineBranch(branchId: string): TimelineBranch | undefined {
    const branch = this.narrativeManager.chooseTimelineBranch(branchId);
    
    if (branch) {
      store.dispatch(chooseTimelineBranch(branch));
      
      // Create news item for the timeline alteration
      console.log(`News: Timeline altered through "${branch.name}"`);
    }
    
    return branch;
  }
  
  /**
   * Process events based on current game state
   */
  public processEvents(gameState: Record<string, any>): GameEvent[] {
    return this.narrativeManager.processEvents(gameState);
  }
  
  /**
   * Get all active events
   */
  public getActiveEvents(): GameEvent[] {
    return this.narrativeManager.getActiveEvents();
  }
  
  /**
   * Get all available clues
   */
  public getAvailableClues(): Clue[] {
    return this.narrativeManager.getAvailableClues();
  }
  
  /**
   * Get all discovered clues
   */
  public getDiscoveredClues(): Clue[] {
    return this.narrativeManager.getDiscoveredClues();
  }
  
  /**
   * Get active narrative arcs
   */
  public getActiveArcs(): NarrativeArc[] {
    return this.narrativeManager.getActiveArcs();
  }
  
  /**
   * Update character knowledge about a clue
   */
  public updateCharacterKnowledge(characterId: string, clueId: string, knows: boolean): void {
    this.narrativeManager.updateCharacterKnowledge(characterId, clueId, knows);
    store.dispatch(updateCharacterKnowledge({ characterId, clueId, knows }));
  }
  
  /**
   * Reset the narrative system (for new game)
   */
  public resetNarrative(): void {
    // Create a new NarrativeManager
    this.narrativeManager = new NarrativeManager(
      undefined,
      this.handleEventTriggered.bind(this)
    );
    
    // Initialize default content
    this.narrativeManager.createInitialContent();
    
    // Reset Redux state
    store.dispatch(resetNarrative());
    
    // Sync to Redux
    this.syncStateToRedux();
  }
}

// Create singleton instance
export const narrativeService = new NarrativeService();