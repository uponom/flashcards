/**
 * TestGenerators - Generators for property-based testing
 */
class TestGenerators {
  /**
   * Generate a random string
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {string} Random string
   */
  static randomString(minLength = 1, maxLength = 100) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * Generate a random UUID
   * @returns {string} Random UUID
   */
  static randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a random integer
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min = 0, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Choose a random element from an array
   * @param {Array} array - Array to choose from
   * @returns {*} Random element
   */
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate a random array
   * @param {Function} generator - Generator function for array elements
   * @param {number} minLength - Minimum array length
   * @param {number} maxLength - Maximum array length
   * @returns {Array} Random array
   */
  static randomArray(generator, minLength = 0, maxLength = 10) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return Array.from({ length }, () => generator());
  }

  /**
   * Generate a random flashcard
   * @returns {Object} Random flashcard object
   */
  static randomCard() {
    return {
      id: this.randomUUID(),
      word: this.randomString(1, 100),
      translation: this.randomString(1, 100),
      tags: this.randomArray(() => this.randomString(1, 20), 0, 5),
      language: this.randomChoice(['en', 'de', 'fr', 'es', 'uk', 'ru']),
      statistics: {
        knowCount: this.randomInt(0, 100),
        dontKnowCount: this.randomInt(0, 100),
        lastReviewed: Math.random() > 0.5 ? Date.now() : null
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Generate an invalid flashcard (missing required fields)
   * @returns {Object} Invalid flashcard object
   */
  static randomInvalidCard() {
    const type = Math.floor(Math.random() * 4);
    switch (type) {
      case 0: return { word: '', translation: this.randomString() };
      case 1: return { word: this.randomString(), translation: '' };
      case 2: return { word: null, translation: this.randomString() };
      case 3: return { word: this.randomString(), translation: null };
      default: return { word: '', translation: '' };
    }
  }

  /**
   * Generate random settings
   * @returns {Object} Random settings object
   */
  static randomSettings() {
    return {
      language: this.randomChoice(['en', 'uk', 'ru']),
      ttsEnabled: Math.random() > 0.5,
      selectedTags: this.randomArray(() => this.randomString(1, 20), 0, 5)
    };
  }
}

/**
 * Run a property-based test with multiple iterations
 * @param {string} name - Test name
 * @param {number} iterations - Number of iterations
 * @param {Function} testFn - Test function
 * @returns {Function} Async test function
 */
function propertyTest(name, iterations, testFn) {
  return async () => {
    for (let i = 0; i < iterations; i++) {
      try {
        await testFn(i);
      } catch (error) {
        throw new Error(`Property test failed on iteration ${i + 1}/${iterations}: ${error.message}`);
      }
    }
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestGenerators, propertyTest };
}
