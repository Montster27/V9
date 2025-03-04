#!/bin/bash
# Run all environment checks for E2E tests

echo "Running unit tests..."
npm run test

echo "Running basic E2E tests..."
npx playwright test e2e/flows/basic.spec.ts

echo "Running linter..."
# Check if eslint.config.js exists
if [ -f "eslint.config.js" ]; then
  # Use the new format
  npx eslint . --report-unused-disable-directives
else
  # Use the original command
  npm run lint
fi

echo "Running type checks..."
npm run type:check

echo "All checks completed."
