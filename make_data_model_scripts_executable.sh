#!/bin/bash
cd /Users/montysharma/Documents/v9/MMV09

# Make the data model scripts executable
chmod +x create_data_model_branch.sh
chmod +x run_data_model_checks.sh
chmod +x commit_data_model_standardization.sh
chmod +x commit_improved_data_models.sh
chmod +x commit_test_fixes.sh
chmod +x apply_data_model_standardization.sh
chmod +x run_fixed_tests.sh

echo "Scripts are now executable. You can run:"
echo "  ./create_data_model_branch.sh to create the feature branch"
echo "  ./run_data_model_checks.sh to run tests and checks"
echo "  ./commit_data_model_standardization.sh to commit the basic changes"
echo "  ./commit_improved_data_models.sh to commit the clean architecture improvements"
echo "  ./commit_test_fixes.sh to commit the test fixes"
echo "  ./apply_data_model_standardization.sh to execute the complete workflow"
echo "  ./run_fixed_tests.sh to run the fixed tests"
