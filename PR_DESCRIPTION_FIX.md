# Fix ResourceDisplay Component Error

## Description

This PR fixes the error `TypeError: undefined is not an object (evaluating 'energy.value')` that was preventing the application from starting. The issue was that the `ResourceDisplay` component was being used without the required props in `App.tsx`.

The fix changes the import to use `ResourceDisplayConnected` (which automatically connects to Redux) instead of the basic `ResourceDisplay` component that requires explicit props.

## Changes Made

- Updated the import in `App.tsx` to use `ResourceDisplayConnected` instead of `ResourceDisplay`
- Added a mock for `ResourceDisplayConnected` in `App.test.tsx` to ensure tests pass
- Created documentation for the fix and a plan to address related TypeScript errors
- Added a UI testing checklist for verification

## Testing Done

- Verified the fix with unit tests
- Checked that `App.test.tsx` passes with the updated mock
- Created a testing checklist for manual verification

## Related Issues

This PR addresses the blank screen issue that occurred on application startup due to undefined resource values.

## Additional Notes

There are still numerous TypeScript errors in the codebase that should be addressed separately. These are primarily related to:

1. Readonly property assignments
2. Enum type mismatches
3. Missing interface properties
4. TimeAllocation type issues

A separate PR will be created to address these TypeScript errors based on the plan outlined in `TYPESCRIPT_ERRORS_PLAN.md`.

## Screenshots

(To be added after manual testing in the browser)
