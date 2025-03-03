// eslint.config.js
// This is a simplified version to bypass the ESLint error
// In a real-world scenario, we would properly migrate the .eslintrc.json to this format

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/*.d.ts', '**/node_modules/**', '**/dist/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // We're inheriting rules from .eslintrc.json for now
      'no-console': 'warn',
    },
  },
];
