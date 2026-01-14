/**
 * CardManager Property-Based Tests
 * Tests universal properties of card management operations
 */

// Feature: flashcard-learning-app, Property 1: Card creation validation
// Feature: flashcard-learning-app, Property 2: Optional fields acceptance
// Feature: flashcard-learning-app, Property 3: Card addition to collection
// Feature: flashcard-learning-app, Property 5: Edit preserves statistics
// Feature: flashcard-learning-app, Property 17: Tag filtering correctness

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
  
  // Clear storage before each test
  storageManager.clearAll();
  
  return { cardManager, storageManager, mockStorage };
}

// Test runner instance
const runner = new TestRunner();

// ============================================================================
// Property 1: Card creation validation
// Validates: Requirements 1.2
// ============================================================================

// Feature: flashcard-learning-app, Property 1: Card creation validation
runner.test('Property 1: Invalid cards are rejected (empty word)', propertyTest(
  'card creation validation - empty word',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Generate invalid card with empty word
    const invalidData = {
      word: '',
      translation: TestGenerators.randomString(1, 100)
    };
    
    // Should throw error
    let errorThrown = false;
    try {
      cardManager.createCard(invalidData);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('Word is required'), 'Error message should mention word requirement');
    }
    
    assert(errorThrown, 'Creating card with empty word should throw error');
    
    // Verify collection is unchanged
    const cards = cardManager.getAllCards();
    assertEqual(cards.length, 0, 'Collection should remain empty after failed creation');
  }
));

// Feature: flashcard-learning-app, Property 1: Card creation validation
runner.test('Property 1: Invalid cards are rejected (empty translation)', propertyTest(
  'card creation validation - empty translation',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Generate invalid card with empty translation
    const invalidData = {
      word: TestGenerators.randomString(1, 100),
      translation: ''
    };
    
    // Should throw error
    let errorThrown = false;
    try {
      cardManager.createCard(invalidData);
    } catch (error) {
      errorThrown = true;
      assert(error.message.includes('Translation is required'), 'Error message should mention translation requirement');
    }
    
    assert(errorThrown, 'Creating card with empty translation should throw error');
    
    // Verify collection is unchanged
    const cards = cardManager.getAllCards();
    assertEqual(cards.length, 0, 'Collection should remain empty after failed creation');
  }
));

// Feature: flashcard-learning-app, Property 1: Card creation validation
runner.test('Property 1: Invalid cards are rejected (whitespace only)', propertyTest(
  'card creation validation - whitespace',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Generate invalid card with whitespace-only fields
    const whitespaceCount = TestGenerators.randomInt(1, 10);
    const invalidData = {
      word: ' '.repeat(whitespaceCount),
      translation: TestGenerators.randomString(1, 100)
    };
    
    // Should throw error
    let errorThrown = false;
    try {
      cardManager.createCard(invalidData);
    } catch (error) {
      errorThrown = true;
    }
    
    assert(errorThrown, 'Creating card with whitespace-only word should throw error');
    
    // Verify collection is unchanged
    const cards = cardManager.getAllCards();
    assertEqual(cards.length, 0, 'Collection should remain empty after failed creation');
  }
));

// ============================================================================
// Property 2: Optional fields acceptance
// Validates: Requirements 1.3
// ============================================================================

// Feature: flashcard-learning-app, Property 2: Optional fields acceptance
runner.test('Property 2: Cards with only required fields are accepted', propertyTest(
  'optional fields acceptance - minimal card',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create card with only required fields
    const minimalData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    
    // Should succeed
    const card = cardManager.createCard(minimalData);
    
    assert(card !== null, 'Card should be created');
    assert(card.id, 'Card should have an ID');
    assertEqual(card.word, minimalData.word.trim(), 'Word should match');
    assertEqual(card.translation, minimalData.translation.trim(), 'Translation should match');
    assertEqual(card.tags, [], 'Tags should default to empty array');
    assertEqual(card.language, '', 'Language should default to empty string');
  }
));

// Feature: flashcard-learning-app, Property 2: Optional fields acceptance
runner.test('Property 2: Cards with optional fields are accepted', propertyTest(
  'optional fields acceptance - full card',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create card with all fields
    const fullData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 1, 5),
      language: TestGenerators.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru'])
    };
    
    // Should succeed
    const card = cardManager.createCard(fullData);
    
    assert(card !== null, 'Card should be created');
    assert(card.id, 'Card should have an ID');
    assertEqual(card.word, fullData.word.trim(), 'Word should match');
    assertEqual(card.translation, fullData.translation.trim(), 'Translation should match');
    assertEqual(card.tags, fullData.tags, 'Tags should match');
    assertEqual(card.language, fullData.language, 'Language should match');
  }
));

// ============================================================================
// Property 3: Card addition to collection
// Validates: Requirements 1.4
// ============================================================================

// Feature: flashcard-learning-app, Property 3: Card addition to collection
runner.test('Property 3: Created cards appear in collection', propertyTest(
  'card addition to collection',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Get initial collection size
    const initialCards = cardManager.getAllCards();
    const initialCount = initialCards.length;
    
    // Create a new card
    const cardData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 0, 5),
      language: TestGenerators.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru'])
    };
    
    const createdCard = cardManager.createCard(cardData);
    
    // Get updated collection
    const updatedCards = cardManager.getAllCards();
    
    // Verify collection grew by 1
    assertEqual(updatedCards.length, initialCount + 1, 'Collection should grow by 1');
    
    // Verify the created card is in the collection
    const foundCard = updatedCards.find(c => c.id === createdCard.id);
    assert(foundCard !== undefined, 'Created card should be in collection');
    assertEqual(foundCard.word, createdCard.word, 'Card in collection should match created card');
  }
));

// Feature: flashcard-learning-app, Property 3: Card addition to collection
runner.test('Property 3: Multiple cards can be added to collection', propertyTest(
  'multiple card addition',
  50,
  () => {
    const { cardManager } = setupTest();
    
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
    
    // Verify all cards are in collection
    const allCards = cardManager.getAllCards();
    assertEqual(allCards.length, cardCount, 'Collection should contain all created cards');
    
    // Verify each created card is in the collection
    for (const createdCard of createdCards) {
      const found = allCards.find(c => c.id === createdCard.id);
      assert(found !== undefined, `Card ${createdCard.id} should be in collection`);
    }
  }
));

// ============================================================================
// Property 5: Edit preserves statistics
// Validates: Requirements 1.8
// ============================================================================

// Feature: flashcard-learning-app, Property 5: Edit preserves statistics
runner.test('Property 5: Editing card preserves statistics', propertyTest(
  'edit preserves statistics',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create a card with initial data
    const initialData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 0, 5),
      language: TestGenerators.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru'])
    };
    
    const card = cardManager.createCard(initialData);
    
    // Manually set some statistics to simulate usage
    const cards = cardManager.getAllCards();
    const cardIndex = cards.findIndex(c => c.id === card.id);
    cards[cardIndex].statistics = {
      knowCount: TestGenerators.randomInt(1, 100),
      dontKnowCount: TestGenerators.randomInt(1, 100),
      lastReviewed: Date.now()
    };
    cardManager.storageManager.saveCards(cards);
    
    // Get the card with statistics
    const cardWithStats = cardManager.getAllCards().find(c => c.id === card.id);
    const originalStats = { ...cardWithStats.statistics };
    
    // Update the card with new data
    const updatedData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 0, 5),
      language: TestGenerators.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru'])
    };
    
    const updatedCard = cardManager.updateCard(card.id, updatedData);
    
    // Verify statistics are preserved
    assertEqual(updatedCard.statistics.knowCount, originalStats.knowCount, 'knowCount should be preserved');
    assertEqual(updatedCard.statistics.dontKnowCount, originalStats.dontKnowCount, 'dontKnowCount should be preserved');
    assertEqual(updatedCard.statistics.lastReviewed, originalStats.lastReviewed, 'lastReviewed should be preserved');
    
    // Verify other fields were updated
    assertEqual(updatedCard.word, updatedData.word.trim(), 'Word should be updated');
    assertEqual(updatedCard.translation, updatedData.translation.trim(), 'Translation should be updated');
  }
));

// Feature: flashcard-learning-app, Property 5: Edit preserves statistics
runner.test('Property 5: Editing preserves createdAt timestamp', propertyTest(
  'edit preserves createdAt',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create a card
    const initialData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    
    const card = cardManager.createCard(initialData);
    const originalCreatedAt = card.createdAt;
    
    // Wait a tiny bit to ensure timestamp would change if not preserved
    const waitTime = 5;
    const start = Date.now();
    while (Date.now() - start < waitTime) {
      // Busy wait
    }
    
    // Update the card
    const updatedData = {
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100)
    };
    
    const updatedCard = cardManager.updateCard(card.id, updatedData);
    
    // Verify createdAt is preserved
    assertEqual(updatedCard.createdAt, originalCreatedAt, 'createdAt should be preserved');
    
    // Verify updatedAt changed
    assert(updatedCard.updatedAt >= originalCreatedAt, 'updatedAt should be updated');
  }
));

// ============================================================================
// Property 17: Tag filtering correctness
// Validates: Requirements 5.2
// ============================================================================

// Feature: flashcard-learning-app, Property 17: Tag filtering correctness
runner.test('Property 17: Tag filter returns only matching cards', propertyTest(
  'tag filtering correctness',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create cards with various tags
    const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
    const cardCount = TestGenerators.randomInt(5, 20);
    
    for (let i = 0; i < cardCount; i++) {
      const cardTags = TestGenerators.randomArray(
        () => TestGenerators.randomChoice(tags),
        1,
        3
      );
      
      cardManager.createCard({
        word: TestGenerators.randomString(1, 100),
        translation: TestGenerators.randomString(1, 100),
        tags: cardTags
      });
    }
    
    // Select random tags to filter by
    const filterTags = TestGenerators.randomArray(
      () => TestGenerators.randomChoice(tags),
      1,
      3
    );
    
    // Get filtered cards
    const filteredCards = cardManager.getCardsByTags(filterTags);
    
    // Verify all returned cards have at least one of the filter tags
    for (const card of filteredCards) {
      const hasMatchingTag = card.tags.some(tag => filterTags.includes(tag));
      assert(hasMatchingTag, `Card ${card.id} should have at least one of the filter tags`);
    }
    
    // Verify no cards were missed (all cards with matching tags are included)
    const allCards = cardManager.getAllCards();
    for (const card of allCards) {
      const hasMatchingTag = card.tags.some(tag => filterTags.includes(tag));
      const isInFiltered = filteredCards.some(fc => fc.id === card.id);
      
      if (hasMatchingTag) {
        assert(isInFiltered, `Card ${card.id} with matching tag should be in filtered results`);
      }
    }
  }
));

// Feature: flashcard-learning-app, Property 17: Tag filtering correctness
runner.test('Property 17: Empty tag filter returns all cards', propertyTest(
  'empty tag filter',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create some cards
    const cardCount = TestGenerators.randomInt(1, 10);
    for (let i = 0; i < cardCount; i++) {
      cardManager.createCard({
        word: TestGenerators.randomString(1, 100),
        translation: TestGenerators.randomString(1, 100),
        tags: TestGenerators.randomArray(() => TestGenerators.randomString(1, 20), 0, 3)
      });
    }
    
    // Filter with empty array
    const filteredCards = cardManager.getCardsByTags([]);
    const allCards = cardManager.getAllCards();
    
    // Should return all cards
    assertEqual(filteredCards.length, allCards.length, 'Empty filter should return all cards');
  }
));

// Feature: flashcard-learning-app, Property 17: Tag filtering correctness
runner.test('Property 17: Filter with non-existent tag returns empty', propertyTest(
  'non-existent tag filter',
  100,
  () => {
    const { cardManager } = setupTest();
    
    // Create cards with specific tags
    const existingTags = ['tag1', 'tag2', 'tag3'];
    const cardCount = TestGenerators.randomInt(1, 10);
    
    for (let i = 0; i < cardCount; i++) {
      cardManager.createCard({
        word: TestGenerators.randomString(1, 100),
        translation: TestGenerators.randomString(1, 100),
        tags: [TestGenerators.randomChoice(existingTags)]
      });
    }
    
    // Filter with non-existent tag
    const nonExistentTag = 'nonexistent_tag_' + TestGenerators.randomString(5, 10);
    const filteredCards = cardManager.getCardsByTags([nonExistentTag]);
    
    // Should return empty array
    assertEqual(filteredCards.length, 0, 'Filter with non-existent tag should return empty array');
  }
));

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runner;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.cardManagerTests = runner;
}
