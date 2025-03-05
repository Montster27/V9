#!/bin/bash
# Make this script executable
chmod +x "$0"

# Run tests and capture output
cd /Users/montysharma/Documents/v9/MMV09
npm run test > test_output.txt 2>&1
echo "Test command finished with exit code: $?" >> test_output.txt

# Run type check
npm run type:check > type_check_output.txt 2>&1
echo "Type check command finished with exit code: $?" >> type_check_output.txt
