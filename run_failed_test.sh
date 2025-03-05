#!/bin/bash
# Run just the failed test to verify our fix

cd /Users/montysharma/Documents/v9/MMV09
npm test -- src/__tests__/RealTimeDataIntegration.test.tsx
