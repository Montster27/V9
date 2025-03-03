#!/bin/bash
# Script to run tests for Session 4

cd /Users/montysharma/Documents/v9/MMV09
echo "Running tests for UseOfTime model..."
npm test -- src/__tests__/unit/domain/models/UseOfTime.test.ts
