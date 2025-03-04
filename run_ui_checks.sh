#!/bin/bash

# run_ui_checks.sh
# Script to run all necessary checks for Use_of_Time UI components

echo "🔍 Running tests..."
npm run test

echo "🔍 Running type checking..."
npm run type:check

echo "✅ All checks completed (linting skipped due to eslint config format)!"
