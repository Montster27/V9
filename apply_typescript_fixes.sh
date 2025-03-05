#!/bin/bash

# Apply TypeScript Fixes Script
#
# This script applies the TypeScript fixes to the codebase:
# 1. Copies the fixed files to their original locations
# 2. Runs type checking on the fixed files
# 3. Generates a report

echo "==== Applying TypeScript Fixes ===="

# Create directories if they don't exist
mkdir -p src/domain/utils/typeSafeUpdates
mkdir -p src/domain/utils/__tests__

# Create a report file
REPORT_FILE="TYPESCRIPT_FIXES_REPORT.md"
echo "# TypeScript Fixes Application Report" > $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Applied Fixes" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to copy a file and report the action
copy_file() {
  src=$1
  dest=$2
  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "✓ Copied $src to $dest" 
    echo "- ✓ Copied \`$src\` to \`$dest\`" >> $REPORT_FILE
  else
    echo "✗ Error: $src does not exist"
    echo "- ✗ Error: \`$src\` does not exist" >> $REPORT_FILE
  fi
}

# Apply the fixed files
echo "Copying fixed files..."

# Copy the utility files
copy_file "src/domain/utils/typeSafeUpdates/index.ts" "src/domain/utils/typeSafeUpdates/index.ts"
copy_file "src/domain/utils/enumHelpers.ts" "src/domain/utils/enumHelpers.ts"
copy_file "src/domain/utils/validationHelpers.ts" "src/domain/utils/validationHelpers.ts"
copy_file "src/domain/utils/__tests__/typeSafeUpdates.test.ts" "src/domain/utils/__tests__/typeSafeUpdates.test.ts"

# Apply fixes to the main files
copy_file "src/infrastructure/state/middleware/eventMiddleware.fixed.ts" "src/infrastructure/state/middleware/eventMiddleware.ts"
copy_file "src/domain/services/UseOfTimeManager.fixed.ts" "src/domain/services/UseOfTimeManager.ts"

echo "" >> $REPORT_FILE
echo "## Type Checking Results" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Run type checking on the fixed files
echo "Running type checking on fixed files..."
FILES_TO_CHECK=(
  "src/domain/utils/typeSafeUpdates/index.ts"
  "src/domain/utils/enumHelpers.ts"
  "src/domain/utils/validationHelpers.ts"
  "src/infrastructure/state/middleware/eventMiddleware.ts"
  "src/domain/services/UseOfTimeManager.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
  echo "Checking $file..."
  if npx tsc --noEmit "$file"; then
    echo "✓ $file passed type checking"
    echo "- ✓ \`$file\` passed type checking" >> $REPORT_FILE
  else
    echo "✗ $file has type errors"
    echo "- ✗ \`$file\` has type errors" >> $REPORT_FILE
  fi
done

# Run tests on the utilities
echo "" >> $REPORT_FILE
echo "## Test Results" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Running tests on utilities..."
if npm test -- -t "Type-Safe Update Utilities"; then
  echo "✓ Utility tests passed"
  echo "- ✓ Utility tests passed" >> $REPORT_FILE
else
  echo "✗ Utility tests failed"
  echo "- ✗ Utility tests failed" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "## Next Steps" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "1. Review the type checking and test results above" >> $REPORT_FILE
echo "2. Check for any remaining TypeScript errors with \`npm run type:check\`" >> $REPORT_FILE
echo "3. Fix any additional errors that might have been introduced" >> $REPORT_FILE
echo "4. Verify the application still works correctly with \`npm start\`" >> $REPORT_FILE

echo "TypeScript fixes applied! See $REPORT_FILE for details."
