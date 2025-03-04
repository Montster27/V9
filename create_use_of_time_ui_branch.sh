#!/bin/bash

# create_use_of_time_ui_branch.sh
# Script to create feature branch for Use_of_Time UI components

echo "🔄 Checking out develop branch..."
git checkout develop

echo "🔄 Pulling latest changes..."
git pull origin develop

echo "🔍 Creating feature branch for Use_of_Time UI components..."
git checkout -b feature/use-of-time-ui-components

echo "✅ Branch created successfully!"
echo "📝 You are now on branch: feature/use-of-time-ui-components"
echo "📝 Next steps:"
echo "  1. Implement the UI components"
echo "  2. Run the tests and checks: ./run_ui_checks.sh"
echo "  3. Commit your changes"
echo "  4. Push branch and create PR with description in PR_DESCRIPTION_SESSION_12.md"
