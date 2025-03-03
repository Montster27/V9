#!/bin/bash
# ensure-dependencies.sh - Ensure all dependencies are installed

echo "Ensuring all dependencies are installed..."

# Core dependencies
echo "Installing core dependencies..."
npm install react-redux @reduxjs/toolkit redux-persist immer zod uuid dayjs

# Development dependencies
echo "Installing development dependencies..."
npm install --save-dev @types/react @types/react-dom @types/node @types/uuid vitest jsdom @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier husky lint-staged

echo "All dependencies have been installed or updated."
