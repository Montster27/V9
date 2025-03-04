#!/bin/bash
# Make this script executable with: chmod +x apply_mockup_design.sh

# Apply the mockup design to the project
cd /Users/montysharma/Documents/v9/MMV09

# Ensure we're on the UI enhancement branch
git checkout feature/ui-usability-enhancement || git checkout -b feature/ui-usability-enhancement

# Copy enhanced files to appropriate locations
cp src/App.enhanced.css src/App.css
cp src/App.enhanced.tsx src/App.tsx

# Fix the test files
cp src/__tests__/App.test.tsx src/__tests__/App.test.tsx.bak
cp e2e/helpers/test-helpers.ts e2e/helpers/test-helpers.ts.bak
cp e2e/flows/narrative-progression.spec.ts e2e/flows/narrative-progression.spec.ts.bak
cp e2e/flows/skill-point-generation.spec.ts e2e/flows/skill-point-generation.spec.ts.bak
cp e2e/flows/time-progression.spec.ts e2e/flows/time-progression.spec.ts.bak

# Run tests to ensure everything is working
echo "Running tests to verify changes..."
npm run test
npm run type:check

echo "Mockup design has been applied to the project!"
echo "To see the changes, run the development server: npm run dev"
echo "After verifying the changes, use commit_ui_usability_enhancements.sh to commit them"
