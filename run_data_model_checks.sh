#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

echo "Running type checking..."
npm run type:check

echo "Running linter..."
npm run lint

echo "Running tests..."
npm run test

echo "Checking for circular dependencies..."
npx madge --circular src/

echo "All checks completed!"
