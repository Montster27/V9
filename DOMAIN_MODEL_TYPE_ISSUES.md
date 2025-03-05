# Domain Model Type Issues

During the UI component data integration (Session 21), we identified numerous type issues in the domain models and simulation services. These issues should be addressed in a dedicated refactoring task.

## Primary Issues

### 1. String Literals vs. Enums

- Many string literals are used where enums are expected:
  - `'MODIFY_RESOURCE'` vs `EffectType.MODIFY_RESOURCE`
  - `'time'` vs `TriggerType.TIME`
  - `'study'` vs `ActivityType.STUDY`

### 2. ReadOnly Property Assignments

- Many attempts to modify readonly properties:
  - `resources.energy.current = ...` (readonly property)
  - `resources.knowledge += ...` (readonly property)
  - `resources.skillPoints = ...` (readonly property)

### 3. Missing Required Properties

- Many objects are missing required properties:
  - `trigger: { type: TriggerType }` (missing `conditions` property)
  - Event effects missing various properties

### 4. Type-Safe Redux Middleware

- Redux middleware using `unknown` type for actions without proper type guards
- Many `action.type` and `action.payload` usages on `unknown` objects

## Impact

These type issues don't prevent the game from running, but they indicate potential runtime bugs and make the codebase harder to maintain. While we've successfully integrated UI components with real-time data, these underlying domain model issues should be addressed to ensure long-term code quality.

## Recommended Approach

A dedicated refactoring session should:

1. Define proper enum values and use them consistently
2. Create proper immutable update patterns for readonly properties
3. Ensure all required properties are provided in objects
4. Implement proper type guards in middleware

This should be scheduled as Session 22 or as a separate maintenance task.
