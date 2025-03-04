# Vitest Command Line Note

## Issue

The project's Vitest configuration doesn't support the `--testPathPattern` flag that's commonly used with Jest.

## Error Message

```
CACError: Unknown option `--testPathPattern`
```

## Solution

When running tests, use the basic Vitest command without pattern flags:

```bash
npm run test
```

For running specific tests, you can:

1. Use the `-t` flag to filter by test name (if available in your Vitest config)
2. Use grep to filter test output
3. Update your package.json to include specific test commands

## Updated Test Scripts

The test scripts have been updated to run all tests without filtering flags. For reviewing specific component test results, you can manually check the test output for the relevant component names.

## Additional Information

For more details on Vitest CLI options, see the documentation:
https://vitest.dev/guide/cli.html
