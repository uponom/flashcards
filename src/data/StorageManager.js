/**
 * StorageManager - Manages all LocalStorage operations
 * Handles saving/loading cards and settings with error handling
 */
class StorageManager {
  constructor() {
    this.CARDS_KEY = 'flashcard_app_cards';
    this.SETTINGS_KEY = 'flashcard_app_settings';
  }

  /**
   * Save cards to LocalStorage
   * @param {Array} cards - Array of card objects
   * @throws {Error} If storage quota is exceeded or storage is unavailable
   */
  saveCards(cards) {
    try {
      const data = JSON.stringify(cards);
      localStorage.setItem(this.CARDS_KEY, data);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some cards or create a backup.');
      }
      throw new Error(`Failed to save cards: ${error.message}`);
    }
  }

  /**
   * Load cards from LocalStorage
   * @returns {Array} Array of card objects, or empty array if none exist
   */
  loadCards() {
    try {
      const data = localStorage.getItem(this.CARDS_KEY);
      if (!data) {
        return [];
      }
      
      const cards = JSON.parse(data);
      
      // Validate that we got an array
      if (!Array.isArray(cards)) {
        console.error('Corrupted data: expected array, got', typeof cards);
        return [];
      }
      
      return cards;
    } catch (error) {
      console.error('Failed to load cards, corrupted data:', error);
      return [];
    }
  }

  /**
   * Save settings to LocalStorage
   * @param {Object} settings - Settings object
   * @throws {Error} If storage quota is exceeded or storage is unavailable
   */
  saveSettings(settings) {
    try {
      const data = JSON.stringify(settings);
      localStorage.setItem(this.SETTINGS_KEY, data);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded.');
      }
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  }

  /**
   * Load settings from LocalStorage
   * @returns {Object} Settings object, or default settings if none exist
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      if (!data) {
        return this._getDefaultSettings();
      }
      
      const settings = JSON.parse(data);
      
      // Validate that we got an object
      if (typeof settings !== 'object' || settings === null) {
        console.error('Corrupted settings data');
        return this._getDefaultSettings();
      }
      
      return settings;
    } catch (error) {
      console.error('Failed to load settings, corrupted data:', error);
      return this._getDefaultSettings();
    }
  }

  /**
   * Clear all data from LocalStorage
   */
  clearAll() {
    try {
      localStorage.removeItem(this.CARDS_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error(`Failed to clear storage: ${error.message}`);
    }
  }

  /**
   * Get default settings
   * @private
   * @returns {Object} Default settings object
   */
  _getDefaultSettings() {
    return {
      language: 'en',
      ttsEnabled: true,
      selectedTags: []
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
