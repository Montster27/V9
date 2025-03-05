/**
 * /src/infrastructure/state/middleware/simulation/serviceRegistry.ts
 *
 * Registry for game simulation services
 * Provides dependency injection and service management
 */

import {
  GameSimulationService,
  ResourceCalculationService,
  ActivityImpactService,
  TimeProgressionService,
  EventGenerationService,
} from '../../../../domain/services/simulation';

/**
 * Service registry configuration
 */
export interface ServiceRegistryConfig {
  simulationConfig?: {
    simulationTickRate?: number;
    maxEventsPerTick?: number;
    resourceUpdateInterval?: number;
  };
  resourceConfig?: {
    baseEnergyRegen?: number;
    baseStressAccumulation?: number;
    baseStressRecovery?: number;
    skillPointsPerHour?: number;
    knowledgePerStudyHour?: number;
    moneyPerWorkHour?: number;
    socialPerSocialHour?: number;
  };
  activityConfig?: {
    efficiencyFloor?: number;
    highStressPenalty?: number;
    lowEnergyPenalty?: number;
    skillBonus?: number;
  };
  timeConfig?: {
    realSecondsPerGameDay?: number;
    startDate?: Date;
    startPaused?: boolean;
    speedMultipliers?: number[];
  };
  eventConfig?: {
    randomEventChance?: number;
    timeEventFrequency?: number;
    stressEventThreshold?: number;
    maxActiveEvents?: number;
    eventTimeout?: number;
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ServiceRegistryConfig = {
  simulationConfig: {
    simulationTickRate: 100,
    maxEventsPerTick: 1,
    resourceUpdateInterval: 0.5,
  },
  resourceConfig: {
    baseEnergyRegen: 5,
    baseStressAccumulation: 1,
    baseStressRecovery: 2,
    skillPointsPerHour: 1,
    knowledgePerStudyHour: 5,
    moneyPerWorkHour: 3,
    socialPerSocialHour: 3,
  },
  activityConfig: {
    efficiencyFloor: 0.5,
    highStressPenalty: 0.3,
    lowEnergyPenalty: 0.4,
    skillBonus: 0.5,
  },
  timeConfig: {
    realSecondsPerGameDay: 3,
    startDate: new Date(1983, 8, 1),
    startPaused: true,
    speedMultipliers: [0.5, 1, 2, 4, 8],
  },
  eventConfig: {
    randomEventChance: 0.1,
    timeEventFrequency: 8,
    stressEventThreshold: 75,
    maxActiveEvents: 3,
    eventTimeout: 60,
  },
};

/**
 * Registry for game simulation services
 */
export class ServiceRegistry {
  private config: ServiceRegistryConfig;
  private resourceService: ResourceCalculationService;
  private activityService: ActivityImpactService;
  private timeService: TimeProgressionService;
  private eventService: EventGenerationService;
  private simulationService: GameSimulationService;

  /**
   * Create a new ServiceRegistry
   * @param config Service configuration
   */
  constructor(config: ServiceRegistryConfig = {}) {
    // Deep merge config with defaults
    this.config = this.mergeConfigs(DEFAULT_CONFIG, config);

    // Create services
    this.resourceService = new ResourceCalculationService(this.config.resourceConfig);
    this.activityService = new ActivityImpactService(this.config.activityConfig);
    this.timeService = new TimeProgressionService(this.config.timeConfig);
    this.eventService = new EventGenerationService(this.config.eventConfig);

    // Create main simulation service
    this.simulationService = new GameSimulationService(
      this.config.simulationConfig,
      this.resourceService,
      this.activityService,
      this.timeService,
      this.eventService
    );
  }

  /**
   * Get the resource calculation service
   * @returns Resource calculation service
   */
  getResourceService(): ResourceCalculationService {
    return this.resourceService;
  }

  /**
   * Get the activity impact service
   * @returns Activity impact service
   */
  getActivityService(): ActivityImpactService {
    return this.activityService;
  }

  /**
   * Get the time progression service
   * @returns Time progression service
   */
  getTimeService(): TimeProgressionService {
    return this.timeService;
  }

  /**
   * Get the event generation service
   * @returns Event generation service
   */
  getEventService(): EventGenerationService {
    return this.eventService;
  }

  /**
   * Get the main game simulation service
   * @returns Game simulation service
   */
  getSimulationService(): GameSimulationService {
    return this.simulationService;
  }

  /**
   * Update service configuration
   * @param config New configuration
   */
  updateConfig(config: ServiceRegistryConfig): void {
    // Deep merge config with current
    this.config = this.mergeConfigs(this.config, config);

    // Update individual services
    if (config.resourceConfig) {
      this.resourceService.updateConfig(config.resourceConfig);
    }

    if (config.activityConfig) {
      this.activityService.updateConfig(config.activityConfig);
    }

    if (config.timeConfig) {
      this.timeService.updateConfig(config.timeConfig);
    }

    if (config.eventConfig) {
      this.eventService.updateConfig(config.eventConfig);
    }

    if (config.simulationConfig) {
      this.simulationService.updateConfig(config.simulationConfig);
    }
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig(): ServiceRegistryConfig {
    return this.cloneConfig(this.config);
  }

  /**
   * Create a new ServiceRegistry instance
   * @param config Service configuration
   * @returns New ServiceRegistry
   */
  static create(config: ServiceRegistryConfig = {}): ServiceRegistry {
    return new ServiceRegistry(config);
  }

  /**
   * Deep merge configurations
   * @param target Target object
   * @param source Source object
   * @returns Merged object
   */
  private mergeConfigs<T>(target: T, source: Partial<T>): T {
    const result: any = { ...target };

    if (source === null || typeof source !== 'object') {
      return result;
    }

    Object.keys(source).forEach((key) => {
      const sourceValue = (source as any)[key];
      const targetValue = (target as any)[key];

      if (
        targetValue &&
        sourceValue &&
        typeof targetValue === 'object' &&
        typeof sourceValue === 'object' &&
        !Array.isArray(targetValue) &&
        !Array.isArray(sourceValue)
      ) {
        // Recursive merge for nested objects
        result[key] = this.mergeConfigs(targetValue, sourceValue);
      } else {
        // Simple assignment for primitives and arrays
        result[key] = sourceValue !== undefined ? sourceValue : targetValue;
      }
    });

    return result;
  }

  /**
   * Deep clone configuration
   * @param config Configuration to clone
   * @returns Cloned configuration
   */
  private cloneConfig<T>(config: T): T {
    if (config === null || typeof config !== 'object') {
      return config;
    }

    if (Array.isArray(config)) {
      return config.map((item) => this.cloneConfig(item)) as any;
    }

    const result: any = {};

    Object.keys(config).forEach((key) => {
      const value = (config as any)[key];
      result[key] = this.cloneConfig(value);
    });

    return result;
  }
}

// Export a default service registry instance
export const defaultServiceRegistry = ServiceRegistry.create();

export default ServiceRegistry;
