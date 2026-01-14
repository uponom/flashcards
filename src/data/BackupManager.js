/**
 * BackupManager - Manages backup and restore operations
 * Handles exporting cards to JSON and importing from JSON files
 */
class BackupManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Create a backup of all cards
   * @param {Array} cards - Array of card objects to backup
   * @returns {string} JSON string containing all cards
   */
  createBackup(cards) {
    const backup = {
      version: '1.0',
      timestamp: Date.now(),
      cards: cards
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restore cards from a backup file
   * @param {File} file - Backup file to restore from
   * @returns {Promise<Object>} Object containing cards array and metadata
   * @throws {Error} If file format is invalid
   */
  async restoreBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const backup = JSON.parse(content);
          
          // Validate backup format
          if (!backup.cards || !Array.isArray(backup.cards)) {
            reject(new Error('Invalid backup format: missing or invalid cards array'));
            return;
          }
          
          resolve(backup);
        } catch (error) {
          reject(new Error(`Failed to parse backup file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Merge imported cards with existing cards, removing duplicates
   * Cards are considered duplicates if they have the same word and translation
   * @param {Array} existing - Existing cards
   * @param {Array} imported - Imported cards
   * @returns {Array} Merged array without duplicates
   */
  mergeCards(existing, imported) {
    const merged = [...existing];
    const existingKeys = new Set(
      existing.map(card => `${card.word}|${card.translation}`)
    );
    
    for (const card of imported) {
      const key = `${card.word}|${card.translation}`;
      if (!existingKeys.has(key)) {
        merged.push(card);
        existingKeys.add(key);
      }
    }
    
    return merged;
  }

  /**
   * Download backup as a file
   * @param {string} backupData - JSON string to download
   * @param {string} filename - Name for the downloaded file
   */
  downloadBackup(backupData, filename = 'flashcards-backup.json') {
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import and merge backup with existing cards
   * @param {File} file - Backup file
   * @param {string} mode - Import mode: 'merge' or 'overwrite'
   * @returns {Promise<Array>} Resulting cards array
   */
  async importBackup(file, mode = 'merge') {
    const backup = await this.restoreBackup(file);
    const existingCards = this.storageManager.loadCards();
    
    let resultCards;
    if (mode === 'overwrite') {
      resultCards = backup.cards;
    } else {
      resultCards = this.mergeCards(existingCards, backup.cards);
    }
    
    // Save to storage
    this.storageManager.saveCards(resultCards);
    
    return resultCards;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackupManager;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.BackupManager = BackupManager;
}
