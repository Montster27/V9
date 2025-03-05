#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Add all changes
git add .

# Commit with conventional commit message
git commit -m "feat(core): implement game loop"

# Push to remote
git push -u origin feature/game-loop
