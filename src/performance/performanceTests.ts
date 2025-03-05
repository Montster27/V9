/**
 * /src/performance/performanceTests.ts
 *
 * Performance testing utilities for Middle Age Multiverse
 *
 * Contains benchmark functions to measure the performance of
 * critical game operations before and after optimization.
 */

import { TimeValue } from '../domain/valueObjects/TimeValue';
import { TimeManager } from '../domain/services/TimeManager';
import { UseOfTimeManager } from '../domain/services/UseOfTimeManager';
import { GameLoop } from '../domain/services/GameLoop';
import { ActivityType } from '../domain/models/UseOfTime';

/**
 * Simple benchmark runner
 * @param name Name of the benchmark
 * @param fn Function to benchmark
 * @param iterations Number of iterations to run
 */
export function runBenchmark(
  name: string,
  fn: () => void,
  iterations = 1000
): { name: string; averageMs: number; totalMs: number } {
  console.log(`Running benchmark: ${name}`);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const end = performance.now();
  const totalMs = end - start;
  const averageMs = totalMs / iterations;

  console.log(`  Completed ${iterations} iterations in ${totalMs.toFixed(2)}ms`);
  console.log(`  Average: ${averageMs.toFixed(4)}ms per operation`);

  return {
    name,
    averageMs,
    totalMs,
  };
}

/**
 * Run all performance tests and return results
 */
export function runAllPerformanceTests(): Record<string, { averageMs: number; totalMs: number }> {
  const results: Record<string, { averageMs: number; totalMs: number }> = {};

  // Benchmark TimeValue operations
  results.timeValueUpdate = runBenchmark(
    'TimeValue.update',
    () => {
      const timeValue = new TimeValue(new Date(1983, 8, 1));
      timeValue.update(Date.now());
    },
    5000
  );

  results.timeValueAdvanceHours = runBenchmark(
    'TimeValue.advanceHours',
    () => {
      const timeValue = new TimeValue(new Date(1983, 8, 1));
      timeValue.advanceHours(Math.random() * 24);
    },
    5000
  );

  // Benchmark TimeManager operations
  const timeManager = new TimeManager();

  results.timeManagerTick = runBenchmark(
    'TimeManager.tick',
    () => {
      timeManager.tick(Date.now());
    },
    1000
  );

  // Benchmark UseOfTimeManager operations
  const useOfTimeManager = new UseOfTimeManager({ timeManager });

  results.calculateHourlyResourceImpact = runBenchmark(
    'UseOfTimeManager.calculateHourlyResourceImpact',
    () => {
      useOfTimeManager.calculateHourlyResourceImpact(1); // 1 game hour
    },
    2000
  );

  results.updateAllocation = runBenchmark(
    'UseOfTimeManager.updateAllocation',
    () => {
      const randomHours = Math.floor(Math.random() * 8) + 1; // 1-8 hours
      const activityTypes = [
        ActivityType.STUDY,
        ActivityType.WORK,
        ActivityType.SOCIAL,
        ActivityType.REST,
      ];
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      useOfTimeManager.updateAllocation(randomActivity, randomHours);
    },
    500
  );

  // Benchmark skill cost calculation
  results.calculateSkillCost = runBenchmark(
    'UseOfTimeManager.calculateSkillCost',
    () => {
      const baseCost = 10;
      const tier = Math.floor(Math.random() * 3) + 1; // 1-3
      const previousSkills = Math.floor(Math.random() * 10); // 0-9
      const threads = ['body', 'mind', 'heart', 'world', 'mastery'];
      const thread = threads[Math.floor(Math.random() * threads.length)];

      useOfTimeManager.calculateSkillCost(baseCost, tier, previousSkills, thread);
    },
    2000
  );

  // Benchmark GameLoop operations
  const gameLoop = new GameLoop({
    timeManager,
    useOfTimeManager,
    tickRate: 100,
  });

  // Mock animationFrame for testing
  let rafCallback: (timestamp: number) => void;
  const mockRequestAnimationFrame = (callback: (timestamp: number) => void) => {
    rafCallback = callback;
    return 1;
  };

  // Patch global requestAnimationFrame temporarily
  const originalRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = mockRequestAnimationFrame as any;

  // Start the game loop
  gameLoop.start();

  results.gameLoopTick = runBenchmark(
    'GameLoop.tick',
    () => {
      if (rafCallback) {
        rafCallback(performance.now());
      }
    },
    500
  );

  // Restore original requestAnimationFrame
  globalThis.requestAnimationFrame = originalRAF;

  // Stop the game loop
  gameLoop.stop();

  return results;
}

/**
 * Compare before and after benchmark results
 * @param before Before optimization results
 * @param after After optimization results
 */
export function compareResults(
  before: Record<string, { averageMs: number; totalMs: number }>,
  after: Record<string, { averageMs: number; totalMs: number }>
): void {
  console.log('\nPerformance Comparison:');
  console.log('======================');

  const allTests = new Set([...Object.keys(before), ...Object.keys(after)]);

  allTests.forEach((test) => {
    const beforeResult = before[test];
    const afterResult = after[test];

    if (beforeResult && afterResult) {
      const improvement = (1 - afterResult.averageMs / beforeResult.averageMs) * 100;
      const improvementText =
        improvement >= 0
          ? `${improvement.toFixed(2)}% faster`
          : `${Math.abs(improvement).toFixed(2)}% slower`;

      console.log(`${test}:`);
      console.log(`  Before: ${beforeResult.averageMs.toFixed(4)}ms`);
      console.log(`  After: ${afterResult.averageMs.toFixed(4)}ms`);
      console.log(`  Change: ${improvementText}`);
    } else if (beforeResult) {
      console.log(`${test}: Only tested in before version`);
    } else if (afterResult) {
      console.log(`${test}: Only tested in after version`);
    }
  });
}

// Expose globally for console testing
(window as any).performanceTests = {
  runBenchmark,
  runAllPerformanceTests,
  compareResults,
};
