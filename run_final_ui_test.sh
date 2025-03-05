#!/bin/bash
# run_final_ui_test.sh
#
# This script runs a comprehensive test of the UI usability enhancements

# Ensure we're in the project directory
cd /Users/montysharma/Documents/v9/MMV09

# Make this script executable
chmod +x run_final_ui_test.sh

# Run tests for enhanced components
echo "Testing enhanced UI components..."

# Test tooltips
echo "Testing tooltips..."
npm run test -- -t "Tooltip"

# Test help panels
echo "Testing help panels..."
npm run test -- -t "HelpPanel"

# Test enhanced time controls
echo "Testing enhanced time controls..."
npm run test -- -t "TimeControlsEnhanced"

# Test enhanced resource display
echo "Testing enhanced resource display..."
npm run test -- -t "ResourceDisplayEnhanced"

# Test enhanced news stream
echo "Testing enhanced news stream..."
npm run test -- -t "NewsStreamEnhanced"

# Test enhanced time allocation sliders
echo "Testing enhanced time allocation sliders..."
npm run test -- -t "TimeAllocationSlidersEnhanced"

# Test tutorial overlay
echo "Testing tutorial overlay..."
npm run test -- -t "TutorialOverlay"

# Test feedback button
echo "Testing feedback button..."
npm run test -- -t "FeedbackButton"

# Run type checking
echo "Running type check..."
npm run type:check

echo "UI testing complete!"
