/**
 * ============================================
 * МОДУЛЬ: ИНИЦИАЛИЗАЦИЯ ДАННЫХ
 * ============================================
 * 
 * Отвечает за:
 * - Создание тестовых пользователей
 * - Создание тестовых занятий
 * - Создание тестовых заданий
 * - Создание тестовых назначений
 * - Проверку наличия данных и их инициализацию
 * ============================================
 */

/**
 * Конфигурация ключей для localStorage
 * Используется для согласованности с storage.js
 */
const DATA_CONFIG = {
    USERS_KEY: 'ege_tutor_users_v1',
    LESSONS_KEY: 'ege_tutor_lessons_v1',
    TASKS_KEY: 'ege_tutor_tasks_v1',
    ASSIGNMENTS_KEY: 'ege_tutor_assignments_v1'
};

/**
 * Статусы занятий
 */
const LessonStatus = {
    SCHEDULED: 'scheduled',
    RESCHEDULED: 'rescheduled',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    IN_PROGRESS: 'in_progress'
};

/**
 * Инициализация всех тестовых данных
 * Вызывается при первом запуске приложения
 */
function initAllData() {
    initUsers();
    initLessons();
    initTasks();
    initAssignments();
    console.log('✅ Все тестовые данные инициализированы');
}

/**
 * Инициализация тестовых пользователей
 */
function initUsers() {
    if (!localStorage.getItem(DATA_CONFIG.USERS_KEY)) {
        const users = [
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
        localStorage.setItem(DATA_CONFIG.USERS_KEY, JSON.stringify(users));
        console.log('  👥 Созданы тестовые пользователи:', users.length);
    }
}

/**
 * Инициализация тестовых занятий
 */
function initLessons() {
    if (!localStorage.getItem(DATA_CONFIG.LESSONS_KEY)) {
        const users = JSON.parse(localStorage.getItem(DATA_CONFIG.USERS_KEY) || '[]');
        const students = users.filter(u => u.role === 'student');
        const admin = users.find(u => u.role === 'admin');
        
        if (students.length > 0 && admin) {
            const now = new Date();
            
            // Завтра в 17:00
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(17, 0, 0, 0);
            
            // Через 3 дня в 15:30
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 3);
            nextWeek.setHours(15, 30, 0, 0);
            
            // Через 7 дней в 18:00
            const weekLater = new Date(now);
            weekLater.setDate(weekLater.getDate() + 7);
            weekLater.setHours(18, 0, 0, 0);
            
            const lessons = [
                {
                    id: 1001,
                    title: 'Подготовка к сочинению',
                    description: 'Разбираем структуру сочинения и критерии оценивания (К1-К12)',
                    startTime: tomorrow.toISOString(),
                    date: tomorrow.toISOString(),
                    duration: 60,
                    meetLink: 'https://meet.google.com/abc-defg-hij',
                    status: LessonStatus.SCHEDULED,
                    studentId: students[0]?.id || 'u2',
                    teacherId: admin.id,
                    materials: [
                        { id: 'm1', type: 'text', content: 'Критерии оценивания сочинения', title: 'Критерии К1-К12' },
                        { id: 'm2', type: 'link', content: 'https://holst.io/board/123', title: 'Доска для работы' }
                    ],
                    assignedTaskIds: [1, 3],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 1002,
                    title: 'Разбор ошибок в тестовой части',
                    description: 'Разбираем задания 8-12 (синтаксис и пунктуация)',
                    startTime: nextWeek.toISOString(),
                    date: nextWeek.toISOString(),
                    duration: 60,
                    meetLink: 'https://meet.google.com/xyz-uvw-abc',
                    status: LessonStatus.SCHEDULED,
                    studentId: students.length > 1 ? students[1].id : students[0]?.id || 'u3',
                    teacherId: admin.id,
                    materials: [
                        { id: 'm3', type: 'text', content: 'Разбор типичных ошибок', title: 'Ошибки в заданиях 8-12' }
                    ],
                    assignedTaskIds: [2, 4],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 1003,
                    title: 'Орфография: повторение',
                    description: 'Повторяем правила орфографии (Н/НН, приставки, корни)',
                    startTime: weekLater.toISOString(),
                    date: weekLater.toISOString(),
                    duration: 60,
                    meetLink: 'https://meet.google.com/def-ghi-jkl',
                    status: LessonStatus.SCHEDULED,
                    studentId: students[0]?.id || 'u2',
                    teacherId: admin.id,
                    materials: [
                        { id: 'm4', type: 'text', content: 'Правила орфографии', title: 'Конспект по орфографии' }
                    ],
                    assignedTaskIds: [5, 6],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                // Завершённое занятие для статистики
                {
                    id: 1004,
                    title: 'Вводное занятие',
                    description: 'Знакомство с курсом, диагностика уровня',
                    startTime: new Date(now.setDate(now.getDate() - 14)).toISOString(),
                    date: new Date(now.setDate(now.getDate() - 14)).toISOString(),
                    duration: 60,
                    meetLink: 'https://meet.google.com/old-link-123',
                    status: LessonStatus.COMPLETED,
                    studentId: students[0]?.id || 'u2',
                    teacherId: admin.id,
                    materials: [],
                    assignedTaskIds: [],
                    createdAt: new Date(now.setDate(now.getDate() - 14)).toISOString(),
                    updatedAt: new Date(now.setDate(now.getDate() - 14)).toISOString()
                }
            ];
            localStorage.setItem(DATA_CONFIG.LESSONS_KEY, JSON.stringify(lessons));
            console.log('  📅 Созданы тестовые занятия:', lessons.length);
        } else {
            console.warn('⚠️ Не удалось создать занятия: недостаточно пользователей');
        }
    }
}

/**
 * Инициализация тестовых заданий
 */
function initTasks() {
    if (!localStorage.getItem(DATA_CONFIG.TASKS_KEY)) {
        const tasks = [
            // ===== ЗАДАНИЕ 1: Множественный выбор (авто) =====
            {
                id: 1,
                type: 'multiple-choice',
                theme: 'orthography',
                name: 'Правописание Н и НН',
                checkMode: 'auto',
                availability: 'all',
                availableFor: [],
                subtasks: [
                    {
                        id: 'subtask1',
                        description: 'Вставьте пропущенные буквы в словах:',
                        interactive: 'дерев{gap}ый, ветре{gap}ый, стекля{gap}ый, ю{gap}ый',
                        gaps: [
                            { id: 'gap1', type: 'select', options: ['н', 'нн'], correct: 'нн' },
                            { id: 'gap2', type: 'input', correct: 'н' },
                            { id: 'gap3', type: 'select', options: ['н', 'нн'], correct: 'нн' },
                            { id: 'gap4', type: 'input', correct: 'н' }
                        ],
                        options: [
                            { text: 'деревянный', correct: true },
                            { text: 'ветреный', correct: false },
                            { text: 'стеклянный', correct: true },
                            { text: 'юный', correct: false }
                        ],
                        image: '',
                        explanation: 'В прилагательных с суффиксами -енн-, -онн- пишется НН. Исключения: ветреный, юный.'
                    }
                ],
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 2: Множественный выбор (ручная) =====
            {
                id: 2,
                type: 'multiple-choice',
                theme: 'punctuation',
                name: 'Знаки препинания в ССП',
                checkMode: 'manual',
                availability: 'selective',
                availableFor: ['u2', 'u3'],
                subtasks: [
                    {
                        id: 'subtask2',
                        description: 'Расставьте знаки препинания в предложениях:',
                        interactive: 'Когда солнце село{gap} стало темно{gap} и мы пошли домой{gap}',
                        gaps: [
                            { id: 'gap5', type: 'input', correct: ',' },
                            { id: 'gap6', type: 'input', correct: ',' },
                            { id: 'gap7', type: 'input', correct: '.' }
                        ],
                        options: [
                            { text: 'Нужна запятая', correct: true },
                            { text: 'Не нужна запятая', correct: false }
                        ],
                        image: '',
                        explanation: 'В сложноподчинённом предложении придаточная часть отделяется запятой. В ССП запятая ставится между частями.'
                    }
                ],
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 3: Написать слово (авто) =====
            {
                id: 3,
                type: 'write-word',
                theme: 'orthography',
                name: 'Паронимы в задании 5',
                checkMode: 'auto',
                availability: 'all',
                availableFor: [],
                workText: 'Исправьте лексическую ошибку, подобрав к выделенному слову пароним. Запишите подобранное слово.',
                description: 'В словосочетании "НЕВЕЖЕСТВЕННЫЙ человек" допущена ошибка',
                correctAnswers: ['невежественный', 'невежа'],
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 4: Соответствие (pairs) =====
            {
                id: 4,
                type: 'matching',
                matchingSubtype: 'pairs',
                theme: 'grammar',
                name: 'Грамматические ошибки (задание 8)',
                description: 'Установите соответствие между грамматическими ошибками и предложениями',
                leftColumnName: 'ОШИБКИ',
                rightColumnName: 'ПРЕДЛОЖЕНИЯ',
                leftItems: [
                    { id: 'l1', label: 'А', text: 'Нарушение видовременной связи' },
                    { id: 'l2', label: 'Б', text: 'Неправильное употребление падежной формы' },
                    { id: 'l3', label: 'В', text: 'Ошибка в построении предложения' }
                ],
                rightItems: [
                    { id: 'r1', number: 1, text: 'Благодаря труда лингвистов мы узнали...' },
                    { id: 'r2', number: 2, text: 'По приезду в город мы заселились в отель' },
                    { id: 'r3', number: 3, text: 'Те, кто изучает язык, знают правила' }
                ],
                correctPairs: [
                    { leftId: 'l1', rightId: 'r3' },
                    { leftId: 'l2', rightId: 'r2' },
                    { leftId: 'l3', rightId: 'r1' }
                ],
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 5: Распределение (distribution) =====
            {
                id: 5,
                type: 'matching',
                matchingSubtype: 'distribution',
                theme: 'orthography',
                name: 'Н и НН в прилагательных',
                description: 'Распределите слова по столбцам в зависимости от написания',
                columns: [
                    { id: 'col1', name: 'Н' },
                    { id: 'col2', name: 'НН' }
                ],
                words: ['деревянный', 'ветреный', 'стеклянный', 'кожаный', 'серебряный', 'оловянный'],
                correctAnswers: [
                    { word: 'деревянный', columnId: 'col2' },
                    { word: 'ветреный', columnId: 'col1' },
                    { word: 'стеклянный', columnId: 'col2' },
                    { word: 'кожаный', columnId: 'col1' },
                    { word: 'серебряный', columnId: 'col1' },
                    { word: 'оловянный', columnId: 'col2' }
                ],
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 6: Работа с текстом (авто) =====
            {
                id: 6,
                type: 'text-work',
                theme: 'text',
                name: 'Синтаксический анализ текста',
                description: 'Вставьте пропущенные слова в текст',
                checkMode: 'auto',
                availability: 'all',
                availableFor: [],
                sourceText: '____ день был солнечным. Мы ____ гуляли в парке. ____ деревья были зелёными.',
                correctText: 'Тот день был солнечным. Мы долго гуляли в парке. Все деревья были зелёными.',
                gapCount: 3,
                createdAt: new Date().toLocaleDateString()
            },
            
            // ===== ЗАДАНИЕ 7: Сочинение (ручная) =====
            {
                id: 7,
                type: 'essay',
                theme: 'text',
                name: 'Сочинение по тексту',
                description: 'Напишите сочинение по предложенному тексту (К1-К12)',
                checkMode: 'manual',
                availability: 'all',
                availableFor: [],
                sourceText: 'Текст для сочинения будет здесь...',
                createdAt: new Date().toLocaleDateString()
            }
        ];
        
        localStorage.setItem(DATA_CONFIG.TASKS_KEY, JSON.stringify(tasks));
        console.log('  📚 Созданы тестовые задания:', tasks.length);
    }
}

/**
 * Инициализация тестовых назначений (связей ученик-задание)
 */
function initAssignments() {
    if (!localStorage.getItem(DATA_CONFIG.ASSIGNMENTS_KEY)) {
        const users = JSON.parse(localStorage.getItem(DATA_CONFIG.USERS_KEY) || '[]');
        const tasks = JSON.parse(localStorage.getItem(DATA_CONFIG.TASKS_KEY) || '[]');
        const students = users.filter(u => u.role === 'student');
        const assignments = [];
        
        // Создаём назначения для каждого задания
        tasks.forEach(task => {
            if (task.type === 'multiple-choice') {
                if (task.availability === 'all') {
                    students.forEach(student => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: student.id,
                            taskId: task.id,
                            status: 'new',
                            subtaskAnswers: {},
                            answers: {},
                            comments: [],
                            reviewComments: []
                        });
                    });
                } else if (task.availability === 'selective' && task.availableFor) {
                    task.availableFor.forEach(studentId => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: studentId,
                            taskId: task.id,
                            status: 'new',
                            subtaskAnswers: {},
                            answers: {},
                            comments: [],
                            reviewComments: []
                        });
                    });
                }
            } else if (task.type === 'write-word') {
                if (task.availability === 'all') {
                    students.forEach(student => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: student.id,
                            taskId: task.id,
                            status: 'new',
                            studentAnswer: '',
                            comments: [],
                            reviewComments: []
                        });
                    });
                } else if (task.availability === 'selective' && task.availableFor) {
                    task.availableFor.forEach(studentId => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: studentId,
                            taskId: task.id,
                            status: 'new',
                            studentAnswer: '',
                            comments: [],
                            reviewComments: []
                        });
                    });
                }
            } else if (task.type === 'text-work' || task.type === 'essay') {
                if (task.availability === 'all') {
                    students.forEach(student => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: student.id,
                            taskId: task.id,
                            status: 'new',
                            studentAnswer: '',
                            comments: [],
                            reviewComments: []
                        });
                    });
                } else if (task.availability === 'selective' && task.availableFor) {
                    task.availableFor.forEach(studentId => {
                        assignments.push({
                            id: Date.now() + Math.random(),
                            studentId: studentId,
                            taskId: task.id,
                            status: 'new',
                            studentAnswer: '',
                            comments: [],
                            reviewComments: []
                        });
                    });
                }
            } else {
                // Для всех остальных типов (matching)
                students.forEach(student => {
                    assignments.push({
                        id: Date.now() + Math.random(),
                        studentId: student.id,
                        taskId: task.id,
                        status: 'new',
                        answers: {},
                        comments: [],
                        reviewComments: []
                    });
                });
            }
        });
        
        // Добавляем несколько выполненных заданий для демонстрации
        // Задание 2 (ручная проверка) - отправлено на проверку
        const task2 = tasks.find(t => t.id === 2);
        if (task2) {
            const u2 = students.find(s => s.id === 'u2');
            const u3 = students.find(s => s.id === 'u3');
            
            if (u2) {
                assignments.push({
                    id: 101,
                    studentId: u2.id,
                    taskId: task2.id,
                    status: 'pending',
                    subtaskAnswers: {
                        subtask2: {
                            answers: { gap5: ',', gap6: ',', gap7: '.' },
                            selectedOptions: [0]
                        }
                    },
                    answers: {},
                    comments: [],
                    reviewComments: [],
                    submittedAt: new Date().toISOString()
                });
            }
            
            if (u3) {
                assignments.push({
                    id: 102,
                    studentId: u3.id,
                    taskId: task2.id,
                    status: 'pending',
                    subtaskAnswers: {
                        subtask2: {
                            answers: { gap5: '.', gap6: '.', gap7: ',' },
                            selectedOptions: [1]
                        }
                    },
                    answers: {},
                    comments: [],
                    reviewComments: [],
                    submittedAt: new Date().toISOString()
                });
            }
        }
        
        // Задание 4 (соответствие) - авто-проверка
        const task4 = tasks.find(t => t.id === 4);
        if (task4) {
            const u2 = students.find(s => s.id === 'u2');
            if (u2) {
                assignments.push({
                    id: 103,
                    studentId: u2.id,
                    taskId: task4.id,
                    status: 'auto-checked',
                    answers: {
                        l1: 'r3',
                        l2: 'r2',
                        l3: 'r1'
                    },
                    comments: [],
                    reviewComments: [],
                    submittedAt: new Date().toISOString(),
                    score: '3/3'
                });
            }
        }
        
        // Задание 1 (множественный выбор) - выполнено с прогрессом
        const task1 = tasks.find(t => t.id === 1);
        if (task1) {
            const u2 = students.find(s => s.id === 'u2');
            if (u2) {
                assignments.push({
                    id: 104,
                    studentId: u2.id,
                    taskId: task1.id,
                    status: 'new',
                    subtaskAnswers: {
                        subtask1: {
                            answers: { gap1: 'нн', gap2: 'н', gap3: 'нн' },
                            selectedOptions: [0, 2]
                        }
                    },
                    answers: {},
                    comments: [],
                    reviewComments: []
                });
            }
        }
        
        localStorage.setItem(DATA_CONFIG.ASSIGNMENTS_KEY, JSON.stringify(assignments));
        console.log('  📝 Созданы тестовые назначения:', assignments.length);
    }
}

/**
 * Сброс всех данных (для отладки)
 * Внимание! Удаляет все данные из localStorage
 */
function resetAllData() {
    const confirmReset = confirm('⚠️ Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.');
    if (confirmReset) {
        localStorage.removeItem(DATA_CONFIG.USERS_KEY);
        localStorage.removeItem(DATA_CONFIG.LESSONS_KEY);
        localStorage.removeItem(DATA_CONFIG.TASKS_KEY);
        localStorage.removeItem(DATA_CONFIG.ASSIGNMENTS_KEY);
        localStorage.removeItem('ege_tutor_auth_v1');
        localStorage.removeItem('student_dashboard_data');
        
        initAllData();
        console.log('🔄 Все данные сброшены и переинициализированы');
        location.reload();
    }
}

/**
 * Вывод информации о текущем состоянии данных
 */
function showDataInfo() {
    const users = JSON.parse(localStorage.getItem(DATA_CONFIG.USERS_KEY) || '[]');
    const lessons = JSON.parse(localStorage.getItem(DATA_CONFIG.LESSONS_KEY) || '[]');
    const tasks = JSON.parse(localStorage.getItem(DATA_CONFIG.TASKS_KEY) || '[]');
    const assignments = JSON.parse(localStorage.getItem(DATA_CONFIG.ASSIGNMENTS_KEY) || '[]');
    
    console.group('📊 Состояние данных');
    console.log('  👥 Пользователи:', users.length);
    console.log('  📅 Занятия:', lessons.length);
    console.log('  📚 Задания:', tasks.length);
    console.log('  📝 Назначения:', assignments.length);
    console.groupEnd();
    
    return { users, lessons, tasks, assignments };
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем конфигурацию
window.DATA_CONFIG = DATA_CONFIG;
window.LessonStatus = LessonStatus;

// Экспортируем функции инициализации
window.initAllData = initAllData;
window.initUsers = initUsers;
window.initLessons = initLessons;
window.initTasks = initTasks;
window.initAssignments = initAssignments;
window.resetAllData = resetAllData;
window.showDataInfo = showDataInfo;

// Автоматическая инициализация при загрузке модуля
initAllData();

console.log('📦 Модуль initData.js загружен');
