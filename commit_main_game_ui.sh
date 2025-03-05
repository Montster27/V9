#!/bin/bash

# commit_main_game_ui.sh
# Script to commit the main game UI integration changes

echo "📦 Preparing to commit main game UI integration..."

# Make sure we're on the right branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "feature/main-game-ui" ]]; then
  echo "❌ Error: You're not on the feature/main-game-ui branch!"
  echo "👉 Please run: git checkout feature/main-game-ui"
  exit 1
fi

# Run checks before committing
echo "🔍 Running checks before commit..."
./run_ui_integration_checks.sh

# Check if tests passed
if [ $? -ne 0 ]; then
  echo "❌ Checks failed. Please fix the issues before committing."
  exit 1
fi

# Stage the changes
echo "➕ Staging changes..."
git add src/App.tsx
git add src/App.css
git add src/__tests__/App.test.tsx
git add SESSION_13_SUMMARY.md
git add PR_DESCRIPTION_SESSION_13.md

# Commit the changes
echo "💾 Committing changes..."
git commit -m "feat(ui): implement main game UI integration

- Integrated all UI components into a cohesive layout
- Added ResourceStatistics and NarrativePanel placeholders
- Implemented responsive grid layout
- Connected time and use_of_time components
- Added integration tests"

echo "✅ Changes committed successfully!"
echo "👉 Next steps:"
echo "  1. Push your changes: git push -u origin feature/main-game-ui"
echo "  2. Create a pull request on GitHub"
