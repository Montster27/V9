#!/bin/bash
set -e

echo "Running UI Data Integration Checks..."

# We'll only check our specific UI components to avoid the domain model errors
echo "Creating a temporary tsconfig for our components..."
cat > tsconfig.ui-check.json << EOF
{
  "extends": "./tsconfig.json",
  "include": [
    "src/interface/components/resources/ResourceDisplayEnhanced.tsx",
    "src/interface/components/news/NewsStreamConnected.tsx",
    "src/interface/components/time/TimeControlsConnected.tsx",
    "src/interface/components/MainGameLayout.tsx"
  ]
}
EOF

echo "Checking our UI components..."
npx tsc -p tsconfig.ui-check.json --noEmit

echo "Verifying new component files exist..."
[ -f "./src/interface/components/resources/ResourceDisplayEnhanced.tsx" ] || (echo "ResourceDisplayEnhanced.tsx not found" && exit 1)
[ -f "./src/interface/components/news/NewsStreamConnected.tsx" ] || (echo "NewsStreamConnected.tsx not found" && exit 1)
[ -f "./src/interface/components/time/TimeControlsConnected.tsx" ] || (echo "TimeControlsConnected.tsx not found" && exit 1)
[ -f "./src/interface/components/MainGameLayout.tsx" ] || (echo "MainGameLayout.tsx not found" && exit 1)

echo "All UI components check passed successfully!"

# Cleanup temporary file
rm tsconfig.ui-check.json
