# TypeScript Errors Resolution Plan

## Overview

This document outlines a plan to address the TypeScript errors in the codebase. These errors were identified when running `npm run type:check` and need to be fixed to ensure proper type safety throughout the application.

## Priority Issues

### 1. Readonly Property Assignments

**Issue:** Several files attempt to modify readonly properties, which TypeScript prevents.

**Examples:**

- `Cannot assign to 'current' because it is a read-only property` in multiple locations
- `Cannot assign to 'knowledge' because it is a read-only property`

**Solution:**

- Use immutable update patterns to create new objects instead of modifying existing ones
- Utilize the spread operator to create copies with updated values
- Consider using a utility like Immer for more complex immutable updates

### 2. Enum Type Mismatches

**Issue:** Incorrect usage of enum types, particularly in the event system.

**Examples:**

- `Type '"MODIFY_RESOURCE"' is not assignable to type 'EffectType'`
- `This comparison appears to be unintentional because the types 'EffectType' and '"MODIFY_RESOURCE"' have no overlap`

**Solution:**

- Use proper enum references (e.g., `EffectType.MODIFY_RESOURCE` instead of `'MODIFY_RESOURCE'`)
- Update EventGenerationService to use correct enum types
- Ensure consistent usage of enums throughout the codebase

### 3. Missing Interface Properties

**Issue:** Objects missing required properties from interfaces.

**Examples:**

- `Property 'conditions' is missing in type '{ type: TriggerType; }' but required in type 'EventTrigger'`
- `Property 'max' is missing in type '{ current: number; }' but required in type 'ResourceValue'`

**Solution:**

- Ensure all required properties are included in object literals
- Add missing properties with appropriate default values
- Update interfaces if certain properties should be optional

### 4. Time Allocation Types

**Issue:** Type mismatches related to the TimeAllocation interface.

**Examples:**

- `Type 'number' is not assignable to type 'TimeAllocation'`

**Solution:**

- Review the UseOfTime model and ensure consistent usage
- Update allocation handling code to use proper TimeAllocation objects
- Fix type definitions if they don't match the actual implementation

## Implementation Strategy

### Phase 1: Setup and Analysis

1. Create a branch specifically for TypeScript fixes
2. Set up a script to regularly run type checks during development
3. Document all error occurrences and categorize them by type
4. Identify patterns and common issues

### Phase 2: Fix Critical Errors

1. Address readonly property issues first, as they are most prevalent
2. Fix enum type mismatches, particularly in the event system
3. Address missing interface properties
4. Fix TimeAllocation type issues

### Phase 3: Test and Verify

1. Run type checks to ensure all errors are fixed
2. Run unit tests to ensure functionality is preserved
3. Run e2e tests to verify UI components still work
4. Manual testing to ensure game mechanics are not affected

### Phase 4: Code Quality Improvements

1. Add better TypeScript documentation to key interfaces
2. Implement stricter TypeScript rules to prevent future issues
3. Add utility functions for common immutable update patterns
4. Review code for other potential type safety issues

## Timeline

- Phase 1: 1 day
- Phase 2: 2-3 days
- Phase 3: 1 day
- Phase 4: 1-2 days

Total estimated time: 5-7 days

## Success Criteria

- All TypeScript errors are resolved
- No new TypeScript errors are introduced
- Unit tests pass at 100%
- e2e tests pass at 100%
- Game functionality works as expected
