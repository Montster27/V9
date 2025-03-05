#!/bin/bash
# Create the feature branch for E2E tests

git checkout develop
git pull origin develop
git checkout -b feature/e2e-tests
