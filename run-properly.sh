#!/bin/bash
echo "Running tests and type checking properly..."
cd /Users/montysharma/Documents/v9/MMV09

# Use npm to run scripts (recommended)
echo "Running tests via npm..."
npm run test

echo "Running type check via npm..."
npm run type:check

# Alternate approaches if npm run doesn't work:
# echo "Trying with npx..."
# npx vitest run
# npx tsc --noEmit

# Or use direct path:
# echo "Trying with direct path..."
# ./node_modules/.bin/vitest run
# ./node_modules/.bin/tsc --noEmit
