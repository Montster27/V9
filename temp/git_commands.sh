#!/bin/bash

# Create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/time-redux-integration

# Add the changes
git add src/infrastructure/state/slices/timeSlice.ts
git add src/infrastructure/state/slices/__tests__/timeSlice.test.ts
git add src/infrastructure/state/store.ts

# Commit the changes
git commit -m "feat(time): implement time redux slice"

# Push to remote
git push -u origin feature/time-redux-integration

# Instructions for creating a pull request
echo "Now create a pull request on GitHub with the following details:"
echo "Title: feat(time): implement time redux slice"
echo "Description: Use the content from /Users/montysharma/Documents/v9/MMV09/temp/PR_DESCRIPTION.md"
