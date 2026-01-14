# Flashcard Learning App

A Progressive Web App (PWA) for learning vocabulary using adaptive flashcards. Built with vanilla JavaScript, no external dependencies.

## Features

- Create and manage flashcards with words, translations, tags, and languages
- Adaptive learning algorithm that prioritizes difficult cards
- Text-to-speech pronunciation support
- Tag-based filtering
- Backup and restore functionality
- CSV import support
- Multi-language interface (English, Ukrainian, Russian)
- Fully offline capable
- Installable as PWA

## Project Structure

```
flashcards/
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── icons/                  # App icons for PWA
└── src/
    ├── app.js              # Application entry point
    ├── data/               # Data layer (storage, backup, import)
    ├── business/           # Business logic layer (managers, algorithms)
    ├── components/         # UI components
    └── test-utils/         # Testing utilities
```

## Getting Started

1. Open `index.html` in a modern web browser
2. Click the + button to create your first flashcard
3. Start studying!

## Development

This app uses vanilla JavaScript with ES6 modules. No build step required.

To run locally:
1. Serve the files using any static file server
2. Open in browser
3. The service worker will cache assets for offline use

## Testing

Tests are located alongside source files with `.test.js` extension.
Open `test.html` in a browser to run all tests.

## Requirements

- Modern web browser with:
  - LocalStorage support
  - Service Worker support
  - ES6 module support
  - Web Speech API (optional, for TTS)
Simple Flashcards PWA
