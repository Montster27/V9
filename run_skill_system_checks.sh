#!/bin/bash
# Environment checks for Skill System implementation

cd /Users/montysharma/Documents/v9/MMV09

echo "Running tests..."
npm run test

echo "Running linter..."
npm run lint

echo "Running type check..."
npm run type:check

echo "All environment checks completed."
