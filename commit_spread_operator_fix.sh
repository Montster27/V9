#!/bin/bash

echo "Committing spread operator fixes..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/spread-operator-error

# Add the files
git add src/domain/services/simulation/GameSimulationService.ts
git add src/domain/services/simulation/EventGenerationService.ts

# Commit the changes
git commit -m "fix: Add safety checks for spread operator

This commit fixes the runtime error:
'TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function'

The error occurred when trying to use the spread operator on a non-iterable object
returned from an event generator. We've added multiple safety checks:

1. In GameSimulationService:
   - Added checks for newEvents being an array before using the spread operator
   - Added Array.isArray() validation before trying to access length property

2. In EventGenerationService:
   - Added error handling around event generation
   - Added checks to ensure each generator returns a proper array
   - Added null checking for activeEvents parameter

These defensive programming changes make the code more robust against
unexpected data types while still maintaining the original functionality."

# Display success message
echo "Changes committed successfully to branch 'fix/spread-operator-error'."
echo "Run the application to verify the fixes."
