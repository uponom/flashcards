# Design Document: Flashcard Learning App

## Overview

Flashcard Learning App - это автономное PWA приложение для изучения иностранных слов методом карточек. Приложение построено на чистом JavaScript (Vanilla JS) с использованием только нативных браузерных API, без внешних зависимостей, фреймворков и библиотек. Архитектура основана на компонентном подходе с четким разделением слоев данных, бизнес-логики и представления.

## Architecture

### Общая архитектура

Приложение следует трехслойной архитектуре:

1. **Data Layer (Слой данных)**: Управление хранением и извлечением данных через LocalStorage API
2. **Business Logic Layer (Слой бизнес-логики)**: Управление карточками, статистикой, алгоритмом показа
3. **Presentation Layer (Слой представления)**: UI компоненты и обработка пользовательского ввода

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
│  - StudyScreen                      │
│  - CardForm                         │
│  - CardList                         │
│  - SettingsPanel                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Business Logic Layer             │
│  - CardManager                      │
│  - StudySessionManager              │
│  - SelectionAlgorithm               │
│  - StatisticsTracker                │
│  - TTSController                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Data Layer                    │
│  - StorageManager                   │
│  - BackupManager                    │
│  - CSVImporter                      │
└─────────────────────────────────────┘
```

### PWA архитектура

- **Service Worker**: Кеширование всех статических ресурсов для офлайн работы
- **Web App Manifest**: Метаданные для установки приложения
- **Cache-First Strategy**: Приоритет локального кеша над сетью

## Components and Interfaces

### Data Layer

#### StorageManager

Управляет всеми операциями с LocalStorage.

```javascript
class StorageManager {
  // Сохранить все карточки
  saveCards(cards) { }
  
  // Загрузить все карточки
  loadCards() { }
  
  // Сохранить настройки
  saveSettings(settings) { }
  
  // Загрузить настройки
  loadSettings() { }
  
  // Очистить все данные
  clearAll() { }
}
```

#### BackupManager

Управляет экспортом и импортом резервных копий.

```javascript
class BackupManager {
  // Создать резервную копию
  createBackup(cards) { }
  
  // Восстановить из резервной копии
  async restoreBackup(file) { }
  
  // Объединить карточки (удаление дубликатов)
  mergeCards(existing, imported) { }
}
```

#### CSVImporter

Импортирует карточки из CSV файлов.

```javascript
class CSVImporter {
  // Парсить CSV файл
  async parseCSV(file) { }
  
  // Валидировать CSV данные
  validateCSVData(data) { }
}
```

### Business Logic Layer

#### CardManager

Центральный менеджер для управления карточками.

```javascript
class CardManager {
  // Создать новую карточку
  createCard(data) { }
  
  // Обновить существующую карточку
  updateCard(id, data) { }
  
  // Удалить карточку
  deleteCard(id) { }
  
  // Получить все карточки
  getAllCards() { }
  
  // Получить карточки по тегам
  getCardsByTags(tags) { }
  
  // Импортировать карточки
  importCards(cards, mode) { } // mode: 'merge' | 'overwrite'
}
```

#### StudySessionManager

Управляет сессией обучения.

```javascript
class StudySessionManager {
  // Начать сессию
  startSession(cards) { }
  
  // Получить следующую карточку
  getNextCard() { }
  
  // Зарегистрировать ответ
  recordResponse(cardId, known) { }
  
  // Получить текущую карточку
  getCurrentCard() { }
}
```

#### SelectionAlgorithm

Алгоритм выбора следующей карточки на основе статистики.

```javascript
class SelectionAlgorithm {
  // Выбрать следующую карточку
  selectNext(cards) { }
  
  // Вычислить вероятность показа
  calculateProbability(card) { }
}
```

**Алгоритм выбора:**

Вероятность показа карточки вычисляется по формуле:

```
weight = 1 / (1 + ratio)
где ratio = knowCount / (dontKnowCount + 1)
```

Карточки с меньшим соотношением "знаю"/"не знаю" получают больший вес и показываются чаще.

#### StatisticsTracker

Отслеживает статистику по карточкам.

```javascript
class StatisticsTracker {
  // Увеличить счетчик "знаю"
  incrementKnown(cardId) { }
  
  // Увеличить счетчик "не знаю"
  incrementDontKnow(cardId) { }
  
  // Получить статистику карточки
  getStatistics(cardId) { }
}
```

#### TTSController

Управляет озвучиванием текста.

```javascript
class TTSController {
  // Озвучить текст
  speak(text, language) { }
  
  // Остановить озвучивание
  stop() { }
  
  // Включить/выключить TTS
  setEnabled(enabled) { }
  
  // Проверить доступность TTS
  isAvailable() { }
}
```

### Presentation Layer

#### StudyScreen

Главный экран для изучения карточек.

```javascript
class StudyScreen {
  // Показать карточку
  displayCard(card) { }
  
  // Перевернуть карточку
  flipCard() { }
  
  // Обработать ответ пользователя
  handleResponse(known) { }
  
  // Обработать свайп
  handleSwipe(direction) { } // direction: 'left' | 'right'
}
```

#### CardForm

Форма для создания/редактирования карточек.

```javascript
class CardForm {
  // Показать форму для новой карточки
  showNew() { }
  
  // Показать форму для редактирования
  showEdit(card) { }
  
  // Сохранить карточку
  save() { }
  
  // Отменить изменения
  cancel() { }
}
```

#### CardList

Список всех карточек с возможностью фильтрации.

```javascript
class CardList {
  // Показать все карточки
  displayCards(cards) { }
  
  // Применить фильтр по тегам
  applyTagFilter(tags) { }
  
  // Обработать выбор карточки
  handleCardSelect(cardId) { }
}
```

#### SettingsPanel

Панель настроек приложения.

```javascript
class SettingsPanel {
  // Изменить язык интерфейса
  changeLanguage(language) { } // language: 'en' | 'uk' | 'ru'
  
  // Экспортировать резервную копию
  exportBackup() { }
  
  // Импортировать резервную копию
  importBackup(file) { }
  
  // Импортировать CSV
  importCSV(file) { }
}
```

## Data Models

### Flashcard

```javascript
// Структура объекта Flashcard
{
  id: string,                    // Уникальный идентификатор
  word: string,                  // Слово/фраза на иностранном языке
  translation: string,           // Перевод
  tags: string[],                // Теги для категоризации
  language: string,              // Код языка (например, 'en', 'de', 'fr')
  statistics: {                  // Статистика изучения
    knowCount: number,
    dontKnowCount: number,
    lastReviewed: number | null
  },
  createdAt: number,             // Timestamp создания
  updatedAt: number              // Timestamp последнего обновления
}
```

### CardStatistics

```javascript
// Структура объекта CardStatistics
{
  knowCount: number,             // Количество раз "знаю"
  dontKnowCount: number,         // Количество раз "не знаю"
  lastReviewed: number | null    // Timestamp последнего просмотра
}
```

### AppSettings

```javascript
// Структура объекта AppSettings
{
  language: string,              // Язык интерфейса: 'en' | 'uk' | 'ru'
  ttsEnabled: boolean,           // Включено ли озвучивание
  selectedTags: string[]         // Выбранные теги для фильтрации
}
```

### CardData

```javascript
// Структура объекта CardData (для создания карточки)
{
  word: string,
  translation: string,
  tags: string[],                // опционально
  language: string               // опционально
}
```

### ValidationResult

```javascript
// Структура объекта ValidationResult
{
  valid: boolean,
  errors: string[]
}
```

## Correctness Properties

*Свойство корректности - это характеристика или поведение, которое должно выполняться во всех допустимых выполнениях системы. Свойства служат мостом между человекочитаемыми спецификациями и машинно-проверяемыми гарантиями корректности.*

### Property 1: Card creation validation
*For any* card creation attempt, if the word or translation field is empty, the system should reject the creation and maintain the current state unchanged.
**Validates: Requirements 1.2**

### Property 2: Optional fields acceptance
*For any* valid card with word and translation, the system should accept the card regardless of whether tags or language are specified.
**Validates: Requirements 1.3**

### Property 3: Card addition to collection
*For any* newly created card, the card should immediately appear in the study collection.
**Validates: Requirements 1.4**

### Property 4: Card persistence round trip
*For any* card, saving it to storage and then reloading should produce an equivalent card with all fields preserved.
**Validates: Requirements 1.5, 2.4**

### Property 5: Edit preserves statistics
*For any* card with existing statistics, editing the card's word, translation, tags, or language should preserve the original know and don't-know counters.
**Validates: Requirements 1.8**

### Property 6: Storage persistence round trip
*For any* collection of cards, saving them, restarting the app, and loading should produce an equivalent collection.
**Validates: Requirements 2.3**

### Property 7: Backup completeness
*For any* collection of cards, creating a backup should include all cards with all their data (word, translation, tags, language, statistics).
**Validates: Requirements 3.1**

### Property 8: Backup format validation
*For any* invalid backup file format, the system should reject the file and display an error message.
**Validates: Requirements 3.2**

### Property 9: Merge without duplicates
*For any* two collections of cards (existing and backup), merging them should result in a collection where each unique card appears exactly once.
**Validates: Requirements 3.4**

### Property 10: Overwrite replaces completely
*For any* existing collection and backup collection, choosing overwrite should result in a collection that contains only the backup cards with no existing cards remaining.
**Validates: Requirements 3.5**

### Property 11: Restore persistence
*For any* restore operation (merge or overwrite), the resulting collection should be persisted and survive an app restart.
**Validates: Requirements 3.6**

### Property 12: CSV parsing validity
*For any* valid CSV file with word and translation columns, the parser should successfully extract all rows as flashcards.
**Validates: Requirements 4.1**

### Property 13: CSV required fields validation
*For any* CSV file missing word or translation fields, the parser should reject the file and report the missing fields.
**Validates: Requirements 4.2**

### Property 14: CSV import completeness
*For any* valid CSV file, all valid rows should be added to the card collection after import.
**Validates: Requirements 4.4**

### Property 15: CSV import persistence
*For any* CSV import operation, the imported cards should be persisted and survive an app restart.
**Validates: Requirements 4.5**

### Property 16: Tag filter completeness
*For any* collection of cards, the filter interface should display all unique tags present in the collection.
**Validates: Requirements 5.1**

### Property 17: Tag filtering correctness
*For any* set of selected tags, the filtered collection should contain only cards that have at least one of the selected tags.
**Validates: Requirements 5.2**

### Property 18: Study session respects filters
*For any* active tag filter, all cards shown in the study session should match the filter criteria.
**Validates: Requirements 5.4**

### Property 19: New card statistics initialization
*For any* newly created card, the know and don't-know counters should both be initialized to zero.
**Validates: Requirements 6.1**

### Property 20: Statistics increment correctness
*For any* card and response (know or don't-know), marking the card should increment the corresponding counter by exactly one.
**Validates: Requirements 6.2, 6.3**

### Property 21: Statistics persistence
*For any* card with updated statistics, the statistics should be persisted and survive an app restart.
**Validates: Requirements 6.4**

### Property 22: Statistics as card data
*For any* card, the statistics (know count, don't-know count, last reviewed) should be stored as part of the card's data structure.
**Validates: Requirements 6.5**

### Property 23: Probability calculation correctness
*For any* card, the selection probability should be calculated as weight = 1 / (1 + knowCount / (dontKnowCount + 1)).
**Validates: Requirements 7.1**

### Property 24: Probability inversely proportional to ratio
*For any* two cards, if card A has a lower know/don't-know ratio than card B, then card A should have a higher selection probability than card B.
**Validates: Requirements 7.2, 7.3**

### Property 25: Card display shows word
*For any* displayed card, the UI should show the card's foreign word/phrase.
**Validates: Requirements 8.2**

### Property 26: TTS pronunciation on display
*For any* displayed card (when TTS is enabled), the TTS should be called with the card's word and language.
**Validates: Requirements 8.3**

### Property 27: Input methods map to responses
*For any* input method (swipe left/right, arrow buttons, know/don't-know buttons), the input should correctly map to the corresponding response (know or don't-know).
**Validates: Requirements 8.4, 8.5, 8.6**

### Property 28: Response updates statistics
*For any* card and response, registering the response should increment the appropriate statistics counter for that card.
**Validates: Requirements 8.8**

### Property 29: TTS uses card language
*For any* card with a specified language, the TTS should use that language when pronouncing the word.
**Validates: Requirements 9.2**

### Property 30: TTS graceful degradation
*For any* environment where TTS is unavailable, the app should continue functioning without errors.
**Validates: Requirements 9.4**

### Property 31: TTS toggle controls pronunciation
*For any* TTS enabled state, toggling it off should prevent automatic pronunciation, and toggling it on should resume automatic pronunciation.
**Validates: Requirements 9.6, 9.7**

### Property 32: TTS preference persistence
*For any* TTS enabled/disabled setting, the preference should be persisted and survive an app restart.
**Validates: Requirements 9.8**

### Property 33: Language switching updates UI
*For any* interface language selection, all UI text elements should be updated to the selected language.
**Validates: Requirements 10.3**

### Property 34: Language preference persistence
*For any* interface language selection, the preference should be persisted and survive an app restart.
**Validates: Requirements 10.4**

### Property 35: Manifest validity
*For any* app deployment, the web app manifest should exist and contain all required fields (name, short_name, icons, start_url, display).
**Validates: Requirements 11.2**

### Property 36: Service worker registration
*For any* app startup, the service worker should be successfully registered.
**Validates: Requirements 11.3**

### Property 37: Offline functionality
*For any* app operation with no network connectivity, the app should function normally with locally stored cards.
**Validates: Requirements 11.4**

### Property 38: Asset caching completeness
*For any* app installation, all necessary assets (HTML, CSS, JS, icons) should be cached by the service worker.
**Validates: Requirements 11.5**

### Property 39: Network isolation
*For any* app operation, no network requests should be made to external services.
**Validates: Requirements 12.1**

### Property 40: Local data storage
*For any* app data, all data should be stored in LocalStorage (no remote storage).
**Validates: Requirements 12.3**


## Error Handling

### Storage Errors

**LocalStorage Full:**
- Detect QuotaExceededError when saving
- Display user-friendly message suggesting to delete old cards or create backup
- Prevent data loss by not clearing existing data

**LocalStorage Unavailable:**
- Detect if LocalStorage is disabled or unavailable
- Display warning message on app startup
- Allow app to function in memory-only mode (data lost on refresh)

**Corrupted Data:**
- Wrap JSON.parse in try-catch
- If data is corrupted, log error and use empty collection
- Offer user option to restore from backup

### File Import Errors

**Invalid File Format:**
- Validate file type before processing
- Display specific error message (e.g., "Expected JSON file" or "Expected CSV file")
- Do not modify existing data on error

**Malformed CSV:**
- Catch parsing errors
- Display line number and error details
- Allow partial import of valid rows (with user confirmation)

**Missing Required Fields:**
- Validate each row/record for required fields
- Display list of missing fields
- Reject import if critical fields are missing

### TTS Errors

**TTS Not Supported:**
- Check for speechSynthesis API availability
- Gracefully disable TTS features if unavailable
- Display icon indicating TTS is disabled

**TTS Failure:**
- Catch errors during speech synthesis
- Log error but continue app operation
- Do not block card display on TTS failure

### Service Worker Errors

**Registration Failure:**
- Log error to console
- Allow app to function without offline capability
- Display warning that offline mode is unavailable

**Cache Failure:**
- Catch cache API errors
- Fall back to network requests
- Log errors for debugging

### General Error Handling Strategy

1. **Never crash the app** - all errors should be caught and handled gracefully
2. **Preserve user data** - never clear or corrupt existing data on error
3. **Inform the user** - display clear, actionable error messages
4. **Fail safely** - default to safe state (e.g., empty collection, disabled features)
5. **Log for debugging** - use console.error for all errors with context

## Testing Strategy

### Overview

Тестирование будет выполняться с использованием встроенных возможностей браузера и простых тестовых функций на чистом JavaScript. Стратегия включает unit-тесты для конкретных примеров и property-based тесты для универсальных свойств корректности.

### Testing Framework

**Подход:** Простые тестовые функции на чистом JavaScript без внешних библиотек

**Структура тестов:**
```javascript
// test-runner.js - простой тест-раннер
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run() {
    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({ test: test.name, error });
        console.error(`✗ ${test.name}:`, error.message);
      }
    }
    return this.results;
  }
}

// Простые assertion функции
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (error) {
    if (error.message === message || error.message === 'Expected function to throw') {
      throw error;
    }
    // Функция выбросила ошибку, как и ожидалось
  }
}
```

### Property-Based Testing Implementation

Для property-based тестирования создадим простые генераторы случайных данных:

```javascript
// test-generators.js - генераторы тестовых данных
class TestGenerators {
  // Генератор случайной строки
  static randomString(minLength = 1, maxLength = 100) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  // Генератор UUID
  static randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Генератор случайного числа
  static randomInt(min = 0, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Генератор случайного элемента из массива
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Генератор случайного массива
  static randomArray(generator, minLength = 0, maxLength = 10) {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    return Array.from({ length }, () => generator());
  }
  
  // Генератор случайной карточки
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
  
  // Генератор невалидной карточки
  static randomInvalidCard() {
    const type = Math.floor(Math.random() * 4);
    switch (type) {
      case 0: return { word: '', translation: this.randomString() };
      case 1: return { word: this.randomString(), translation: '' };
      case 2: return { word: null, translation: this.randomString() };
      case 3: return { word: this.randomString(), translation: null };
    }
  }
}

// Функция для запуска property-based теста
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
```

### Property-Based Testing Configuration

Каждый property test ДОЛЖЕН:
- Запускаться минимум 100 итераций
- Включать комментарий: `// Feature: flashcard-learning-app, Property N: [property text]`
- Ссылаться на номер свойства из документа дизайна

Пример:
```javascript
// Feature: flashcard-learning-app, Property 4: Card persistence round trip
runner.test('card persistence preserves all fields', propertyTest(
  'card persistence',
  100,
  () => {
    const card = TestGenerators.randomCard();
    storageManager.saveCards([card]);
    const loaded = storageManager.loadCards();
    assertEqual(loaded[0], card);
  }
));
```

### Unit Testing Focus

Unit-тесты должны покрывать:

1. **Конкретные примеры:**
   - Создание карточки со всеми полями
   - Создание карточки только с обязательными полями
   - Редактирование карточки и проверка изменений

2. **Граничные случаи:**
   - Пустая коллекция карточек
   - Одна карточка в коллекции
   - Очень длинные слова/переводы
   - Специальные символы (Unicode, эмодзи)
   - Карточки без указанного языка

3. **Условия ошибок:**
   - LocalStorage переполнен
   - Невалидный JSON в хранилище
   - Некорректные CSV файлы
   - TTS недоступен

4. **Точки интеграции:**
   - Взаимодействие UI компонентов
   - Регистрация service worker
   - Вызовы TTS API

### Property Testing Focus

Property-тесты должны проверять:

1. **Round Trip Properties:**
   - Сохранение/загрузка карточек (Property 4, 6)
   - Backup/restore (Property 11)
   - CSV import/export (Property 15)
   - Сохранение настроек (Property 32, 34)

2. **Инварианты:**
   - Статистика всегда неотрицательная (Property 19, 20)
   - ID карточек остаются уникальными
   - Отфильтрованные коллекции являются подмножествами полной коллекции

3. **Метаморфные свойства:**
   - Вероятность обратно пропорциональна соотношению (Property 24)
   - Merge не создает дубликатов (Property 9)
   - Фильтр уменьшает или сохраняет размер коллекции

4. **Свойства валидации:**
   - Невалидные карточки отклоняются (Property 1)
   - Невалидный CSV отклоняется (Property 13)
   - Невалидный backup отклоняется (Property 8)

### Test Organization

```
src/
├── components/
│   ├── StudyScreen.js
│   ├── StudyScreen.test.js          # Unit tests
│   ├── CardForm.js
│   └── CardForm.test.js
├── business/
│   ├── CardManager.js
│   ├── CardManager.test.js          # Unit + Property tests
│   ├── SelectionAlgorithm.js
│   └── SelectionAlgorithm.test.js   # Property tests
├── data/
│   ├── StorageManager.js
│   ├── StorageManager.test.js       # Property tests (round trips)
│   ├── BackupManager.js
│   └── BackupManager.test.js        # Property tests
└── test-utils/
    ├── test-runner.js               # Простой тест-раннер
    └── test-generators.js           # Генераторы тестовых данных
```

### Running Tests

Создать простую HTML страницу для запуска тестов:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Flashcard App Tests</title>
</head>
<body>
  <h1>Test Results</h1>
  <div id="results"></div>
  
  <script type="module">
    import { TestRunner } from './test-utils/test-runner.js';
    import './data/StorageManager.test.js';
    import './business/CardManager.test.js';
    // ... импорт всех тестов
    
    const runner = new TestRunner();
    const results = await runner.run();
    
    document.getElementById('results').innerHTML = `
      <p>Passed: ${results.passed}</p>
      <p>Failed: ${results.failed}</p>
      ${results.errors.map(e => `<p>❌ ${e.test}: ${e.error.message}</p>`).join('')}
    `;
  </script>
</body>
</html>
```

### Testing Priorities

**Высокий приоритет (обязательно тестировать):**
- Сохранение данных (Properties 4, 6, 11, 15, 21, 32, 34)
- Отслеживание статистики (Properties 19, 20, 21, 28)
- Алгоритм выбора (Properties 23, 24)
- Валидация (Properties 1, 8, 13)

**Средний приоритет (желательно тестировать):**
- Фильтрация (Properties 16, 17, 18)
- Логика merge/overwrite (Properties 9, 10)
- Управление TTS (Properties 26, 29, 31)

**Низкий приоритет (опционально):**
- Отображение UI (Properties 25, 33)
- PWA функции (Properties 35, 36, 37, 38)
- Сетевая изоляция (Properties 39, 40)

### Manual Testing Checklist

Поскольку это UI-приложение, ручное тестирование также важно:

- [ ] Установить как PWA на десктопе
- [ ] Установить как PWA на мобильном
- [ ] Тестировать офлайн функциональность
- [ ] Тестировать свайп-жесты на сенсорных устройствах
- [ ] Тестировать навигацию с клавиатуры
- [ ] Тестировать со screen reader (доступность)
- [ ] Тестировать в разных браузерах (Chrome, Firefox, Safari)
- [ ] Тестировать с разными языками интерфейса
- [ ] Тестировать с большими коллекциями карточек (1000+)
- [ ] Тестировать лимиты LocalStorage
