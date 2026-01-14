/**
 * Node.js test runner for CardManager tests
 * This simulates the browser environment for testing
 */

// Simulate browser globals
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

global.window = global;

// Load modules
const fs = require('fs');
const path = require('path');

// Load source files
eval(fs.readFileSync('src/test-utils/test-runner.js', 'utf8'));
eval(fs.readFileSync('src/test-utils/test-generators.js', 'utf8'));
eval(fs.readFileSync('src/data/StorageManager.js', 'utf8'));
eval(fs.readFileSync('src/business/CardManager.js', 'utf8'));

// Load test file
eval(fs.readFileSync('src/business/CardManager.test.js', 'utf8'));

// Run tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Running CardManager Property Tests');
  console.log('='.repeat(60));
  console.log();

  console.log(`Total tests registered: ${cardManagerTests.tests.length}`);
  console.log();
  console.log('Running tests...');
  console.log('-'.repeat(60));
  
  // Run tests
  const results = await cardManagerTests.run();
  
  console.log();
  console.log('='.repeat(60));
  console.log('Test Results');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`Total: ${results.passed + results.failed}`);
  
  if (results.errors.length > 0) {
    console.log();
    console.log('Failures:');
    console.log('-'.repeat(60));
    results.errors.forEach(e => {
      console.log(`\n❌ ${e.test}`);
      console.log(`   ${e.error.message}`);
      if (e.error.stack) {
        console.log(`   ${e.error.stack.split('\n').slice(1, 3).join('\n   ')}`);
      }
    });
  } else {
    console.log();
    console.log('🎉 All tests passed!');
  }
  
  console.log();
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
