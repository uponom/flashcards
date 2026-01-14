/**
 * Node.js test runner for StatisticsTracker tests
 */

// Mock browser globals
global.window = global;
global.document = {};

// Load dependencies
require('./src/test-utils/test-runner.js');
require('./src/test-utils/test-generators.js');
require('./src/data/StorageManager.js');
require('./src/business/CardManager.js');
require('./src/business/StatisticsTracker.js');
require('./src/business/StatisticsTracker.test.js');

// Run tests
(async () => {
  console.log('Running StatisticsTracker Property-Based Tests...\n');
  
  const startTime = Date.now();
  const results = await global.statisticsTrackerTests.run();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Duration: ${duration}s`);
  
  if (results.errors.length > 0) {
    console.log('\nFAILURES:');
    results.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`);
      console.log(`   ${error.error.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
})();
