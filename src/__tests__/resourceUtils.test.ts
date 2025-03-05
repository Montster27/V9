/**
 * /src/__tests__/resourceUtils.test.ts
 *
 * Tests for resource utility functions
 */

import {
  mapTrendToResourceTrend,
  TrendDirection,
  TrendRate,
  ResourceTrend,
} from '../interface/components/resources/ResourceDisplayEnhanced';

describe('mapTrendToResourceTrend', () => {
  test('should map increasing trend to up direction', () => {
    const result = mapTrendToResourceTrend('increasing', 'moderate');

    expect(result).toBeDefined();
    expect(result?.direction).toBe('up');
    expect(result?.rate).toBe('moderate');
  });

  test('should map decreasing trend to down direction', () => {
    const result = mapTrendToResourceTrend('decreasing', 'fast');

    expect(result).toBeDefined();
    expect(result?.direction).toBe('down');
    expect(result?.rate).toBe('fast');
  });

  test('should map stable trend to stable direction', () => {
    const result = mapTrendToResourceTrend('stable', 'slow');

    expect(result).toBeDefined();
    expect(result?.direction).toBe('stable');
    expect(result?.rate).toBe('slow');
  });

  test('should use default moderate rate if not provided', () => {
    const result = mapTrendToResourceTrend('increasing');

    expect(result).toBeDefined();
    expect(result?.direction).toBe('up');
    expect(result?.rate).toBe('moderate');
  });

  test('should return undefined if trend is undefined', () => {
    const result = mapTrendToResourceTrend(undefined);

    expect(result).toBeUndefined();
  });
});
