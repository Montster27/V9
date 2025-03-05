#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Make this script executable
chmod +x apply_and_commit.sh

# Apply the mockup design
echo "Applying UI mockup design..."
cp src/App.enhanced.css src/App.css
cp src/App.enhanced.tsx src/App.tsx
cp src/__tests__/App.test.tsx src/__tests__/App.test.tsx.bak

# Run tests
echo "Running tests..."
npm run test
npm run type:check

# Commit changes
echo "Committing changes..."
git add .
git commit -m "feat(ui): implement UI usability enhancements

This commit adds comprehensive UI usability improvements:
- Update UI layout to match the mockup design
- Implement a 3-column layout with clear panel organization
- Add tooltip component for contextual help
- Implement help panels for detailed explanations
- Create tutorial overlay system for new players
- Enhance resource displays with visual feedback
- Improve time controls with better state visualization
- Add feedback collection mechanism
- Centralize help content in HelpSystem service
- Implement consistent visual styling across components
- Fix tests to work with the updated UI design"

# Push changes if commit was successful
if [ $? -eq 0 ]; then
  echo "Pushing changes..."
  git push -u origin feature/ui-usability-enhancement
  echo "UI enhancements completed and pushed successfully!"
else
  echo "Commit failed. Please review changes and commit manually."
fi
