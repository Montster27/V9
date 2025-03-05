#!/bin/bash

# Create TypeScript Fixes Branch Script
#
# This script creates a new branch for TypeScript fixes and commits the changes

# Create and checkout a new branch
git checkout -b fix/typescript-errors

# Add all the new files
git add src/domain/utils/typeSafeUpdates/index.ts
git add src/domain/utils/enumHelpers.ts
git add src/domain/utils/validationHelpers.ts
git add src/domain/utils/__tests__/typeSafeUpdates.test.ts
git add src/infrastructure/state/middleware/eventMiddleware.fixed.ts
git add src/domain/services/UseOfTimeManager.fixed.ts
git add TYPESCRIPT_FIXES_SUMMARY.md
git add TYPESCRIPT_FIXES_README.md
git add PR_DESCRIPTION_TYPESCRIPT_FIXES.md
git add apply_typescript_fixes.sh
git add run_typescript_tests.sh
git add make_typescript_scripts_executable.sh

# Commit the changes
git commit -m "fix: Add TypeScript error fixes

This commit adds utilities and fixes to address TypeScript errors:
- Add type-safe update utilities for readonly properties
- Add enum helper functions for type safety
- Add validation utilities for interfaces
- Fix event middleware and UseOfTimeManager

These changes improve type safety throughout the codebase and prepare
for the Event System implementation in Session 22."

echo "Created branch fix/typescript-errors and committed changes"
echo "Run './apply_typescript_fixes.sh' to apply the fixes to the codebase"
