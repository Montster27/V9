#!/bin/bash

# Script for validating Redux architecture enhancements
echo "=== Running Redux Architecture Enhancement Checks ==="

# Check TypeScript compilation
echo "Checking TypeScript compilation..."
npx tsc --noEmit --project tsconfig.json

# Run linting on new files
echo "Running lint checks on new Redux files..."
npx eslint ./src/infrastructure/state/middleware/*.ts
npx eslint ./src/infrastructure/state/thunks/*.ts
npx eslint ./src/infrastructure/state/store.enhanced.ts

# Run tests if available
echo "Running available tests..."
npx vitest run --testNamePattern="redux|store|middleware|thunk" --silent

# Success message
echo "=== Redux Architecture Enhancement Checks Complete ==="
echo "Note: Full tests will be implemented in future sessions"
