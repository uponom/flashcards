/**
 * SelectionAlgorithm Property-Based Tests
 * Tests universal properties of adaptive card selection algorithm
 */

// Feature: flashcard-learning-app, Property 23: Probability calculation correctness
// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio

// Test runner instance
const runner = new TestRunner();

// ============================================================================
// Property 23: Probability calculation correctness
// Validates: Requirements 7.1
// ============================================================================

// Feature: flashcard-learning-app, Property 23: Probability calculation correctness
runner.test('Property 23: Probability calculated as weight = 1 / (1 + ratio)', propertyTest(
  'probability calculation formula',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Generate random statistics
    const knowCount = TestGenerators.randomInt(0, 100);
    const dontKnowCount = TestGenerators.randomInt(0, 100);
    
    const card = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCount,
        dontKnowCount: dontKnowCount,
        lastReviewed: null
      }
    };
    
    // Calculate expected weight using the formula
    const ratio = knowCount / (dontKnowCount + 1);
    const expectedWeight = 1 / (1 + ratio);
    
    // Get actual weight from algorithm
    const actualWeight = algorithm.calculateProbability(card);
    
    // Verify weight matches formula (with small tolerance for floating point)
    const tolerance = 0.0001;
    assert(
      Math.abs(actualWeight - expectedWeight) < tolerance,
      `Weight should be ${expectedWeight}, got ${actualWeight}`
    );
  }
));

// Feature: flashcard-learning-app, Property 23: Probability calculation correctness
runner.test('Property 23: Probability is always positive', propertyTest(
  'probability always positive',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Generate random statistics (including edge cases)
    const knowCount = TestGenerators.randomInt(0, 1000);
    const dontKnowCount = TestGenerators.randomInt(0, 1000);
    
    const card = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCount,
        dontKnowCount: dontKnowCount,
        lastReviewed: null
      }
    };
    
    const weight = algorithm.calculateProbability(card);
    
    // Verify weight is always positive
    assert(weight > 0, `Weight should be positive, got ${weight}`);
  }
));

// Feature: flashcard-learning-app, Property 23: Probability calculation correctness
runner.test('Property 23: Probability is at most 1', propertyTest(
  'probability bounded by 1',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Generate random statistics
    const knowCount = TestGenerators.randomInt(0, 1000);
    const dontKnowCount = TestGenerators.randomInt(0, 1000);
    
    const card = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCount,
        dontKnowCount: dontKnowCount,
        lastReviewed: null
      }
    };
    
    const weight = algorithm.calculateProbability(card);
    
    // Verify weight is at most 1
    assert(weight <= 1, `Weight should be at most 1, got ${weight}`);
  }
));

// Feature: flashcard-learning-app, Property 23: Probability calculation correctness
runner.test('Property 23: New card (0/0) has maximum weight', propertyTest(
  'new card maximum weight',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Create a new card with zero statistics
    const newCard = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: 0,
        dontKnowCount: 0,
        lastReviewed: null
      }
    };
    
    const weight = algorithm.calculateProbability(newCard);
    
    // For a new card: ratio = 0 / (0 + 1) = 0, weight = 1 / (1 + 0) = 1
    const expectedWeight = 1.0;
    const tolerance = 0.0001;
    
    assert(
      Math.abs(weight - expectedWeight) < tolerance,
      `New card should have weight ${expectedWeight}, got ${weight}`
    );
  }
));

// ============================================================================
// Property 24: Probability inversely proportional to ratio
// Validates: Requirements 7.2, 7.3
// ============================================================================

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: Lower ratio yields higher probability', propertyTest(
  'lower ratio higher probability',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Create two cards with different ratios
    // Card A: lower ratio (more difficult)
    const knowCountA = TestGenerators.randomInt(0, 50);
    const dontKnowCountA = TestGenerators.randomInt(50, 100);
    
    // Card B: higher ratio (easier)
    const knowCountB = TestGenerators.randomInt(50, 100);
    const dontKnowCountB = TestGenerators.randomInt(0, 50);
    
    const cardA = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCountA,
        dontKnowCount: dontKnowCountA,
        lastReviewed: null
      }
    };
    
    const cardB = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCountB,
        dontKnowCount: dontKnowCountB,
        lastReviewed: null
      }
    };
    
    // Calculate ratios
    const ratioA = knowCountA / (dontKnowCountA + 1);
    const ratioB = knowCountB / (dontKnowCountB + 1);
    
    // Only test if ratios are actually different
    if (Math.abs(ratioA - ratioB) > 0.01) {
      const weightA = algorithm.calculateProbability(cardA);
      const weightB = algorithm.calculateProbability(cardB);
      
      // If card A has lower ratio, it should have higher weight
      if (ratioA < ratioB) {
        assert(
          weightA > weightB,
          `Card with lower ratio (${ratioA}) should have higher weight than card with higher ratio (${ratioB}). Got weights: ${weightA} vs ${weightB}`
        );
      } else {
        assert(
          weightB > weightA,
          `Card with lower ratio (${ratioB}) should have higher weight than card with higher ratio (${ratioA}). Got weights: ${weightB} vs ${weightA}`
        );
      }
    }
  }
));

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: Cards with more "don\'t know" have higher probability', propertyTest(
  'more dont know higher probability',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Create two cards with same knowCount but different dontKnowCount
    const knowCount = TestGenerators.randomInt(10, 50);
    const dontKnowCountLow = TestGenerators.randomInt(1, 20);
    const dontKnowCountHigh = TestGenerators.randomInt(50, 100);
    
    const cardLowDontKnow = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCount,
        dontKnowCount: dontKnowCountLow,
        lastReviewed: null
      }
    };
    
    const cardHighDontKnow = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCount,
        dontKnowCount: dontKnowCountHigh,
        lastReviewed: null
      }
    };
    
    const weightLow = algorithm.calculateProbability(cardLowDontKnow);
    const weightHigh = algorithm.calculateProbability(cardHighDontKnow);
    
    // Card with more "don't know" should have higher weight (lower ratio)
    assert(
      weightHigh > weightLow,
      `Card with more "don't know" (${dontKnowCountHigh}) should have higher weight than card with less "don't know" (${dontKnowCountLow}). Got weights: ${weightHigh} vs ${weightLow}`
    );
  }
));

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: Cards with more "know" have lower probability', propertyTest(
  'more know lower probability',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Create two cards with same dontKnowCount but different knowCount
    const dontKnowCount = TestGenerators.randomInt(10, 50);
    const knowCountLow = TestGenerators.randomInt(1, 20);
    const knowCountHigh = TestGenerators.randomInt(50, 100);
    
    const cardLowKnow = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCountLow,
        dontKnowCount: dontKnowCount,
        lastReviewed: null
      }
    };
    
    const cardHighKnow = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: knowCountHigh,
        dontKnowCount: dontKnowCount,
        lastReviewed: null
      }
    };
    
    const weightLow = algorithm.calculateProbability(cardLowKnow);
    const weightHigh = algorithm.calculateProbability(cardHighKnow);
    
    // Card with more "know" should have lower weight (higher ratio)
    assert(
      weightLow > weightHigh,
      `Card with less "know" (${knowCountLow}) should have higher weight than card with more "know" (${knowCountHigh}). Got weights: ${weightLow} vs ${weightHigh}`
    );
  }
));

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: selectNext returns cards with proper distribution', propertyTest(
  'selectNext distribution',
  50,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    // Create a collection with cards of varying difficulty
    const easyCard = {
      id: 'easy',
      word: 'easy',
      translation: 'easy',
      statistics: { knowCount: 100, dontKnowCount: 10, lastReviewed: null }
    };
    
    const mediumCard = {
      id: 'medium',
      word: 'medium',
      translation: 'medium',
      statistics: { knowCount: 50, dontKnowCount: 50, lastReviewed: null }
    };
    
    const hardCard = {
      id: 'hard',
      word: 'hard',
      translation: 'hard',
      statistics: { knowCount: 10, dontKnowCount: 100, lastReviewed: null }
    };
    
    const cards = [easyCard, mediumCard, hardCard];
    
    // Select cards multiple times and count selections
    const selections = { easy: 0, medium: 0, hard: 0 };
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
      const selected = algorithm.selectNext(cards);
      selections[selected.id]++;
    }
    
    // Hard card should be selected most often, easy card least often
    assert(
      selections.hard > selections.medium,
      `Hard card should be selected more than medium card. Got: hard=${selections.hard}, medium=${selections.medium}`
    );
    assert(
      selections.medium > selections.easy,
      `Medium card should be selected more than easy card. Got: medium=${selections.medium}, easy=${selections.easy}`
    );
  }
));

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: selectNext returns null for empty array', propertyTest(
  'selectNext empty array',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    const result = algorithm.selectNext([]);
    
    assertEqual(result, null, 'selectNext should return null for empty array');
  }
));

// Feature: flashcard-learning-app, Property 24: Probability inversely proportional to ratio
runner.test('Property 24: selectNext returns the only card when array has one card', propertyTest(
  'selectNext single card',
  100,
  () => {
    const algorithm = new SelectionAlgorithm();
    
    const card = {
      id: TestGenerators.randomUUID(),
      word: TestGenerators.randomString(1, 100),
      translation: TestGenerators.randomString(1, 100),
      statistics: {
        knowCount: TestGenerators.randomInt(0, 100),
        dontKnowCount: TestGenerators.randomInt(0, 100),
        lastReviewed: null
      }
    };
    
    const result = algorithm.selectNext([card]);
    
    assertEqual(result.id, card.id, 'selectNext should return the only card in array');
  }
));

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runner;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.selectionAlgorithmTests = runner;
}
