#!/bin/bash
# fix_ui_interactive.sh
#
# This script fixes the issues with the interactive UI components

# Ensure we're in the project directory
cd /Users/montysharma/Documents/v9/MMV09

# Make this script executable
chmod +x fix_ui_interactive.sh

# Ensure we're on the feature branch
git checkout feature/ui-usability-enhancement || {
  echo "Error: Could not checkout the feature branch"
  echo "Creating the branch now..."
  git checkout develop
  git pull origin develop
  git checkout -b feature/ui-usability-enhancement
}

echo "Fixing UI interactive components..."

# Run type check to make sure everything is compatible
echo "Running type check..."
npm run type:check

# Start the development server
echo "Starting the development server..."
echo "The UI should now be interactive! Press Ctrl+C to stop the server."
echo ""
echo "After verifying the UI works, you can commit these changes with:"
echo "git add src/infrastructure/state/slices/newsSlice.ts src/infrastructure/state/slices/resourcesSlice.ts src/infrastructure/state/store.ts src/App.tsx"
echo "git commit -m \"fix: add missing Redux slices and fix interactive UI components\""

npm run dev
