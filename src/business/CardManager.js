/**
 * CardManager - Manages flashcard CRUD operations
 * Handles card creation, updates, deletion, and filtering with validation
 */
class CardManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Generate a unique ID for a card
   * @private
   * @returns {string} UUID v4
   */
  _generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate card data
   * @private
   * @param {Object} data - Card data to validate
   * @returns {Object} Validation result with valid flag and errors array
   */
  _validateCardData(data) {
    const errors = [];

    // Check required fields
    if (!data.word || typeof data.word !== 'string' || data.word.trim() === '') {
      errors.push('Word is required and must be a non-empty string');
    }

    if (!data.translation || typeof data.translation !== 'string' || data.translation.trim() === '') {
      errors.push('Translation is required and must be a non-empty string');
    }

    // Validate optional fields if present
    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push('Tags must be an array');
      } else {
        for (const tag of data.tags) {
          if (typeof tag !== 'string') {
            errors.push('All tags must be strings');
            break;
          }
        }
      }
    }

    if (data.language !== undefined && typeof data.language !== 'string') {
      errors.push('Language must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new flashcard
   * @param {Object} data - Card data (word, translation, tags?, language?)
   * @returns {Object} Created card object
   * @throws {Error} If validation fails
   */
  createCard(data) {
    // Validate input
    const validation = this._validateCardData(data);
    if (!validation.valid) {
      throw new Error(`Card validation failed: ${validation.errors.join(', ')}`);
    }

    // Create card with all fields
    const now = Date.now();
    const card = {
      id: this._generateId(),
      word: data.word.trim(),
      translation: data.translation.trim(),
      tags: data.tags || [],
      language: data.language || '',
      statistics: {
        knowCount: 0,
        dontKnowCount: 0,
        lastReviewed: null
      },
      createdAt: now,
      updatedAt: now
    };

    // Load existing cards, add new card, and save
    const cards = this.storageManager.loadCards();
    cards.push(card);
    this.storageManager.saveCards(cards);

    return card;
  }

  /**
   * Update an existing flashcard
   * @param {string} id - Card ID to update
   * @param {Object} data - Updated card data (word, translation, tags?, language?)
   * @returns {Object} Updated card object
   * @throws {Error} If card not found or validation fails
   */
  updateCard(id, data) {
    // Validate input
    const validation = this._validateCardData(data);
    if (!validation.valid) {
      throw new Error(`Card validation failed: ${validation.errors.join(', ')}`);
    }

    // Load cards and find the one to update
    const cards = this.storageManager.loadCards();
    const cardIndex = cards.findIndex(c => c.id === id);

    if (cardIndex === -1) {
      throw new Error(`Card with id ${id} not found`);
    }

    // Update card while preserving statistics and timestamps
    const existingCard = cards[cardIndex];
    const updatedCard = {
      ...existingCard,
      word: data.word.trim(),
      translation: data.translation.trim(),
      tags: data.tags || [],
      language: data.language || '',
      updatedAt: Date.now()
      // statistics, createdAt are preserved from existingCard
    };

    cards[cardIndex] = updatedCard;
    this.storageManager.saveCards(cards);

    return updatedCard;
  }

  /**
   * Delete a flashcard
   * @param {string} id - Card ID to delete
   * @returns {boolean} True if card was deleted, false if not found
   */
  deleteCard(id) {
    const cards = this.storageManager.loadCards();
    const initialLength = cards.length;
    const filteredCards = cards.filter(c => c.id !== id);

    if (filteredCards.length === initialLength) {
      return false; // Card not found
    }

    this.storageManager.saveCards(filteredCards);
    return true;
  }

  /**
   * Get all flashcards
   * @returns {Array} Array of all card objects
   */
  getAllCards() {
    return this.storageManager.loadCards();
  }

  /**
   * Get flashcards filtered by tags
   * @param {Array<string>} tags - Array of tags to filter by
   * @returns {Array} Array of cards that have at least one of the specified tags
   */
  getCardsByTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) {
      return this.getAllCards();
    }

    const cards = this.storageManager.loadCards();
    return cards.filter(card => {
      // Card matches if it has at least one of the specified tags
      return card.tags.some(cardTag => tags.includes(cardTag));
    });
  }

  /**
   * Import cards with merge or overwrite mode
   * @param {Array} cards - Array of cards to import
   * @param {string} mode - Import mode: 'merge' or 'overwrite'
   * @returns {Array} Resulting cards array after import
   * @throws {Error} If mode is invalid
   */
  importCards(cards, mode = 'merge') {
    if (!Array.isArray(cards)) {
      throw new Error('Cards must be an array');
    }

    if (mode !== 'merge' && mode !== 'overwrite') {
      throw new Error('Mode must be either "merge" or "overwrite"');
    }

    let resultCards;

    if (mode === 'overwrite') {
      // Replace all existing cards with imported cards
      resultCards = cards;
    } else {
      // Merge: combine existing and imported, removing duplicates
      const existingCards = this.storageManager.loadCards();
      const merged = [...existingCards];
      const existingKeys = new Set(
        existingCards.map(card => `${card.word}|${card.translation}`)
      );

      for (const card of cards) {
        const key = `${card.word}|${card.translation}`;
        if (!existingKeys.has(key)) {
          merged.push(card);
          existingKeys.add(key);
        }
      }

      resultCards = merged;
    }

    // Save to storage
    this.storageManager.saveCards(resultCards);

    return resultCards;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardManager;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.CardManager = CardManager;
}
