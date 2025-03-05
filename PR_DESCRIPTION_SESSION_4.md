# Pull Request: Use_of_Time Interface and Data Structure

## Description
This PR implements the Use_of_Time data model for Middle Age Multiverse, which is the foundation for the game's time allocation system. Players will use this system to distribute their weekly hours among different activities (study, work, social, rest, exercise), impacting various resources like knowledge, money, energy, and stress.

## Changes Made
- Created `/src/domain/models/UseOfTime.ts` with:
  - ActivityType enum for different activities
  - ActivityImpact interface for resource impacts
  - TimeAllocation and WeeklyTimeAllocation interfaces
  - ResourceImpact interface for tracking resource changes
  - Utility functions for creating, adjusting, and validating time allocations
  - Resource impact calculation functions

- Added comprehensive tests in `/src/__tests__/unit/domain/models/UseOfTime.test.ts`

## Design Decisions
1. **Activity Types**: Selected core activities that represent the main ways players spend time in college
2. **Time Balancing**: Implemented proportional adjustment to maintain total weekly hours (168)
3. **Resource Impacts**: Configured default impacts based on design document specifications
4. **Stress Penalties**: Implemented additional stress calculations for insufficient rest and overexertion

## Test Coverage
- Unit tests cover all utility functions and edge cases
- Test coverage is 100% for the UseOfTime model
- Validation tests ensure integrity of the time allocation system

## Implementation Notes
- The model follows an immutable update pattern for thread safety
- Default weekly allocation provides a balanced starting point (8 hours rest, 4 hours each for other activities)
- Activity impacts are configurable, allowing for skill and item modifications in the future
- Stress penalties encourage balanced time allocations

## Related Documents
- Implements requirements from Session 4 in the Operational Plan
- Follows design specifications from the Functional Specification document

## Next Steps
After this PR is merged, we'll proceed with:
1. Implementing the Use_of_TimeManager service
2. Integrating with Redux state management
3. Creating UI components for time allocation sliders
