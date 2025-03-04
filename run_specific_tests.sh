#!/bin/bash

# run_specific_tests.sh
# Run only the useOfTime component tests

echo "🔍 Running tests for useOfTime components only..."
# Using grep to filter test results rather than using test pattern
npm run test | grep -A 50 "useOfTime"

echo "✅ Test run complete!"
