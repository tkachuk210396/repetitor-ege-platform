/**
 * ============================================
 * МОДУЛЬ: БЫСТРАЯ ТРЕНИРОВКА (УЧЕНИК)
 * ============================================
 * 
 * Отвечает за:
 * - Отображение списка заданий и упражнений
 * - Запуск спринта (случайная тренировка)
 * - Выполнение упражнений с проверкой
 * - Отображение результатов
 * - Фильтрацию упражнений по статусу и дате
 * ============================================
 */

// ============================================
// ДАННЫЕ
// ============================================

/**
 * Список заданий (разделов)
 */
const FAST_TRAIN_TASKS = [
    { id: 'tasks-1-3', title: 'Задания 1–3', subtitle: 'Логико-смысловые + Лексика + Стилистика' },
    { id: 'task-4', title: 'Задание 4', subtitle: 'Орфоэпические нормы' },
    { id: 'task-5', title: 'Задание 5', subtitle: 'Лексические нормы (паронимы)' },
    { id: 'task-6', title: 'Задание 6', subtitle: 'Лексическая сочетаемость' },
    { id: 'task-7', title: 'Задание 7', subtitle: 'Морфологические нормы' },
    { id: 'task-8', title: 'Задание 8', subtitle: 'Синтаксические нормы' },
    { id: 'task-9', title: 'Задание 9', subtitle: 'Правописание корней' },
    { id: 'task-10', title: 'Задание 10', subtitle: 'Правописание приставок' },
    { id: 'task-11', title: 'Задание 11', subtitle: 'Правописание суффиксов' },
    { id: 'task-12', title: 'Задание 12', subtitle: 'Личные окончания и суффиксы причастий' },
    { id: 'task-13', title: 'Задание 13', subtitle: 'НЕ с разными частями речи' },
    { id: 'task-14', title: 'Задание 14', subtitle: 'Слитное, дефисное, раздельное написание' },
    { id: 'task-15', title: 'Задание 15', subtitle: 'Н и НН в разных частях речи' },
    { id: 'task-16', title: 'Задание 16', subtitle: 'Пунктуация в ССП и с однородными' },
    { id: 'task-17', title: 'Задание 17', subtitle: 'Пунктуация при обособленных членах' },
    { id: 'task-18', title: 'Задание 18', subtitle: 'Вводные конструкции и обращения' },
    { id: 'task-19', title: 'Задание 19', subtitle: 'Пунктуация в СПП' },
    { id: 'task-20', title: 'Задание 20', subtitle: 'Сложное с разными видами связи' },
    { id: 'task-21', title: 'Задание 21', subtitle: 'Пунктуационный анализ' },
    { id: 'task-22', title: 'Задание 22', subtitle: 'Текст как речевое произведение' },
    { id: 'tasks-23-26', title: 'Задания 23–26', subtitle: 'Анализ текста' }
];

/**
 * Упражнения по заданиям
 */
const FAST_TRAIN_EXERCISES = {
    'tasks-1-3': {
        title: 'Задания 1–3',
        exercises: [
            { id: 'ex1-1', name: 'Определение основной мысли текста', status: 'new', date: '2026-06-15' },
            { id: 'ex1-2', name: 'Средства связи в тексте', status: 'new', date: '2026-06-14' },
            { id: 'ex1-3', name: 'Определение стиля текста', status: 'new', date: '2026-06-10' }
        ]
    },
    'task-4': {
        title: 'Задание 4',
        exercises: [
            { id: 'ex4-1', name: 'Ударение в словах', status: 'new', date: '2026-06-18' },
            { id: 'ex4-2', name: 'Орфоэпический минимум', status: 'new', date: '2026-06-16' }
        ]
    },
    'task-5': {
        title: 'Задание 5',
        exercises: [
            { id: 'ex5-1', name: 'Паронимы: вставка слова', status: 'new', date: '2026-06-20' }
        ]
    },
    'task-6': {
        title: 'Задание 6',
        exercises: [
            { id: 'ex6-1', name: 'Исправление лексической ошибки', status: 'new', date: '2026-06-21' }
        ]
    },
    'task-7': {
        title: 'Задание 7',
        exercises: [
            { id: 'ex7-1', name: 'Формы слова: исправление ошибок', status: 'new', date: '2026-06-22' }
        ]
    },
    'task-8': {
        title: 'Задание 8',
        exercises: [
            { id: 'ex8-1', name: 'Соответствие: ошибки и предложения', status: 'new', date: '2026-06-23' }
        ]
    },
    'task-9': {
        title: 'Задание 9',
        exercises: [
            { id: 'ex9-1', name: 'Безударные гласные в корне', status: 'new', date: '2026-06-24' }
        ]
    },
    'task-10': {
        title: 'Задание 10',
        exercises: [
            { id: 'ex10-1', name: 'Приставки ПРЕ-/ПРИ-', status: 'new', date: '2026-06-25' }
        ]
    },
    'task-11': {
        title: 'Задание 11',
        exercises: [
            { id: 'ex11-1', name: 'Суффиксы существительных', status: 'new', date: '2026-06-26' }
        ]
    },
    'task-12': {
        title: 'Задание 12',
        exercises: [
            { id: 'ex12-1', name: 'Личные окончания глаголов', status: 'new', date: '2026-06-27' }
        ]
    },
    'task-13': {
        title: 'Задание 13',
        exercises: [
            { id: 'ex13-1', name: 'НЕ с разными частями речи', status: 'new', date: '2026-06-28' }
        ]
    },
    'task-14': {
        title: 'Задание 14',
        exercises: [
            { id: 'ex14-1', name: 'Слитное и раздельное написание', status: 'new', date: '2026-06-29' }
        ]
    },
    'task-15': {
        title: 'Задание 15',
        exercises: [
            { id: 'ex15-1', name: 'Н/НН в прилагательных', status: 'new', date: '2026-06-30' }
        ]
    },
    'task-16': {
        title: 'Задание 16',
        exercises: [
            { id: 'ex16-1', name: 'Запятые в ССП', status: 'new', date: '2026-07-01' }
        ]
    },
    'task-17': {
        title: 'Задание 17',
        exercises: [
            { id: 'ex17-1', name: 'Обособление определений', status: 'new', date: '2026-07-02' }
        ]
    },
    'task-18': {
        title: 'Задание 18',
        exercises: [
            { id: 'ex18-1', name: 'Вводные слова и конструкции', status: 'new', date: '2026-07-03' }
        ]
    },
    'task-19': {
        title: 'Задание 19',
        exercises: [
            { id: 'ex19-1', name: 'Запятые в СПП', status: 'new', date: '2026-07-04' }
        ]
    },
    'task-20': {
        title: 'Задание 20',
        exercises: [
            { id: 'ex20-1', name: 'Стык союзов', status: 'new', date: '2026-07-05' }
        ]
    },
    'task-21': {
        title: 'Задание 21',
        exercises: [
            { id: 'ex21-1', name: 'Пунктуационный анализ', status: 'new', date: '2026-07-06' }
        ]
    },
    'task-22': {
        title: 'Задание 22',
        exercises: [
            { id: 'ex22-1', name: 'Соответствие: средства связи', status: 'new', date: '2026-07-07' }
        ]
    },
    'tasks-23-26': {
        title: 'Задания 23–26',
        exercises: [
            { id: 'ex23-1', name: 'Типы речи (задание 23)', status: 'new', date: '2026-07-08' },
            { id: 'ex24-1', name: 'Выразительные средства (задание 24)', status: 'new', date: '2026-07-08' }
        ]
    }
};

/**
 * Данные для заданий на соответствие (matching)
 */
const FAST_TRAIN_MATCHING = {
    'task-8': {
        left: [
            { id: 'l1', label: 'А', text: 'Ошибка в управлении' },
            { id: 'l2', label: 'Б', text: 'Ошибка в построении предложения' },
            { id: 'l3', label: 'В', text: 'Ошибка в употреблении падежной формы' }
        ],
        right: [
            { id: 'r1', number: '1', text: 'Предложение 1' },
            { id: 'r2', number: '2', text: 'Предложение 2' },
            { id: 'r3', number: '3', text: 'Предложение 3' }
        ],
        correct: { l1: 'r1', l2: 'r2', l3: 'r3' }
    },
    'task-22': {
        left: [
            { id: 'l1', label: 'А', text: 'Лексический повтор' },
            { id: 'l2', label: 'Б', text: 'Анафора' },
            { id: 'l3', label: 'В', text: 'Синонимы' }
        ],
        right: [
            { id: 'r1', number: '1', text: 'Пример 1' },
            { id: 'r2', number: '2', text: 'Пример 2' },
            { id: 'r3', number: '3', text: 'Пример 3' }
        ],
        correct: { l1: 'r1', l2: 'r2', l3: 'r3' }
    }
};

/**
 * Данные для выполнения упражнений
 */
const FAST_TRAIN_EXECUTION = {
    'tasks-1-3': {
        text: 'Прочитайте текст и выполните задания 1–3.\n\n(1) Текст для анализа...',
        tasks: [
            { id: 'ex1-1', label: 'Задание 1', text: 'Определите основную мысль текста.', type: 'text' },
            { id: 'ex1-2', label: 'Задание 2', text: 'Какие средства связи использованы?', type: 'choice', options: ['Союзы', 'Местоимения', 'Вводные слова', 'Частицы'] },
            { id: 'ex1-3', label: 'Задание 3', text: 'Определите стиль текста.', type: 'choice', options: ['Научный', 'Публицистический', 'Художественный', 'Официально-деловой'] }
        ]
    },
    'task-4': {
        text: 'Поставьте ударение в словах.',
        tasks: [
            { id: 'ex4-1', label: 'Задание 4', text: 'В каком слове ударение падает на второй слог?', type: 'choice', options: ['Каталог', 'Звонит', 'Баловать', 'Договор'] }
        ]
    },
    'task-5': {
        text: 'Вставьте пропущенное слово (пароним).',
        tasks: [
            { id: 'ex5-1', label: 'Задание 5', text: 'Выберите правильное слово: (эффектный / эффектный) метод.', type: 'text' }
        ]
    },
    'task-6': {
        text: 'Исправьте лексическую ошибку.',
        tasks: [
            { id: 'ex6-1', label: 'Задание 6', text: 'Исправьте ошибку: "Он сделал огромный вклад в науку".', type: 'text' }
        ]
    },
    'task-7': {
        text: 'Найдите и исправьте ошибку в образовании формы слова.',
        tasks: [
            { id: 'ex7-1', label: 'Задание 7', text: 'Исправьте ошибку: "более красивее".', type: 'text' }
        ]
    },
    'task-8': {
        text: 'Установите соответствие между грамматическими ошибками и предложениями.',
        tasks: [
            { id: 'ex8-1', label: 'Задание 8', text: 'Установите соответствие.', type: 'matching', matchingId: 'task-8' }
        ]
    },
    'task-9': {
        text: 'В каком слове пропущена безударная проверяемая гласная?',
        tasks: [
            { id: 'ex9-1', label: 'Задание 9', text: 'Выберите правильный вариант.', type: 'choice', options: ['Р...сток', 'З...ря', 'К...саться', 'П...левой'] }
        ]
    },
    'task-10': {
        text: 'В каком слове пропущена буква И?',
        tasks: [
            { id: 'ex10-1', label: 'Задание 10', text: 'Выберите правильный вариант.', type: 'choice', options: ['Пр...одолеть', 'Пр...града', 'Пр...красный', 'Пр...емник'] }
        ]
    },
    'task-11': {
        text: 'В каком слове пропущена буква Е?',
        tasks: [
            { id: 'ex11-1', label: 'Задание 11', text: 'Выберите правильный вариант.', type: 'choice', options: ['Глянц...вый', 'Ключ...вой', 'Ткач...вый', 'Нул...вой'] }
        ]
    },
    'task-12': {
        text: 'В каком слове пропущена буква И?',
        tasks: [
            { id: 'ex12-1', label: 'Задание 12', text: 'Выберите правильный вариант.', type: 'choice', options: ['Бор...шься', 'Стел...шь', 'Кле...шь', 'Дыш...шь'] }
        ]
    },
    'task-13': {
        text: 'В каком слове НЕ пишется слитно?',
        tasks: [
            { id: 'ex13-1', label: 'Задание 13', text: 'Выберите правильный вариант.', type: 'choice', options: ['(Не)годовать', '(Не)зная', '(Не)смотря', '(Не)большой'] }
        ]
    },
    'task-14': {
        text: 'В каком слове написание слитное?',
        tasks: [
            { id: 'ex14-1', label: 'Задание 14', text: 'Выберите правильный вариант.', type: 'choice', options: ['(В)течение', '(Не)смотря', '(За)то', '(По)этому'] }
        ]
    },
    'task-15': {
        text: 'В каком слове пишется НН?',
        tasks: [
            { id: 'ex15-1', label: 'Задание 15', text: 'Выберите правильный вариант.', type: 'choice', options: ['Юный', 'Оловя...ый', 'Стекля...ый', 'Деревя...ый'] }
        ]
    },
    'task-16': {
        text: 'Где нужно поставить запятую?',
        tasks: [
            { id: 'ex16-1', label: 'Задание 16', text: 'Выберите правильный вариант.', type: 'choice', options: ['Солнце встало и осветило поля', 'Солнце встало осветило поля', 'Солнце встало, осветило поля'] }
        ]
    },
    'task-17': {
        text: 'Где нужно обособить определение?',
        tasks: [
            { id: 'ex17-1', label: 'Задание 17', text: 'Выберите правильный вариант.', type: 'choice', options: ['Уставший он пошёл домой', 'Он уставший пошёл домой', 'Он, уставший, пошёл домой'] }
        ]
    },
    'task-18': {
        text: 'Где нужно выделить вводное слово?',
        tasks: [
            { id: 'ex18-1', label: 'Задание 18', text: 'Выберите правильный вариант.', type: 'choice', options: ['К счастью всё обошлось', 'К счастью, всё обошлось', 'К счастью всё, обошлось'] }
        ]
    },
    'task-19': {
        text: 'Где нужно поставить запятую в СПП?',
        tasks: [
            { id: 'ex19-1', label: 'Задание 19', text: 'Выберите правильный вариант.', type: 'choice', options: ['Я знаю что он придёт', 'Я знаю, что он придёт', 'Я знаю что, он придёт'] }
        ]
    },
    'task-20': {
        text: 'Где нужно поставить запятую на стыке союзов?',
        tasks: [
            { id: 'ex20-1', label: 'Задание 20', text: 'Выберите правильный вариант.', type: 'choice', options: ['Он сказал что если будет дождь мы не пойдём', 'Он сказал, что, если будет дождь, мы не пойдём', 'Он сказал что, если будет дождь мы не пойдём'] }
        ]
    },
    'task-21': {
        text: 'Где нужно поставить запятую?',
        tasks: [
            { id: 'ex21-1', label: 'Задание 21', text: 'Выберите правильный вариант.', type: 'choice', options: ['Он пришёл но никого не застал', 'Он пришёл, но никого не застал', 'Он пришёл но, никого не застал'] }
        ]
    },
    'task-22': {
        text: 'Установите соответствие между средствами связи и их характеристиками.',
        tasks: [
            { id: 'ex22-1', label: 'Задание 22', text: 'Установите соответствие.', type: 'matching', matchingId: 'task-22' }
        ]
    },
    'tasks-23-26': {
        text: 'Прочитайте текст и выполните задания 23–26.\n\n(1) Текст для анализа...',
        tasks: [
            { id: 'ex23-1', label: 'Задание 23', text: 'Определите тип речи текста.', type: 'choice', options: ['Повествование', 'Описание', 'Рассуждение'] },
            { id: 'ex24-1', label: 'Задание 24', text: 'Какие средства выразительности использованы?', type: 'choice', options: ['Метафора', 'Эпитет', 'Олицетворение', 'Сравнение'] },
            { id: 'ex25-1', label: 'Задание 25', text: 'Найдите и запишите антонимы в тексте.', type: 'text' },
            { id: 'ex26-1', label: 'Задание 26', text: 'Назовите изобразительно-выразительное средство.', type: 'text' }
        ]
    }
};

// ============================================
// СОСТОЯНИЕ
// ============================================

let fastTrainState = {
    currentView: 'list', // 'list' | 'exercises' | 'execution'
    currentTaskId: null,
    currentExerciseId: null,
    exerciseFilter: 'all',
    exerciseDateFilter: 'all',
    sprintMode: false,
    sprintQueue: [],
    sprintOriginalQueue: [],
    sprintChecked: false,
    sprintResults: []
};

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА
// ============================================

/**
 * Рендеринг страницы быстрой тренировки
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderFastTrain(container) {
    if (!container) return;
    
    if (fastTrainState.currentView === 'execution' && fastTrainState.currentExerciseId) {
        renderFastTrainExecution(container);
        return;
    }
    
    if (fastTrainState.currentView === 'exercises' && fastTrainState.currentTaskId) {
        renderFastTrainExercises(container);
        return;
    }
    
    renderFastTrainList(container);
}

// ============================================
// РЕНДЕРИНГ СПИСКА ЗАДАНИЙ
// ============================================

/**
 * Рендеринг списка заданий (главная страница)
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderFastTrainList(container) {
    container.innerHTML = `
        ${renderSprintBlock(false)}
        <div class="cards-grid">
            ${FAST_TRAIN_TASKS.map(task => {
                const exerciseCount = FAST_TRAIN_EXERCISES[task.id]?.exercises?.length || 0;
                return `
                    <div class="task-card" onclick="openFastTrainExercises('${task.id}')">
                        <div>
                            <div class="task-title">
                                ${task.title}
                                <small>${task.subtitle}</small>
                            </div>
                        </div>
                        <div class="task-footer">
                            <span style="font-size:11px; color:#94a3b8;">${exerciseCount} упражнений</span>
                            <button class="btn-enter" onclick="event.stopPropagation(); openFastTrainExercises('${task.id}')">Открыть</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ============================================
// РЕНДЕРИНГ УПРАЖНЕНИЙ
// ============================================

/**
 * Рендеринг списка упражнений для выбранного задания
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderFastTrainExercises(container) {
    const data = FAST_TRAIN_EXERCISES[fastTrainState.currentTaskId];
    if (!data) {
        container.innerHTML = `<p>Задание не найдено</p>`;
        return;
    }
    
    let filtered = [...data.exercises];
    
    // Фильтр по статусу
    if (fastTrainState.exerciseFilter !== 'all') {
        filtered = filtered.filter(e => e.status === fastTrainState.exerciseFilter);
    }
    
    // Фильтр по дате
    if (fastTrainState.exerciseDateFilter !== 'all') {
        const now = new Date();
        if (fastTrainState.exerciseDateFilter === 'today') {
            filtered = filtered.filter(e => new Date(e.date).toDateString() === now.toDateString());
        } else if (fastTrainState.exerciseDateFilter === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(e => new Date(e.date) >= weekAgo);
        } else if (fastTrainState.exerciseDateFilter === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setDate(monthAgo.getDate() - 30);
            filtered = filtered.filter(e => new Date(e.date) >= monthAgo);
        }
    }
    
    const statusMap = {
        'new': { label: '🆕 Новое', cls: 'badge-new' },
        'in-progress': { label: '⏳ В работе', cls: 'badge-in-progress' },
        'done': { label: '✅ Выполнено', cls: 'badge-done' }
    };
    
    // Сортировка: сначала новые, потом в работе, потом выполненные
    const sortOrder = { 'new': 0, 'in-progress': 1, 'done': 2 };
    filtered.sort((a, b) => sortOrder[a.status] - sortOrder[b.status]);
    
    container.innerHTML = `
        <button class="btn btn-back" onclick="backToFastTrainList()" style="margin-bottom:16px;">
            <i class="fas fa-arrow-left"></i> Назад к заданиям
        </button>
        
        ${renderSprintBlock(true)}
        
        <div class="exercises-header">
            <h2>${data.title}</h2>
            <span style="font-size:14px; color:#64748b;">${data.exercises.length} упражнений</span>
        </div>
        
        <div class="filter-bar">
            <button class="filter-btn ${fastTrainState.exerciseFilter === 'all' ? 'active' : ''}" data-filter="all" onclick="setFastTrainFilter('all', this)">Все</button>
            <button class="filter-btn ${fastTrainState.exerciseFilter === 'new' ? 'active' : ''}" data-filter="new" onclick="setFastTrainFilter('new', this)">🆕 Новые</button>
            <button class="filter-btn ${fastTrainState.exerciseFilter === 'in-progress' ? 'active' : ''}" data-filter="in-progress" onclick="setFastTrainFilter('in-progress', this)">⏳ В работе</button>
            <button class="filter-btn ${fastTrainState.exerciseFilter === 'done' ? 'active' : ''}" data-filter="done" onclick="setFastTrainFilter('done', this)">✅ Выполнено</button>
            <span style="margin-left:8px; color:#94a3b8;">|</span>
            <select class="filter-select" onchange="setFastTrainDateFilter(this.value)">
                <option value="all" ${fastTrainState.exerciseDateFilter === 'all' ? 'selected' : ''}>Все даты</option>
                <option value="today" ${fastTrainState.exerciseDateFilter === 'today' ? 'selected' : ''}>Сегодня</option>
                <option value="week" ${fastTrainState.exerciseDateFilter === 'week' ? 'selected' : ''}>За неделю</option>
                <option value="month" ${fastTrainState.exerciseDateFilter === 'month' ? 'selected' : ''}>За месяц</option>
            </select>
        </div>
        
        <div class="exercises-grid">
            ${filtered.length === 0 ? '<p style="text-align:center; color:#94a3b8; padding:20px;">Нет упражнений по выбранным фильтрам</p>' :
                filtered.map(ex => {
                    const status = statusMap[ex.status] || statusMap['new'];
                    return `
                        <div class="exercise-item" onclick="openFastTrainExecution('${fastTrainState.currentTaskId}', '${ex.id}')">
                            <span class="ex-number">${ex.id}</span>
                            <span class="ex-name">${ex.name}</span>
                            <span class="ex-status"><span class="badge ${status.cls}">${status.label}</span></span>
                            <span class="ex-date">${ex.date}</span>
                            <button class="btn-start" onclick="event.stopPropagation(); openFastTrainExecution('${fastTrainState.currentTaskId}', '${ex.id}')">Приступить</button>
                        </div>
                    `;
                }).join('')
            }
        </div>
    `;
}

// ============================================
// РЕНДЕРИНГ ВЫПОЛНЕНИЯ УПРАЖНЕНИЯ
// ============================================

/**
 * Рендеринг страницы выполнения упражнения
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderFastTrainExecution(container) {
    let taskId = null;
    let exerciseData = null;
    let execData = null;
    
    for (const [tid, data] of Object.entries(FAST_TRAIN_EXERCISES)) {
        const ex = data.exercises.find(e => e.id === fastTrainState.currentExerciseId);
        if (ex) {
            taskId = tid;
            exerciseData = ex;
            execData = FAST_TRAIN_EXECUTION[tid];
            break;
        }
    }
    
    if (!execData || !exerciseData) {
        container.innerHTML = `<p>Упражнение не найдено</p>`;
        return;
    }
    
    const taskForExercise = execData.tasks.find(t => t.id === fastTrainState.currentExerciseId);
    if (!taskForExercise) {
        container.innerHTML = `<p>Данные для упражнения не найдены</p>`;
        return;
    }
    
    const isMatching = taskForExercise.type === 'matching';
    const matchingId = taskForExercise.matchingId;
    
    // Определяем, последнее ли это задание в спринте
    const isLastSprint = fastTrainState.sprintMode && fastTrainState.sprintQueue.length === 0;
    
    let html = `
        <button class="btn btn-back" onclick="${fastTrainState.sprintMode ? 'cancelFastTrainSprint()' : `openFastTrainExercises('${taskId}')`}" style="margin-bottom:16px;">
            <i class="fas fa-arrow-left"></i> ${fastTrainState.sprintMode ? 'Выйти из спринта' : 'Назад к упражнениям'}
        </button>
        
        <div class="execution-container">
            <div class="exec-title">${exerciseData.name}</div>
            ${execData.text ? `<div class="exec-text">${execData.text}</div>` : ''}
    `;
    
    html += `
        <div class="task-block">
            <div class="task-label">${taskForExercise.label}</div>
            <div class="task-text">${taskForExercise.text}</div>
    `;
    
    if (taskForExercise.type === 'text') {
        html += `
            <textarea id="input_${taskForExercise.id}" placeholder="Введите ответ..."></textarea>
        `;
    } else if (taskForExercise.type === 'choice') {
        html += `<div class="options" id="options_${taskForExercise.id}">`;
        taskForExercise.options.forEach((opt, oi) => {
            html += `
                <div class="option" onclick="toggleFastTrainOption(this, '${taskForExercise.id}')">
                    <input type="checkbox" id="opt_${taskForExercise.id}_${oi}" value="${opt}">
                    <label for="opt_${taskForExercise.id}_${oi}">${opt}</label>
                </div>
            `;
        });
        html += `</div>`;
    } else if (taskForExercise.type === 'matching' && matchingId) {
        const matchData = FAST_TRAIN_MATCHING[matchingId];
        if (matchData) {
            html += `
                <div class="matching-container">
                    <div class="matching-col">
                        ${matchData.left.map(item => `
                            <div class="matching-item">
                                <span class="label">${item.label}</span>
                                <span>${item.text}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="matching-col">
                        ${matchData.right.map(item => `
                            <div class="matching-item">
                                <span>${item.text}</span>
                                <span class="label" style="color:#8b5cf6;">${item.number}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="matching-selectors" id="matching_${taskForExercise.id}">
                    ${matchData.left.map(item => `
                        <div class="selector-row">
                            <span class="left-ref">${item.label}</span>
                            <span class="left-text">${item.text}</span>
                            <select data-left="${item.id}">
                                <option value="">—</option>
                                ${matchData.right.map(r => `
                                    <option value="${r.id}">${r.number}</option>
                                `).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    html += `</div>`;
    
    // Кнопки в зависимости от режима
    if (fastTrainState.sprintMode) {
        if (isLastSprint && !fastTrainState.sprintChecked) {
            html += `
                <div class="action-buttons">
                    <button class="btn-sprint-check" onclick="checkFastTrainSprintLast()">
                        <i class="fas fa-check-circle"></i> Проверить
                    </button>
                </div>
            `;
        } else if (isLastSprint && fastTrainState.sprintChecked) {
            html += `
                <div id="resultBox"></div>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="retryFastTrainSprint()">
                        <i class="fas fa-arrow-up" style="transform:rotate(45deg);"></i> Я могу лучше
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="action-buttons">
                    <button class="btn-sprint-next" onclick="nextFastTrainSprintExercise()">
                        Следующее → <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
        }
    } else {
        html += `
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="checkFastTrainExercise('${fastTrainState.currentExerciseId}')">
                    <i class="fas fa-check-circle"></i> Проверить
                </button>
                <button class="btn btn-success" onclick="resetFastTrainExercise('${fastTrainState.currentExerciseId}')">
                    <i class="fas fa-arrow-up" style="transform:rotate(45deg);"></i> Я могу лучше
                </button>
            </div>
            <div id="resultBox"></div>
        `;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Индикатор спринта
    if (fastTrainState.sprintMode) {
        const sprintIndicator = document.createElement('div');
        sprintIndicator.className = 'sprint-indicator';
        const remaining = fastTrainState.sprintQueue.length;
        const total = fastTrainState.sprintOriginalQueue.length || fastTrainState.sprintQueue.length + 1;
        sprintIndicator.innerHTML = `
            <span class="sprint-progress">⚡ Спринт: задание ${total - remaining} из ${total}</span>
            <span style="color:#854d0e; font-size:13px;">${remaining > 0 ? `Осталось ${remaining} заданий` : 'Последнее задание!'}</span>
        `;
        const containerEl = container.querySelector('.execution-container');
        if (containerEl) containerEl.prepend(sprintIndicator);
        
        // Если это последнее и уже проверено, показываем результат
        if (isLastSprint && fastTrainState.sprintChecked) {
            const resultBox = document.getElementById('resultBox');
            if (resultBox) {
                const results = getFastTrainSprintResults();
                resultBox.innerHTML = `
                    <div class="result-box">
                        <div class="result-score">${results.percent}%</div>
                        <div class="result-details">${results.details}</div>
                    </div>
                `;
            }
        }
    }
}

// ============================================
// БЛОК СПРИНТА
// ============================================

/**
 * Рендеринг блока "Запустить спринт"
 * @param {boolean} isExercisesView - Находимся ли в режиме упражнений
 * @returns {string} HTML-строка
 */
function renderSprintBlock(isExercisesView) {
    const sourceLabel = isExercisesView ? 'из текущего задания' : 'из всех заданий';
    
    return `
        <div class="sprint-block">
            <div class="sprint-title">🚀 Запустить спринт</div>
            <div class="sprint-subtitle">Выбери количество заданий для случайной тренировки ${sourceLabel}</div>
            <div class="sprint-buttons">
                <button class="btn-sprint" onclick="startFastTrainSprint(5)">5 заданий</button>
                <button class="btn-sprint" onclick="startFastTrainSprint(10)">10 заданий</button>
                <button class="btn-sprint" onclick="startFastTrainSprint(15)">15 заданий</button>
            </div>
        </div>
    `;
}

// ============================================
// ЛОГИКА ВЗАИМОДЕЙСТВИЯ
// ============================================

/**
 * Переключение выбора варианта ответа
 * @param {HTMLElement} el - Элемент с вариантом
 * @param {string} taskId - ID задания
 */
function toggleFastTrainOption(el, taskId) {
    const checkbox = el.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    el.classList.toggle('selected', checkbox.checked);
}

/**
 * Проверка упражнения
 * @param {string} exerciseId - ID упражнения
 */
function checkFastTrainExercise(exerciseId) {
    const result = getFastTrainExerciseResult(exerciseId);
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
        resultBox.innerHTML = `
            <div class="result-box">
                <div class="result-score">${result.percent}%</div>
                <div class="result-details">${result.details}</div>
            </div>
        `;
    }
}

/**
 * Сброс упражнения
 * @param {string} exerciseId - ID упражнения
 */
function resetFastTrainExercise(exerciseId) {
    let taskForExercise = null;
    for (const [tid, data] of Object.entries(FAST_TRAIN_EXECUTION)) {
        const task = data.tasks.find(t => t.id === exerciseId);
        if (task) {
            taskForExercise = task;
            break;
        }
    }
    
    if (!taskForExercise) return;
    
    if (taskForExercise.type === 'text') {
        const input = document.getElementById(`input_${taskForExercise.id}`);
        if (input) input.value = '';
    } else if (taskForExercise.type === 'choice') {
        document.querySelectorAll(`#options_${taskForExercise.id} .option`).forEach(el => {
            const cb = el.querySelector('input[type="checkbox"]');
            if (cb) {
                cb.checked = false;
                el.classList.remove('selected');
            }
        });
    } else if (taskForExercise.type === 'matching') {
        document.querySelectorAll(`#matching_${taskForExercise.id} select`).forEach(sel => {
            sel.value = '';
        });
    }
    
    const resultBox = document.getElementById('resultBox');
    if (resultBox) resultBox.innerHTML = '';
    
    alert('🔄 Упражнение сброшено. Попробуй выполнить его заново!');
}

/**
 * Получение результата упражнения
 * @param {string} exerciseId - ID упражнения
 * @returns {Object} Результат { percent, details }
 */
function getFastTrainExerciseResult(exerciseId) {
    let taskForExercise = null;
    for (const [tid, data] of Object.entries(FAST_TRAIN_EXECUTION)) {
        const task = data.tasks.find(t => t.id === exerciseId);
        if (task) {
            taskForExercise = task;
            break;
        }
    }
    
    if (!taskForExercise) return { percent: 0, details: 'Ошибка' };
    
    let correct = 0;
    let total = 1;
    let details = [];
    
    if (taskForExercise.type === 'text') {
        const input = document.getElementById(`input_${taskForExercise.id}`);
        if (input && input.value.trim().length > 0) {
            correct++;
            details.push('✅ Верно!');
        } else {
            details.push('❌ Ответ не введён');
        }
    } else if (taskForExercise.type === 'choice') {
        const checked = document.querySelectorAll(`#options_${taskForExercise.id} .option input:checked`);
        if (checked.length > 0) {
            correct++;
            details.push(`✅ Верно (выбрано ${checked.length} вариантов)`);
        } else {
            details.push('❌ Ничего не выбрано');
        }
    } else if (taskForExercise.type === 'matching') {
        const selects = document.querySelectorAll(`#matching_${taskForExercise.id} select`);
        let allSelected = true;
        selects.forEach(sel => {
            if (!sel.value) allSelected = false;
        });
        if (allSelected) {
            correct++;
            details.push('✅ Соответствие установлено');
        } else {
            details.push('❌ Не все соответствия выбраны');
        }
    }
    
    const percent = Math.round((correct / total) * 100);
    return { percent, details: details.join('<br>') };
}

// ============================================
// ЛОГИКА СПРИНТА
// ============================================

/**
 * Запуск спринта
 * @param {number} count - Количество заданий
 */
function startFastTrainSprint(count) {
    let availableExercises = [];
    
    if (fastTrainState.currentView === 'exercises' && fastTrainState.currentTaskId) {
        const data = FAST_TRAIN_EXERCISES[fastTrainState.currentTaskId];
        if (data) {
            availableExercises = data.exercises
                .filter(ex => ex.status === 'new')
                .map(ex => ({ ...ex, taskId: fastTrainState.currentTaskId }));
        }
    } else {
        for (const [taskId, data] of Object.entries(FAST_TRAIN_EXERCISES)) {
            data.exercises.forEach(ex => {
                if (ex.status === 'new') {
                    availableExercises.push({ ...ex, taskId });
                }
            });
        }
    }
    
    if (availableExercises.length === 0) {
        alert('🎉 Нет новых упражнений для спринта!');
        return;
    }
    
    const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
    const takeCount = Math.min(count, shuffled.length);
    fastTrainState.sprintQueue = shuffled.slice(0, takeCount);
    fastTrainState.sprintOriginalQueue = [...fastTrainState.sprintQueue];
    fastTrainState.sprintMode = true;
    fastTrainState.sprintChecked = false;
    fastTrainState.sprintResults = [];
    
    if (fastTrainState.sprintQueue.length > 0) {
        const first = fastTrainState.sprintQueue[0];
        fastTrainState.sprintQueue = fastTrainState.sprintQueue.slice(1);
        fastTrainState.currentTaskId = first.taskId;
        fastTrainState.currentExerciseId = first.id;
        fastTrainState.currentView = 'execution';
        renderFastTrain(document.getElementById('currentSection'));
    }
}

/**
 * Следующее упражнение в спринте
 */
function nextFastTrainSprintExercise() {
    if (fastTrainState.sprintQueue.length === 0) {
        return;
    }
    
    const next = fastTrainState.sprintQueue[0];
    fastTrainState.sprintQueue = fastTrainState.sprintQueue.slice(1);
    fastTrainState.currentTaskId = next.taskId;
    fastTrainState.currentExerciseId = next.id;
    fastTrainState.sprintChecked = false;
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Проверка последнего упражнения в спринте
 */
function checkFastTrainSprintLast() {
    const result = getFastTrainExerciseResult(fastTrainState.currentExerciseId);
    fastTrainState.sprintChecked = true;
    fastTrainState.sprintResults.push({
        exerciseId: fastTrainState.currentExerciseId,
        ...result
    });
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Получение результатов спринта
 * @returns {Object} Результаты { percent, details }
 */
function getFastTrainSprintResults() {
    const results = fastTrainState.sprintResults || [];
    const total = fastTrainState.sprintOriginalQueue.length || 1;
    const correct = results.filter(r => r.percent === 100).length;
    const percent = Math.round((correct / total) * 100);
    
    let details = results.map((r, i) => {
        const ex = findFastTrainExerciseById(r.exerciseId);
        return `${i + 1}. ${ex?.name || 'Задание'} — ${r.percent}% ${r.percent === 100 ? '✅' : '❌'}`;
    }).join('<br>');
    
    if (details.length === 0) {
        details = 'Результаты не найдены';
    }
    
    return { percent, details };
}

/**
 * Поиск упражнения по ID
 * @param {string} id - ID упражнения
 * @returns {Object|null} Упражнение или null
 */
function findFastTrainExerciseById(id) {
    for (const [taskId, data] of Object.entries(FAST_TRAIN_EXERCISES)) {
        const ex = data.exercises.find(e => e.id === id);
        if (ex) return ex;
    }
    return null;
}

/**
 * Повтор спринта ("Я могу лучше")
 */
function retryFastTrainSprint() {
    if (fastTrainState.sprintOriginalQueue.length === 0) return;
    
    fastTrainState.sprintQueue = [...fastTrainState.sprintOriginalQueue];
    fastTrainState.sprintMode = true;
    fastTrainState.sprintChecked = false;
    fastTrainState.sprintResults = [];
    
    if (fastTrainState.sprintQueue.length > 0) {
        const first = fastTrainState.sprintQueue[0];
        fastTrainState.sprintQueue = fastTrainState.sprintQueue.slice(1);
        fastTrainState.currentTaskId = first.taskId;
        fastTrainState.currentExerciseId = first.id;
        fastTrainState.currentView = 'execution';
        renderFastTrain(document.getElementById('currentSection'));
    }
}

/**
 * Отмена спринта
 */
function cancelFastTrainSprint() {
    fastTrainState.sprintMode = false;
    fastTrainState.sprintQueue = [];
    fastTrainState.sprintOriginalQueue = [];
    fastTrainState.sprintChecked = false;
    fastTrainState.sprintResults = [];
    if (fastTrainState.currentTaskId) {
        fastTrainState.currentView = 'exercises';
        renderFastTrain(document.getElementById('currentSection'));
    } else {
        backToFastTrainList();
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================

/**
 * Возврат к списку заданий
 */
function backToFastTrainList() {
    fastTrainState.currentView = 'list';
    fastTrainState.currentTaskId = null;
    fastTrainState.currentExerciseId = null;
    fastTrainState.sprintMode = false;
    fastTrainState.sprintQueue = [];
    fastTrainState.sprintOriginalQueue = [];
    fastTrainState.sprintChecked = false;
    fastTrainState.sprintResults = [];
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Открытие упражнений для задания
 * @param {string} taskId - ID задания
 */
function openFastTrainExercises(taskId) {
    fastTrainState.currentTaskId = taskId;
    fastTrainState.currentView = 'exercises';
    fastTrainState.exerciseFilter = 'all';
    fastTrainState.exerciseDateFilter = 'all';
    fastTrainState.sprintMode = false;
    fastTrainState.sprintQueue = [];
    fastTrainState.sprintOriginalQueue = [];
    fastTrainState.sprintChecked = false;
    fastTrainState.sprintResults = [];
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Открытие выполнения упражнения
 * @param {string} taskId - ID задания
 * @param {string} exerciseId - ID упражнения
 */
function openFastTrainExecution(taskId, exerciseId) {
    fastTrainState.currentExerciseId = exerciseId;
    fastTrainState.currentView = 'execution';
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Установка фильтра по статусу
 * @param {string} filter - Значение фильтра
 * @param {HTMLElement} btn - Кнопка фильтра
 */
function setFastTrainFilter(filter, btn) {
    fastTrainState.exerciseFilter = filter;
    if (btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    renderFastTrain(document.getElementById('currentSection'));
}

/**
 * Установка фильтра по дате
 * @param {string} value - Значение фильтра
 */
function setFastTrainDateFilter(value) {
    fastTrainState.exerciseDateFilter = value;
    renderFastTrain(document.getElementById('currentSection'));
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем главную функцию
window.renderFastTrain = renderFastTrain;

// Экспортируем навигационные функции
window.backToFastTrainList = backToFastTrainList;
window.openFastTrainExercises = openFastTrainExercises;
window.openFastTrainExecution = openFastTrainExecution;

// Экспортируем функции фильтрации
window.setFastTrainFilter = setFastTrainFilter;
window.setFastTrainDateFilter = setFastTrainDateFilter;

// Экспортируем функции выполнения
window.toggleFastTrainOption = toggleFastTrainOption;
window.checkFastTrainExercise = checkFastTrainExercise;
window.resetFastTrainExercise = resetFastTrainExercise;

// Экспортируем функции спринта
window.startFastTrainSprint = startFastTrainSprint;
window.nextFastTrainSprintExercise = nextFastTrainSprintExercise;
window.checkFastTrainSprintLast = checkFastTrainSprintLast;
window.retryFastTrainSprint = retryFastTrainSprint;
window.cancelFastTrainSprint = cancelFastTrainSprint;

console.log('⚡ Модуль FastTrain.js загружен');
