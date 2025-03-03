# Technical Context: The Middle Age Multiverse

## Technology Stack

### Frontend
- **React** with **TypeScript**: For building the user interface with type safety
- **Redux Toolkit**: For state management with predictable state containers
- **Vite**: Fast and lean development server and build tool

### Desktop Application
- **Tauri**: Lightweight framework for building desktop applications with web technologies
- **Rust**: For performance-critical operations and system access

### Testing
- **Vitest**: Fast unit and integration testing compatible with ESM modules
- **Testing Library**: For testing React components
- **Playwright**: For end-to-end testing

### Storage
- **Redux Persist**: For saving game state between sessions
- **SQLite** (via Tauri): For more complex or persistent data storage

## Development Environment

### Requirements
- Node.js 18.x or later
- Rust and Cargo (latest stable)
- Git

### Editor Setup
- VS Code with recommended extensions:
  - ESLint
  - Prettier
  - Tauri
  - Rust Analyzer

### Development Workflow
1. Local development with `npm run dev`
2. Testing with `npm test`
3. Building with `npm run build` and `npm run tauri:build`

## Technical Constraints

### Cross-Platform Compatibility
- Must function on Windows, macOS, and Linux
- Target older hardware common among 55+ audience
- Minimal system requirements

### Accessibility
- Support for larger text sizes
- High contrast options
- Configurable game speed

### Performance
- Smooth performance on lower-end machines
- Efficient state management for complex game mechanics
- Optimized rendering for UI components with frequent updates

## Technical Decisions

1. **Why Tauri over Electron**: Smaller binary size, better performance, lower memory usage
2. **Why React**: Component reusability, vast ecosystem, declarative UI paradigm
3. **Why Redux**: Predictable state management for complex game state
4. **Why Clean Architecture**: Separation of concerns, testability, maintainability

This technical architecture allows us to create a responsive, accessible gaming experience for our target audience while maintaining developer productivity and code quality.
