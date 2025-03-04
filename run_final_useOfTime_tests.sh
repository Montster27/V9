#!/bin/bash

# run_final_useOfTime_tests.sh
# Run only the useOfTime component tests to verify all our fixes

echo "🔍 Running final tests for useOfTime components..."
npm run test

echo "🔍 Checking types..."
npm run type:check

echo "✅ Test and type verification complete!"
