#!/bin/bash
echo "Running tests on fixed implementation..."
cd /Users/montysharma/Documents/v9/MMV09

# Run just the time slice tests
npm run test -- src/infrastructure/state/slices/__tests__/timeSlice.test.ts

echo "Running type check..."
npm run type:check
