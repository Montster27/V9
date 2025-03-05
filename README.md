# The Middle Age Multiverse

A Tauri-based time-travel RPG where players relive their college years with the knowledge and wisdom gained throughout life.

## Project Overview

This game allows players to explore "what if" scenarios, starting at a college campus in 1983. Players manage resources like energy, knowledge, money, social capital, and stress while navigating events and making choices that affect the future.

## Architecture

This project follows Clean Architecture principles:

- **Domain Layer**: Core game logic, entities, and business rules
- **Application Layer**: Use cases that orchestrate domain logic
- **Infrastructure Layer**: State management (Redux), persistence
- **Interface Layer**: UI components and pages

## Development Setup

### Prerequisites
- Node.js 18.x or later
- Rust and Cargo (latest stable)
- Git

### Installation
1. Clone the repository
2. Run `npm install`
3. Start development server: `npm run dev`
4. Start Tauri development: `npm run tauri dev`
5. Run tests: `npm test`

## Key Features

1. **Resource Management**: Track and manage energy, knowledge, money, social, and stress
2. **Time System**: Advance time based on activities (3 real seconds = 1 game day)
3. **Use_of_Time System**: Distribute time between different activities using sliders
4. **Skill System**: Progress through five Life Path Threads with tiered skills
5. **Event System**: Encounter events based on your choices and state

## Skill System

The game features an Adaptive Growth Web skill system with five Life Path Threads:

- **Body**: Physical stamina, health, fitness
- **Mind**: Critical thinking, problem-solving, memory  
- **Heart**: Social awareness, persuasion, leadership
- **World**: Resource management, finance, sustainability
- **Mastery**: Specialized expertise, entrepreneurship

Skills are arranged in three tiers with increasing costs and power. Players earn skill points continuously (1 per game hour) and can spend them to unlock skills that provide permanent bonuses.

## Testing

This project uses Vitest for unit and integration testing:

- Run all tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:coverage`
- E2E tests: `npm run test:e2e`

## Project Structure

```
src/
├── domain/              # Core business logic
│   ├── entities/        # Business objects
│   ├── valueObjects/    # Immutable objects
│   ├── models/          # Domain models (UseOfTime, Skill, etc.)
│   ├── services/        # Domain services
│   └── types/           # TypeScript type definitions
├── application/         # Use cases and application logic
│   ├── useCases/        # Application-specific business rules
│   ├── services/        # Application services
│   └── ports/           # Interfaces for infrastructure
├── infrastructure/      # External interfaces and tools
│   ├── state/           # Redux state management
│   └── persistence/     # Storage mechanisms
└── interface/           # UI components
    ├── components/      # React components
    └── pages/           # Page components
```
