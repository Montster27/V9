#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Make script executable
chmod +x run_tests.sh

# Run tests
echo "Running tests..."
npm run test

echo "Tests completed!"
