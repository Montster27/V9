#!/bin/bash

# Create and checkout feature branch for UI data integration
echo "Creating feature branch for UI data integration..."
git checkout develop
git pull origin develop
git checkout -b feature/ui-data-integration

echo "Branch created and checked out successfully!"
