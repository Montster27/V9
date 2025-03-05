#!/bin/bash

echo "Fixing all spread operator usage..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/remove-all-spread-operators

# Add the files
git add src/domain/services/simulation/GameSimulationService.ts

# Commit the changes
git commit -m "fix: Replace all spread operators with array methods

This commit addresses the persistent spread operator error by completely
removing all spread operators from GameSimulationService.ts.

Changes:
1. Replaced all spread syntax (...array) with array.slice() 
2. Used array.concat() instead of array.push(...otherArray)
3. Added extensive array type checking before operations
4. Added error recovery to reset arrays if they become corrupted
5. Added detailed logging to diagnose future issues
6. Made code safer by ensuring 'update.newEvents' is always an array
7. Added thorough validation in all getter and setter methods

These changes take a more defensive approach to array operations, handling
cases where arrays may become undefined or corrupted during application
execution."

# Display success message
echo "All spread operators removed and committed to branch 'fix/remove-all-spread-operators'."
echo "Run the application to verify the fixes."
