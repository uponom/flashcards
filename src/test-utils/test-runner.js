/**
 * TestRunner - Simple test runner for browser-based testing
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }

  /**
   * Register a test
   * @param {string} name - Test name
   * @param {Function} fn - Test function
   */
  test(name, fn) {
    this.tests.push({ name, fn });
  }

  /**
   * Run all registered tests
   * @returns {Object} Test results
   */
  async run() {
    this.results = { passed: 0, failed: 0, errors: [] };
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ test: test.name, error });
        console.error(`✗ ${test.name}:`, error.message);
      }
    }
    
    return this.results;
  }
}

/**
 * Assert that a condition is true
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message if assertion fails
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert that two values are equal (deep comparison)
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @param {string} message - Error message if assertion fails
 */
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

/**
 * Assert that a function throws an error
 * @param {Function} fn - Function that should throw
 * @param {string} message - Error message if assertion fails
 */
function assertThrows(fn, message) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (error) {
    if (error.message === message || error.message === 'Expected function to throw') {
      throw error;
    }
    // Function threw an error as expected
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, assert, assertEqual, assertThrows };
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.TestRunner = TestRunner;
  window.assert = assert;
  window.assertEqual = assertEqual;
  window.assertThrows = assertThrows;
}
