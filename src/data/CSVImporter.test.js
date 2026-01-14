/**
 * Property-based tests for CSVImporter
 */

// Feature: flashcard-learning-app, Property 12: CSV parsing validity
// Feature: flashcard-learning-app, Property 13: CSV required fields validation
// Feature: flashcard-learning-app, Property 14: CSV import completeness
// Feature: flashcard-learning-app, Property 15: CSV import persistence

/**
 * Run CSVImporter property tests
 * @param {TestRunner} runner - Test runner instance
 * @param {TestGenerators} generators - Test generators instance
 * @param {Function} propertyTest - Property test helper
 * @param {Function} assertEqual - Assertion helper
 * @param {Function} assert - Assertion helper
 */
function runCSVImporterTests(runner, generators, propertyTest, assertEqual, assert) {
  const StorageManager = window.StorageManager;
  const CSVImporter = window.CSVImporter;

  /**
   * Helper to create a CSV file from card data
   */
  function createCSVFile(cards, includeHeader = true) {
    let csv = '';
    if (includeHeader) {
      csv = 'word,translation,tags,language\n';
    }
    
    cards.forEach(card => {
      // Escape quotes by doubling them (CSV standard)
      const word = (card.word || '').replace(/"/g, '""');
      const translation = (card.translation || '').replace(/"/g, '""');
      const tags = Array.isArray(card.tags) ? card.tags.join(';') : '';
      const language = card.language || 'en';
      csv += `"${word}","${translation}","${tags}","${language}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    return new File([blob], 'test.csv');
  }

  // Feature: flashcard-learning-app, Property 12: CSV parsing validity
  // Validates: Requirements 4.1
  runner.test('Property 12: CSV parsing validity - valid CSV parsed correctly', propertyTest(
    'valid CSV parsing',
    100,
    async () => {
      const storageManager = new StorageManager();
      const importer = new CSVImporter(storageManager);
      
      // Generate random cards
      const cards = generators.randomArray(() => generators.randomCard(), 1, 10);
      const file = createCSVFile(cards);
      
      // Parse CSV
      const parsed = await importer.parseCSV(file);
      
      // Verify all cards were parsed
      assertEqual(parsed.length, cards.length, 'Should parse all cards');
      
      // Verify each card has required fields
      parsed.forEach((card, index) => {
        assertEqual(card.word, cards[index].word, 'Word should match');
        assertEqual(card.translation, cards[index].translation, 'Translation should match');
        assert(card.id, 'Should have generated ID');
        assert(card.statistics, 'Should have statistics');
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 13: CSV required fields validation
  // Validates: Requirements 4.2
  runner.test('Property 13: CSV required fields validation - missing word column', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Create CSV without word column
    const csv = 'translation,tags,language\n"hello","greetings","en"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'invalid.csv');
    
    try {
      await importer.parseCSV(file);
      throw new Error('Should have rejected CSV without word column');
    } catch (error) {
      assert(error.message.includes('word'), 'Should report missing word column');
    }
    
    // Cleanup
    storageManager.clearAll();
  });

  // Feature: flashcard-learning-app, Property 13: CSV required fields validation
  // Validates: Requirements 4.2
  runner.test('Property 13: CSV required fields validation - missing translation column', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Create CSV without translation column
    const csv = 'word,tags,language\n"hello","greetings","en"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'invalid.csv');
    
    try {
      await importer.parseCSV(file);
      throw new Error('Should have rejected CSV without translation column');
    } catch (error) {
      assert(error.message.includes('translation'), 'Should report missing translation column');
    }
    
    // Cleanup
    storageManager.clearAll();
  });

  // Feature: flashcard-learning-app, Property 13: CSV required fields validation
  // Validates: Requirements 4.2
  runner.test('Property 13: CSV required fields validation - empty required fields', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Create CSV with empty word/translation
    const csv = 'word,translation,tags,language\n"","hello","","en"\n"world","","","en"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'invalid.csv');
    
    // Parse should succeed but skip invalid rows
    const parsed = await importer.parseCSV(file);
    
    // Should have skipped both invalid rows
    assertEqual(parsed.length, 0, 'Should skip rows with empty required fields');
    
    // Cleanup
    storageManager.clearAll();
  });

  // Feature: flashcard-learning-app, Property 14: CSV import completeness
  // Validates: Requirements 4.4
  runner.test('Property 14: CSV import completeness - all valid rows imported', propertyTest(
    'CSV import completeness',
    100,
    async () => {
      const storageManager = new StorageManager();
      const importer = new CSVImporter(storageManager);
      
      // Generate random cards
      const cards = generators.randomArray(() => generators.randomCard(), 1, 10);
      const file = createCSVFile(cards);
      
      // Import CSV
      const imported = await importer.importCSV(file);
      
      // Verify all cards were imported
      assertEqual(imported.length, cards.length, 'Should import all valid cards');
      
      // Verify cards are in storage
      const stored = storageManager.loadCards();
      assert(stored.length >= cards.length, 'Storage should contain imported cards');
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 15: CSV import persistence
  // Validates: Requirements 4.5
  runner.test('Property 15: CSV import persistence', propertyTest(
    'CSV import persists to storage',
    100,
    async () => {
      const storageManager = new StorageManager();
      const importer = new CSVImporter(storageManager);
      
      // Generate random cards
      const cards = generators.randomArray(() => generators.randomCard(), 1, 5);
      const file = createCSVFile(cards);
      
      // Import CSV
      await importer.importCSV(file);
      
      // Load from storage
      const loaded = storageManager.loadCards();
      
      // Verify persistence
      assert(loaded.length >= cards.length, 'Should have at least imported cards');
      
      // Verify each imported card is in storage
      cards.forEach(card => {
        const found = loaded.some(l => l.word === card.word && l.translation === card.translation);
        assert(found, `Card "${card.word}" should be persisted`);
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Test CSV with optional fields
  runner.test('CSV with optional fields parsed correctly', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Create CSV with only required fields
    const csv = 'word,translation\n"hello","привет"\n"world","мир"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'minimal.csv');
    
    const parsed = await importer.parseCSV(file);
    
    assertEqual(parsed.length, 2, 'Should parse both cards');
    assertEqual(parsed[0].word, 'hello', 'First word should match');
    assertEqual(parsed[0].translation, 'привет', 'First translation should match');
    assertEqual(parsed[0].tags, [], 'Tags should default to empty array');
    assertEqual(parsed[0].language, 'en', 'Language should default to en');
    
    // Cleanup
    storageManager.clearAll();
  });

  // Test CSV validation
  runner.test('CSV validation detects invalid data', () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Invalid cards (missing required fields)
    const invalidCards = [
      { word: '', translation: 'test' },
      { word: 'test', translation: '' },
      { word: null, translation: 'test' }
    ];
    
    const validation = importer.validateCSVData(invalidCards);
    
    assertEqual(validation.valid, false, 'Should be invalid');
    assert(validation.errors.length > 0, 'Should have errors');
    
    // Cleanup
    storageManager.clearAll();
  });

  // Test empty CSV
  runner.test('Empty CSV rejected', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    const csv = '';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'empty.csv');
    
    try {
      await importer.parseCSV(file);
      throw new Error('Should have rejected empty CSV');
    } catch (error) {
      assert(error.message.includes('empty'), 'Should report empty file');
    }
    
    // Cleanup
    storageManager.clearAll();
  });

  // Test CSV with special characters
  runner.test('CSV with special characters handled correctly', async () => {
    const storageManager = new StorageManager();
    const importer = new CSVImporter(storageManager);
    
    // Create CSV with special characters (using semicolon for tags)
    const csv = 'word,translation,tags,language\n"hello, world","привет, мир","greeting;common","ru"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'special.csv');
    
    const parsed = await importer.parseCSV(file);
    
    assertEqual(parsed.length, 1, 'Should parse one card');
    assertEqual(parsed[0].word, 'hello, world', 'Should handle comma in quoted field');
    assertEqual(parsed[0].translation, 'привет, мир', 'Should handle Cyrillic characters');
    
    // Cleanup
    storageManager.clearAll();
  });
}

// Export for use in test.html
if (typeof window !== 'undefined') {
  window.runCSVImporterTests = runCSVImporterTests;
}
