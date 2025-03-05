#!/bin/bash

echo "Fixing RealTimeGameLoop test mocks..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/realtime-gameloop-tests

# Add the files
git add src/__tests__/App.test.tsx

# Commit the changes
git commit -m "fix: Add realTimeGameLoop mock to App tests

This fix addresses the 'Cannot read properties of undefined (reading 'gameLoopState')' 
error in the App tests. The test mocks were not updated to include the 
realTimeGameLoop state that was added to the Redux store.

Changes:
1. Add realTimeGameLoop state to the mock Redux state in App.test.tsx
2. Mock the gameLoopState with all required properties

This ensures consistency between the real Redux store and the test mocks."

# Display success message
echo "Changes committed successfully to branch 'fix/realtime-gameloop-tests'."
echo "Run the tests with 'npm run test' to verify the fixes."
