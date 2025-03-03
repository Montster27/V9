#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

echo "Staging changes..."
git add src/infrastructure/state/store.ts
git add FINAL_SESSION_3_SUMMARY.md
git add SESSION_3_FIX_REPORT.md

echo "Committing changes..."
git commit -m "fix(time): complete time redux integration by adding reducer to store"

echo "Changes committed successfully."
