/**
 * /src/domain/services/RealTimeGameLoop.ts
 *
 * Real-time game loop service integrating with simulation services
 * Provides efficient animation frame-based game loop with tick batching
 */

import { GameSimulationService, SimulationUpdate } from './simulation/GameSimulationService';

/**
 * Game loop configuration options
 */
export interface RealTimeGameLoopConfig {
  targetFPS: number; // Target frames per second
  maxTicksPerFrame: number; // Maximum simulation ticks per frame
  simulationTickRateMs: number; // Milliseconds between simulation ticks
  autoStart: boolean; // Start automatically
}

/**
 * Game loop event types
 */
export enum GameLoopEventType {
  FRAME = 'frame', // Animation frame processed
  TICK = 'tick', // Simulation tick processed
  START = 'start', // Game loop started
  STOP = 'stop', // Game loop stopped
  PAUSE = 'pause', // Game paused
  RESUME = 'resume', // Game resumed
  ERROR = 'error', // Error occurred
}

/**
 * Game loop event data
 */
export interface GameLoopEventData {
  timestamp: number; // Current timestamp
  deltaTime: number; // Time since last frame (ms)
  simulationUpdates: SimulationUpdate[]; // Simulation updates from this frame
  tickCount: number; // Number of ticks processed in this frame
  fps: number; // Current frames per second
  error?: Error; // Error if one occurred
}

/**
 * Game loop state
 */
export interface GameLoopState {
  isRunning: boolean; // Is the loop running
  isPaused: boolean; // Is the game paused
  startTime: number; // When the loop started
  lastFrameTime: number; // Last frame timestamp
  frameCount: number; // Total frames processed
  tickCount: number; // Total ticks processed
  fps: number; // Current FPS
  ticksThisFrame: number; // Ticks processed in current frame
  simulationTime: number; // Total simulation time (ms)
  realTime: number; // Total real time (ms)
}

/**
 * Event listener function type
 */
export type GameLoopEventListener = (data: GameLoopEventData) => void;

/**
 * Real-time game loop with simulation integration
 */
export class RealTimeGameLoop {
  private config: RealTimeGameLoopConfig;
  private simulation: GameSimulationService;
  private state: GameLoopState;
  private animationFrameId: number | null = null;
  private eventListeners: Map<GameLoopEventType, Set<GameLoopEventListener>>;
  private tickAccumulator: number = 0;
  private simulationUpdates: SimulationUpdate[] = [];
  private lastFpsUpdateTime: number = 0;
  private frameTimeHistory: number[] = [];

  /**
   * Create a new RealTimeGameLoop
   * @param simulation Game simulation service
   * @param config Game loop configuration
   */
  constructor(simulation: GameSimulationService, config: Partial<RealTimeGameLoopConfig> = {}) {
    // Store simulation
    this.simulation = simulation;

    // Initialize config with defaults
    this.config = {
      targetFPS: config.targetFPS ?? 60,
      maxTicksPerFrame: config.maxTicksPerFrame ?? 5,
      simulationTickRateMs: config.simulationTickRateMs ?? 100,
      autoStart: config.autoStart ?? false,
    };

    // Initialize state
    this.state = {
      isRunning: false,
      isPaused: simulation.getCurrentGameTime().getIsPaused(),
      startTime: 0,
      lastFrameTime: 0,
      frameCount: 0,
      tickCount: 0,
      fps: 0,
      ticksThisFrame: 0,
      simulationTime: 0,
      realTime: 0,
    };

    // Initialize event listeners
    this.eventListeners = new Map<GameLoopEventType, Set<GameLoopEventListener>>();
    Object.values(GameLoopEventType).forEach((type) => {
      this.eventListeners.set(type, new Set<GameLoopEventListener>());
    });

    // Subscribe to simulation updates
    this.simulation.subscribe(this.handleSimulationUpdate.bind(this));

    // Start if autoStart is true
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Handle simulation updates
   * @param update Simulation update
   */
  private handleSimulationUpdate(update: SimulationUpdate): void {
    // Store updates to emit in next frame
    this.simulationUpdates.push(update);
  }

  /**
   * Start the game loop
   */
  public start(): void {
    console.log('RealTimeGameLoop.start() called');
    if (this.state.isRunning) {
      console.log('Game loop already running, ignoring start call');
      return;
    }

    // Update state
    this.state = {
      ...this.state,
      isRunning: true,
      startTime: performance.now(),
      lastFrameTime: performance.now(),
    };

    // Start simulation
    this.simulation.start();

    // Start animation frame loop
    this.scheduleTick();

    // Emit start event
    this.emitEvent(GameLoopEventType.START, {
      timestamp: this.state.startTime,
      deltaTime: 0,
      simulationUpdates: [],
      tickCount: 0,
      fps: 0,
    });
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    // Update state
    this.state = {
      ...this.state,
      isRunning: false,
    };

    // Stop simulation
    this.simulation.stop();

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Emit stop event
    this.emitEvent(GameLoopEventType.STOP, {
      timestamp: performance.now(),
      deltaTime: 0,
      simulationUpdates: [],
      tickCount: 0,
      fps: this.state.fps,
    });
  }

  /**
   * Pause the game loop
   */
  public pause(): void {
    if (this.state.isPaused) {
      return;
    }

    // Pause simulation
    this.simulation.pauseTime();

    // Update state
    this.state = {
      ...this.state,
      isPaused: true,
    };

    // Emit pause event
    this.emitEvent(GameLoopEventType.PAUSE, {
      timestamp: performance.now(),
      deltaTime: 0,
      simulationUpdates: [],
      tickCount: 0,
      fps: this.state.fps,
    });
  }

  /**
   * Resume the game loop
   */
  public resume(): void {
    if (!this.state.isPaused) {
      return;
    }

    // Resume simulation
    this.simulation.resumeTime();

    // Update state
    this.state = {
      ...this.state,
      isPaused: false,
      lastFrameTime: performance.now(), // Reset last frame time to avoid large delta
    };

    // Emit resume event
    this.emitEvent(GameLoopEventType.RESUME, {
      timestamp: performance.now(),
      deltaTime: 0,
      simulationUpdates: [],
      tickCount: 0,
      fps: this.state.fps,
    });
  }

  /**
   * Toggle pause state
   * @returns New pause state
   */
  public togglePause(): boolean {
    if (this.state.isPaused) {
      this.resume();
      return false;
    } else {
      this.pause();
      return true;
    }
  }

  /**
   * Schedule the next tick
   */
  private scheduleTick(): void {
    if (!this.state.isRunning) {
      return;
    }

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Main tick function
   * @param timestamp Current timestamp
   */
  private tick(timestamp: number): void {
    // Schedule next tick
    this.scheduleTick();

    // Calculate delta time
    const deltaTime = timestamp - this.state.lastFrameTime;

    // Update frame time history for FPS calculation
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Update FPS every second
    if (timestamp - this.lastFpsUpdateTime > 1000) {
      const avgFrameTime =
        this.frameTimeHistory.reduce((sum, time) => sum + time, 0) /
        Math.max(1, this.frameTimeHistory.length);
      const fps = Math.round(1000 / avgFrameTime);

      this.state = {
        ...this.state,
        fps,
      };

      this.lastFpsUpdateTime = timestamp;
    }

    // Process simulation ticks
    if (!this.state.isPaused) {
      // Add delta time to accumulator
      this.tickAccumulator += deltaTime;

      // Calculate how many ticks to process
      const ticksToProcess = Math.min(
        this.config.maxTicksPerFrame,
        Math.floor(this.tickAccumulator / this.config.simulationTickRateMs)
      );

      // Process ticks
      if (ticksToProcess > 0) {
        // Manually trigger simulation ticks
        console.log(
          `Processing ${ticksToProcess} simulation ticks, isPaused=${this.state.isPaused}`
        );

        // Make sure simulation is also not paused
        if (this.simulation.getCurrentGameTime().getIsPaused()) {
          console.log('Resuming simulation service since game loop is running');
          this.simulation.resumeTime();
        }

        // Process ticks
        for (let i = 0; i < ticksToProcess; i++) {
          const update = this.simulation.tick();
          console.log(
            'Tick result:',
            'time:',
            update.timeUpdate.elapsedGameHours.toFixed(2) + ' hours',
            'resources:',
            update.resourceUpdate ? 'updated' : 'no change'
          );
        }

        // Reduce accumulator
        this.tickAccumulator -= ticksToProcess * this.config.simulationTickRateMs;

        // Update state
        this.state = {
          ...this.state,
          tickCount: this.state.tickCount + ticksToProcess,
          ticksThisFrame: ticksToProcess,
          simulationTime:
            this.state.simulationTime + ticksToProcess * this.config.simulationTickRateMs,
        };

        // Emit tick event
        this.emitEvent(GameLoopEventType.TICK, {
          timestamp,
          deltaTime,
          simulationUpdates: this.simulationUpdates,
          tickCount: ticksToProcess,
          fps: this.state.fps,
        });
      }
    }

    // Update state
    this.state = {
      ...this.state,
      lastFrameTime: timestamp,
      frameCount: this.state.frameCount + 1,
      realTime: this.state.realTime + deltaTime,
      ticksThisFrame: 0,
    };

    // Emit frame event
    this.emitEvent(GameLoopEventType.FRAME, {
      timestamp,
      deltaTime,
      simulationUpdates: this.simulationUpdates,
      tickCount: 0,
      fps: this.state.fps,
    });

    // Clear simulation updates
    this.simulationUpdates = [];
  }

  /**
   * Add an event listener
   * @param eventType Event type
   * @param listener Event listener
   */
  public addEventListener(eventType: GameLoopEventType, listener: GameLoopEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   * @param eventType Event type
   * @param listener Event listener
   */
  public removeEventListener(eventType: GameLoopEventType, listener: GameLoopEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event
   * @param eventType Event type
   * @param data Event data
   */
  private emitEvent(eventType: GameLoopEventType, data: GameLoopEventData): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      // Create frozen data to prevent modifications
      const frozenData = Object.freeze({ ...data });

      // Call all listeners
      listeners.forEach((listener) => {
        try {
          listener(frozenData);
        } catch (error) {
          console.error(`Error in game loop event listener for ${eventType}:`, error);

          // Emit error event
          if (eventType !== GameLoopEventType.ERROR) {
            this.emitEvent(GameLoopEventType.ERROR, {
              timestamp: performance.now(),
              deltaTime: 0,
              simulationUpdates: [],
              tickCount: 0,
              fps: this.state.fps,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }
      });
    }
  }

  /**
   * Get the current state
   * @returns Current state
   */
  public getState(): GameLoopState {
    return { ...this.state };
  }

  /**
   * Get the simulation service
   * @returns Simulation service
   */
  public getSimulation(): GameSimulationService {
    return this.simulation;
  }

  /**
   * Update configuration
   * @param config New configuration
   */
  public updateConfig(config: Partial<RealTimeGameLoopConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
