/**
 * StatisticsTracker Property-Based Tests
 * Tests universal properties of statistics tracking operations
 */

// Feature: flashcard-learning-app, Property 19: New card statistics initialization
// Feature: flashcard-learning-app, Property 20: Statistics increment correctness
// Feature: flashcard-learning-app, Property 21: Statistics persistence
// Feature: flashcard-learning-app, Property 22: Statistics as card data

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

// Setup test environment
function setupTest() {
  const mockStorage = new MockLocalStorage();
  global.localStorage = mockStorage;
  
  const storageManager = new StorageManager();
  const cardManager = new CardManager(storageManager);
  const statisticsTracker = new StatisticsTracker(storageManager);
  
  // Clear storage before each test
  storageManager.clearAll();
  
  return { cardManager, storageManager, statisticsTracker, mockStorage };
}

// Test runner instance
const runner = new TestRunner();

// ============================================================================
// Property 19: New card statistics initialization
// Validates: Requirements 6.1
// ============================================================================

// Feature: flashcard-learning-app, Property 19: New card statistics initialization
runner.test('Property 19: New cards have zero statistics', propertyTest(
  'new card statistics initialization',
  100,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create a new card with random data
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 0, 5),
      language: TestGenerators.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru'])
    };
    
    const card = cardManager.createCard(cardData);
    
    // Get statistics for the new card
    const stats = statisticsTracker.getStatistics(card.id);
    
    // Verify both counters are initialized to zero
    assertEqual(stats.knowCount, 0, 'knowCount should be initialized to 0');
    assertEqual(stats.dontKnowCount, 0, 'dontKnowCount should be initialized to 0');
    assertEqual(stats.lastReviewed, null, 'lastReviewed should be initialized to null');
  }
));

// Feature: flashcard-learning-app, Property 19: New card statistics initialization
runner.test('Property 19: All new cards have zero statistics', propertyTest(
  'multiple new cards statistics initialization',
  50,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create multiple cards
    const cardCount = TestGenerators.randomInt(1, 10);
    const createdCards = [];
    
    for (let i = 0; i < cardCount; i++) {
      const cardData = {
        word: TestGenerators.randomString(1, 100),
        translation: TestGenerators.randomString(1, 100)
      };
      createdCards.push(cardManager.createCard(cardData));
    }
    
    // Verify all cards have zero statistics
    for (const card of createdCards) {
      const stats = statisticsTracker.getStatistics(card.id);
      assertEqual(stats.knowCount, 0, `Card ${card.id} knowCount should be 0`);
      assertEqual(stats.dontKnowCount, 0, `Card ${card.id} dontKnowCount should be 0`);
      assertEqual(stats.lastReviewed, null, `Card ${card.id} lastReviewed should be null`);
    }
  }
));

// ============================================================================
// Property 20: Statistics increment correctness
// Validates: Requirements 6.2, 6.3
// ============================================================================

// Feature: flashcard-learning-app, Property 20: Statistics increment correctness
runner.test('Property 20: incrementKnown increases knowCount by exactly one', propertyTest(
  'incrementKnown correctness',
  100,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create a card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    // Get initial statistics
    const initialStats = statisticsTracker.getStatistics(card.id);
    const initialKnowCount = initialStats.knowCount;
    const initialDontKnowCount = initialStats.dontKnowCount;
    
    // Increment know counter
    statisticsTracker.incrementKnown(card.id);
    
    // Get updated statistics
    const updatedStats = statisticsTracker.getStatistics(card.id);
    
    // Verify knowCount increased by exactly 1
    assertEqual(updatedStats.knowCount, initialKnowCount + 1, 'knowCount should increase by 1');
    
    // Verify dontKnowCount unchanged
    assertEqual(updatedStats.dontKnowCount, initialDontKnowCount, 'dontKnowCount should remain unchanged');
    
    // Verify lastReviewed was updated
    assert(updatedStats.lastReviewed !== null, 'lastReviewed should be set');
    assert(updatedStats.lastReviewed > 0, 'lastReviewed should be a valid timestamp');
  }
));

// Feature: flashcard-learning-app, Property 20: Statistics increment correctness
runner.test('Property 20: incrementDontKnow increases dontKnowCount by exactly one', propertyTest(
  'incrementDontKnow correctness',
  100,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create a card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    // Get initial statistics
    const initialStats = statisticsTracker.getStatistics(card.id);
    const initialKnowCount = initialStats.knowCount;
    const initialDontKnowCount = initialStats.dontKnowCount;
    
    // Increment don't know counter
    statisticsTracker.incrementDontKnow(card.id);
    
    // Get updated statistics
    const updatedStats = statisticsTracker.getStatistics(card.id);
    
    // Verify dontKnowCount increased by exactly 1
    assertEqual(updatedStats.dontKnowCount, initialDontKnowCount + 1, 'dontKnowCount should increase by 1');
    
    // Verify knowCount unchanged
    assertEqual(updatedStats.knowCount, initialKnowCount, 'knowCount should remain unchanged');
    
    // Verify lastReviewed was updated
    assert(updatedStats.lastReviewed !== null, 'lastReviewed should be set');
    assert(updatedStats.lastReviewed > 0, 'lastReviewed should be a valid timestamp');
  }
));

// Feature: flashcard-learning-app, Property 20: Statistics increment correctness
runner.test('Property 20: Multiple increments accumulate correctly', propertyTest(
  'multiple increments correctness',
  50,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create a card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    // Randomly increment know and don't know counters
    const knowIncrements = TestGenerators.randomInt(0, 10);
    const dontKnowIncrements = TestGenerators.randomInt(0, 10);
    
    for (let i = 0; i < knowIncrements; i++) {
      statisticsTracker.incrementKnown(card.id);
    }
    
    for (let i = 0; i < dontKnowIncrements; i++) {
      statisticsTracker.incrementDontKnow(card.id);
    }
    
    // Get final statistics
    const finalStats = statisticsTracker.getStatistics(card.id);
    
    // Verify counts match expected values
    assertEqual(finalStats.knowCount, knowIncrements, 'knowCount should match number of increments');
    assertEqual(finalStats.dontKnowCount, dontKnowIncrements, 'dontKnowCount should match number of increments');
  }
));

// Feature: flashcard-learning-app, Property 20: Statistics increment correctness
runner.test('Property 20: Increment on non-existent card throws error', propertyTest(
  'increment non-existent card error',
  100,
  () => {
    const { statisticsTracker } = setupTest();
    
    // Generate a random non-existent card ID
    const nonExistentId = TestGenerators.randomUUID();
    
    // Attempt to increment know counter
    let knowErrorThrown = false;
    try {
      statisticsTracker.incrementKnown(nonExistentId);
    } catch (error) {
      knowErrorThrown = true;
      assert(error.message.includes('not found'), 'Error should mention card not found');
    }
    assert(knowErrorThrown, 'incrementKnown should throw error for non-existent card');
    
    // Attempt to increment don't know counter
    let dontKnowErrorThrown = false;
    try {
      statisticsTracker.incrementDontKnow(nonExistentId);
    } catch (error) {
      dontKnowErrorThrown = true;
      assert(error.message.includes('not found'), 'Error should mention card not found');
    }
    assert(dontKnowErrorThrown, 'incrementDontKnow should throw error for non-existent card');
  }
));

// ============================================================================
// Property 21: Statistics persistence
// Validates: Requirements 6.4
// ============================================================================

// Feature: flashcard-learning-app, Property 21: Statistics persistence
runner.test('Property 21: Statistics persist after increment', propertyTest(
  'statistics persistence after increment',
  100,
  () => {
    const { cardManager, storageManager } = setupTest();
    
    // Create a card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    // Create a new StatisticsTracker instance and increment
    const tracker1 = new StatisticsTracker(storageManager);
    const incrementKnow = TestGenerators.randomInt(1, 10);
    const incrementDontKnow = TestGenerators.randomInt(1, 10);
    
    for (let i = 0; i < incrementKnow; i++) {
      tracker1.incrementKnown(card.id);
    }
    
    for (let i = 0; i < incrementDontKnow; i++) {
      tracker1.incrementDontKnow(card.id);
    }
    
    // Create a new StatisticsTracker instance (simulating app restart)
    const tracker2 = new StatisticsTracker(storageManager);
    const persistedStats = tracker2.getStatistics(card.id);
    
    // Verify statistics persisted
    assertEqual(persistedStats.knowCount, incrementKnow, 'knowCount should persist');
    assertEqual(persistedStats.dontKnowCount, incrementDontKnow, 'dontKnowCount should persist');
    assert(persistedStats.lastReviewed !== null, 'lastReviewed should persist');
  }
));

// Feature: flashcard-learning-app, Property 21: Statistics persistence
runner.test('Property 21: Statistics survive app restart', propertyTest(
  'statistics survive restart',
  100,
  () => {
    const { cardManager, storageManager, mockStorage } = setupTest();
    
    // Create a card and update statistics
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    const tracker1 = new StatisticsTracker(storageManager);
    tracker1.incrementKnown(card.id);
    tracker1.incrementDontKnow(card.id);
    
    const statsBeforeRestart = tracker1.getStatistics(card.id);
    
    // Simulate app restart by creating new instances with same storage
    const newStorageManager = new StorageManager();
    global.localStorage = mockStorage; // Use same mock storage
    const tracker2 = new StatisticsTracker(newStorageManager);
    
    const statsAfterRestart = tracker2.getStatistics(card.id);
    
    // Verify statistics are identical after restart
    assertEqual(statsAfterRestart.knowCount, statsBeforeRestart.knowCount, 'knowCount should survive restart');
    assertEqual(statsAfterRestart.dontKnowCount, statsBeforeRestart.dontKnowCount, 'dontKnowCount should survive restart');
    assertEqual(statsAfterRestart.lastReviewed, statsBeforeRestart.lastReviewed, 'lastReviewed should survive restart');
  }
));

// ============================================================================
// Property 22: Statistics as card data
// Validates: Requirements 6.5
// ============================================================================

// Feature: flashcard-learning-app, Property 22: Statistics as card data
runner.test('Property 22: Statistics are stored as part of card data', propertyTest(
  'statistics as card data',
  100,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create a card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    const card = cardManager.createCard(cardData);
    
    // Update statistics
    const knowIncrements = TestGenerators.randomInt(1, 10);
    const dontKnowIncrements = TestGenerators.randomInt(1, 10);
    
    for (let i = 0; i < knowIncrements; i++) {
      statisticsTracker.incrementKnown(card.id);
    }
    
    for (let i = 0; i < dontKnowIncrements; i++) {
      statisticsTracker.incrementDontKnow(card.id);
    }
    
    // Get card from CardManager
    const allCards = cardManager.getAllCards();
    const cardFromManager = allCards.find(c => c.id === card.id);
    
    // Verify card has statistics property
    assert(cardFromManager.statistics !== undefined, 'Card should have statistics property');
    assert(typeof cardFromManager.statistics === 'object', 'Statistics should be an object');
    
    // Verify statistics values match
    assertEqual(cardFromManager.statistics.knowCount, knowIncrements, 'Card statistics knowCount should match');
    assertEqual(cardFromManager.statistics.dontKnowCount, dontKnowIncrements, 'Card statistics dontKnowCount should match');
    assert(cardFromManager.statistics.lastReviewed !== null, 'Card statistics lastReviewed should be set');
    
    // Verify statistics from StatisticsTracker match card data
    const statsFromTracker = statisticsTracker.getStatistics(card.id);
    assertEqual(statsFromTracker.knowCount, cardFromManager.statistics.knowCount, 'Tracker stats should match card data');
    assertEqual(statsFromTracker.dontKnowCount, cardFromManager.statistics.dontKnowCount, 'Tracker stats should match card data');
    assertEqual(statsFromTracker.lastReviewed, cardFromManager.statistics.lastReviewed, 'Tracker stats should match card data');
  }
));

// Feature: flashcard-learning-app, Property 22: Statistics as card data
runner.test('Property 22: Statistics structure is consistent', propertyTest(
  'statistics structure consistency',
  100,
  () => {
    const { cardManager, statisticsTracker } = setupTest();
    
    // Create multiple cards
    const cardCount = TestGenerators.randomInt(1, 10);
    const createdCards = [];
    
    for (let i = 0; i < cardCount; i++) {
      const cardData = {
        word: TestGenerators.randomString(1, 100),
        translation: TestGenerators.randomString(1, 100)
      };
      createdCards.push(cardManager.createCard(cardData));
    }
    
    // Randomly update some statistics
    for (const card of createdCards) {
      if (Math.random() > 0.5) {
        statisticsTracker.incrementKnown(card.id);
      }
      if (Math.random() > 0.5) {
        statisticsTracker.incrementDontKnow(card.id);
      }
    }
    
    // Verify all cards have consistent statistics structure
    const allCards = cardManager.getAllCards();
    for (const card of allCards) {
      assert(card.statistics !== undefined, `Card ${card.id} should have statistics`);
      assert(typeof card.statistics === 'object', `Card ${card.id} statistics should be an object`);
      assert(typeof card.statistics.knowCount === 'number', `Card ${card.id} knowCount should be a number`);
      assert(typeof card.statistics.dontKnowCount === 'number', `Card ${card.id} dontKnowCount should be a number`);
      assert(
        card.statistics.lastReviewed === null || typeof card.statistics.lastReviewed === 'number',
        `Card ${card.id} lastReviewed should be null or a number`
      );
    }
  }
));

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runner;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.statisticsTrackerTests = runner;
}
