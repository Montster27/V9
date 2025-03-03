#!/bin/bash
# Ensure that the right testing dependencies are installed

echo "Ensuring Vitest dependencies are installed..."
npm install -D vitest jsdom @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event

echo "Ensuring Playwright dependencies are installed..."
npm install -D @playwright/test
npx playwright install-deps

echo "All testing dependencies verified."
