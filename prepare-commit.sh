#!/bin/bash
echo "Preparing commit for Time Redux Integration..."
cd /Users/montysharma/Documents/v9/MMV09

# Stage all files
git add src/infrastructure/state/slices/timeSlice.ts
git add src/infrastructure/state/slices/__tests__/timeSlice.test.ts
git add src/infrastructure/state/store.ts
git add SESSION_3_SUMMARY.md
git add PR_DESCRIPTION.md
git add FINAL_SESSION_3_SUMMARY.md

# Show staged changes
echo "Changes staged for commit:"
git status

echo "Ready to commit. Run:"
echo "git commit -m \"feat(time): implement time redux slice\""
echo "git push -u origin feature/time-redux-integration"
