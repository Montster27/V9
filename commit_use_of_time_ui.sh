#!/bin/bash

# commit_use_of_time_ui.sh
# Script to commit Use_of_Time UI components

echo "🔍 Checking status..."
git status

echo "➕ Adding files to commit..."
git add src/interface/components/useOfTime
git add SESSION_12_SUMMARY.md
git add SESSION_12_FINAL.md
git add PR_DESCRIPTION_SESSION_12.md
git add SESSION_12_PREPARED.md
git add run_specific_tests.sh
git add run_final_useOfTime_tests.sh
git add ESLINT_NOTE.md
git add VITEST_NOTE.md
git add run_ui_checks.sh

echo "✏️ Committing changes..."
git commit -m "feat(ui): implement use_of_time UI components

- Add TimeAllocationSliders component for time distribution
- Add TimeDistributionView for visual breakdown
- Add ResourceImpactPreview for resource impact display
- Add tests for all components with proper React Testing Library practices
- Fix test issues with proper DOM queries and isolated test stores
- Update scripts to work with project's test and linting configurations

Part of Session 12 implementation."

echo "🚀 Pushing to remote..."
git push -u origin feature/use-of-time-ui-components

echo "✅ All done! Ready to create PR."
echo "📝 Use the content in PR_DESCRIPTION_SESSION_12.md for the pull request description."
