#!/bin/bash
# Check just the UseOfTimeManager file for TypeScript errors
echo "Checking UseOfTimeManager.ts for TypeScript errors..."
npx tsc --noEmit src/domain/services/UseOfTimeManager.ts
