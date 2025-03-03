#!/bin/bash
# generate-value-object.sh - Generate a new value object class

# Check if a name was provided
if [ -z "$1" ]; then
  echo "Error: No value object name provided."
  echo "Usage: ./generate-value-object.sh SkillValue"
  exit 1
fi

# Create the file
mkdir -p src/domain/valueObjects
cat > src/domain/valueObjects/$1.ts << EOF
/**
 * $1 - Domain value object
 */
export class $1 {
  // Add properties and methods here
  
  constructor() {
    // Initialize properties
  }
  
  // Add methods
  
  // Clone method
  clone(): $1 {
    return new $1();
  }
  
  // Serialization
  toJSON() {
    return {};
  }
}
EOF

# Create the test file
mkdir -p src/domain/valueObjects/__tests__
cat > src/domain/valueObjects/__tests__/$1.test.ts << EOF
import { describe, it, expect } from 'vitest';
import { $1 } from '../$1';

describe('$1', () => {
  it('should create a new instance', () => {
    const valueObject = new $1();
    expect(valueObject).toBeInstanceOf($1);
  });
  
  // Add more tests
});
EOF

echo "Generated value object $1 with test file."
