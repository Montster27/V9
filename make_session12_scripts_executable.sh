#!/bin/bash

# make_session12_scripts_executable.sh
# Makes all Session 12 scripts executable

chmod +x create_use_of_time_ui_branch.sh
chmod +x run_ui_checks.sh
chmod +x commit_use_of_time_ui.sh
chmod +x make_session12_scripts_executable.sh
chmod +x run_specific_tests.sh
chmod +x run_final_useOfTime_tests.sh

echo "Creating ESLint note for documentation..."
# No need to make executable, this is just a documentation file

echo "✅ All Session 12 scripts are now executable!"
