# System Patterns: The Middle Age Multiverse

## Clean Architecture

The project follows Clean Architecture principles with distinct layers:

1. **Domain Layer**: Core game logic independent of any external concerns
2. **Application Layer**: Use cases that orchestrate domain logic
3. **Infrastructure Layer**: External implementations (state management, storage)
4. **Interface Layer**: UI components and pages

This approach ensures:
- The core game logic can be tested in isolation
- The UI can evolve independently of the game mechanics
- External dependencies can be replaced without affecting core functionality

## State Management

### Redux + Domain Model

We use a hybrid approach combining Redux for UI state with a rich domain model:

- **Redux Store**: Single source of truth for the current application state
- **Domain Classes**: Encapsulate game logic and business rules
- **Slices**: Organized by feature (time, resources, skills, events)

### State Synchronization

Domain objects perform calculations and return new states, which are then dispatched to Redux:



## Key Design Patterns

### Value Objects

Immutable objects representing concepts like:
- ResourceValue
- GameTime
- SkillLevel

### Services

Stateless operations that implement game rules:
- TimeManager
- ResourceCalculator
- EventGenerator

### Repositories

Interfaces to data storage mechanisms:
- GameStateRepository
- EventRepository

### Factories

Create complex domain objects:
- EventFactory
- ActivityFactory

## Component Architecture

React components follow a clear hierarchy:

1. **Pages**: Top-level containers for each major game view
2. **Feature Components**: Implement specific game features
3. **Base Components**: Reusable UI elements

Components use:
- Functional components with hooks
- Composition over inheritance
- Prop typing for interface documentation

## Module Dependencies

Dependencies flow inward:
- Interface depends on Application and Infrastructure
- Application depends on Domain
- Domain has no external dependencies

This ensures the core game logic remains pure and testable.
