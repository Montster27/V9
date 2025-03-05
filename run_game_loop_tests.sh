#!/bin/bash
echo "Running tests for game loop fix..."
cd /Users/montysharma/Documents/v9/MMV09
npm run test src/domain/services/RealTimeGameLoop.test.ts
npm run test src/domain/services/simulation/GameSimulationService.test.ts
npm run test src/infrastructure/state/middleware/simulation/simulationMiddleware.test.ts
