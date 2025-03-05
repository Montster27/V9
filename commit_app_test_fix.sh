#!/bin/bash

echo "Committing fixed App.test.tsx..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/app-test-simulation-mock

# Replace the file
mv /Users/montysharma/Documents/v9/MMV09/src/__tests__/App.test.tsx.fixed /Users/montysharma/Documents/v9/MMV09/src/__tests__/App.test.tsx

# Add the file
git add src/__tests__/App.test.tsx

# Commit the changes
git commit -m "fix: Mock simulation sync in App tests

This commit fixes the 'store.getState is not a function' error in the App tests
by properly mocking the simulation middleware and Redux store.

Changes:
1. Added mock implementation for setupSimulationSync to prevent actual sync
2. Updated store mock to include a proper getState method
3. Added mock for useRealTimeGameLoop hook
4. Kept proper resource state structure for the selectors

This fix ensures the tests run properly without trying to interact with actual
services or Redux store that don't exist in the test environment."

# Display success message
echo "Changes committed successfully to branch 'fix/app-test-simulation-mock'."
echo "Run the tests with 'npm run test' to verify the fixes."
