# Implementation Plan: Flashcard Learning App

## Overview

Этот план описывает пошаговую реализацию PWA приложения для изучения слов методом flashcards. Приложение будет построено на чистом JavaScript без внешних зависимостей, с использованием только нативных браузерных API. Реализация следует трехслойной архитектуре: Data Layer → Business Logic Layer → Presentation Layer.

## Tasks

- [x] 1. Настройка структуры проекта и базовых файлов
  - Создать структуру директорий (src/data, src/business, src/components, src/test-utils)
  - Создать index.html с базовой разметкой
  - Создать manifest.json для PWA
  - Создать базовый service worker
  - Создать основной CSS файл для стилей
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Реализация Data Layer
  - [x] 2.1 Создать StorageManager для работы с LocalStorage
    - Реализовать методы saveCards, loadCards, saveSettings, loadSettings, clearAll
    - Добавить обработку ошибок (QuotaExceededError, corrupted data)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Написать property-тесты для StorageManager
    - **Property 4: Card persistence round trip**
    - **Property 6: Storage persistence round trip**
    - **Validates: Requirements 1.5, 2.3, 2.4**

  - [x] 2.3 Создать BackupManager для экспорта/импорта
    - Реализовать createBackup (экспорт в JSON)
    - Реализовать restoreBackup (импорт из JSON)
    - Реализовать mergeCards (объединение без дубликатов)
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [x] 2.4 Написать property-тесты для BackupManager
    - **Property 7: Backup completeness**
    - **Property 8: Backup format validation**
    - **Property 9: Merge without duplicates**
    - **Property 10: Overwrite replaces completely**
    - **Property 11: Restore persistence**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.6**

  - [x] 2.5 Создать CSVImporter для импорта CSV
    - Реализовать parseCSV (парсинг CSV файлов)
    - Реализовать validateCSVData (валидация данных)
    - Добавить обработку ошибок для невалидных файлов
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 2.6 Написать property-тесты для CSVImporter
    - **Property 12: CSV parsing validity**
    - **Property 13: CSV required fields validation**
    - **Property 14: CSV import completeness**
    - **Property 15: CSV import persistence**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

- [ ] 3. Checkpoint - Убедиться что Data Layer работает корректно
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

- [ ] 4. Реализация Business Logic Layer
  - [ ] 4.1 Создать CardManager для управления карточками
    - Реализовать createCard (создание с валидацией)
    - Реализовать updateCard (обновление с сохранением статистики)
    - Реализовать deleteCard, getAllCards, getCardsByTags
    - Реализовать importCards (merge/overwrite режимы)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 5.2_

  - [ ] 4.2 Написать property-тесты для CardManager
    - **Property 1: Card creation validation**
    - **Property 2: Optional fields acceptance**
    - **Property 3: Card addition to collection**
    - **Property 5: Edit preserves statistics**
    - **Property 17: Tag filtering correctness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.8, 5.2**

  - [ ] 4.3 Создать StatisticsTracker для отслеживания статистики
    - Реализовать incrementKnown, incrementDontKnow
    - Реализовать getStatistics
    - Обеспечить персистентность статистики
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 4.4 Написать property-тесты для StatisticsTracker
    - **Property 19: New card statistics initialization**
    - **Property 20: Statistics increment correctness**
    - **Property 21: Statistics persistence**
    - **Property 22: Statistics as card data**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

  - [ ] 4.5 Создать SelectionAlgorithm для адаптивного показа
    - Реализовать calculateProbability (формула weight = 1 / (1 + ratio))
    - Реализовать selectNext (взвешенный случайный выбор)
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 4.6 Написать property-тесты для SelectionAlgorithm
    - **Property 23: Probability calculation correctness**
    - **Property 24: Probability inversely proportional to ratio**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 4.7 Создать StudySessionManager для управления сессией
    - Реализовать startSession, getNextCard, getCurrentCard
    - Реализовать recordResponse (обновление статистики)
    - Интегрировать с SelectionAlgorithm
    - _Requirements: 7.4, 8.1, 8.8, 8.9_

  - [ ] 4.8 Написать unit-тесты для StudySessionManager
    - Тест начала сессии
    - Тест получения следующей карточки
    - Тест записи ответа
    - _Requirements: 7.4, 8.1, 8.8, 8.9_

  - [ ] 4.9 Создать TTSController для озвучивания
    - Реализовать speak (использование Web Speech API)
    - Реализовать stop, setEnabled, isAvailable
    - Добавить graceful degradation если TTS недоступен
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 9.8_

  - [ ] 4.10 Написать property-тесты для TTSController
    - **Property 29: TTS uses card language**
    - **Property 30: TTS graceful degradation**
    - **Property 31: TTS toggle controls pronunciation**
    - **Property 32: TTS preference persistence**
    - **Validates: Requirements 9.2, 9.4, 9.6, 9.7, 9.8**

- [ ] 5. Checkpoint - Убедиться что Business Logic работает корректно
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

- [ ] 6. Реализация Presentation Layer - Базовые компоненты
  - [ ] 6.1 Создать систему интернационализации (i18n)
    - Создать объект с переводами для EN, UK, RU
    - Реализовать функцию переключения языка
    - Реализовать функцию получения перевода по ключу
    - Добавить персистентность выбранного языка
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 6.2 Написать property-тесты для i18n
    - **Property 33: Language switching updates UI**
    - **Property 34: Language preference persistence**
    - **Validates: Requirements 10.3, 10.4**

  - [ ] 6.3 Создать базовый App класс (главный контроллер)
    - Инициализация всех менеджеров
    - Управление навигацией между экранами
    - Обработка глобальных событий
    - _Requirements: 8.1_

- [ ] 7. Реализация Presentation Layer - StudyScreen
  - [ ] 7.1 Создать StudyScreen компонент
    - Реализовать displayCard (показ слова)
    - Реализовать flipCard (показ перевода)
    - Реализовать handleResponse (обработка ответа)
    - Добавить кнопки "знаю"/"не знаю" и стрелки
    - Интегрировать с TTSController для озвучивания
    - Добавить кнопку включения/отключения TTS
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 8.7, 9.1, 9.5_

  - [ ] 7.2 Добавить поддержку свайпов в StudyScreen
    - Реализовать handleSwipe для touch событий
    - Добавить визуальную обратную связь при свайпе
    - _Requirements: 8.4_

  - [ ] 7.3 Написать unit-тесты для StudyScreen
    - Тест отображения карточки
    - Тест переворота карточки
    - Тест обработки ответов
    - _Requirements: 8.2, 8.4, 8.5, 8.6, 8.7_

  - [ ] 7.4 Написать property-тесты для StudyScreen
    - **Property 25: Card display shows word**
    - **Property 26: TTS pronunciation on display**
    - **Property 27: Input methods map to responses**
    - **Property 28: Response updates statistics**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.6, 8.8**

- [ ] 8. Реализация Presentation Layer - CardForm
  - [ ] 8.1 Создать CardForm компонент
    - Реализовать showNew (форма для новой карточки)
    - Реализовать showEdit (форма для редактирования)
    - Реализовать save (валидация и сохранение)
    - Реализовать cancel (закрытие формы)
    - Добавить поля для word, translation, tags, language
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7_

  - [ ] 8.2 Написать unit-тесты для CardForm
    - Тест создания новой карточки
    - Тест редактирования существующей карточки
    - Тест валидации полей
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7_

- [ ] 9. Реализация Presentation Layer - CardList и фильтрация
  - [ ] 9.1 Создать CardList компонент
    - Реализовать displayCards (отображение списка)
    - Реализовать handleCardSelect (выбор для редактирования)
    - Добавить UI для отображения карточек
    - _Requirements: 1.6_

  - [ ] 9.2 Добавить фильтрацию по тегам в CardList
    - Реализовать applyTagFilter
    - Создать UI для выбора тегов
    - Интегрировать с StudySessionManager
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 9.3 Написать property-тесты для фильтрации
    - **Property 16: Tag filter completeness**
    - **Property 18: Study session respects filters**
    - **Validates: Requirements 5.1, 5.4**

- [ ] 10. Реализация Presentation Layer - SettingsPanel
  - [ ] 10.1 Создать SettingsPanel компонент
    - Реализовать changeLanguage (переключение языка интерфейса)
    - Реализовать exportBackup (скачивание JSON файла)
    - Реализовать importBackup (загрузка и восстановление)
    - Реализовать importCSV (загрузка CSV)
    - Добавить UI для всех настроек
    - _Requirements: 3.3, 10.3_

  - [ ] 10.2 Написать unit-тесты для SettingsPanel
    - Тест экспорта backup
    - Тест импорта backup с выбором merge/overwrite
    - Тест импорта CSV
    - Тест переключения языка
    - _Requirements: 3.3, 10.3_

- [ ] 11. Добавление кнопки создания карточки на все экраны
  - Добавить плавающую кнопку "+" на StudyScreen
  - Добавить кнопку "+" на CardList
  - Добавить кнопку "+" на SettingsPanel
  - Связать кнопки с CardForm.showNew()
  - _Requirements: 1.9_

- [ ] 12. Checkpoint - Убедиться что UI работает корректно
  - Убедиться что все тесты проходят, спросить пользователя если возникли вопросы.

- [ ] 13. Реализация PWA функциональности
  - [ ] 13.1 Настроить Service Worker для кеширования
    - Добавить кеширование всех статических ресурсов
    - Реализовать cache-first стратегию
    - Добавить обработку ошибок регистрации
    - _Requirements: 11.3, 11.4, 11.5_

  - [ ] 13.2 Написать property-тесты для PWA
    - **Property 35: Manifest validity**
    - **Property 36: Service worker registration**
    - **Property 37: Offline functionality**
    - **Property 38: Asset caching completeness**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

  - [ ] 13.3 Проверить автономность приложения
    - Убедиться что нет сетевых запросов
    - Убедиться что все данные в LocalStorage
    - Протестировать работу без интернета
    - _Requirements: 12.1, 12.3, 12.5_

  - [ ] 13.4 Написать property-тесты для автономности
    - **Property 39: Network isolation**
    - **Property 40: Local data storage**
    - **Validates: Requirements 12.1, 12.3**

- [ ] 14. Стилизация и UX улучшения
  - Добавить CSS для всех компонентов
  - Реализовать адаптивный дизайн (mobile-first)
  - Добавить анимации для переворота карточек
  - Добавить визуальную обратную связь для всех действий
  - Добавить loading состояния
  - Оптимизировать для touch устройств

- [ ] 15. Создание тестовой инфраструктуры
  - [ ] 15.1 Создать test-runner.js
    - Реализовать TestRunner класс
    - Реализовать assertion функции (assert, assertEqual, assertThrows)
    - _Testing infrastructure_

  - [ ] 15.2 Создать test-generators.js
    - Реализовать TestGenerators класс
    - Добавить генераторы для всех типов данных
    - Реализовать propertyTest функцию
    - _Testing infrastructure_

  - [ ] 15.3 Создать test.html для запуска тестов
    - Создать HTML страницу для запуска всех тестов
    - Добавить отображение результатов
    - _Testing infrastructure_

- [ ] 16. Final checkpoint - Полное тестирование
  - Запустить все unit и property тесты
  - Выполнить ручное тестирование по чек-листу
  - Протестировать на разных устройствах и браузерах
  - Убедиться что все требования выполнены

## Notes

- Все задачи являются обязательными для полной реализации
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property-тесты валидируют универсальные свойства корректности
- Unit-тесты валидируют конкретные примеры и граничные случаи
- Приложение использует только чистый JavaScript без внешних библиотек
