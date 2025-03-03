#!/bin/bash
# make_scripts_executable.sh - Make all shell scripts executable

echo "Making shell scripts executable..."

# Make the scripts executable
find . -name "*.sh" -type f -exec chmod +x {} \;

echo "All scripts are now executable."
