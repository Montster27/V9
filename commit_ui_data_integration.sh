#!/bin/bash
set -e

echo "Committing UI data integration changes..."

# Add files to git
git add src/App.realtimedata.tsx
git add src/interface/components/resources/ResourceDisplayEnhanced.tsx
git add src/interface/components/resources/ResourceDisplayEnhanced.css
git add src/interface/components/news/NewsStreamConnected.tsx
git add src/interface/components/time/TimeControlsConnected.tsx
git add src/interface/components/time/TimeControlsEnhanced.css
git add src/interface/components/time/index.ts
git add src/interface/components/news/index.ts
git add src/interface/components/resources/index.ts
git add src/interface/components/MainGameLayout.tsx
git add src/interface/components/MainGameLayout.css
git add src/__tests__/RealTimeDataIntegration.test.tsx
git add run_ui_data_integration_checks.sh

# Create a commit 
git commit -m "feat(ui): integrate UI components with real-time data

- Fix type errors in connected components
- Update ResourceDisplayEnhanced export for compatibility
- Fix TimeControlsConnected to use available time selectors
- Fix MainGameLayout component to use correct components
- Add TypeScript validation script for UI components
- Update component integration with proper Redux state structure"

echo "Changes committed successfully!"
