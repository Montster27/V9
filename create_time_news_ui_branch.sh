#!/bin/bash

# Create a feature branch for Time and News UI Components

echo "Creating feature branch for time-news-ui-components..."
git checkout develop
git pull origin develop
git checkout -b feature/time-news-ui-components

echo "Branch created. Ready to begin implementation."
