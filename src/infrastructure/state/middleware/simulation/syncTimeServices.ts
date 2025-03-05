/**
 * /src/infrastructure/state/middleware/simulation/syncTimeServices.ts
 *
 * Utility for synchronizing time-related services
 * Ensures consistent time state across Redux, GameLoop, and Simulation
 */

import { GameSimulationService } from '../../../../domain/services/simulation/GameSimulationService';
import { RealTimeGameLoop } from '../../../../domain/services/RealTimeGameLoop';
import { Dispatch } from 'redux';
import { pauseTime, resumeTime } from '../../slices/timeSlice';
import { pauseRealTimeGameLoop, resumeRealTimeGameLoop } from '../../slices/realTimeGameLoopSlice';

/**
 * Synchronize pause state between all time-related services
 */
export function syncPauseState(
  dispatch: Dispatch,
  isPaused: boolean,
  gameLoop: RealTimeGameLoop,
  simulationService: GameSimulationService
): void {
  console.log(`Syncing pause state across all services: ${isPaused ? 'PAUSED' : 'RUNNING'}`);

  // Update simulation service
  if (simulationService.getCurrentGameTime().getIsPaused() !== isPaused) {
    console.log(`- Updating simulation service pause state to ${isPaused}`);
    if (isPaused) {
      simulationService.pauseTime();
    } else {
      simulationService.resumeTime();
    }
  }

  // Update game loop
  const gameLoopState = gameLoop.getState();
  if (gameLoopState.isPaused !== isPaused) {
    console.log(`- Updating game loop pause state to ${isPaused}`);
    if (isPaused) {
      gameLoop.pause();
    } else {
      gameLoop.resume();
    }
  }

  // Update Redux state
  if (isPaused) {
    dispatch(pauseTime());
    dispatch(pauseRealTimeGameLoop());
  } else {
    dispatch(resumeTime());
    dispatch(resumeRealTimeGameLoop());
  }

  console.log('Pause state synchronization complete');
}

/**
 * Verify time services are all in sync
 * Returns true if all services are in sync, false otherwise
 */
export function checkTimeServicesSync(
  reduxIsPaused: boolean,
  gameLoop: RealTimeGameLoop,
  simulationService: GameSimulationService
): boolean {
  const gameLoopIsPaused = gameLoop.getState().isPaused;
  const simulationIsPaused = simulationService.getCurrentGameTime().getIsPaused();

  const isInSync = reduxIsPaused === gameLoopIsPaused && reduxIsPaused === simulationIsPaused;

  if (!isInSync) {
    console.warn(
      'Time services out of sync:',
      'Redux:',
      reduxIsPaused,
      'GameLoop:',
      gameLoopIsPaused,
      'Simulation:',
      simulationIsPaused
    );
  }

  return isInSync;
}

export default syncPauseState;
