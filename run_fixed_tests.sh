#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Run only the tests that were failing
echo "Running TypeGuards test..."
npx vitest run src/__tests__/unit/domain/utils/TypeGuards.test.ts

echo "Running App tests..."
npx vitest run src/__tests__/App.test.tsx

echo "Tests completed!"
