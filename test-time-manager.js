// Simple script to manually check TimeManager implementation
import { TimeValue } from './src/domain/valueObjects/TimeValue.js';
import { TimeManager } from './src/domain/services/TimeManager.js';

try {
  console.log('Testing TimeManager implementation...');
  
  // Create a TimeManager instance
  const timeManager = new TimeManager();
  console.log('TimeManager created successfully.');
  
  // Get initial state
  const initialState = timeManager.getState();
  console.log('Initial state:', JSON.stringify(initialState, null, 2));
  
  // Test tick method
  console.log('Testing tick method...');
  const updatedState = timeManager.tick(Date.now() + 3000); // simulate 3 seconds passed
  console.log('Updated state after tick:', JSON.stringify(updatedState, null, 2));
  
  // Test pause/resume
  console.log('Testing pause...');
  timeManager.pause();
  console.log('Is paused:', timeManager.isPaused());
  
  console.log('Testing resume...');
  timeManager.resume();
  console.log('Is paused:', timeManager.isPaused());
  
  console.log('TimeManager tests completed successfully!');
} catch (error) {
  console.error('Error testing TimeManager:', error);
}
