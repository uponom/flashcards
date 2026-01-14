// Main Application Entry Point
// Flashcard Learning App

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[App] Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });
  });
}

// Application initialization
class App {
  constructor() {
    console.log('[App] Initializing Flashcard Learning App...');
    this.init();
  }

  init() {
    // Check for LocalStorage availability
    if (!this.checkLocalStorage()) {
      this.showError('LocalStorage is not available. The app requires LocalStorage to function.');
      return;
    }

    console.log('[App] App initialized successfully');
    
    // Display welcome message if no cards exist
    this.showWelcomeIfNeeded();
  }

  checkLocalStorage() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  showError(message) {
    const main = document.getElementById('app-main');
    if (main) {
      main.innerHTML = `
        <div class="empty-state">
          <h3>Error</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }

  showWelcomeIfNeeded() {
    // Check if there are any cards in storage
    const cards = localStorage.getItem('flashcards');
    if (!cards || JSON.parse(cards).length === 0) {
      const studyScreen = document.getElementById('study-screen');
      if (studyScreen) {
        studyScreen.innerHTML = `
          <div class="empty-state">
            <h3>Welcome to Flashcard Learning!</h3>
            <p>You don't have any flashcards yet.</p>
            <p>Click the + button to create your first card.</p>
          </div>
        `;
      }
    }
  }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}
