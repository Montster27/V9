#!/bin/bash

echo "Committing final test fix for App.test.tsx..."

# Make sure we're in the correct directory
cd /Users/montysharma/Documents/v9/MMV09

# Create and checkout a new branch
git checkout -b fix/app-test-text-matching

# Add the file
git add src/__tests__/App.test.tsx

# Commit the changes
git commit -m "fix: Use flexible text matching in App test

This commit fixes the test failures in App.test.tsx by using more flexible
text matching patterns.

The issue was that the resource text content like 'Energy: 75/100' is
actually rendered as separate DOM elements in the UI:
- <span class=\"resource-label\">Energy:</span>
- <span class=\"resource-value\">75/100</span>

Changes:
1. Updated the test to use regex patterns to match partial text
2. Separated the assertions for labels and values
3. Added special handling for formatted numbers with commas and symbols

This approach makes the tests more resilient to small UI changes while
still verifying the essential content is present."

# Display success message
echo "Changes committed successfully to branch 'fix/app-test-text-matching'."
echo "Run the tests with 'npm run test' to verify all tests are now passing."
