#!/bin/bash
echo "Preparing git commit for Time Redux Integration..."
cd /Users/montysharma/Documents/v9/MMV09

# Stage all changed files
git add src/infrastructure/state/slices/timeSlice.ts
git add src/infrastructure/state/slices/__tests__/timeSlice.test.ts
git add src/infrastructure/state/store.ts
git add SESSION_3_SUMMARY.md
git add PR_DESCRIPTION.md

# Create commit
git commit -m "feat(time): implement time redux slice"

echo "Commit prepared. Ready to push with:"
echo "git push -u origin feature/time-redux-integration"
