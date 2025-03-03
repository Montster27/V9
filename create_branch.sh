#!/bin/bash
# create_branch.sh - Create a new Git branch for a feature

# Check if a branch name was provided
if [ -z "$1" ]; then
  echo "Error: No branch name provided."
  echo "Usage: ./create_branch.sh feature/branch-name"
  exit 1
fi

# Create and checkout the new branch
git checkout -b $1

echo "Created and checked out new branch: $1"
