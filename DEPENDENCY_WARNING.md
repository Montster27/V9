# ⚠️ DEPENDENCY WARNING ⚠️

## Package Compatibility Issues

This project requires specific dependency versions to function correctly. Do not upgrade dependencies without thorough testing.

### Critical Dependencies

- **ESLint**: Must use version 8.x (not 9.x)
  - @typescript-eslint/eslint-plugin is not compatible with ESLint 9.x
  - If you see `npm error ERESOLVE could not resolve`, downgrade ESLint:
    ```
    npm uninstall eslint
    npm install --save-dev eslint@8.57.1
    ```

### Testing System

- **Vitest**: Required for running tests
  - If you encounter `sh: vitest: command not found`, run:
    ```
    npm install --save-dev vitest
    ```
  - Always use `npm test` to run tests, not direct vitest commands

## Known Issues

There is a failing test in `src/infrastructure/state/slices/__tests__/timeSlice.test.ts`:
- Test: "tick should advance time when not paused"
- Error: Expected day difference to be 1, but got 0
- This needs to be addressed in a future update

## When Making Changes

1. Always run tests after dependency changes
2. Do not use `--force` or `--legacy-peer-deps` as permanent solutions
3. Document any changes to dependency requirements
4. Consult the team before upgrading major versions
