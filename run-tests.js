/**
 * Node.js test runner for Data Layer tests
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
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.type = options?.type || '';
  }
};

global.File = class File extends global.Blob {
  constructor(parts, name, options) {
    super(parts, options);
    this.name = name;
  }
};

global.FileReader = class FileReader {
  readAsText(blob) {
    setTimeout(() => {
      this.result = blob.parts[0];
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
};

// Load modules
const fs = require('fs');
const path = require('path');

// Load source files
eval(fs.readFileSync('src/test-utils/test-runner.js', 'utf8'));
eval(fs.readFileSync('src/test-utils/test-generators.js', 'utf8'));
eval(fs.readFileSync('src/data/StorageManager.js', 'utf8'));
eval(fs.readFileSync('src/data/BackupManager.js', 'utf8'));
eval(fs.readFileSync('src/data/CSVImporter.js', 'utf8'));

// Load test files
eval(fs.readFileSync('src/data/StorageManager.test.js', 'utf8'));
eval(fs.readFileSync('src/data/BackupManager.test.js', 'utf8'));
eval(fs.readFileSync('src/data/CSVImporter.test.js', 'utf8'));

// Run tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Running Data Layer Tests');
  console.log('='.repeat(60));
  console.log();

  const runner = new TestRunner();
  
  // Register all tests
  console.log('Registering StorageManager tests...');
  runStorageManagerTests(runner, TestGenerators, propertyTest, assertEqual);
  
  console.log('Registering BackupManager tests...');
  runBackupManagerTests(runner, TestGenerators, propertyTest, assertEqual, assert);
  
  console.log('Registering CSVImporter tests...');
  runCSVImporterTests(runner, TestGenerators, propertyTest, assertEqual, assert);
  
  console.log();
  console.log('Running tests...');
  console.log('-'.repeat(60));
  
  // Run tests
  const results = await runner.run();
  
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
