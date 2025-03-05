# Redux Integration Plan

This document outlines the steps to fully integrate the enhanced Redux architecture with existing components.

## Integration Steps

### 1. Update Component Imports

Update imports in UI components to use the new selectors and hooks:

```typescript
// Before
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../infrastructure/state/store';

// After
import { useAppSelector, useAppDispatch } from '../../infrastructure/state/store';
import { selectEnergy, selectStress } from '../../infrastructure/state/slices/resourcesSlice';
```

### 2. Replace Direct State Access

Replace direct state access with memoized selectors:

```typescript
// Before
const energy = useSelector((state: RootState) => state.resources.energy);

// After
const energy = useAppSelector(selectEnergy);
```

### 3. Replace Action Dispatches

Update action dispatches to use thunks for complex operations:

```typescript
// Before
dispatch(tick(Date.now()));
dispatch(updateResources({ energy: { current: newEnergy } }));

// After
dispatch(gameTick(Date.now()));
```

### 4. Update Store Implementation

Replace the current store implementation with the enhanced version:

1. Rename `store.enhanced.ts` to `store.ts` (after backup)
2. Update any imports that may be affected

### 5. Test Component Integration

Test each component with the new Redux architecture:

1. Time controls
2. Resource displays
3. Event handling
4. Use_of_Time allocation

### 6. Performance Verification

Verify performance improvements:

1. Enable monitoring middleware with performance logging
2. Test high-frequency operations like animation frames
3. Measure render counts for critical components

## Component Update Checklist

- [ ] TimeControls
- [ ] ResourceDisplays
- [ ] EventSystem
- [ ] UseOfTimeAllocator
- [ ] NewsStream
- [ ] GameLoop
- [ ] SkillTree

## Testing Strategy

1. Unit tests for each thunk and middleware
2. Integration tests for connected components
3. End-to-end tests for critical user flows

## Rollback Plan

If issues are encountered:

1. Revert to original store implementation
2. Keep the new middleware and thunks for reference
3. Incrementally migrate instead of full replacement

## Next Session Goals

In Session 19, focus on:

1. Implementing the Game Simulation Service
2. Connecting it to the enhanced Redux architecture
3. Testing the integration with existing UI components
