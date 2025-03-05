import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimeManager, TimeEventType, TimeManagerState } from './TimeManager';
import { TimeValue } from '../valueObjects/TimeValue';

describe('TimeManager', () => {
  beforeEach(() => {
    // Setup before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const timeManager = new TimeManager();
    const state = timeManager.getState();
    
    expect(state.isPaused).toBe(false);
    expect(state.currentTime).toBeInstanceOf(TimeValue);
    expect(state.totalGeneratedSkillPoints).toBe(0);
    expect(state.totalElapsedGameHours).toBe(0);
    expect(state.totalNewsUpdates).toBe(0);
  });

  it('should initialize with custom config', () => {
    const initialDate = new Date(1983, 8, 6);  // Sept 6, 1983 (5 days after Sept 1)
    initialDate.setHours(10);
    const initialTime = new TimeValue(initialDate);
    const timeManager = new TimeManager({
      realSecondsPerGameDay: 5,
      skillPointsPerGameHour: 2,
      newsUpdateFrequencyHours: 8,
      initialGameTime: initialTime,
      startPaused: true
    });
    
    const state = timeManager.getState();
    
    expect(state.isPaused).toBe(true);
    expect(state.currentTime).toEqual(initialTime);
  });

  it('should advance time correctly based on elapsed real time', () => {
    const timeManager = new TimeManager({
      realSecondsPerGameDay: 3 // 3 real seconds = 1 game day (default)
    });
    
    const initialTime = timeManager.getCurrentTime();
    
    // Advance real time by 3 seconds (1 game day)
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    const newTime = timeManager.getCurrentTime();
    
    // Time should be advanced by 1 day
    expect(newTime.getGameDate().getDate()).toBe(initialTime.getGameDate().getDate() + 1);
  });

  it('should generate skill points based on elapsed game hours', () => {
    const timeManager = new TimeManager({
      realSecondsPerGameDay: 3, // 3 real seconds = 1 game day
      skillPointsPerGameHour: 1 // 1 skill point per game hour
    });
    
    // Advance real time by 3 seconds (1 game day = 24 game hours)
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    const state = timeManager.getState();
    
    // Should generate 24 skill points (1 day * 24 hours * 1 point per hour)
    expect(state.totalGeneratedSkillPoints).toBe(24);
  });

  it('should not advance time when paused', () => {
    const timeManager = new TimeManager();
    timeManager.pause();
    
    const initialTime = timeManager.getCurrentTime();
    
    // Advance real time while paused
    vi.advanceTimersByTime(10000);
    timeManager.tick(Date.now());
    
    const newTime = timeManager.getCurrentTime();
    
    // Time should not change
    expect(newTime).toEqual(initialTime);
  });

  it('should resume time progression correctly', () => {
    const timeManager = new TimeManager();
    timeManager.pause();
    
    // Advance real time while paused
    vi.advanceTimersByTime(5000);
    timeManager.tick(Date.now());
    
    const pausedTime = timeManager.getCurrentTime();
    
    // Resume time progression
    timeManager.resume();
    
    // Advance real time while resumed
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    const newTime = timeManager.getCurrentTime();
    
    // Time should advance from the paused time
    expect(newTime.getGameDate().getDate()).toBe(pausedTime.getGameDate().getDate() + 1);
  });

  it('should toggle pause state correctly', () => {
    const timeManager = new TimeManager();
    
    // Initially not paused
    expect(timeManager.isPaused()).toBe(false);
    
    // Toggle to paused
    timeManager.togglePause();
    expect(timeManager.isPaused()).toBe(true);
    
    // Toggle back to not paused
    timeManager.togglePause();
    expect(timeManager.isPaused()).toBe(false);
  });

  it('should emit events when time changes', () => {
    const timeManager = new TimeManager();
    const tickHandler = vi.fn();
    const hourChangedHandler = vi.fn();
    const dayChangedHandler = vi.fn();
    
    timeManager.addEventListener(TimeEventType.TICK, tickHandler);
    timeManager.addEventListener(TimeEventType.HOUR_CHANGED, hourChangedHandler);
    timeManager.addEventListener(TimeEventType.DAY_CHANGED, dayChangedHandler);
    
    // Advance time by 3 seconds (1 game day)
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    // Should emit events
    expect(tickHandler).toHaveBeenCalled();
    expect(hourChangedHandler).toHaveBeenCalled();
    expect(dayChangedHandler).toHaveBeenCalled();
    
    // Event data should contain the correct information
    expect(tickHandler.mock.calls[0][0].elapsedGameHours).toBeCloseTo(24, 0);
    expect(dayChangedHandler.mock.calls[0][0].currentTime).toEqual(timeManager.getCurrentTime());
  });

  it('should emit skill points generated event', () => {
    const timeManager = new TimeManager();
    const skillPointsHandler = vi.fn();
    
    timeManager.addEventListener(TimeEventType.SKILL_POINTS_GENERATED, skillPointsHandler);
    
    // Advance time by 3 seconds (1 game day)
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    // Should emit skill points event
    expect(skillPointsHandler).toHaveBeenCalled();
    expect(skillPointsHandler.mock.calls[0][0].skillPointsGenerated).toBe(24);
  });

  it('should trigger news updates at the correct frequency', () => {
    const timeManager = new TimeManager({
      newsUpdateFrequencyHours: 4 // News update every 4 game hours
    });
    const newsUpdateHandler = vi.fn();
    
    timeManager.addEventListener(TimeEventType.NEWS_UPDATE, newsUpdateHandler);
    
    // Advance time by 3 seconds (1 game day = 24 hours)
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
    
    // Should emit 6 news updates (24 hours / 4 hour frequency)
    expect(newsUpdateHandler).toHaveBeenCalledTimes(6);
    expect(timeManager.getState().totalNewsUpdates).toBe(6);
  });

  it('should not emit events when event type has no listeners', () => {
    const timeManager = new TimeManager();
    // No event listeners registered
    
    // This should not cause any errors
    vi.advanceTimersByTime(3000);
    timeManager.tick(Date.now());
  });

  it('should handle event listener removal correctly', () => {
    const timeManager = new TimeManager();
    const tickHandler = vi.fn();
    
    timeManager.addEventListener(TimeEventType.TICK, tickHandler);
    
    // Advance time and verify handler called
    vi.advanceTimersByTime(1000);
    timeManager.tick(Date.now());
    expect(tickHandler).toHaveBeenCalledTimes(1);
    
    // Remove the event listener
    timeManager.removeEventListener(TimeEventType.TICK, tickHandler);
    
    // Advance time again
    vi.advanceTimersByTime(1000);
    timeManager.tick(Date.now());
    
    // Handler should not be called again
    expect(tickHandler).toHaveBeenCalledTimes(1);
  });

  it('should allow setting time directly', () => {
    const timeManager = new TimeManager();
    const newDate = new Date(1983, 8, 11);  // Sept 11, 1983 (10 days after Sept 1)
    newDate.setHours(12);
    const newTime = new TimeValue(newDate);
    
    timeManager.setTime(newTime);
    
    expect(timeManager.getCurrentTime()).toEqual(newTime);
  });

  it('should calculate correct game time for fractional real seconds', () => {
    const timeManager = new TimeManager({
      realSecondsPerGameDay: 3 // 3 real seconds = 1 game day
    });
    
    // Advance real time by 1.5 seconds (0.5 game days = 12 game hours)
    vi.advanceTimersByTime(1500);
    timeManager.tick(Date.now());
    
    const time = timeManager.getCurrentTime();
    
    // Should advance by 12 hours
    expect(time.getGameDate().getHours()).toBeCloseTo(12, 0);
    
    // Should generate 12 skill points
    expect(timeManager.getState().totalGeneratedSkillPoints).toBe(12);
  });

  it('should handle multiple tick calls correctly', () => {
    const timeManager = new TimeManager();
    
    // Advance in smaller increments
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(1000); // 1 second (1/3 of a game day)
      timeManager.tick(Date.now());
    }
    
    const time = timeManager.getCurrentTime();
    
    // Should advance by 1 day total
    expect(time.getGameDate().getDate()).toBe(2);  // Sept 2, 1983 (one day after the default Sept 1, 1983)
    expect(time.getGameDate().getHours()).toBeCloseTo(0, 1);
    
    // Should generate 24 skill points
    expect(timeManager.getState().totalGeneratedSkillPoints).toBe(24);
  });

  it('should emit pause and resume events', () => {
    const timeManager = new TimeManager();
    const pauseHandler = vi.fn();
    const resumeHandler = vi.fn();
    
    timeManager.addEventListener(TimeEventType.PAUSED, pauseHandler);
    timeManager.addEventListener(TimeEventType.RESUMED, resumeHandler);
    
    // Pause
    timeManager.pause();
    expect(pauseHandler).toHaveBeenCalledTimes(1);
    
    // Resume
    timeManager.resume();
    expect(resumeHandler).toHaveBeenCalledTimes(1);
  });
});