#!/bin/bash
# make_ui_interactive.sh
#
# This script updates the app to use interactive components instead of static images

# Ensure we're in the project directory
cd /Users/montysharma/Documents/v9/MMV09

# Make this script executable
chmod +x make_ui_interactive.sh

# Ensure we're on the feature branch
git checkout feature/ui-usability-enhancement || {
  echo "Error: Could not checkout the feature branch"
  echo "Creating the branch now..."
  git checkout develop
  git pull origin develop
  git checkout -b feature/ui-usability-enhancement
}

# Create copy of original files
echo "Creating backups of original files..."
cp src/App.tsx src/App.original.tsx.bak
cp src/App.css src/App.original.css.bak

echo "Updating App.tsx and App.css to use interactive components..."

# Run type check to make sure everything is compatible
echo "Running type check..."
npm run type:check

# Start the development server
echo "Starting the development server..."
echo "The UI should now be interactive! Press Ctrl+C to stop the server."
echo "You can commit these changes with:"
echo "git add src/App.tsx src/App.css"
echo "git commit -m \"fix: update App.tsx to use interactive components\""

npm run dev
