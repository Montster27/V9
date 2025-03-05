#!/bin/bash

# Run TypeScript Tests Script
#
# This script runs tests on our TypeScript fixes:
# 1. Runs the type checker on the utility files
# 2. Runs unit tests on the utility functions
# 3. Verifies the fixed files against TypeScript errors

echo "==== Running TypeScript Fix Tests ===="

# Create a report file
REPORT_FILE="TYPESCRIPT_TESTS_REPORT.md"
echo "# TypeScript Tests Report" > $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to run type checking on a file
check_file() {
  file=$1
  echo "Checking $file..."
  echo "## Type Checking: \`$file\`" >> $REPORT_FILE
  echo '```' >> $REPORT_FILE
  
  if npx tsc --noEmit "$file" >> $REPORT_FILE 2>&1; then
    echo "✓ $file passed type checking"
    echo '```' >> $REPORT_FILE
    echo "**Result:** ✅ Passed" >> $REPORT_FILE
  else
    echo "✗ $file has type errors"
    echo '```' >> $REPORT_FILE
    echo "**Result:** ❌ Failed" >> $REPORT_FILE
  fi
  echo "" >> $REPORT_FILE
}

# Run type checking on all utility files
echo "Running type checking on utility files..."
echo "# 1. Type Checking Results" >> $REPORT_FILE
echo "" >> $REPORT_FILE

FILES_TO_CHECK=(
  "src/domain/utils/typeSafeUpdates/index.ts"
  "src/domain/utils/enumHelpers.ts"
  "src/domain/utils/validationHelpers.ts"
  "src/infrastructure/state/middleware/eventMiddleware.fixed.ts"
  "src/domain/services/UseOfTimeManager.fixed.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    check_file "$file"
  else
    echo "✗ $file does not exist"
    echo "## Type Checking: \`$file\`" >> $REPORT_FILE
    echo "**Result:** ❌ File does not exist" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
  fi
done

# Run tests on the utilities
echo "# 2. Test Results" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Running tests on typeSafeUpdates..."
echo "## Unit Tests: typeSafeUpdates" >> $REPORT_FILE
echo '```' >> $REPORT_FILE

if npm test -- --findRelatedTests src/domain/utils/__tests__/typeSafeUpdates.test.ts >> $REPORT_FILE 2>&1; then
  echo "✓ typeSafeUpdates tests passed"
  echo '```' >> $REPORT_FILE
  echo "**Result:** ✅ Passed" >> $REPORT_FILE
else
  echo "✗ typeSafeUpdates tests failed"
  echo '```' >> $REPORT_FILE
  echo "**Result:** ❌ Failed" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "# 3. Compatibility Check" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Checking if fixed files integrate with the codebase..."

# Create temporary copies of files for compatibility testing
mkdir -p tmp
cp src/infrastructure/state/middleware/eventMiddleware.ts tmp/eventMiddleware.original.ts
cp src/domain/services/UseOfTimeManager.ts tmp/UseOfTimeManager.original.ts

# Temporarily apply the fixes
cp src/infrastructure/state/middleware/eventMiddleware.fixed.ts src/infrastructure/state/middleware/eventMiddleware.ts
cp src/domain/services/UseOfTimeManager.fixed.ts src/domain/services/UseOfTimeManager.ts

echo "## Compatibility Test" >> $REPORT_FILE
echo '```' >> $REPORT_FILE

if npm run type:check >> $REPORT_FILE 2>&1; then
  echo "✓ Fixed files are compatible with the codebase"
  echo '```' >> $REPORT_FILE
  echo "**Result:** ✅ Fixed files are compatible with the codebase" >> $REPORT_FILE
else
  echo "✗ Fixed files have compatibility issues"
  echo '```' >> $REPORT_FILE
  echo "**Result:** ❌ Fixed files have compatibility issues" >> $REPORT_FILE
fi

# Restore original files
cp tmp/eventMiddleware.original.ts src/infrastructure/state/middleware/eventMiddleware.ts
cp tmp/UseOfTimeManager.original.ts src/domain/services/UseOfTimeManager.ts
rm -rf tmp

echo "" >> $REPORT_FILE
echo "# 4. Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "The TypeScript fixes have been tested for:" >> $REPORT_FILE
echo "- Type correctness" >> $REPORT_FILE
echo "- Unit test functionality" >> $REPORT_FILE
echo "- Compatibility with the existing codebase" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Review this report to determine if the fixes are ready to be applied." >> $REPORT_FILE

echo "TypeScript tests completed! See $REPORT_FILE for details."
