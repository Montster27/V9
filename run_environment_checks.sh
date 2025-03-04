#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Run tests
echo "Running tests..."
npm run test

# Type check
echo "Running type check..."
npm run type:check

# Skip linting for now as it's causing parsing errors with TypeScript
# echo "Running linter..."
# npm run lint
