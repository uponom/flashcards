/**
 * Property-based tests for BackupManager
 */

// Feature: flashcard-learning-app, Property 7: Backup completeness
// Feature: flashcard-learning-app, Property 8: Backup format validation
// Feature: flashcard-learning-app, Property 9: Merge without duplicates
// Feature: flashcard-learning-app, Property 10: Overwrite replaces completely
// Feature: flashcard-learning-app, Property 11: Restore persistence

/**
 * Run BackupManager property tests
 * @param {TestRunner} runner - Test runner instance
 * @param {TestGenerators} generators - Test generators instance
 * @param {Function} propertyTest - Property test helper
 * @param {Function} assertEqual - Assertion helper
 * @param {Function} assert - Assertion helper
 */
function runBackupManagerTests(runner, generators, propertyTest, assertEqual, assert) {
  const StorageManager = window.StorageManager;
  const BackupManager = window.BackupManager;

  // Feature: flashcard-learning-app, Property 7: Backup completeness
  // Validates: Requirements 3.1
  runner.test('Property 7: Backup completeness - all card data included', propertyTest(
    'backup includes all card data',
    100,
    () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      const cards = generators.randomArray(() => generators.randomCard(), 1, 10);
      
      // Create backup
      const backupData = backupManager.createBackup(cards);
      const backup = JSON.parse(backupData);
      
      // Verify all cards are included
      assertEqual(backup.cards.length, cards.length, 'Backup should include all cards');
      
      // Verify each card has all fields
      backup.cards.forEach((card, index) => {
        assertEqual(card.word, cards[index].word, 'Word should be preserved');
        assertEqual(card.translation, cards[index].translation, 'Translation should be preserved');
        assertEqual(card.tags, cards[index].tags, 'Tags should be preserved');
        assertEqual(card.language, cards[index].language, 'Language should be preserved');
        assertEqual(card.statistics, cards[index].statistics, 'Statistics should be preserved');
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 8: Backup format validation
  // Validates: Requirements 3.2
  runner.test('Property 8: Backup format validation - invalid JSON rejected', async () => {
    const storageManager = new StorageManager();
    const backupManager = new BackupManager(storageManager);
    
    // Create invalid file
    const invalidContent = 'invalid json {{{';
    const blob = new Blob([invalidContent], { type: 'application/json' });
    const file = new File([blob], 'invalid.json');
    
    try {
      await backupManager.restoreBackup(file);
      throw new Error('Should have rejected invalid JSON');
    } catch (error) {
      assert(error.message.includes('Failed to parse'), 'Should report parse error');
    }
    
    // Cleanup
    storageManager.clearAll();
  });

  // Feature: flashcard-learning-app, Property 8: Backup format validation
  // Validates: Requirements 3.2
  runner.test('Property 8: Backup format validation - missing cards array rejected', async () => {
    const storageManager = new StorageManager();
    const backupManager = new BackupManager(storageManager);
    
    // Create backup without cards array
    const invalidBackup = JSON.stringify({ version: '1.0', timestamp: Date.now() });
    const blob = new Blob([invalidBackup], { type: 'application/json' });
    const file = new File([blob], 'invalid.json');
    
    try {
      await backupManager.restoreBackup(file);
      throw new Error('Should have rejected backup without cards array');
    } catch (error) {
      assert(error.message.includes('Invalid backup format'), 'Should report format error');
    }
    
    // Cleanup
    storageManager.clearAll();
  });

  // Feature: flashcard-learning-app, Property 9: Merge without duplicates
  // Validates: Requirements 3.4
  runner.test('Property 9: Merge without duplicates', propertyTest(
    'merge removes duplicates',
    100,
    () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      
      // Create existing cards
      const existing = generators.randomArray(() => generators.randomCard(), 1, 5);
      
      // Create imported cards with some duplicates
      const imported = [...existing.slice(0, 2)]; // Duplicate first 2 cards
      imported.push(...generators.randomArray(() => generators.randomCard(), 1, 3)); // Add new cards
      
      // Merge
      const merged = backupManager.mergeCards(existing, imported);
      
      // Count unique cards by word+translation
      const uniqueKeys = new Set();
      merged.forEach(card => {
        uniqueKeys.add(`${card.word}|${card.translation}`);
      });
      
      // Verify no duplicates
      assertEqual(merged.length, uniqueKeys.size, 'Merged array should have no duplicates');
      
      // Verify all existing cards are present
      existing.forEach(card => {
        const found = merged.some(m => m.word === card.word && m.translation === card.translation);
        assert(found, 'All existing cards should be in merged result');
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 9: Merge without duplicates
  // Validates: Requirements 3.4
  runner.test('Property 9: Merge with identical collections produces same size', propertyTest(
    'merge identical collections',
    100,
    () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      
      const cards = generators.randomArray(() => generators.randomCard(), 1, 10);
      
      // Merge identical collections
      const merged = backupManager.mergeCards(cards, cards);
      
      // Should have same size (all duplicates removed)
      assertEqual(merged.length, cards.length, 'Merging identical collections should not increase size');
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 10: Overwrite replaces completely
  // Validates: Requirements 3.5
  runner.test('Property 10: Overwrite replaces completely', propertyTest(
    'overwrite mode replaces all cards',
    100,
    async () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      
      // Save existing cards
      const existing = generators.randomArray(() => generators.randomCard(), 3, 5);
      storageManager.saveCards(existing);
      
      // Create backup with different cards
      const imported = generators.randomArray(() => generators.randomCard(), 2, 4);
      const backupData = backupManager.createBackup(imported);
      const blob = new Blob([backupData], { type: 'application/json' });
      const file = new File([blob], 'backup.json');
      
      // Import with overwrite mode
      const result = await backupManager.importBackup(file, 'overwrite');
      
      // Verify only imported cards remain
      assertEqual(result.length, imported.length, 'Should have only imported cards');
      assertEqual(result, imported, 'Result should match imported cards exactly');
      
      // Verify no existing cards remain
      existing.forEach(card => {
        const found = result.some(r => r.id === card.id);
        assert(!found, 'Existing cards should not be in result');
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 11: Restore persistence
  // Validates: Requirements 3.6
  runner.test('Property 11: Restore persistence - merge mode', propertyTest(
    'merge restore persists to storage',
    100,
    async () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      
      // Save existing cards
      const existing = generators.randomArray(() => generators.randomCard(), 2, 3);
      storageManager.saveCards(existing);
      
      // Create backup
      const imported = generators.randomArray(() => generators.randomCard(), 2, 3);
      const backupData = backupManager.createBackup(imported);
      const blob = new Blob([backupData], { type: 'application/json' });
      const file = new File([blob], 'backup.json');
      
      // Import with merge mode
      await backupManager.importBackup(file, 'merge');
      
      // Load from storage
      const loaded = storageManager.loadCards();
      
      // Verify persistence
      assert(loaded.length >= existing.length, 'Should have at least existing cards');
      assert(loaded.length <= existing.length + imported.length, 'Should not exceed sum of both');
      
      // Verify all existing cards are present
      existing.forEach(card => {
        const found = loaded.some(l => l.word === card.word && l.translation === card.translation);
        assert(found, 'Existing cards should be persisted');
      });
      
      // Cleanup
      storageManager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 11: Restore persistence
  // Validates: Requirements 3.6
  runner.test('Property 11: Restore persistence - overwrite mode', propertyTest(
    'overwrite restore persists to storage',
    100,
    async () => {
      const storageManager = new StorageManager();
      const backupManager = new BackupManager(storageManager);
      
      // Save existing cards
      const existing = generators.randomArray(() => generators.randomCard(), 2, 3);
      storageManager.saveCards(existing);
      
      // Create backup
      const imported = generators.randomArray(() => generators.randomCard(), 2, 3);
      const backupData = backupManager.createBackup(imported);
      const blob = new Blob([backupData], { type: 'application/json' });
      const file = new File([blob], 'backup.json');
      
      // Import with overwrite mode
      await backupManager.importBackup(file, 'overwrite');
      
      // Load from storage
      const loaded = storageManager.loadCards();
      
      // Verify only imported cards are persisted
      assertEqual(loaded.length, imported.length, 'Should have only imported cards');
      assertEqual(loaded, imported, 'Loaded cards should match imported cards');
      
      // Cleanup
      storageManager.clearAll();
    }
  ));
}

// Export for use in test.html
if (typeof window !== 'undefined') {
  window.runBackupManagerTests = runBackupManagerTests;
}
