/**
 * ============================================
 * МОДУЛЬ: МОИ ЗАДАНИЯ (УЧЕНИК)
 * ============================================
 * 
 * Отвечает за:
 * - Отображение списка заданий ученика в виде карточек
 * - Фильтрацию заданий по темам
 * - Отображение прогресса по каждому заданию
 * - Открытие задания для выполнения
 * - Индикацию доступности заданий
 * ============================================
 */

/**
 * Рендеринг страницы "Мои задания" для ученика
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderStudentTasks(container) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Получаем данные
    const allTasks = getTasks();
    const assignments = getAssignments().filter(a => a.studentId === user.id);
    
    // Формируем список заданий с прогрессом
    const tasksWithProgress = allTasks.map(task => {
        const assignment = assignments.find(a => a.taskId === task.id);
        const progress = calculateTaskProgress(task, assignment);
        
        // Определяем доступность
        let available = true;
        if (task.availability === 'selective') {
            available = task.availableFor?.includes(user.id) || false;
        }
        
        // Определяем статус
        let status = 'new';
        if (assignment) {
            if (assignment.status === 'pending' || assignment.status === 'checked' || assignment.status === 'auto-checked') {
                status = assignment.status === 'checked' ? 'done' : 
                         assignment.status === 'auto-checked' ? 'done' : 'in-progress';
            } else if (assignment.status === 'new' && progress.percent > 0 && progress.percent < 100) {
                status = 'in-progress';
            } else if (assignment.status === 'new' && progress.percent === 100) {
                status = 'done';
            }
        }
        
        return {
            ...task,
            progress: progress.percent,
            done: progress.completed,
            total: progress.total,
            status: status,
            available: available,
            assignment: assignment
        };
    });
    
    // Сортируем: сначала доступные, потом недоступные
    tasksWithProgress.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return 0;
    });
    
    // Статистика
    const totalTasks = tasksWithProgress.length;
    const availableTasks = tasksWithProgress.filter(t => t.available).length;
    const completedTasks = tasksWithProgress.filter(t => t.available && t.status === 'done').length;
    const inProgressTasks = tasksWithProgress.filter(t => t.available && t.status === 'in-progress').length;
    const avgProgress = availableTasks > 0 ? 
        Math.round(tasksWithProgress.filter(t => t.available).reduce((sum, t) => sum + t.progress, 0) / availableTasks) : 0;
    
    container.innerHTML = `
        <!-- Верхняя панель -->
        <div class="top-bar">
            <h1 class="page-title">📖 Годовой курс ЕГЭ · Русский язык</h1>
            <div class="role-indicator">👤 Ученик</div>
        </div>
        
        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card student">
                <div class="stat-title">📊 Общий прогресс</div>
                <div class="stat-number">${avgProgress}%</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">✅ Изучено тем</div>
                <div class="stat-number">${completedTasks} / ${availableTasks}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">⏳ В процессе</div>
                <div class="stat-number">${inProgressTasks}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">📚 Всего заданий</div>
                <div class="stat-number">${totalTasks}</div>
            </div>
        </div>
        
        <!-- Фильтры -->
        <div class="filter-bar">
            <button class="filter-btn active" data-filter="all" onclick="filterStudentTasks('all', this)">Все задания</button>
            <button class="filter-btn" data-filter="orthography" onclick="filterStudentTasks('orthography', this)">Орфография</button>
            <button class="filter-btn" data-filter="punctuation" onclick="filterStudentTasks('punctuation', this)">Пунктуация</button>
            <button class="filter-btn" data-filter="text" onclick="filterStudentTasks('text', this)">Работа с текстом</button>
            <button class="filter-btn" data-filter="grammar" onclick="filterStudentTasks('grammar', this)">Грамматика</button>
            <button class="filter-btn" data-filter="syntax" onclick="filterStudentTasks('syntax', this)">Синтаксис</button>
        </div>
        
        <!-- Сетка карточек -->
        <div class="cards-grid" id="studentTasksGrid">
            ${renderTaskCards(tasksWithProgress)}
        </div>
    `;
}

/**
 * Рендеринг карточек заданий
 * @param {Array} tasks - Массив заданий с прогрессом
 * @returns {string} HTML-строка
 */
function renderTaskCards(tasks) {
    if (!tasks || tasks.length === 0) {
        return `
            <div style="text-align: center; padding: 60px 20px; grid-column: 1 / -1; background: white; border-radius: 24px; border: 1px solid #eef2f6;">
                <i class="fas fa-tasks" style="font-size: 48px; color: #4f46e5; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Нет заданий</h3>
                <p style="color: #64748b;">Задания пока не добавлены</p>
            </div>
        `;
    }
    
    // Маппинг тегов на CSS-классы
    const tagClassMap = {
        'orthography': 'tag-orthography',
        'punctuation': 'tag-punctuation',
        'text': 'tag-text',
        'grammar': 'tag-grammar',
        'syntax': 'tag-syntax'
    };
    
    // Маппинг тем на человекочитаемые названия
    const themeMap = {
        'orthography': 'Орфография',
        'punctuation': 'Пунктуация',
        'text': 'Работа с текстом',
        'grammar': 'Грамматика',
        'syntax': 'Синтаксис'
    };
    
    return tasks.map(task => {
        const isAvailable = task.available !== false;
        const progressText = `${task.done || 0}/${task.total || 1}`;
        const statusLabel = getTaskStatusLabel(task.status, isAvailable);
        const statusClass = getTaskStatusClass(task.status, isAvailable);
        const themeName = themeMap[task.theme] || task.theme || 'Общее';
        const themeClass = tagClassMap[task.theme] || '';
        
        // Определяем иконку в зависимости от типа задания
        const typeIcon = getTaskTypeIcon(task.type, task.matchingSubtype);
        
        return `
            <div class="task-card ${!isAvailable ? 'unavailable' : ''}" 
                 data-task-id="${task.id}" 
                 onclick="${isAvailable ? `openStudentTask(${task.id})` : ''}"
                 style="cursor: ${isAvailable ? 'pointer' : 'not-allowed'};">
                
                ${!isAvailable ? `<span class="lock-icon"><i class="fas fa-lock"></i></span>` : ''}
                
                <div class="task-card-header">
                    <div class="task-card-title">
                        ${task.name || 'Задание'}
                        <small>${task.description || task.subtasks?.[0]?.description || 'Без описания'}</small>
                    </div>
                    ${typeIcon ? `<span class="task-card-icon">${typeIcon}</span>` : ''}
                </div>
                
                <div class="task-card-tags">
                    <span class="tag ${themeClass}">${themeName}</span>
                    ${task.type ? `<span class="tag">${getTaskTypeLabel(task.type, task.matchingSubtype)}</span>` : ''}
                    ${!isAvailable ? `<span class="tag" style="background: #fee2e2; color: #dc2626;">🔒 Недоступно</span>` : ''}
                </div>
                
                <div class="task-card-progress">
                    <span class="progress-text">${progressText}</span>
                    <div class="progress-bar">
                        <span class="fill" style="width: ${isAvailable ? task.progress : 0}%;"></span>
                    </div>
                    <span class="progress-text">${isAvailable ? task.progress : 0}%</span>
                </div>
                
                <div class="task-card-footer">
                    ${isAvailable ? `<span class="task-status-badge ${statusClass}">${statusLabel}</span>` : ''}
                    <button class="btn-enter" ${!isAvailable ? 'disabled' : ''} 
                            onclick="${isAvailable ? `event.stopPropagation(); openStudentTask(${task.id})` : 'event.stopPropagation();'}">
                        <i class="fas fa-${isAvailable ? 'arrow-right' : 'lock'}"></i> 
                        ${isAvailable ? 'Войти' : 'Недоступно'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Фильтрация заданий по теме
 * @param {string} filter - Тема для фильтрации
 * @param {HTMLElement} btn - Кнопка фильтра
 */
function filterStudentTasks(filter, btn) {
    // Обновляем активную кнопку
    document.querySelectorAll('#currentSection .filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    
    const user = getCurrentUser();
    if (!user) return;
    
    const allTasks = getTasks();
    const assignments = getAssignments().filter(a => a.studentId === user.id);
    
    // Формируем список заданий
    let tasksWithProgress = allTasks.map(task => {
        const assignment = assignments.find(a => a.taskId === task.id);
        const progress = calculateTaskProgress(task, assignment);
        
        let available = true;
        if (task.availability === 'selective') {
            available = task.availableFor?.includes(user.id) || false;
        }
        
        let status = 'new';
        if (assignment) {
            if (assignment.status === 'pending' || assignment.status === 'checked' || assignment.status === 'auto-checked') {
                status = assignment.status === 'checked' ? 'done' : 
                         assignment.status === 'auto-checked' ? 'done' : 'in-progress';
            } else if (assignment.status === 'new' && progress.percent > 0 && progress.percent < 100) {
                status = 'in-progress';
            } else if (assignment.status === 'new' && progress.percent === 100) {
                status = 'done';
            }
        }
        
        return {
            ...task,
            progress: progress.percent,
            done: progress.completed,
            total: progress.total,
            status: status,
            available: available,
            assignment: assignment
        };
    });
    
    // Применяем фильтр
    if (filter !== 'all') {
        tasksWithProgress = tasksWithProgress.filter(t => t.theme === filter);
    }
    
    // Сортируем: сначала доступные
    tasksWithProgress.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return 0;
    });
    
    const grid = document.getElementById('studentTasksGrid');
    if (grid) {
        grid.innerHTML = renderTaskCards(tasksWithProgress);
    }
}

/**
 * Расчёт прогресса выполнения задания
 * @param {Object} task - Объект задания
 * @param {Object} assignment - Объект назначения
 * @returns {Object} { percent, completed, total }
 */
function calculateTaskProgress(task, assignment) {
    if (!task) return { percent: 0, completed: 0, total: 1 };
    
    let total = 0;
    let completed = 0;
    
    // Для заданий с подзаданиями (multiple-choice)
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
            const answers = assignment?.subtaskAnswers?.[subtask.id];
            if (!answers) {
                // Если нет ответов, считаем все пропуски и варианты
                subtask.gaps.forEach(() => total++);
                subtask.options.forEach(opt => {
                    if (opt.correct) total++;
                });
                return;
            }
            
            // Считаем пропуски
            subtask.gaps.forEach(gap => {
                total++;
                if (answers.answers?.[gap.id] === gap.correct) {
                    completed++;
                }
            });
            
            // Считаем варианты ответов
            subtask.options.forEach((opt, idx) => {
                if (opt.correct) {
                    total++;
                    if (answers.selectedOptions?.includes(idx)) {
                        completed++;
                    }
                }
            });
        });
    } 
    // Для заданий "Написать слово"
    else if (task.type === 'write-word') {
        total = 1;
        if (assignment?.studentAnswer && task.correctAnswers) {
            const userAnswer = assignment.studentAnswer.trim().toLowerCase();
            const isCorrect = task.correctAnswers.some(ans => 
                ans.toLowerCase() === userAnswer
            );
            if (isCorrect) completed = 1;
        }
    }
    // Для заданий "Работа с текстом"
    else if (task.type === 'text-work' || task.type === 'essay') {
        total = task.gapCount || 1;
        if (assignment?.studentAnswer) {
            // Простая эвристика: считаем количество слов в ответе
            const words = assignment.studentAnswer.split(/\s+/).filter(w => w.length > 0);
            completed = Math.min(words.length, total);
        }
    }
    // Для заданий "Соответствие"
    else if (task.type === 'matching') {
        if (task.matchingSubtype === 'pairs') {
            total = task.leftItems?.length || 1;
            if (assignment?.answers) {
                let correct = 0;
                task.correctPairs?.forEach(pair => {
                    if (assignment.answers[pair.leftId] === pair.rightId) {
                        correct++;
                    }
                });
                completed = correct;
            }
        } else if (task.matchingSubtype === 'distribution') {
            total = task.words?.length || 1;
            if (assignment?.answers) {
                let correct = 0;
                task.correctAnswers?.forEach(correctAns => {
                    const userColumn = Object.entries(assignment.answers).find(
                        ([colId, words]) => words.includes(correctAns.word)
                    )?.[0];
                    if (userColumn === correctAns.columnId) {
                        correct++;
                    }
                });
                completed = correct;
            }
        }
    }
    
    // Защита от деления на ноль
    if (total === 0) total = 1;
    
    const percent = Math.min(Math.round((completed / total) * 100), 100);
    return { percent, completed, total };
}

/**
 * Получение иконки для типа задания
 * @param {string} type - Тип задания
 * @param {string} subtype - Подтип задания
 * @returns {string} HTML-код иконки
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
 * Получение метки статуса задания
 * @param {string} status - Статус
 * @param {boolean} available - Доступно ли задание
 * @returns {string} Текст статуса
 */
function getTaskStatusLabel(status, available) {
    if (!available) return '';
    const map = {
        'new': '🆕 Новое',
        'in-progress': '⏳ В процессе',
        'done': '✅ Пройдено'
    };
    return map[status] || status;
}

/**
 * Получение CSS-класса для статуса
 * @param {string} status - Статус
 * @param {boolean} available - Доступно ли задание
 * @returns {string} CSS-класс
 */
function getTaskStatusClass(status, available) {
    if (!available) return 'unavailable';
    return status;
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем главную функцию
window.renderStudentTasks = renderStudentTasks;

// Экспортируем функции фильтрации
window.filterStudentTasks = filterStudentTasks;

// Экспортируем вспомогательные функции
window.calculateTaskProgress = calculateTaskProgress;
window.getTaskTypeIcon = getTaskTypeIcon;
window.getTaskTypeLabel = getTaskTypeLabel;
window.getTaskStatusLabel = getTaskStatusLabel;
window.getTaskStatusClass = getTaskStatusClass;

// Сообщаем о загрузке модуля
console.log('📚 Модуль StudentTasks.js загружен');
