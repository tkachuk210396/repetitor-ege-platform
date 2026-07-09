/**
 * ============================================
 * МОДУЛЬ ХРАНИЛИЩА (STORAGE)
 * ============================================
 * 
 * Отвечает за:
 * - Работу с localStorage
 * - Геттеры и сеттеры для всех сущностей
 * - Инициализацию тестовых данных
 * - Конфигурацию ключей хранилища
 * ============================================
 */

/**
 * Конфигурация ключей для localStorage
 */
const Config = {
    AUTH_KEY: 'ege_tutor_auth_v1',
    USERS_KEY: 'ege_tutor_users_v1',
    LESSONS_KEY: 'ege_tutor_lessons_v1',
    TASKS_KEY: 'ege_tutor_tasks_v1',
    ASSIGNMENTS_KEY: 'ege_tutor_assignments_v1'
};

/**
 * ============================================
 * БАЗОВЫЕ ГЕТТЕРЫ И СЕТТЕРЫ
 * ============================================
 */

/**
 * Получить всех пользователей
 * @returns {Array} Массив пользователей
 */
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(Config.USERS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении пользователей:', e);
        return [];
    }
}

/**
 * Сохранить пользователей
 * @param {Array} data - Массив пользователей
 */
function setUsers(data) {
    try {
        localStorage.setItem(Config.USERS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении пользователей:', e);
    }
}

/**
 * Получить все занятия
 * @returns {Array} Массив занятий
 */
function getLessons() {
    try {
        return JSON.parse(localStorage.getItem(Config.LESSONS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении занятий:', e);
        return [];
    }
}

/**
 * Сохранить занятия
 * @param {Array} data - Массив занятий
 */
function setLessons(data) {
    try {
        localStorage.setItem(Config.LESSONS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении занятий:', e);
    }
}

/**
 * Получить все задания
 * @returns {Array} Массив заданий
 */
function getTasks() {
    try {
        return JSON.parse(localStorage.getItem(Config.TASKS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении заданий:', e);
        return [];
    }
}

/**
 * Сохранить задания
 * @param {Array} data - Массив заданий
 */
function setTasks(data) {
    try {
        localStorage.setItem(Config.TASKS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении заданий:', e);
    }
}

/**
 * Получить все назначения (связи ученик-задание)
 * @returns {Array} Массив назначений
 */
function getAssignments() {
    try {
        return JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении назначений:', e);
        return [];
    }
}

/**
 * Сохранить назначения
 * @param {Array} data - Массив назначений
 */
function setAssignments(data) {
    try {
        localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении назначений:', e);
    }
}

/**
 * Получить текущего авторизованного пользователя
 * @returns {Object|null} Объект пользователя или null
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(Config.AUTH_KEY));
    } catch (e) {
        console.error('Ошибка при получении текущего пользователя:', e);
        return null;
    }
}

/**
 * ============================================
 * ИНИЦИАЛИЗАЦИЯ ТЕСТОВЫХ ДАННЫХ
 * ============================================
 */

/**
 * Инициализирует тестовые данные при первом запуске
 * Создаёт:
 * - Пользователей (админ + 2 ученика)
 * - Занятия
 * - Задания
 * - Назначения
 */
function initData() {
    // === ПОЛЬЗОВАТЕЛИ ===
    if (!localStorage.getItem(Config.USERS_KEY)) {
        const defaultUsers = [
            {
                id: 'u1',
                name: 'Анна Николаева (Админ)',
                email: 'admin@ege.ru',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: 'u2',
                name: 'Анна К. (Ученик)',
                email: 'anna@student.ru',
                password: 'student123',
                role: 'student'
            },
            {
                id: 'u3',
                name: 'Дмитрий М. (Ученик)',
                email: 'dmitry@student.ru',
                password: 'student123',
                role: 'student'
            }
        ];
        localStorage.setItem(Config.USERS_KEY, JSON.stringify(defaultUsers));
        console.log('✅ Созданы тестовые пользователи');
    }
    
    // === ЗАНЯТИЯ ===
    if (!localStorage.getItem(Config.LESSONS_KEY)) {
        const now = new Date();
        
        // Завтра в 17:00
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(17, 0, 0, 0);
        
        // Через 3 дня в 15:30
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 3);
        nextWeek.setHours(15, 30, 0, 0);
        
        const defaultLessons = [
            {
                id: 1001,
                title: 'Подготовка к сочинению',
                description: 'Разбираем структуру сочинения и критерии оценивания',
                date: tomorrow.toISOString(),
                duration: 60,
                meetLink: 'https://meet.google.com/abc-defg-hij',
                status: 'scheduled',
                studentId: 'u2',
                teacherId: 'u1'
            },
            {
                id: 1002,
                title: 'Разбор ошибок в тестовой части',
                description: 'Разбираем задания 8-12',
                date: nextWeek.toISOString(),
                duration: 60,
                meetLink: 'https://meet.google.com/xyz-uvw-abc',
                status: 'scheduled',
                studentId: 'u3',
                teacherId: 'u1'
            }
        ];
        localStorage.setItem(Config.LESSONS_KEY, JSON.stringify(defaultLessons));
        console.log('✅ Созданы тестовые занятия');
    }
    
    // === ЗАДАНИЯ ===
    if (!localStorage.getItem(Config.TASKS_KEY)) {
        const defaultTasks = [
            {
                id: 1,
                type: 'multiple-choice',
                theme: 'orthography',
                name: 'Правописание Н и НН',
                checkMode: 'auto',
                createdAt: new Date().toLocaleDateString(),
                subtasks: [
                    {
                        id: 'subtask1',
                        description: 'Вставьте пропущенные буквы',
                        interactive: 'дерен{gap}ый сад, ветре{gap}ый день',
                        gaps: [
                            { id: 'gap1', type: 'input', correct: 'в' },
                            { id: 'gap2', type: 'input', correct: 'н' }
                        ],
                        options: [],
                        image: '',
                        explanation: 'В прилагательных с суффиксами -енн-, -онн- пишется НН'
                    }
                ],
                availability: 'all',
                availableFor: []
            },
            {
                id: 2,
                type: 'multiple-choice',
                theme: 'punctuation',
                name: 'Знаки препинания',
                checkMode: 'manual',
                createdAt: new Date().toLocaleDateString(),
                subtasks: [
                    {
                        id: 'subtask2',
                        description: 'Расставьте знаки препинания',
                        interactive: 'Мы гуляли {gap} и наслаждались погодой',
                        gaps: [
                            { id: 'gap3', type: 'select', correct: 'запятая', options: ['запятая', 'точка', 'тире'] }
                        ],
                        options: [],
                        image: '',
                        explanation: 'Перед союзом "и" запятая не ставится, если части сложного предложения имеют общий второстепенный член'
                    }
                ],
                availability: 'all',
                availableFor: []
            },
            {
                id: 3,
                type: 'write-word',
                theme: 'orthography',
                name: 'Паронимы в задании 5',
                checkMode: 'auto',
                createdAt: new Date().toLocaleDateString(),
                workText: 'Исправьте лексическую ошибку, подобрав к выделенному слову пароним.',
                description: 'В словосочетании "НЕВЕЖЕСТВЕННЫЙ человек" допущена ошибка',
                correctAnswers: ['невежественный'],
                availability: 'all',
                availableFor: []
            }
        ];
        localStorage.setItem(Config.TASKS_KEY, JSON.stringify(defaultTasks));
        console.log('✅ Созданы тестовые задания');
    }
    
    // === НАЗНАЧЕНИЯ ===
    if (!localStorage.getItem(Config.ASSIGNMENTS_KEY)) {
        const defaultAssignments = [
            {
                id: 101,
                studentId: 'u2',
                taskId: 2,
                status: 'pending',
                subtaskAnswers: {
                    'subtask2': {
                        answers: { 'gap3': 'запятая' },
                        selectedOptions: []
                    }
                },
                submittedAt: new Date().toISOString(),
                comments: [],
                reviewComments: []
            },
            {
                id: 102,
                studentId: 'u3',
                taskId: 2,
                status: 'pending',
                subtaskAnswers: {
                    'subtask2': {
                        answers: { 'gap3': 'точка' },
                        selectedOptions: []
                    }
                },
                submittedAt: new Date().toISOString(),
                comments: [],
                reviewComments: []
            }
        ];
        localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(defaultAssignments));
        console.log('✅ Созданы тестовые назначения');
    }
}

/**
 * Сброс всех данных (для отладки)
 * Внимание! Удаляет все данные из localStorage
 */
function resetAllData() {
    const confirmReset = confirm('⚠️ Вы уверены, что хотите удалить все данные?');
    if (confirmReset) {
        localStorage.removeItem(Config.AUTH_KEY);
        localStorage.removeItem(Config.USERS_KEY);
        localStorage.removeItem(Config.LESSONS_KEY);
        localStorage.removeItem(Config.TASKS_KEY);
        localStorage.removeItem(Config.ASSIGNMENTS_KEY);
        
        initData();
        location.reload();
    }
}

/**
 * ============================================
 * ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
 * ============================================
 */

// Экспортируем Config для использования в других модулях
window.Config = Config;

// Экспортируем геттеры и сеттеры
window.getUsers = getUsers;
window.setUsers = setUsers;
window.getLessons = getLessons;
window.setLessons = setLessons;
window.getTasks = getTasks;
window.setTasks = setTasks;
window.getAssignments = getAssignments;
window.setAssignments = setAssignments;
window.getCurrentUser = getCurrentUser;

// Экспортируем функции инициализации
window.initData = initData;
window.resetAllData = resetAllData;

// Автоматическая инициализация при загрузке модуля
initData();

console.log('📦 Модуль storage.js загружен');
console.log('📊 Текущие данные:');
console.log('  👥 Пользователи:', getUsers().length);
console.log('  📅 Занятия:', getLessons().length);
console.log('  📚 Задания:', getTasks().length);
console.log('  📝 Назначения:', getAssignments().length);
