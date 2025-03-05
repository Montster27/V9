#!/bin/bash

echo "Fixing App.test.tsx resource state..."

# Check if the new file exists
if [ -f "/Users/montysharma/Documents/v9/MMV09/src/__tests__/App.test.tsx.new" ]; then
  # Replace the old file with the new one
  mv /Users/montysharma/Documents/v9/MMV09/src/__tests__/App.test.tsx.new /Users/montysharma/Documents/v9/MMV09/src/__tests__/App.test.tsx
  echo "App.test.tsx replaced successfully!"
else
  echo "New file not found. Please check the path."
  exit 1
fi

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/app-test-resources

# Add the files
git add src/__tests__/App.test.tsx

# Commit the changes
git commit -m "fix: Add resources state to App test mocks

This fix addresses the 'Cannot read properties of undefined (reading 'energy')'
error in the App tests. The test mocks had realTimeGameLoop state but were
missing the resources state.

Changes:
1. Add resources state to the mock Redux state in App.test.tsx
2. Ensure all resource properties needed by selectors are present

This ensures the resource selectors can properly access the energy, stress,
and other resource properties in the tests."

# Display success message
echo "Changes committed successfully to branch 'fix/app-test-resources'."
echo "Run the tests with 'npm run test' to verify the fixes."
