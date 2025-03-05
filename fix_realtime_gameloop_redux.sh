#!/bin/bash

echo "Fixing RealTimeGameLoop Redux integration..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/realtime-gameloop-redux

# Add the files
git add src/infrastructure/state/store.ts

# Commit the changes
git commit -m "fix: Add realTimeGameLoop reducer to store

This fix addresses the 'gameLoop.gameLoopState is undefined' error by properly 
registering the realTimeGameLoopReducer in the Redux store. 

The issue was that our implementation used hooks from realTimeGameLoopSlice.ts,
but the reducer wasn't registered in the store configuration.

Changes:
1. Import realTimeGameLoopReducer in store.ts
2. Add realTimeGameLoop to the reducer map
3. Add realTimeGameLoop actions to ignoredActions for serialization checks
4. Add realTimeGameLoop.gameLoopState to ignoredPaths

Without these changes, accessing the realTimeGameLoop state would fail with:
TypeError: undefined is not an object (evaluating 'gameLoop.gameLoopState')"

# Display success message
echo "Changes committed successfully to branch 'fix/realtime-gameloop-redux'."
echo "Run 'git push -u origin fix/realtime-gameloop-redux' to push the changes."
