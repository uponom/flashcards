/**
 * StatisticsTracker - Tracks and manages flashcard learning statistics
 * Handles incrementing know/don't-know counters and ensures persistence
 */
class StatisticsTracker {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Increment the "know" counter for a card
   * @param {string} cardId - ID of the card to update
   * @throws {Error} If card not found
   */
  incrementKnown(cardId) {
    const cards = this.storageManager.loadCards();
    const card = cards.find(c => c.id === cardId);

    if (!card) {
      throw new Error(`Card with id ${cardId} not found`);
    }

    // Increment know counter and update last reviewed timestamp
    card.statistics.knowCount++;
    card.statistics.lastReviewed = Date.now();
    card.updatedAt = Date.now();

    // Persist changes
    this.storageManager.saveCards(cards);
  }

  /**
   * Increment the "don't know" counter for a card
   * @param {string} cardId - ID of the card to update
   * @throws {Error} If card not found
   */
  incrementDontKnow(cardId) {
    const cards = this.storageManager.loadCards();
    const card = cards.find(c => c.id === cardId);

    if (!card) {
      throw new Error(`Card with id ${cardId} not found`);
    }

    // Increment don't know counter and update last reviewed timestamp
    card.statistics.dontKnowCount++;
    card.statistics.lastReviewed = Date.now();
    card.updatedAt = Date.now();

    // Persist changes
    this.storageManager.saveCards(cards);
  }

  /**
   * Get statistics for a specific card
   * @param {string} cardId - ID of the card
   * @returns {Object} Statistics object with knowCount, dontKnowCount, lastReviewed
   * @throws {Error} If card not found
   */
  getStatistics(cardId) {
    const cards = this.storageManager.loadCards();
    const card = cards.find(c => c.id === cardId);

    if (!card) {
      throw new Error(`Card with id ${cardId} not found`);
    }

    // Return a copy of the statistics to prevent external modification
    return {
      knowCount: card.statistics.knowCount,
      dontKnowCount: card.statistics.dontKnowCount,
      lastReviewed: card.statistics.lastReviewed
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatisticsTracker;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.StatisticsTracker = StatisticsTracker;
}
