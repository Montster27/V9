#!/bin/bash

echo "Fixing code quality issues..."
echo "Running ESLint fix..."
npm run lint:fix

echo "Formatting code with Prettier..."
npm run format

echo "Checking TypeScript types..."
npm run type:check

echo "Code quality check completed."
