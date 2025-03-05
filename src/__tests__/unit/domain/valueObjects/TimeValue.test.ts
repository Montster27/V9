/**
 * /src/__tests__/unit/domain/valueObjects/TimeValue.test.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimeValue } from '../../../../domain/valueObjects/TimeValue';

describe('TimeValue', () => {
  let realDateNow: () => number;
  
  beforeEach(() => {
    // Save the real Date.now function
    realDateNow = Date.now;
    // Mock Date.now to return a fixed timestamp
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });
  
  afterEach(() => {
    // Restore the real Date.now function
    Date.now = realDateNow;
    vi.restoreAllMocks();
  });
  
  it('should initialize with default values', () => {
    const timeValue = new TimeValue();
    expect(timeValue.getGameDate().getFullYear()).toBe(1983);
    expect(timeValue.getGameDate().getMonth()).toBe(8); // September (0-indexed)
    expect(timeValue.getGameDate().getDate()).toBe(1);
    expect(timeValue.getIsPaused()).toBe(true);
  });
  
  it('should initialize with custom values', () => {
    const initialDate = new Date(1984, 0, 15); // January 15, 1984
    const timeValue = new TimeValue(initialDate, false);
    expect(timeValue.getGameDate().getFullYear()).toBe(1984);
    expect(timeValue.getGameDate().getMonth()).toBe(0); // January
    expect(timeValue.getGameDate().getDate()).toBe(15);
    expect(timeValue.getIsPaused()).toBe(false);
  });
  
  it('should not update game time when paused', () => {
    const initialDate = new Date(1983, 8, 1);
    const timeValue = new TimeValue(initialDate, true);
    
    // Mock Date.now to simulate 10 seconds passed
    Date.now = vi.fn(() => 11000);
    
    const updatedTimeValue = timeValue.update(Date.now());
    
    // Date should not change because time is paused
    expect(updatedTimeValue.getGameDate().getTime()).toBe(initialDate.getTime());
    expect(updatedTimeValue.getIsPaused()).toBe(true);
  });
  
  it('should update game time based on elapsed real time', () => {
    const initialDate = new Date(1983, 8, 1);
    const timeValue = new TimeValue(initialDate, false);
    
    // Mock initial timestamp
    Date.now = vi.fn(() => 1000);
    
    // Set the last real timestamp
    const initialTimeValue = timeValue.update(Date.now());
    
    // Mock Date.now to simulate 3 seconds passed (= 1 game day)
    Date.now = vi.fn(() => 4000);
    
    const updatedTimeValue = initialTimeValue.update(Date.now());
    
    // Date should advance by 1 day
    const expectedDate = new Date(1983, 8, 2); // September 2, 1983
    expect(updatedTimeValue.getGameDate().getFullYear()).toBe(expectedDate.getFullYear());
    expect(updatedTimeValue.getGameDate().getMonth()).toBe(expectedDate.getMonth());
    expect(updatedTimeValue.getGameDate().getDate()).toBe(expectedDate.getDate());
  });
  
  it('should advance fractional days correctly', () => {
    const initialDate = new Date(1983, 8, 1, 12, 0, 0); // September 1, 1983, 12:00:00
    const timeValue = new TimeValue(initialDate, false);
    
    // Mock initial timestamp
    Date.now = vi.fn(() => 1000);
    
    // Set the last real timestamp
    const initialTimeValue = timeValue.update(Date.now());
    
    // Mock Date.now to simulate 1.5 seconds passed (= 0.5 game days = 12 hours)
    Date.now = vi.fn(() => 2500);
    
    const updatedTimeValue = initialTimeValue.update(Date.now());
    
    // Time should advance by 12 hours
    expect(updatedTimeValue.getGameDate().getDate()).toBe(2); // Next day
    expect(updatedTimeValue.getGameDate().getHours()).toBe(0); // 12 + 12 = 24 = 0 of next day
  });
  
  it('should pause time correctly', () => {
    const timeValue = new TimeValue(undefined, false);
    const pausedTimeValue = timeValue.pause();
    
    expect(pausedTimeValue.getIsPaused()).toBe(true);
  });
  
  it('should resume time correctly', () => {
    const timeValue = new TimeValue(undefined, true);
    const resumedTimeValue = timeValue.resume();
    
    expect(resumedTimeValue.getIsPaused()).toBe(false);
  });
  
  it('should advance days correctly', () => {
    const initialDate = new Date(1983, 8, 1);
    const timeValue = new TimeValue(initialDate);
    
    const advancedTimeValue = timeValue.advanceDays(5);
    
    expect(advancedTimeValue.getGameDate().getDate()).toBe(6); // September 6
  });
  
  it('should advance hours correctly', () => {
    const initialDate = new Date(1983, 8, 1, 12, 0, 0); // September 1, 1983, 12:00:00
    const timeValue = new TimeValue(initialDate);
    
    const advancedTimeValue = timeValue.advanceHours(15);
    
    expect(advancedTimeValue.getGameDate().getDate()).toBe(2); // Next day
    expect(advancedTimeValue.getGameDate().getHours()).toBe(3); // 12 + 15 = 27 = 3 of next day
  });
  
  it('should convert real seconds to game hours correctly', () => {
    // 3 real seconds = 1 game day = 24 game hours
    // 1 real second = 8 game hours
    
    expect(TimeValue.realSecondsToGameHours(3)).toBe(24); // 1 day
    expect(TimeValue.realSecondsToGameHours(1.5)).toBe(12); // 12 hours
    expect(TimeValue.realSecondsToGameHours(0.375)).toBe(3); // 3 hours
  });
  
  it('should convert game hours to real seconds correctly', () => {
    // 24 game hours = 1 game day = 3 real seconds
    // 1 game hour = 0.125 real seconds
    
    expect(TimeValue.gameHoursToRealSeconds(24)).toBe(3); // 1 day
    expect(TimeValue.gameHoursToRealSeconds(12)).toBe(1.5); // 12 hours
    expect(TimeValue.gameHoursToRealSeconds(3)).toBe(0.375); // 3 hours
  });
});
