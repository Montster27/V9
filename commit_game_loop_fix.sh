#!/bin/bash

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "Error: This directory is not a git repository."
  exit 1
fi

# Create and checkout a new branch
git checkout -b fix/game-loop-connection

# Add the files
git add src/infrastructure/state/middleware/simulation/simulationMiddleware.ts
git add src/domain/services/RealTimeGameLoop.ts
git add src/domain/services/simulation/GameSimulationService.ts
git add src/infrastructure/state/store.ts
git add src/App.tsx
git add GAME_LOOP_CONNECTION_ISSUES_FIX_PLAN.md

# Commit the changes
git commit -m "fix: Connect game loop to resource updates

This fix resolves several critical issues with the game loop connection:
1. Complete empty simulation subscription in simulationMiddleware
2. Add explicit simulation tick calls in RealTimeGameLoop
3. Remove dual timing system by eliminating setInterval in GameSimulationService
4. Add simulation middleware to Redux store
5. Set up bidirectional sync between Redux and simulation in App.tsx
6. Add debugging logs to track update flow

These changes ensure proper data flow from time progression to resource updates."

# Display success message
echo "Changes committed successfully to branch 'fix/game-loop-connection'."
echo "Run 'git push -u origin fix/game-loop-connection' to push the changes."
