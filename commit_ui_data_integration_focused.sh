#!/bin/bash
set -e

echo "Committing UI data integration changes (focused on UI components only)..."

# Add only UI component files to git
git add \
  src/interface/components/resources/ResourceDisplayEnhanced.tsx \
  src/interface/components/resources/ResourceDisplayEnhanced.css \
  src/interface/components/news/NewsStreamConnected.tsx \
  src/interface/components/time/TimeControlsConnected.tsx \
  src/interface/components/time/TimeControlsEnhanced.css \
  src/interface/components/MainGameLayout.tsx \
  src/interface/components/MainGameLayout.css \
  src/interface/components/resources/index.ts \
  src/interface/components/time/index.ts \
  src/interface/components/news/index.ts \
  run_ui_data_integration_checks.sh \
  DOMAIN_MODEL_TYPE_ISSUES.md \
  SESSION_21_SUMMARY.md

# Create a commit 
git commit -m "feat(ui): integrate UI components with real-time data (UI focus)

- Fix React import syntax in UI components
- Update ResourceDisplayEnhanced export for compatibility
- Update MainGameLayout to use direct imports
- Fix TimeControlsConnected to work with available selectors
- Add focused validation for UI components
- Document domain model type issues for future refactoring
- Address type compatibility issues in UI code

Note: This commit focuses only on UI components and ignores domain model type errors
that will be addressed in a separate ticket for the simulation services."

echo "UI component changes committed successfully!"
