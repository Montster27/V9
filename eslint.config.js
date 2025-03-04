// eslint.config.js
// This is a simplified version to bypass the ESLint error when using TypeScript
// It properly configures ESLint to handle TypeScript syntax

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/*.d.ts', '**/node_modules/**', '**/dist/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': await import('@typescript-eslint/eslint-plugin'),
      react: await import('eslint-plugin-react'),
      'react-hooks': await import('eslint-plugin-react-hooks'),
    },
    rules: {
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
