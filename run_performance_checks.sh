#!/bin/bash

# Environment checks for the performance optimization PR
echo "Running environment checks for performance optimization..."

# Run tests
echo "Running tests..."
npm run test

# Check if tests passed
if [ $? -ne 0 ]; then
  echo "Tests failed! Please fix before proceeding."
  exit 1
fi

# Run linting
echo "Running linter..."
npm run lint

# Check if linting passed
if [ $? -ne 0 ]; then
  echo "Linting failed! Please fix before proceeding."
  exit 1
fi

# Run type checking
echo "Running type check..."
npm run type:check

# Check if type checking passed
if [ $? -ne 0 ]; then
  echo "Type checking failed! Please fix before proceeding."
  exit 1
fi

# Run performance tests (if available)
if [ -f "npm run test:performance" ]; then
  echo "Running performance tests..."
  npm run test:performance
fi

# Run E2E tests
echo "Running E2E tests..."
npm run test:e2e

# Check if E2E tests passed
if [ $? -ne 0 ]; then
  echo "E2E tests failed! Please fix before proceeding."
  exit 1
fi

echo "All checks passed! Ready to create the PR."
