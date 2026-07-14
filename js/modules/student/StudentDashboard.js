/**
 * ============================================
 * МОДУЛЬ: ДАШБОРД УЧЕНИКА
 * ============================================
 * 
 * Отвечает за:
 * - Отображение приветствия и статистики
 * - Блок "Моя цель" с возможностью изменения
 * - Блок "Задания в работе"
 * - Блок "Мой прогресс" с графиком
 * - Блок "Ближайшее занятие"
 * - Блок "Актуальные материалы" (добавление/удаление)
 * - Блоки "Уже хорошо" и "Можно улучшить"
 * - Блок "Поддержка" с цитатами
 * ============================================
 */

// ===== ДАННЫЕ (имитация базы данных) =====

/**
 * Уроки с материалами (данные от администратора)
 */
const LESSONS_DATA = [
    {
        id: 1,
        title: 'Подготовка к сочинению',
        materials: [
            { id: 101, title: 'Структура сочинения (К1-К12)', type: 'lesson' },
            { id: 102, title: 'Клише для комментария (К2)', type: 'lesson' },
            { id: 103, title: 'Аргументы для обоснования (К4)', type: 'lesson' }
        ]
    },
    {
        id: 2,
        title: 'Орфография: повторение',
        materials: [
            { id: 201, title: 'Правила Н/НН в причастиях', type: 'task' },
            { id: 202, title: 'Тренажёр: приставки ПРЕ-/ПРИ-', type: 'task' }
        ]
    },
    {
        id: 3,
        title: 'Синтаксис и пунктуация',
        materials: [
            { id: 301, title: 'Обособление определений (задание 17)', type: 'task' },
            { id: 302, title: 'Схемы СПП (задание 19)', type: 'lesson' },
            { id: 303, title: 'Пунктуационный анализ (задание 21)', type: 'task' }
        ]
    }
];

/**
 * Материалы, добавленные учеником (сохраняются в localStorage)
 */
let studentMaterials = [];

/**
 * Цель ученика (сохраняется в localStorage)
 */
let studentGoal = 85;

/**
 * Данные прогресса по КИМам
 */
const KIM_DATA = [
    { label: 'КИМ 1', value: 42 },
    { label: 'КИМ 2', value: 56 },
    { label: 'КИМ 3', value: 67 },
    { label: 'КИМ 4', value: 51 },
    { label: 'КИМ 5', value: 73 },
    { label: 'КИМ 6', value: 79 },
    { label: 'КИМ 7', value: 60 },
    { label: 'КИМ 8', value: 85 }
];

/**
 * Цитаты для блока "Поддержка"
 */
const QUOTES = [
    { text: '"Не бойтесь делать ошибки — бойтесь их не замечать. Каждая ошибка — это шаг к правильному ответу."', author: 'Антон Чехов' },
    { text: '"Учиться — всё равно что грести против течения: как только перестанешь, тебя сносит назад."', author: 'Китайская пословица' },
    { text: '"Знание — это сокровищница, но ключ к ней — практика."', author: 'Томас Фуллер' },
    { text: '"Образование — это то, что остаётся после того, как забывается всё выученное."', author: 'Альберт Эйнштейн' },
    { text: '"Читайте, чтобы жить не одну, а много жизней."', author: 'Уильям Фолкнер' },
    { text: '"Границы моего языка — границы моего мира."', author: 'Людвиг Витгенштейн' }
];

// ============================================
// ЗАГРУЗКА/СОХРАНЕНИЕ ДАННЫХ
// ============================================

/**
 * Загрузка данных ученика из localStorage
 */
function loadStudentData() {
    try {
        const saved = localStorage.getItem('student_dashboard_data');
        if (saved) {
            const data = JSON.parse(saved);
            studentMaterials = data.materials || [];
            studentGoal = data.goal || 85;
        } else {
            // Инициализация тестовыми данными
            studentMaterials = [
                { id: 1, title: 'Конспект: сочинение (структура)', type: 'lesson', addedBy: 'admin', lessonId: 1 },
                { id: 2, title: 'Практика: задание 8 (синтаксис)', type: 'task', addedBy: 'admin', lessonId: 3 }
            ];
            saveStudentData();
        }
    } catch (e) {
        console.error('Ошибка загрузки данных ученика:', e);
        studentMaterials = [];
        studentGoal = 85;
    }
}

/**
 * Сохранение данных ученика в localStorage
 */
function saveStudentData() {
    try {
        localStorage.setItem('student_dashboard_data', JSON.stringify({
            materials: studentMaterials,
            goal: studentGoal
        }));
    } catch (e) {
        console.error('Ошибка сохранения данных ученика:', e);
    }
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА
// ============================================

/**
 * Рендеринг дашборда ученика
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderStudentDashboard(container) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Загружаем данные
    loadStudentData();
    
    // Получаем данные из хранилища
    const lessons = getLessons().filter(l => l.studentId === user.id);
    const assignments = getAssignments().filter(a => a.studentId === user.id);
    const tasks = getTasks();
    
    // Статистика для заданий в работе
    const inProgress = assignments.filter(a => a.status === 'pending' || a.status === 'new');
    const completed = assignments.filter(a => a.status === 'checked' || a.status === 'auto-checked');
    
    // Ближайшее занятие
    const nextLesson = lessons
        .filter(l => new Date(l.date) >= new Date() && l.status !== 'cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    
    // Имя пользователя (имя + первая буква фамилии)
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || 'Ученик';
    const lastName = nameParts[1] || '';
    const initials = (firstName[0] || '') + (lastName[0] || '');
    
    container.innerHTML = `
        <!-- Верхняя панель -->
        <div class="top-bar">
            <div>
                <h1 class="page-title">👋 Привет, ${firstName}!</h1>
                <div class="greeting">Добро пожаловать в твою учебную доску</div>
            </div>
            <div class="role-indicator">👤 Ученик</div>
        </div>

        <!-- Ряд 1: Моя цель + Задания в работе -->
        <div class="dashboard-grid">
            ${renderGoalBlock()}
            ${renderTasksInProgress(inProgress, tasks)}
        </div>

        <!-- Ряд 2: Мой прогресс + Ближайшее занятие + Актуальные материалы -->
        <div class="dashboard-grid-2">
            ${renderProgressBlock()}
            ${renderNextLessonBlock(nextLesson)}
            ${renderMaterialsBlock()}
        </div>

        <!-- Ряд 3: Уже хорошо + Можно улучшить + Поддержка -->
        <div class="dashboard-grid-3">
            ${renderStrengthsBlock()}
            ${renderWeaknessesBlock()}
            ${renderSupportBlock()}
        </div>
    `;
    
    // Инициализация интерактивных элементов
    setTimeout(() => {
        initGoalBlock();
        initProgressChart();
        initMaterialsBlock();
        initModalEvents();
    }, 50);
}

// ============================================
// БЛОК: МОЯ ЦЕЛЬ
// ============================================

function renderGoalBlock() {
    return `
        <div class="block goal-block">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-bullseye"></i> Моя цель</span>
                <span style="font-size:12px; color:#94a3b8;">Обновляется после КИМов</span>
            </div>
            <div class="goal-scale">
                <span style="font-size:13px; color:#64748b; min-width:36px;">0</span>
                <div class="goal-track">
                    <span class="fill" style="width: 67%;"></span>
                    <span class="marker" style="left: ${studentGoal}%;"></span>
                </div>
                <span style="font-size:13px; color:#64748b; min-width:36px;">100</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:2px;">
                <span style="font-size:12px; color:#94a3b8;">Текущий: <strong style="color:#4f46e5;">${getCurrentScore()} баллов</strong></span>
                <span style="font-size:12px; color:#94a3b8;">Цель: <strong style="color:#ef4444;">${studentGoal} баллов</strong></span>
            </div>
            <div class="goal-edit">
                <span style="font-size:13px; color:#64748b;">Изменить цель:</span>
                <input type="number" id="goalInput" value="${studentGoal}" min="0" max="100">
                <button class="btn-small btn-primary-small" onclick="updateGoal()">Обновить</button>
            </div>
            <div style="margin-top:6px; font-size:12px; color:#94a3b8;">
                <i class="fas fa-info-circle"></i> Прогресс формируется после пробных КИМов
            </div>
        </div>
    `;
}

function initGoalBlock() {
    const input = document.getElementById('goalInput');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') updateGoal();
        });
    }
}

function getCurrentScore() {
    // Получаем последний КИМ или среднее значение
    if (KIM_DATA.length > 0) {
        return KIM_DATA[KIM_DATA.length - 1].value;
    }
    return 0;
}

/**
 * Обновление цели ученика
 */
function updateGoal() {
    const input = document.getElementById('goalInput');
    if (!input) return;
    
    let val = parseInt(input.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 100) val = 100;
    input.value = val;
    
    studentGoal = val;
    saveStudentData();
    
    // Обновляем маркер на шкале
    const marker = document.querySelector('.goal-track .marker');
    if (marker) marker.style.left = val + '%';
    
    // Обновляем текст цели
    const goalText = document.querySelector('.goal-scale + div span strong:last-child');
    if (goalText) goalText.textContent = val + ' баллов';
    
    // Обновляем легенду графика
    const legend = document.querySelector('.chart-legend span:last-child');
    if (legend) legend.innerHTML = `<span class="dot dot-green"></span> Цель: ${val} баллов`;
}

// ============================================
// БЛОК: ЗАДАНИЯ В РАБОТЕ
// ============================================

function renderTasksInProgress(inProgress, tasks) {
    // Если заданий нет, показываем заглушку
    if (!inProgress.length) {
        return `
            <div class="block tasks-in-progress">
                <div class="block-header">
                    <span class="block-title"><i class="fas fa-clock"></i> Задания в работе</span>
                    <span style="font-size:12px; color:#94a3b8;">0 заданий</span>
                </div>
                <div style="text-align:center; padding:20px 0; color:#94a3b8;">
                    <i class="fas fa-check-circle" style="font-size:32px; color:#10b981; display:block; margin-bottom:8px;"></i>
                    <p>Все задания выполнены!</p>
                    <p style="font-size:13px; margin-top:4px;">Отличная работа! 🎉</p>
                </div>
                <div style="margin-top:10px; text-align:right;">
                    <a href="#" onclick="navigateTo('student-tasks'); return false;" style="color:#4f46e5; font-size:13px; text-decoration:none; font-weight:500;">Все задания →</a>
                </div>
            </div>
        `;
    }
    
    // Ограничиваем до 3 заданий
    const displayTasks = inProgress.slice(0, 3);
    
    return `
        <div class="block tasks-in-progress">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-clock"></i> Задания в работе</span>
                <span style="font-size:12px; color:#94a3b8;">${inProgress.length} заданий</span>
            </div>
            ${displayTasks.map(assignment => {
                const task = tasks.find(t => t.id === assignment.taskId);
                const taskName = task ? task.name : 'Задание без названия';
                const progress = calculateTaskProgress(assignment, task);
                const progressPercent = progress.percent || 0;
                const progressText = progress.text || '0/0';
                
                return `
                    <div class="task-item" onclick="navigateTo('student-task-execution'); openStudentTask(${task?.id || 0});">
                        <span class="task-name">${taskName}</span>
                        <span class="task-progress-small">${progressText}</span>
                        <div class="task-progress-bar">
                            <span class="fill" style="width:${progressPercent}%;"></span>
                        </div>
                    </div>
                `;
            }).join('')}
            <div style="margin-top:10px; text-align:right;">
                <a href="#" onclick="navigateTo('student-tasks'); return false;" style="color:#4f46e5; font-size:13px; text-decoration:none; font-weight:500;">Все задания →</a>
            </div>
        </div>
    `;
}

function calculateTaskProgress(assignment, task) {
    if (!task || !task.subtasks) {
        return { percent: 0, text: '0/0' };
    }
    
    let total = 0;
    let completed = 0;
    
    task.subtasks.forEach(subtask => {
        const answers = assignment.subtaskAnswers?.[subtask.id];
        if (!answers) return;
        
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
    
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percent, text: `${completed}/${total}` };
}

// ============================================
// БЛОК: МОЙ ПРОГРЕСС
// ============================================

function renderProgressBlock() {
    const maxValue = Math.max(...KIM_DATA.map(d => d.value), studentGoal);
    const maxHeight = 100;
    
    let barsHtml = KIM_DATA.map((data, index) => {
        const height = maxValue > 0 ? Math.max((data.value / maxValue) * maxHeight, 4) : 4;
        return `
            <div class="chart-bar">
                <div class="bar" style="height: ${height}px;"></div>
                <span class="bar-value">${data.value}</span>
                <span class="bar-label">${data.label}</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="block progress-block">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-chart-line"></i> Мой прогресс</span>
                <span style="font-size:12px; color:#94a3b8;">По пробным КИМам</span>
            </div>
            <div class="chart-container" id="chartContainer">
                ${barsHtml}
            </div>
            <div class="chart-legend">
                <span><span class="dot dot-blue"></span> Текущий прогресс</span>
                <span><span class="dot dot-green"></span> Цель: ${studentGoal} баллов</span>
            </div>
        </div>
    `;
}

function initProgressChart() {
    // Анимация графиков
    const bars = document.querySelectorAll('.chart-bar .bar');
    bars.forEach((bar, index) => {
        const targetHeight = bar.style.height;
        bar.style.height = '4px';
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, 100 + index * 60);
    });
}

// ============================================
// БЛОК: БЛИЖАЙШЕЕ ЗАНЯТИЕ
// ============================================

function renderNextLessonBlock(nextLesson) {
    if (!nextLesson) {
        return `
            <div class="block next-lesson">
                <div class="block-header">
                    <span class="block-title"><i class="fas fa-video"></i> Ближайшее занятие</span>
                    <span style="font-size:12px; color:#94a3b8;">Онлайн</span>
                </div>
                <div class="no-lesson">
                    <i class="fas fa-calendar-plus" style="font-size:24px; display:block; margin-bottom:8px; color:#94a3b8;"></i>
                    <p>Нет запланированных занятий</p>
                    <p style="font-size:13px; margin-top:4px;">Свяжитесь с репетитором</p>
                </div>
            </div>
        `;
    }
    
    const start = new Date(nextLesson.date);
    const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const teacher = getUsers().find(u => u.id === nextLesson.teacherId);
    const teacherName = teacher ? teacher.name : 'Репетитор';
    
    return `
        <div class="block next-lesson">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-video"></i> Ближайшее занятие</span>
                <span style="font-size:12px; color:#94a3b8;">Онлайн</span>
            </div>
            <div class="lesson-info">
                <div class="lesson-title">📖 ${nextLesson.title || 'Занятие'}</div>
                <div class="lesson-datetime"><i class="far fa-calendar"></i> ${dateStr}, ${timeStr}</div>
                <div class="lesson-teacher"><i class="fas fa-user-graduate"></i> ${teacherName}</div>
                ${nextLesson.meetLink ? `
                    <a href="${nextLesson.meetLink}" target="_blank" class="lesson-link">
                        <i class="fas fa-link"></i> Присоединиться к встрече
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// ============================================
// БЛОК: АКТУАЛЬНЫЕ МАТЕРИАЛЫ
// ============================================

function renderMaterialsBlock() {
    return `
        <div class="block materials-block" id="materialsBlock">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-paperclip"></i> Актуальные материалы</span>
            </div>
            <div class="materials-list" id="materialsList">
                ${renderMaterialsList()}
            </div>
            <button class="add-material-btn" onclick="openAddMaterialModal()">
                <i class="fas fa-plus"></i> Добавить для себя
            </button>
        </div>
    `;
}

function renderMaterialsList() {
    if (!studentMaterials || studentMaterials.length === 0) {
        return '<div class="no-materials">Нет актуальных материалов</div>';
    }
    
    // Сортируем: сначала админские, потом ученические
    const sorted = [...studentMaterials].sort((a, b) => {
        if (a.addedBy === 'admin' && b.addedBy === 'student') return -1;
        if (a.addedBy === 'student' && b.addedBy === 'admin') return 1;
        return 0;
    });
    
    const typeLabels = {
        lesson: { label: 'К занятию', class: 'lesson', icon: 'fa-video' },
        task: { label: 'К заданию', class: 'task', icon: 'fa-tasks' },
        link: { label: 'Ссылка', class: 'link', icon: 'fa-link' }
    };
    
    return sorted.map(item => {
        const info = typeLabels[item.type] || typeLabels.link;
        const isAdmin = item.addedBy === 'admin';
        const titleAttr = item.title && item.title.length > 30 ? item.title : '';
        
        return `
            <div class="material-item">
                <i class="fas ${info.icon}"></i>
                <div class="material-link-wrap">
                    <a href="#" class="material-link" title="${titleAttr}">${item.title || 'Без названия'}</a>
                </div>
                <span class="material-badge ${info.class}">${info.label}</span>
                ${isAdmin ? `<span class="material-badge admin">👤 Админ</span>` : ''}
                <div class="material-actions">
                    ${!isAdmin ? `<button onclick="removeStudentMaterial(${item.id})" title="Удалить"><i class="fas fa-trash"></i></button>` :
                    `<button class="delete-disabled" title="Добавлено администратором"><i class="fas fa-lock"></i></button>`}
                </div>
            </div>
        `;
    }).join('');
}

function initMaterialsBlock() {
    // Ничего не делаем, всё уже отрендерено
}

// ============================================
// УПРАВЛЕНИЕ МАТЕРИАЛАМИ
// ============================================

/**
 * Удаление материала (только ученик может удалить свои)
 * @param {number} id - ID материала
 */
function removeStudentMaterial(id) {
    const item = studentMaterials.find(m => m.id === id);
    if (!item) return;
    
    if (item.addedBy === 'admin') {
        alert('Этот материал добавлен администратором, вы не можете его удалить.');
        return;
    }
    
    if (confirm('Удалить этот материал?')) {
        studentMaterials = studentMaterials.filter(m => m.id !== id);
        saveStudentData();
        renderMaterialsList();
        // Обновляем блок
        const container = document.getElementById('materialsList');
        if (container) {
            container.innerHTML = renderMaterialsList();
        }
    }
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ МАТЕРИАЛОВ
// ============================================

let selectedMaterialId = null;

/**
 * Открытие модального окна для добавления материалов
 */
function openAddMaterialModal() {
    const modal = document.getElementById('addMaterialModal');
    if (!modal) {
        // Создаём модальное окно, если его нет
        createMaterialModal();
        return;
    }
    
    const selector = document.getElementById('lessonSelector');
    if (!selector) return;
    
    // Заполняем список уроков
    const lessons = getLessons().filter(l => l.status !== 'cancelled');
    selector.innerHTML = `<option value="">— Выберите урок —</option>` +
        lessons.map(l => `<option value="${l.id}">${l.title || 'Занятие ' + l.id}</option>`).join('');
    
    document.getElementById('materialsForLesson').style.display = 'none';
    document.getElementById('materialListSelect').innerHTML = '';
    document.getElementById('addSelectedMaterialBtn').disabled = true;
    selectedMaterialId = null;
    
    modal.classList.add('active');
}

/**
 * Создание модального окна для материалов
 */
function createMaterialModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addMaterialModal';
    modal.innerHTML = `
        <div class="modal-box">
            <span class="close-modal" onclick="closeAddMaterialModal()">&times;</span>
            <h3>📎 Добавить материал</h3>
            <p style="color:#64748b; font-size:14px; margin-bottom:16px;">Выберите урок, чтобы увидеть доступные материалы</p>

            <div class="form-group">
                <label>Выберите урок</label>
                <select id="lessonSelector" onchange="onLessonSelect(this.value)">
                    <option value="">— Выберите урок —</option>
                </select>
            </div>

            <div id="materialsForLesson" style="display:none;">
                <div class="form-group">
                    <label>Доступные материалы</label>
                    <div class="material-list-select" id="materialListSelect">
                        <!-- Заполняется динамически -->
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn-small btn-outline-small" onclick="closeAddMaterialModal()">Отмена</button>
                <button class="btn-small btn-primary-small" id="addSelectedMaterialBtn" onclick="addSelectedMaterial()" disabled>Добавить выбранное</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Закрытие по клику вне
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeAddMaterialModal();
    });
}

function closeAddMaterialModal() {
    const modal = document.getElementById('addMaterialModal');
    if (modal) modal.classList.remove('active');
    selectedMaterialId = null;
}

function onLessonSelect(lessonId) {
    const container = document.getElementById('materialListSelect');
    const materialsDiv = document.getElementById('materialsForLesson');
    
    if (!lessonId) {
        materialsDiv.style.display = 'none';
        container.innerHTML = '';
        document.getElementById('addSelectedMaterialBtn').disabled = true;
        selectedMaterialId = null;
        return;
    }
    
    // Ищем урок в данных
    let lessonMaterials = [];
    const lessonIdNum = parseInt(lessonId);
    
    // Ищем в глобальных уроках
    const lesson = LESSONS_DATA.find(l => l.id === lessonIdNum);
    if (lesson && lesson.materials) {
        lessonMaterials = lesson.materials;
    }
    
    // Также ищем в занятиях из хранилища (могут быть другие материалы)
    const lessons = getLessons();
    const storedLesson = lessons.find(l => l.id === lessonIdNum);
    if (storedLesson && storedLesson.materials) {
        // Объединяем с уникальными ID
        const existingIds = lessonMaterials.map(m => m.id);
        storedLesson.materials.forEach(m => {
            if (!existingIds.includes(m.id)) {
                lessonMaterials.push(m);
            }
        });
    }
    
    if (!lessonMaterials.length) {
        materialsDiv.style.display = 'block';
        container.innerHTML = '<div style="padding:12px; text-align:center; color:#94a3b8;">В этом уроке нет материалов</div>';
        document.getElementById('addSelectedMaterialBtn').disabled = true;
        selectedMaterialId = null;
        return;
    }
    
    materialsDiv.style.display = 'block';
    
    // Фильтруем уже добавленные материалы
    const addedIds = studentMaterials.map(m => m.id);
    const available = lessonMaterials.filter(m => !addedIds.includes(m.id));
    
    if (available.length === 0) {
        container.innerHTML = '<div style="padding:12px; text-align:center; color:#94a3b8;">Все материалы из этого урока уже добавлены</div>';
        document.getElementById('addSelectedMaterialBtn').disabled = true;
        selectedMaterialId = null;
        return;
    }
    
    const typeLabels = {
        lesson: '📹 К занятию',
        task: '📋 К заданию',
        link: '🔗 Ссылка'
    };
    
    container.innerHTML = available.map(m => `
        <div class="mat-item" onclick="selectMaterial(${m.id})" data-id="${m.id}">
            <i class="fas fa-${m.type === 'lesson' ? 'video' : m.type === 'task' ? 'tasks' : 'link'}"></i>
            <span>${m.title}</span>
            <span class="mat-badge">${typeLabels[m.type] || 'Материал'}</span>
        </div>
    `).join('');
    
    document.getElementById('addSelectedMaterialBtn').disabled = true;
    selectedMaterialId = null;
}

function selectMaterial(materialId) {
    // Снимаем выделение со всех
    document.querySelectorAll('.mat-item').forEach(el => el.classList.remove('selected'));
    // Выделяем выбранный
    const el = document.querySelector(`.mat-item[data-id="${materialId}"]`);
    if (el) el.classList.add('selected');
    
    selectedMaterialId = materialId;
    document.getElementById('addSelectedMaterialBtn').disabled = false;
}

function addSelectedMaterial() {
    if (!selectedMaterialId) return;
    
    // Находим материал в уроках
    let found = null;
    let foundLessonId = null;
    
    // Ищем в статических данных
    for (const lesson of LESSONS_DATA) {
        const mat = lesson.materials.find(m => m.id === selectedMaterialId);
        if (mat) {
            found = mat;
            foundLessonId = lesson.id;
            break;
        }
    }
    
    // Если не нашли, ищем в занятиях из хранилища
    if (!found) {
        const lessons = getLessons();
        for (const lesson of lessons) {
            if (lesson.materials) {
                const mat = lesson.materials.find(m => m.id === selectedMaterialId);
                if (mat) {
                    found = mat;
                    foundLessonId = lesson.id;
                    break;
                }
            }
        }
    }
    
    if (!found) {
        alert('Материал не найден');
        return;
    }
    
    // Проверяем, не добавлен ли уже
    if (studentMaterials.some(m => m.id === found.id)) {
        alert('Этот материал уже добавлен');
        closeAddMaterialModal();
        return;
    }
    
    // Добавляем
    studentMaterials.push({
        id: found.id,
        title: found.title,
        type: found.type || 'link',
        addedBy: 'student',
        lessonId: foundLessonId
    });
    
    saveStudentData();
    
    // Обновляем список материалов
    const container = document.getElementById('materialsList');
    if (container) {
        container.innerHTML = renderMaterialsList();
    }
    
    closeAddMaterialModal();
    alert('Материал добавлен!');
}

function initModalEvents() {
    // Закрытие модального окна по клику вне
    const modal = document.getElementById('addMaterialModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeAddMaterialModal();
        });
    }
}

// ============================================
// БЛОК: УЖЕ ХОРОШО
// ============================================

function renderStrengthsBlock() {
    // В реальном приложении данные берутся из аналитики
    const strengths = [
        { text: 'Пунктуация в ССП — 85% правильных', icon: 'fa-check-circle' },
        { text: 'Правописание корней — 82%', icon: 'fa-check-circle' },
        { text: 'Лексические нормы (паронимы) — 78%', icon: 'fa-check-circle' },
        { text: 'Сочинение: структура (К1, К3) — 80%', icon: 'fa-check-circle' }
    ];
    
    return `
        <div class="block strengths-block">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-star" style="color:#f59e0b;"></i> Уже хорошо</span>
                <span style="font-size:12px; color:#10b981;">Сильные стороны</span>
            </div>
            ${strengths.map(item => `
                <div class="strength-item"><i class="fas ${item.icon}"></i> ${item.text}</div>
            `).join('')}
        </div>
    `;
}

// ============================================
// БЛОК: МОЖНО УЛУЧШИТЬ
// ============================================

function renderWeaknessesBlock() {
    // В реальном приложении данные берутся из аналитики
    const weaknesses = [
        { text: 'Орфоэпические нормы — 45%', icon: 'fa-exclamation-circle' },
        { text: 'Синтаксические нормы — 48%', icon: 'fa-exclamation-circle' },
        { text: 'Пунктуация в СПП — 52%', icon: 'fa-exclamation-circle' },
        { text: 'Сочинение: комментарий (К2) — 55%', icon: 'fa-exclamation-circle' }
    ];
    
    return `
        <div class="block weaknesses-block">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-arrow-up" style="color:#ef4444;"></i> Можно улучшить</span>
                <span style="font-size:12px; color:#ef4444;">Точки роста</span>
            </div>
            ${weaknesses.map(item => `
                <div class="weakness-item"><i class="fas ${item.icon}"></i> ${item.text}</div>
            `).join('')}
        </div>
    `;
}

// ============================================
// БЛОК: ПОДДЕРЖКА
// ============================================

function renderSupportBlock() {
    // Получаем цитату дня (на основе дня года)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % QUOTES.length;
    const quote = QUOTES[quoteIndex];
    
    return `
        <div class="block support-block">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-heart" style="color:#ef4444;"></i> Поддержка</span>
                <span style="font-size:12px; color:#94a3b8;">День ${dayOfYear + 1}</span>
            </div>
            <div class="quote-text">${quote.text}</div>
            <div class="quote-author">— ${quote.author}</div>
            <div class="quote-day">🌸 Цитата дня · ${now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="margin-top:12px; font-size:12px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:10px;">
                <i class="fas fa-heart" style="color:#ef4444;"></i> Всего цитат в коллекции: ${QUOTES.length}
            </div>
        </div>
    `;
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем главную функцию
window.renderStudentDashboard = renderStudentDashboard;

// Экспортируем функции для материалов
window.openAddMaterialModal = openAddMaterialModal;
window.closeAddMaterialModal = closeAddMaterialModal;
window.onLessonSelect = onLessonSelect;
window.selectMaterial = selectMaterial;
window.addSelectedMaterial = addSelectedMaterial;
window.removeStudentMaterial = removeStudentMaterial;

// Экспортируем функцию обновления цели
window.updateGoal = updateGoal;

// Сообщаем о загрузке модуля
console.log('📊 Модуль StudentDashboard.js загружен');
console.log('📚 Загружено материалов:', studentMaterials.length);
console.log('🎯 Цель ученика:', studentGoal);
