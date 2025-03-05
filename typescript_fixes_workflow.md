# TypeScript Fixes Workflow

This document outlines the step-by-step workflow for applying the TypeScript fixes to the Middle Age Multiverse project.

## Prerequisites

Ensure you are working with the latest version of the codebase:

```bash
git checkout develop
git pull origin develop
```

## Workflow Steps

### 1. Make Scripts Executable

```bash
bash make_all_typescript_scripts_executable.sh
```

This will make all TypeScript fix scripts executable.

### 2. Create Branch and Stage Changes

```bash
./create_typescript_fixes_branch.sh
```

This script will:

- Create a new branch called `fix/typescript-errors`
- Add all the new TypeScript fix files to git
- Commit the changes with a descriptive message

### 3. Run Tests

```bash
./run_typescript_tests.sh
```

This script will:

- Run type checking on all new utility files
- Run unit tests for the utility functions
- Test compatibility with the existing codebase
- Generate a report at `TYPESCRIPT_TESTS_REPORT.md`

Review this report to ensure all tests pass.

### 4. Apply Fixes

```bash
./apply_typescript_fixes.sh
```

This script will:

- Copy the fixed files to their original locations
- Run type checking on the fixed files
- Generate a report at `TYPESCRIPT_FIXES_REPORT.md`

Review this report to verify the fixes were applied correctly.

### 5. Verify Application

Start the application to ensure it still works correctly:

```bash
npm start
```

Test the main functionality to ensure nothing is broken.

### 6. Commit Applied Changes

```bash
git add .
git commit -m "chore: Apply TypeScript fixes to codebase"
```

### 7. Push Branch and Create Pull Request

```bash
git push origin fix/typescript-errors
```

Create a pull request with the content from `PR_DESCRIPTION_TYPESCRIPT_FIXES.md`.

## Troubleshooting

### If Type Checking Fails

If type checking fails after applying the fixes:

1. Review the error messages in the report
2. Check the specific files with errors
3. Update the utility functions or fixed files as needed
4. Run the tests again
5. Apply the fixes again

### If Tests Fail

If unit tests fail:

1. Review the test output in the report
2. Fix the issues in the utility functions
3. Run the tests again
4. Apply the fixes again

### If Application Breaks

If the application doesn't work after applying the fixes:

1. Check the browser console for errors
2. Revert to the original files if needed:
   ```bash
   git checkout develop -- src/infrastructure/state/middleware/eventMiddleware.ts src/domain/services/UseOfTimeManager.ts
   ```
3. Fix the issues in the utility functions or fixed files
4. Apply the fixes again
