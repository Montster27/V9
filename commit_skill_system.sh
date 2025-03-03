#!/bin/bash
# Commit script for Skill System implementation

cd /Users/montysharma/Documents/v9/MMV09

# Add the files
git add src/domain/models/Skill.ts
git add src/__tests__/unit/domain/models/Skill.test.ts
git add README.md
git add PR_DESCRIPTION_SESSION_7.md

# Commit with the conventional commit message
git commit -m "feat(skills): implement skill system"

# Push to the feature branch
git push -u origin feature/skill-system

echo "Changes committed and pushed to feature/skill-system branch."
