#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Add all the improved model files
git add src/domain/models/Resource.ts
git add src/domain/models/PsychologicalVariables.ts
git add src/domain/models/Event.ts
git add src/domain/models/index.ts

# Add the improved services and utilities
git add src/domain/services/ValidationService.ts
git add src/domain/utils/TypeGuards.ts

# Add the improved Redux slices
git add src/infrastructure/state/slices/resourcesSlice.ts
git add src/infrastructure/state/slices/eventSlice.ts
git add src/infrastructure/state/store.ts

# Add the test files
git add src/__tests__/unit/domain/models/Resource.test.ts
git add src/__tests__/unit/domain/services/ValidationService.test.ts
git add src/__tests__/unit/domain/utils/TypeGuards.test.ts
git add src/__tests__/integration/redux/resourcesSlice.test.ts
git add src/__tests__/integration/redux/eventSlice.test.ts

# Add documentation and scripts
git add docs/DATA_MODEL_DOCUMENTATION.md
git add CLEAN_ARCHITECTURE_IMPROVEMENTS.md
git add PR_DESCRIPTION_SESSION_17.md
git add run_data_model_checks.sh
git add commit_data_model_standardization.sh
git add apply_data_model_standardization.sh
git add make_data_model_scripts_executable.sh
git add create_data_model_branch.sh
git add SESSION_17_SUMMARY.md
git add FINAL_SESSION_17_SUMMARY.md
git add commit_improved_data_models.sh

# Commit the changes
git commit -m "refactor(data): improve data models based on clean architecture principles

- Added immutability with readonly modifiers
- Implemented more specific event types
- Enhanced validation with better error handling
- Improved TypeGuards with detailed type checking
- Created comprehensive calculation functions
- Added helper utilities for type validation
- Updated Redux slice to separate UI concerns

These improvements align the code more closely with clean architecture principles."