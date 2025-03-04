#!/bin/bash

# Commit Time and News UI Components

echo "Committing Time and News UI Components..."

# Add all new files
git add src/interface/components/time
git add src/interface/components/news
git add src/App.tsx
git add src/App.css
git add SESSION_11_SUMMARY.md
git add PR_DESCRIPTION_SESSION_11.md

# Commit the changes
git commit -m "feat(ui): implement time and news UI components"

# Push to origin
git push -u origin feature/time-news-ui-components

echo "Changes committed and pushed to origin/feature/time-news-ui-components"
echo "PR description is available in PR_DESCRIPTION_SESSION_11.md"
