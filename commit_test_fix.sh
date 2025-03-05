#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

echo "Staging changes..."
git add src/infrastructure/state/slices/timeSlice.ts
git add src/infrastructure/state/slices/__tests__/timeSlice.test.ts
git add DEPENDENCY_WARNING.md
git add TEST_FIX_REPORT.md
git add TEST_FIX_NOTES.md

echo "Committing changes..."
git commit -m "fix: update timeSlice tick logic and test calculation"

echo "Changes committed successfully."
