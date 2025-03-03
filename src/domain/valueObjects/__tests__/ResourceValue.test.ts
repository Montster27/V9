import { describe, it, expect } from 'vitest';
import { ResourceValue } from '../ResourceValue';
import { ResourceType } from '../../types';

describe('ResourceValue', () => {
  it('should create a resource with default limits', () => {
    const resource = new ResourceValue(ResourceType.ENERGY, 50);
    expect(resource.value).toBe(50);
    expect(resource.min).toBe(0);
    expect(resource.max).toBe(100);
    expect(resource.type).toBe(ResourceType.ENERGY);
  });

  it('should clamp values within min and max', () => {
    const resource = new ResourceValue(ResourceType.ENERGY, 120);
    expect(resource.value).toBe(100);

    resource.value = -10;
    expect(resource.value).toBe(0);
  });

  it('should add and subtract values correctly', () => {
    const resource = new ResourceValue(ResourceType.ENERGY, 50);
    
    resource.add(30);
    expect(resource.value).toBe(80);
    
    resource.subtract(40);
    expect(resource.value).toBe(40);
    
    // Test clamping during operations
    resource.add(100);
    expect(resource.value).toBe(100);
    
    resource.subtract(150);
    expect(resource.value).toBe(0);
  });

  it('should clone properly', () => {
    const resource = new ResourceValue(ResourceType.ENERGY, 50);
    const clone = resource.clone();
    
    expect(clone.value).toBe(50);
    expect(clone.type).toBe(ResourceType.ENERGY);
    
    // Verify independence
    resource.add(20);
    expect(resource.value).toBe(70);
    expect(clone.value).toBe(50);
  });
});
