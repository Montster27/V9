#!/bin/bash
echo "Running final tests and checks..."
cd /Users/montysharma/Documents/v9/MMV09

# Run tests through npm
echo "Running tests with npm run test..."
npm run test

# Run type check through npm
echo "Running type check with npm run type:check..."
npm run type:check

echo "Checks completed."
