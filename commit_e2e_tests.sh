#!/bin/bash
# Commit E2E tests

git add e2e/
git add PR_DESCRIPTION_SESSION_14.md
git add PR_DESCRIPTION_SESSION_14_REVISED.md
git add PR_DESCRIPTION_SESSION_14_SIMPLIFIED.md
git add PR_DESCRIPTION_SESSION_14_FINAL.md
git add SESSION_14_SUMMARY.md
git add SESSION_14_DEBUG.md
git add run_e2e_checks.sh
git add run_debug_test.sh
git add make_session14_scripts_executable.sh
git add make_all_session14_scripts_executable.sh
git add commit_e2e_tests.sh
git add create_e2e_tests_branch.sh

git commit -m "test(e2e): implement end-to-end testing with accurate selectors"
git push -u origin feature/e2e-tests
