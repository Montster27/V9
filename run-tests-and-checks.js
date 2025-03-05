import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  console.log('Running tests...');
  const testOutput = execSync('npm run test', { encoding: 'utf8' });
  writeFileSync('test-results.txt', testOutput);
  console.log('Tests completed.');

  console.log('Running type check...');
  const typeCheckOutput = execSync('npm run type:check', { encoding: 'utf8' });
  writeFileSync('type-check-results.txt', typeCheckOutput);
  console.log('Type check completed.');

  console.log('All checks completed successfully.');
} catch (error) {
  console.error('Error running checks:', error.message);
  if (error.stdout) writeFileSync('error-output.txt', error.stdout);
  if (error.stderr) writeFileSync('error-stderr.txt', error.stderr);
  process.exit(1);
}
