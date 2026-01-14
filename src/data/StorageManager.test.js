/**
 * Property-based tests for StorageManager
 */

// Feature: flashcard-learning-app, Property 4: Card persistence round trip
// Feature: flashcard-learning-app, Property 6: Storage persistence round trip

// This test file will be run in a browser environment with test.html

/**
 * Run StorageManager property tests
 * @param {TestRunner} runner - Test runner instance
 * @param {TestGenerators} generators - Test generators instance
 * @param {Function} propertyTest - Property test helper
 * @param {Function} assertEqual - Assertion helper
 */
function runStorageManagerTests(runner, generators, propertyTest, assertEqual) {
  const StorageManager = window.StorageManager;
  
  // Feature: flashcard-learning-app, Property 4: Card persistence round trip
  // Validates: Requirements 1.5, 2.4
  runner.test('Property 4: Card persistence round trip - single card', propertyTest(
    'card persistence round trip',
    100,
    () => {
      const manager = new StorageManager();
      const card = generators.randomCard();
      
      // Save and load a single card
      manager.saveCards([card]);
      const loaded = manager.loadCards();
      
      assertEqual(loaded.length, 1, 'Should load exactly one card');
      assertEqual(loaded[0], card, 'Loaded card should match saved card');
      
      // Cleanup
      manager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 4: Card persistence round trip
  // Validates: Requirements 1.5, 2.4
  runner.test('Property 4: Card persistence round trip - multiple cards', propertyTest(
    'multiple cards persistence round trip',
    100,
    () => {
      const manager = new StorageManager();
      const cards = generators.randomArray(() => generators.randomCard(), 1, 20);
      
      // Save and load multiple cards
      manager.saveCards(cards);
      const loaded = manager.loadCards();
      
      assertEqual(loaded.length, cards.length, 'Should load same number of cards');
      assertEqual(loaded, cards, 'Loaded cards should match saved cards');
      
      // Cleanup
      manager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 4: Card persistence round trip
  // Validates: Requirements 1.5, 2.4
  runner.test('Property 4: Card persistence round trip - empty collection', propertyTest(
    'empty collection persistence',
    100,
    () => {
      const manager = new StorageManager();
      
      // Save and load empty collection
      manager.saveCards([]);
      const loaded = manager.loadCards();
      
      assertEqual(loaded.length, 0, 'Should load empty array');
      assertEqual(loaded, [], 'Loaded collection should be empty');
      
      // Cleanup
      manager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 6: Storage persistence round trip
  // Validates: Requirements 2.3
  runner.test('Property 6: Storage persistence round trip - settings', propertyTest(
    'settings persistence round trip',
    100,
    () => {
      const manager = new StorageManager();
      const settings = generators.randomSettings();
      
      // Save and load settings
      manager.saveSettings(settings);
      const loaded = manager.loadSettings();
      
      assertEqual(loaded, settings, 'Loaded settings should match saved settings');
      
      // Cleanup
      manager.clearAll();
    }
  ));

  // Feature: flashcard-learning-app, Property 6: Storage persistence round trip
  // Validates: Requirements 2.3
  runner.test('Property 6: Storage persistence round trip - cards and settings together', propertyTest(
    'cards and settings persistence together',
    100,
    () => {
      const manager = new StorageManager();
      const cards = generators.randomArray(() => generators.randomCard(), 1, 10);
      const settings = generators.randomSettings();
      
      // Save both cards and settings
      manager.saveCards(cards);
      manager.saveSettings(settings);
      
      // Load both
      const loadedCards = manager.loadCards();
      const loadedSettings = manager.loadSettings();
      
      assertEqual(loadedCards, cards, 'Loaded cards should match saved cards');
      assertEqual(loadedSettings, settings, 'Loaded settings should match saved settings');
      
      // Cleanup
      manager.clearAll();
    }
  ));

  // Test corrupted data handling
  runner.test('Corrupted card data returns empty array', () => {
    const manager = new StorageManager();
    
    // Manually corrupt the data
    localStorage.setItem(manager.CARDS_KEY, 'invalid json {{{');
    
    const loaded = manager.loadCards();
    assertEqual(loaded, [], 'Should return empty array for corrupted data');
    
    // Cleanup
    manager.clearAll();
  });

  // Test corrupted settings data handling
  runner.test('Corrupted settings data returns defaults', () => {
    const manager = new StorageManager();
    
    // Manually corrupt the data
    localStorage.setItem(manager.SETTINGS_KEY, 'invalid json {{{');
    
    const loaded = manager.loadSettings();
    assertEqual(loaded.language, 'en', 'Should return default language');
    assertEqual(loaded.ttsEnabled, true, 'Should return default TTS setting');
    assertEqual(loaded.selectedTags, [], 'Should return default tags');
    
    // Cleanup
    manager.clearAll();
  });

  // Test clearAll functionality
  runner.test('clearAll removes all data', () => {
    const manager = new StorageManager();
    const cards = [generators.randomCard()];
    const settings = generators.randomSettings();
    
    // Save data
    manager.saveCards(cards);
    manager.saveSettings(settings);
    
    // Clear all
    manager.clearAll();
    
    // Verify cleared
    const loadedCards = manager.loadCards();
    const loadedSettings = manager.loadSettings();
    
    assertEqual(loadedCards, [], 'Cards should be cleared');
    assertEqual(loadedSettings.language, 'en', 'Settings should be reset to defaults');
  });
}

// Export for use in test.html
if (typeof window !== 'undefined') {
  window.runStorageManagerTests = runStorageManagerTests;
}
