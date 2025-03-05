# ResourceDisplay Component Fix

## Issue

The application was failing to start with the following error:

```
[Error] TypeError: undefined is not an object (evaluating 'energy.value')
```

This error occurred in the `ResourceDisplay.tsx` component when it tried to access properties of resources that were not provided via props.

## Root Cause

The `ResourceDisplay` component in `src/interface/components/resources/ResourceDisplay.tsx` expects props to be passed containing resource values. However, in `App.tsx`, the component was being used without any props, leading to undefined values.

The issue is that `ResourceDisplay` is a presentational component that needs explicit props, while `ResourceDisplayConnected` is already connected to Redux and automatically fetches the required data.

## Solution

Modified `App.tsx` to import and use `ResourceDisplayConnected` instead of `ResourceDisplay`:

```diff
- import { ResourceDisplay } from './interface/components/resources';
+ import { ResourceDisplayConnected as ResourceDisplay } from './interface/components/resources';
```

This ensures that the component used in the application has access to the Redux store and can get resource values automatically without needing explicit props.

## Verification

The fix was verified by:

1. Updating the import in `App.tsx`
2. Updating the test mock in `App.test.tsx` to include ResourceDisplayConnected
3. Running tests to ensure the component renders correctly

## Additional Notes

There are several TypeScript errors in the codebase that should be addressed separately:

1. Issues with readonly properties in various files
2. Type mismatches in the event system
3. Incorrect enum usages

These issues do not affect the immediate fix for the ResourceDisplay component but should be addressed as part of ongoing maintenance.

## Next Steps

1. Run the application with `npm run dev` to verify the fix in the browser
2. Address TypeScript errors throughout the codebase
3. Update component documentation to clarify which components are connected to Redux
