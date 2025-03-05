# PR: Data Model Standardization

## Overview

This PR implements standardized data models across the application, addressing inconsistencies in naming conventions, property structures, and type definitions. It creates a comprehensive set of domain models that align with the game design specifications and improves type safety and validation throughout the codebase.

## Changes

### New Models

- Created standardized `Resource` models with consistent structure
- Implemented `PsychologicalVariables` models for energy, stress, health, and belonging
- Added comprehensive `Event` models for the event system
- Created centralized export index for all domain models

### Validation Services

- Implemented `ValidationService` for data integrity validation
- Added validation functions for all core data types
- Created runtime type guards for dynamic data validation

### Redux Integration

- Updated `resourcesSlice` to use standardized models
- Added new `eventSlice` for event system management
- Updated `store.ts` to incorporate the event slice
- Added memoized selectors for performance optimization

### Documentation

- Added detailed data model documentation
- Created model overview and migration guide
- Documented type validation utilities

## Testing Implications

- Existing tests may need updates to match new model structure
- Redux selectors have been updated, which may affect component tests
- New validation functions should be tested with valid and invalid data

## Migration Guide

See the [Data Model Documentation](./docs/DATA_MODEL_DOCUMENTATION.md) for detailed information on the new models and how to use them in components.

Key points:

1. Import models from central `domain/models` directory
2. Use type guards when working with dynamic data
3. Validate data before using it
4. Use standardized selectors from Redux slices

## Future Work

- Update all existing UI components to use the new models
- Implement more comprehensive validation functions
- Add unit tests for validation and type guards
- Implement real-time data calculation services

## Screenshots

N/A - This PR focuses on internal structure rather than visual changes.
