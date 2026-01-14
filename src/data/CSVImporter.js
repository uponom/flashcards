/**
 * CSVImporter - Imports flashcards from CSV files
 * Expected CSV format: word,translation,tags,language
 * Required fields: word, translation
 * Optional fields: tags (comma-separated), language
 */
class CSVImporter {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Parse a CSV file and extract flashcard data
   * @param {File} file - CSV file to parse
   * @returns {Promise<Array>} Array of card objects
   * @throws {Error} If file cannot be parsed or validation fails
   */
  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }
          
          // Parse header
          const header = this._parseCSVLine(lines[0]);
          const wordIndex = header.findIndex(h => h.toLowerCase() === 'word');
          const translationIndex = header.findIndex(h => h.toLowerCase() === 'translation');
          const tagsIndex = header.findIndex(h => h.toLowerCase() === 'tags');
          const languageIndex = header.findIndex(h => h.toLowerCase() === 'language');
          
          // Validate required fields
          if (wordIndex === -1 || translationIndex === -1) {
            reject(new Error('CSV must contain "word" and "translation" columns'));
            return;
          }
          
          // Parse data rows
          const cards = [];
          for (let i = 1; i < lines.length; i++) {
            const values = this._parseCSVLine(lines[i]);
            
            if (values.length === 0) continue; // Skip empty lines
            
            const word = values[wordIndex]?.trim() || '';
            const translation = values[translationIndex]?.trim() || '';
            
            // Skip rows with missing required fields
            if (!word || !translation) {
              console.warn(`Skipping row ${i + 1}: missing word or translation`);
              continue;
            }
            
            const card = {
              id: this._generateId(),
              word,
              translation,
              tags: tagsIndex !== -1 && values[tagsIndex] 
                ? values[tagsIndex].split(';').map(t => t.trim()).filter(t => t)
                : [],
              language: languageIndex !== -1 && values[languageIndex]
                ? values[languageIndex].trim()
                : 'en',
              statistics: {
                knowCount: 0,
                dontKnowCount: 0,
                lastReviewed: null
              },
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            
            cards.push(card);
          }
          
          resolve(cards);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Parse a single CSV line, handling quoted values
   * @private
   * @param {string} line - CSV line to parse
   * @returns {Array<string>} Array of values
   */
  _parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (two quotes in a row)
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  /**
   * Generate a unique ID for a card
   * @private
   * @returns {string} Unique ID
   */
  _generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate CSV data
   * @param {Array} cards - Array of card objects to validate
   * @returns {Object} Validation result with valid flag and errors array
   */
  validateCSVData(cards) {
    const errors = [];
    
    if (!Array.isArray(cards)) {
      errors.push('Data must be an array');
      return { valid: false, errors };
    }
    
    if (cards.length === 0) {
      errors.push('No valid cards found in CSV');
      return { valid: false, errors };
    }
    
    cards.forEach((card, index) => {
      if (!card.word || typeof card.word !== 'string' || !card.word.trim()) {
        errors.push(`Card ${index + 1}: missing or invalid word`);
      }
      if (!card.translation || typeof card.translation !== 'string' || !card.translation.trim()) {
        errors.push(`Card ${index + 1}: missing or invalid translation`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Import cards from CSV file and save to storage
   * @param {File} file - CSV file to import
   * @returns {Promise<Array>} Array of imported cards
   * @throws {Error} If validation fails
   */
  async importCSV(file) {
    const cards = await this.parseCSV(file);
    const validation = this.validateCSVData(cards);
    
    if (!validation.valid) {
      throw new Error(`CSV validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Merge with existing cards
    const existingCards = this.storageManager.loadCards();
    const allCards = [...existingCards, ...cards];
    
    // Save to storage
    this.storageManager.saveCards(allCards);
    
    return cards;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSVImporter;
}

// Export to window for browser use
if (typeof window !== 'undefined') {
  window.CSVImporter = CSVImporter;
}
