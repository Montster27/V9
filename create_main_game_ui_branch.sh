#!/bin/bash

# create_main_game_ui_branch.sh
# This script creates the feature branch for the main game UI integration

echo "🔱 Creating feature branch for Main Game UI Integration..."

# Make sure we're starting from develop
echo "🔄 Checking out develop branch..."
git checkout develop

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin develop

# Create the feature branch
echo "🌱 Creating feature/main-game-ui branch..."
git checkout -b feature/main-game-ui

echo "✅ Branch created successfully!"
echo "👉 You're now on the feature/main-game-ui branch."
echo "🖥️ Start implementing the main game UI integration."
