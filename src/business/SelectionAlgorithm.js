/**
 * SelectionAlgorithm - Adaptive card selection algorithm
 * Selects cards based on know/don't-know ratio with weighted random selection
 * Cards with lower ratios (more difficult) appear more frequently
 */
class SelectionAlgorithm {
  /**
   * Calculate selection probability weight for a card
   * Formula: weight = 1 / (1 + ratio)
   * where ratio = knowCount / (dontKnowCount + 1)
   * 
   * @param {Object} card - Card object with statistics
   * @returns {number} Weight value for selection probability
   */
  calculateProbability(card) {
    if (!card || !card.statistics) {
      throw new Error('Card must have statistics');
    }

    const { knowCount, dontKnowCount } = card.statistics;

    // Calculate ratio: knowCount / (dontKnowCount + 1)
    // Adding 1 to dontKnowCount prevents division by zero
    const ratio = knowCount / (dontKnowCount + 1);

    // Calculate weight: 1 / (1 + ratio)
    // Lower ratio (more difficult cards) = higher weight
    const weight = 1 / (1 + ratio);

    return weight;
  }

  /**
   * Select next card using weighted random selection
   * Cards with higher weights (lower know/don't-know ratios) are more likely to be selected
   * 
   * @param {Array} cards - Array of card objects
   * @returns {Object|null} Selected card or null if no cards available
   */
  selectNext(cards) {
    if (!Array.isArray(cards) || cards.length === 0) {
      return null;
    }

    // Calculate weights for all cards
    const weights = cards.map(card => this.calculateProbability(card));

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // If total weight is 0 (shouldn't happen with our formula), return random card
    if (totalWeight === 0) {
      return cards[Math.floor(Math.random() * cards.length)];
    }

    // Weighted random selection
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < cards.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return cards[i];
      }
    }

    // Fallback: return last card (should rarely happen due to floating point)
    return cards[cards.length - 1];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SelectionAlgorithm;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.SelectionAlgorithm = SelectionAlgorithm;
}
