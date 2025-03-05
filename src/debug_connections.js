/**
 * Debug Connections Script
 * This script verifies all connections between the UI, game loop, and simulation services
 */

console.log('Game Time Debugging Tool');
console.log('=====================');

// Import required modules
const { RealTimeGameLoop } = require('./domain/services/RealTimeGameLoop');

const { GameSimulationService } = require('./domain/services/simulation/GameSimulationService');

const { TimeProgressionService } = require('./domain/services/simulation/TimeProgressionService');

// Initialize services
console.log('Initializing services...');
const timeService = new TimeProgressionService({
  realSecondsPerGameDay: 3,
  startPaused: false, // Start unpaused for testing
});

const simulationService = new GameSimulationService(
  { simulationTickRate: 100 },
  null,
  null,
  timeService,
  null
);

// Subscribe to simulation updates
simulationService.subscribe((update) => {
  console.log('Simulation update received:');
  console.log('- Time:', update.timeUpdate.currentDate.toLocaleString());
  console.log('- Elapsed hours:', update.timeUpdate.elapsedGameHours.toFixed(2));
  console.log('- Paused:', update.timeUpdate.isPaused);
});

const gameLoop = new RealTimeGameLoop(simulationService, {
  targetFPS: 60,
  maxTicksPerFrame: 5,
  simulationTickRateMs: 100,
  autoStart: false,
});

// Test 1: Manual tick
console.log('\nTest 1: Manual tick');
const updateResult = simulationService.tick();
console.log(
  'Manual tick result:',
  updateResult.timeUpdate.elapsedGameHours.toFixed(2),
  'hours',
  updateResult.timeUpdate.isPaused ? '(paused)' : '(running)'
);

// Test 2: Pause and resume
console.log('\nTest 2: Pause and resume');
console.log('Initial pause state:', timeService.isPaused());
simulationService.pauseTime();
console.log('After pause:', timeService.isPaused());
simulationService.resumeTime();
console.log('After resume:', timeService.isPaused());

// Test 3: Start game loop and run for a few seconds
console.log('\nTest 3: Game loop integration');
console.log('Starting game loop...');

// Log events
gameLoop.addEventListener('tick', (data) => {
  console.log('Game loop tick:', data.tickCount, 'ticks');
});

// Start the game loop
gameLoop.start();

// Run for 3 seconds then stop
setTimeout(() => {
  console.log('Stopping game loop after 3 seconds');
  gameLoop.stop();
  console.log('Final game time:', timeService.getCurrentGameDate().toLocaleString());
  console.log('Test complete');
}, 3000);
