/**
 * ============================================
 * МОДУЛЬ: УТИЛИТЫ РЕНДЕРИНГА (SHARED)
 * ============================================
 * 
 * Отвечает за:
 * - Вспомогательные функции для отображения данных
 * - Форматирование статусов, тем, типов заданий
 * - Общие утилиты для всех модулей
 * ============================================
 */

/**
 * Получение текстового представления статуса
 * @param {string} status - Статус (new, pending, checked, auto-checked, scheduled, completed, cancelled, rescheduled, in_progress)
 * @returns {string} Текст статуса с эмодзи
 */
function getStatusText(status) {
    const statuses = {
        'new': '🆕 Новое',
        'pending': '⏳ На проверке',
        'checked': '✅ Проверено',
        'auto-checked': '🤖 Проверено',
        'scheduled': 'Запланировано',
        'completed': 'Завершено',
        'cancelled': 'Отменено',
        'rescheduled': 'Перенесено',
        'in_progress': 'Выполняется задание'
    };
    return statuses[status] || status;
}

/**
 * Получение текстового представления статуса урока
 * @param {string} status - Статус урока
 * @returns {string} Текст статуса с эмодзи
 */
function getLessonStatusText(status) {
    const statuses = {
        'scheduled': '📅 Запланировано',
        'completed': '✅ Пройдено',
        'rescheduled': '🔄 Перенесено',
        'cancelled': '❌ Отменено',
        'in_progress': '🔴 В процессе'
    };
    return statuses[status] || status;
}

/**
 * Получение CSS-класса для статуса урока
 * @param {string} status - Статус урока
 * @returns {string} CSS-класс
 */
function getLessonStatusClass(status) {
    const classes = {
        'scheduled': 'badge-new',
        'completed': 'badge-checked',
        'rescheduled': 'badge-pending',
        'cancelled': 'badge-pending',
        'in_progress': 'badge-new'
    };
    return classes[status] || 'badge-new';
}

/**
 * Получение цвета для статуса урока
 * @param {string} status - Статус урока
 * @returns {string} Цвет в HEX
 */
function getLessonStatusColor(status) {
    const colors = {
        'scheduled': '#4f46e5',
        'completed': '#10b981',
        'rescheduled': '#f59e0b',
        'cancelled': '#ef4444',
        'in_progress': '#8b5cf6'
    };
    return colors[status] || '#4f46e5';
}

/**
 * Получение CSS-класса для статуса задания
 * @param {string} status - Статус задания
 * @param {boolean} available - Доступно ли задание
 * @returns {string} CSS-класс
 */
function getTaskStatusClass(status, available = true) {
    if (!available) return 'unavailable';
    return status;
}

/**
 * Получение текстовой метки статуса задания
 * @param {string} status - Статус задания
 * @param {boolean} available - Доступно ли задание
 * @returns {string} Текст статуса
 */
function getTaskStatusLabel(status, available = true) {
    if (!available) return '';
    const map = {
        'new': '🆕 Новое',
        'in-progress': '⏳ В процессе',
        'done': '✅ Пройдено'
    };
    return map[status] || status;
}

/**
 * Получение названия темы с эмодзи
 * @param {string} theme - Ключ темы
 * @returns {string} Название темы с эмодзи
 */
function getThemeName(theme) {
    const themes = {
        'orthography': '📝 Орфография',
        'punctuation': '🔖 Пунктуация',
        'text': '📄 Работа с текстом',
        'grammar': '📚 Грамматика',
        'syntax': '🔤 Синтаксис',
        'orthography2': '📝 И/Ы после приставок',
        'orthography3': '📝 Чередование',
        'lexis': '📖 Лексика',
        'morphology': '🔤 Морфология',
        'speech': '🗣️ Речевые нормы',
        'essay': '📝 Сочинение'
    };
    return themes[theme] || theme;
}

/**
 * Получение названия типа задания с эмодзи
 * @param {string} type - Тип задания
 * @param {string} subtype - Подтип задания (для matching)
 * @returns {string} Название типа с эмодзи
 */
function getTaskTypeName(type, subtype) {
    if (type === 'multiple-choice') return '📝 Выбор ответа';
    if (type === 'matching') {
        if (subtype === 'distribution') return '📊 Распределение';
        if (subtype === 'pairs') return '🎯 Соответствие';
        return '🎯 Соответствие';
    }
    if (type === 'write-word') return '✍️ Написать слово';
    if (type === 'text-work') return '📄 Работа с текстом';
    if (type === 'essay') return '📝 Сочинение';
    return '📌 Задание';
}

/**
 * Получение иконки для типа задания
 * @param {string} type - Тип задания
 * @param {string} subtype - Подтип задания
 * @returns {string} HTML-код иконки или эмодзи
 */
function getTaskTypeIcon(type, subtype) {
    const icons = {
        'multiple-choice': '📝',
        'matching': subtype === 'distribution' ? '📊' : '🎯',
        'write-word': '✍️',
        'text-work': '📄',
        'essay': '📝'
    };
    return icons[type] || '📌';
}

/**
 * Получение текстовой метки для типа задания
 * @param {string} type - Тип задания
 * @param {string} subtype - Подтип задания
 * @returns {string} Текстовая метка
 */
function getTaskTypeLabel(type, subtype) {
    const labels = {
        'multiple-choice': 'Выбор ответа',
        'matching': subtype === 'distribution' ? 'Распределение' : 'Соответствие',
        'write-word': 'Написать слово',
        'text-work': 'Работа с текстом',
        'essay': 'Сочинение'
    };
    return labels[type] || 'Задание';
}

/**
 * Форматирование даты в читаемый вид
 * @param {string|Date} date - Дата для форматирования
 * @param {Object} options - Опции форматирования
 * @returns {string} Отформатированная дата
 */
function formatDate(date, options = {}) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return '-';
    
    const defaultOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    return d.toLocaleDateString('ru-RU', mergedOptions);
}

/**
 * Форматирование времени в читаемый вид
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированное время (ЧЧ:ММ)
 */
function formatTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return '-';
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Форматирование даты и времени
 * @param {string|Date} date - Дата для форматирования
 * @param {Object} options - Опции форматирования
 * @returns {string} Отформатированные дата и время
 */
function formatDateTime(date, options = {}) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return '-';
    
    const dateStr = formatDate(d, options);
    const timeStr = formatTime(d);
    return `${dateStr} в ${timeStr}`;
}

/**
 * Проверка, является ли дата сегодняшней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean} true если дата сегодня
 */
function isToday(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return false;
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
}

/**
 * Проверка, является ли дата завтрашней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean} true если дата завтра
 */
function isTomorrow(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dateObj = new Date(d);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj.getTime() === tomorrow.getTime();
}

/**
 * Получение человекочитаемого представления даты (Сегодня/Завтра/Дата)
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Человекочитаемая дата
 */
function getRelativeDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d)) return '-';
    
    if (isToday(d)) return 'Сегодня';
    if (isTomorrow(d)) return 'Завтра';
    return formatDate(d);
}

/**
 * Получение цвета для статуса задания в карточке
 * @param {string} status - Статус задания
 * @returns {string} CSS-класс для левой границы
 */
function getTaskCardStatusClass(status) {
    const classes = {
        'new': 'status-new',
        'pending': 'status-pending',
        'checked': 'status-checked',
        'auto-checked': 'status-auto-checked',
        'in-progress': 'status-pending'
    };
    return classes[status] || 'status-new';
}

/**
 * Получение бейджа для статуса задания
 * @param {string} status - Статус задания
 * @param {boolean} available - Доступно ли задание
 * @returns {string} HTML-код бейджа
 */
function getTaskStatusBadge(status, available = true) {
    if (!available) {
        return '<span class="badge badge-pending">🔒 Недоступно</span>';
    }
    
    const classes = {
        'new': 'badge-new',
        'pending': 'badge-pending',
        'checked': 'badge-checked',
        'auto-checked': 'badge-auto-checked',
        'in-progress': 'badge-pending'
    };
    
    const labels = {
        'new': '🆕 Новое',
        'pending': '⏳ На проверке',
        'checked': '✅ Проверено',
        'auto-checked': '🤖 Проверено',
        'in-progress': '⏳ В процессе'
    };
    
    const cls = classes[status] || 'badge-new';
    const label = labels[status] || status;
    return `<span class="badge ${cls}">${label}</span>`;
}

/**
 * Экранирование HTML-сущностей
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Обрезка текста до указанной длины с добавлением многоточия
 * @param {string} text - Текст для обрезки
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст
 */
function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
}

/**
 * Генерация случайного ID
 * @param {string} prefix - Префикс для ID
 * @returns {string} Сгенерированный ID
 */
function generateId(prefix = 'id') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
}

/**
 * Получение CSS-класса для тега темы
 * @param {string} theme - Ключ темы
 * @returns {string} CSS-класс
 */
function getThemeTagClass(theme) {
    const classes = {
        'orthography': 'tag-orthography',
        'punctuation': 'tag-punctuation',
        'text': 'tag-text',
        'grammar': 'tag-grammar',
        'syntax': 'tag-syntax',
        'lexis': 'tag-grammar',
        'morphology': 'tag-grammar',
        'speech': 'tag-grammar'
    };
    return classes[theme] || '';
}

/**
 * Получение названия доступности задания
 * @param {string} availability - Ключ доступности
 * @param {Array} availableFor - Список учеников с доступом
 * @returns {string} Название доступности
 */
function getAvailabilityLabel(availability, availableFor = []) {
    if (availability === 'all') {
        return '👥 Всем ученикам';
    } else if (availability === 'selective') {
        return `👤 Выборочно (${availableFor?.length || 0} учеников)`;
    }
    return '👥 Всем ученикам';
}

/**
 * Получение CSS-класса для доступности задания
 * @param {string} availability - Ключ доступности
 * @returns {string} CSS-класс
 */
function getAvailabilityClass(availability) {
    if (availability === 'all') {
        return 'badge-available-all';
    } else if (availability === 'selective') {
        return 'badge-available-selective';
    }
    return 'badge-available-all';
}

/**
 * Сортировка массива по дате
 * @param {Array} items - Массив объектов с датой
 * @param {string} dateField - Поле с датой
 * @param {boolean} ascending - По возрастанию (true) или убыванию (false)
 * @returns {Array} Отсортированный массив
 */
function sortByDate(items, dateField = 'date', ascending = true) {
    return [...items].sort((a, b) => {
        const dateA = new Date(a[dateField] || a.startTime || a.createdAt);
        const dateB = new Date(b[dateField] || b.startTime || b.createdAt);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

/**
 * Фильтрация массива по статусу
 * @param {Array} items - Массив объектов
 * @param {string} statusField - Поле со статусом
 * @param {string|Array} statuses - Статус(ы) для фильтрации
 * @returns {Array} Отфильтрованный массив
 */
function filterByStatus(items, statusField = 'status', statuses) {
    if (!statuses) return items;
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];
    return items.filter(item => statusArray.includes(item[statusField]));
}

/**
 * Получение иконки для режима проверки
 * @param {string} checkMode - Режим проверки ('auto' | 'manual')
 * @returns {string} Иконка с эмодзи
 */
function getCheckModeIcon(checkMode) {
    if (checkMode === 'auto') return '🤖';
    if (checkMode === 'manual') return '👤';
    return '❓';
}

/**
 * Получение текста режима проверки
 * @param {string} checkMode - Режим проверки ('auto' | 'manual')
 * @returns {string} Текст режима проверки
 */
function getCheckModeLabel(checkMode) {
    if (checkMode === 'auto') return 'Автоматическая';
    if (checkMode === 'manual') return 'Ручная';
    return 'Неизвестно';
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем все функции
window.getStatusText = getStatusText;
window.getLessonStatusText = getLessonStatusText;
window.getLessonStatusClass = getLessonStatusClass;
window.getLessonStatusColor = getLessonStatusColor;
window.getTaskStatusClass = getTaskStatusClass;
window.getTaskStatusLabel = getTaskStatusLabel;
window.getThemeName = getThemeName;
window.getTaskTypeName = getTaskTypeName;
window.getTaskTypeIcon = getTaskTypeIcon;
window.getTaskTypeLabel = getTaskTypeLabel;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatDateTime = formatDateTime;
window.isToday = isToday;
window.isTomorrow = isTomorrow;
window.getRelativeDate = getRelativeDate;
window.getTaskCardStatusClass = getTaskCardStatusClass;
window.getTaskStatusBadge = getTaskStatusBadge;
window.escapeHtml = escapeHtml;
window.truncateText = truncateText;
window.generateId = generateId;
window.getThemeTagClass = getThemeTagClass;
window.getAvailabilityLabel = getAvailabilityLabel;
window.getAvailabilityClass = getAvailabilityClass;
window.sortByDate = sortByDate;
window.filterByStatus = filterByStatus;
window.getCheckModeIcon = getCheckModeIcon;
window.getCheckModeLabel = getCheckModeLabel;

// Сообщаем о загрузке модуля
console.log('🛠️ Модуль renderUtils.js загружен');
