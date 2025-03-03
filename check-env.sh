#!/bin/bash
echo "Checking environment..."
cd /Users/montysharma/Documents/v9/MMV09

# Check if node_modules/.bin exists
echo "Checking for node_modules/.bin..."
if [ -d "node_modules/.bin" ]; then
  echo "Directory exists!"
  ls -l node_modules/.bin
else
  echo "Directory does not exist!"
fi

# Check npm version
echo "npm version:"
npm --version

# Check if tsc exists in node_modules
echo "Checking for tsc in node_modules..."
if [ -f "node_modules/.bin/tsc" ]; then
  echo "tsc exists!"
else
  echo "tsc not found in node_modules/.bin!"
fi

# Check if vitest exists in node_modules
echo "Checking for vitest in node_modules..."
if [ -f "node_modules/.bin/vitest" ]; then
  echo "vitest exists!"
else
  echo "vitest not found in node_modules/.bin!"
fi

# Try running commands with npx
echo "Trying with npx..."
echo "npx tsc --version:"
npx tsc --version

echo "Environment check complete."
