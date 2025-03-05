#!/bin/bash
echo "Running final tests..."
cd /Users/montysharma/Documents/v9/MMV09
npm run test -- src/infrastructure/state/slices/__tests__/timeSlice.test.ts
echo "Running type check..."
npm run type:check
