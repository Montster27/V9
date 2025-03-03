import { describe, it, expect } from 'vitest';
import { GameTimeValue } from '../GameTime';

describe('GameTimeValue', () => {
  it('should create a game time with default values', () => {
    const time = new GameTimeValue();
    expect(time.year).toBe(1983);
    expect(time.month).toBe(9);
    expect(time.day).toBe(1);
    expect(time.hour).toBe(8);
    expect(time.minute).toBe(0);
    // September 1, 1983 was a Thursday (4)
    expect(time.dayOfWeek).toBe(4);
  });

  it('should create a game time with custom values', () => {
    const time = new GameTimeValue(1983, 9, 2, 14, 30);
    expect(time.year).toBe(1983);
    expect(time.month).toBe(9);
    expect(time.day).toBe(2);
    expect(time.hour).toBe(14);
    expect(time.minute).toBe(30);
    // September 2, 1983 was a Friday (5)
    expect(time.dayOfWeek).toBe(5);
  });

  it('should add hours correctly', () => {
    const time = new GameTimeValue(1983, 9, 1, 22, 0);
    const newTime = time.addHours(4);
    
    // Should be the next day
    expect(newTime.year).toBe(1983);
    expect(newTime.month).toBe(9);
    expect(newTime.day).toBe(2);
    expect(newTime.hour).toBe(2);
    expect(newTime.minute).toBe(0);
  });

  it('should handle month and year transitions', () => {
    const time = new GameTimeValue(1983, 9, 30, 20, 0);
    const newTime = time.addHours(10);
    
    // Should be the next month
    expect(newTime.year).toBe(1983);
    expect(newTime.month).toBe(10);
    expect(newTime.day).toBe(1);
    expect(newTime.hour).toBe(6);
    expect(newTime.minute).toBe(0);
  });
});
