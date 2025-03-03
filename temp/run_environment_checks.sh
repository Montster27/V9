#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

echo "Running tests..."
npm run test

echo "Running linter..."
npm run lint

echo "Running type checking..."
npm run type:check
