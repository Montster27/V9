#!/bin/bash
# Run just the debug test

echo "Running E2E debug test..."
npx playwright test e2e/flows/debug.spec.ts

echo "Debug test completed."
echo "Check the console output and the debug-full-page.png screenshot to understand the UI structure."
