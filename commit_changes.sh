#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

echo "Staging changes..."
git add src/domain/valueObjects/TimeValue.ts
git add src/__tests__/unit/domain/valueObjects/TimeValue.test.ts
git add eslint.config.js

echo "Committing changes..."
git commit -m "feat(time): implement TimeValue value object"

echo "Pushing changes..."
git push -u origin feature/time-value-object
