#!/bin/bash
# Makes the script executable with: chmod +x run-app-test.sh
echo "Running App.test.tsx to verify ResourceDisplay fix..."
cd /Users/montysharma/Documents/v9/MMV09
npm run test -- App.test.tsx
