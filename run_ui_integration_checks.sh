#!/bin/bash

# run_ui_integration_checks.sh
# This script runs tests and checks for the Main Game UI Integration

echo "🔍 Running Main Game UI Integration Checks..."

# Run tests
echo "📋 Running tests..."
npm run test -- App.test.tsx

# Run linting
echo "🔍 Running linter..."
npm run lint

# Type check
echo "🔍 Running type check..."
npm run type:check

echo "✅ All checks completed!"
