/**
 * ============================================
 * МОДУЛЬ: АДМИН - УПРАВЛЕНИЕ ЗАНЯТИЯМИ
 * ============================================
 * 
 * Отвечает за:
 * - Отображение списка всех занятий
 * - Фильтрацию занятий по статусу и ученику
 * - Создание новых занятий
 * - Редактирование занятий
 * - Изменение статуса занятия (начать, завершить, отменить, перенести)
 * - Добавление материалов и заданий к занятию
 * - Детальный просмотр занятия
 * ============================================
 */

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
 * Текущий ID редактируемого занятия
 */
let currentEditingLessonId = null;

/**
 * Рендеринг страницы "Занятия" для администратора
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderAdminLessons(container) {
    const lessons = getLessons();
    const users = getUsers();
    const students = users.filter(u => u.role === 'student');
    
    container.innerHTML = `
        <div class="section-header">
            <h2>📹 Все занятия</h2>
            <button class="btn-primary" onclick="openLessonCreateModal()">
                <i class="fas fa-plus"></i> Создать занятие
            </button>
        </div>
        
        <div class="filter-bar">
            <select id="lessonStatusFilter" class="filter-select" onchange="filterLessons()">
                <option value="all">Все статусы</option>
                <option value="scheduled">📅 Запланировано</option>
                <option value="completed">✅ Завершено</option>
                <option value="rescheduled">🔄 Перенесено</option>
                <option value="cancelled">❌ Отменено</option>
                <option value="in_progress">🔴 В процессе</option>
            </select>
            
            <select id="lessonStudentFilter" class="filter-select" onchange="filterLessons()">
                <option value="all">Все ученики</option>
                ${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
            
            <button class="btn-outline btn-small" onclick="resetLessonFilters()">
                <i class="fas fa-times"></i> Сбросить
            </button>
        </div>
        
        <div id="lessonsList" class="lessons-list">
            ${renderLessonsList(lessons, students)}
        </div>
    `;
}

/**
 * Рендеринг списка занятий (карточки)
 * @param {Array} lessons - Массив занятий
 * @param {Array} students - Массив учеников
 * @returns {string} HTML-строка
 */
function renderLessonsList(lessons, students) {
    if (!lessons || !lessons.length) {
        return `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 24px; border: 1px solid #eef2f6;">
                <i class="fas fa-calendar-plus" style="font-size: 48px; color: #4f46e5; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Нет занятий</h3>
                <p style="color: #64748b;">Создайте первое занятие для ваших учеников</p>
                <button class="btn-primary" onclick="openLessonCreateModal()" style="margin-top: 16px;">
                    <i class="fas fa-plus"></i> Создать занятие
                </button>
            </div>
        `;
    }
    
    // Сортируем по дате (сначала новые)
    const sorted = [...lessons].sort((a, b) => {
        const dateA = new Date(a.startTime || a.date);
        const dateB = new Date(b.startTime || b.date);
        return dateB - dateA;
    });
    
    return sorted.map(lesson => {
        const start = new Date(lesson.startTime || lesson.date);
        const dateStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const student = students.find(u => u.id === lesson.studentId);
        const statusText = getLessonStatusText(lesson.status);
        const statusClass = getLessonStatusClass(lesson.status);
        const statusColor = getLessonStatusColor(lesson.status);
        const isUpcoming = start >= new Date() && (lesson.status === 'scheduled' || lesson.status === 'rescheduled');
        
        return `
            <div class="lesson-card ${lesson.status}" style="
                background: white;
                border-radius: 20px;
                padding: 20px 24px;
                margin-bottom: 16px;
                border: 1px solid #eef2f6;
                border-left: 4px solid ${statusColor};
                transition: 0.15s;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            " onclick="openLessonDetail(${lesson.id})">
                <div style="flex: 1; min-width: 200px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${lesson.title || 'Без названия'}</h3>
                        <span class="badge ${statusClass}">${statusText}</span>
                        ${isUpcoming ? '<span class="badge badge-new" style="background: #dbeafe; color: #1e40af;">🔜 Скоро</span>' : ''}
                    </div>
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
                        <i class="far fa-calendar-alt" style="margin-right: 4px;"></i>
                        ${dateStr} в ${timeStr}
                        <span style="margin: 0 8px;">·</span>
                        <i class="fas fa-user-graduate" style="margin-right: 4px;"></i>
                        ${student?.name || 'Ученик не найден'}
                    </div>
                    ${lesson.description ? `
                        <div style="color: #64748b; font-size: 14px; margin-top: 6px; line-height: 1.5;">
                            ${lesson.description}
                        </div>
                    ` : ''}
                    ${lesson.meetLink ? `
                        <a href="${lesson.meetLink}" target="_blank" style="color: #4f46e5; font-size: 13px; text-decoration: none; margin-top: 4px; display: inline-block;" onclick="event.stopPropagation();">
                            <i class="fas fa-video"></i> Подключиться
                        </a>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-outline btn-small" onclick="event.stopPropagation(); editLesson(${lesson.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${(lesson.status === 'scheduled' || lesson.status === 'rescheduled') ? `
                        <button class="btn-success btn-small" onclick="event.stopPropagation(); startLesson(${lesson.id})">
                            <i class="fas fa-play"></i> Начать
                        </button>
                    ` : ''}
                    ${lesson.status === 'in_progress' ? `
                        <button class="btn-success btn-small" onclick="event.stopPropagation(); completeLesson(${lesson.id})">
                            <i class="fas fa-check"></i> Завершить
                        </button>
                    ` : ''}
                    <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteLesson(${lesson.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Фильтрация занятий по статусу и ученику
 */
function filterLessons() {
    const statusFilter = document.getElementById('lessonStatusFilter')?.value || 'all';
    const studentFilter = document.getElementById('lessonStudentFilter')?.value || 'all';
    
    let filtered = getLessons();
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(l => l.status === statusFilter);
    }
    
    if (studentFilter !== 'all') {
        filtered = filtered.filter(l => l.studentId === studentFilter);
    }
    
    const container = document.getElementById('lessonsList');
    if (container) {
        const students = getUsers().filter(u => u.role === 'student');
        container.innerHTML = renderLessonsList(filtered, students);
    }
}

/**
 * Сброс фильтров занятий
 */
function resetLessonFilters() {
    const statusFilter = document.getElementById('lessonStatusFilter');
    const studentFilter = document.getElementById('lessonStudentFilter');
    
    if (statusFilter) statusFilter.value = 'all';
    if (studentFilter) studentFilter.value = 'all';
    
    filterLessons();
}

/**
 * Загрузка всех занятий
 */
function loadAllLessons() {
    const container = document.getElementById('lessonsList');
    const lessons = getLessons();
    const users = getUsers();
    
    const statusFilter = document.getElementById('lessonStatusFilter')?.value || 'all';
    const studentFilter = document.getElementById('lessonStudentFilter')?.value || 'all';
    
    let filteredLessons = [...lessons];
    
    if (statusFilter !== 'all') {
        filteredLessons = filteredLessons.filter(l => l.status === statusFilter);
    }
    
    if (studentFilter !== 'all') {
        filteredLessons = filteredLessons.filter(l => l.studentId === studentFilter);
    }
    
    filteredLessons.sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date));
    
    if (filteredLessons.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #64748b;">Нет занятий</p>';
        return;
    }
    
    const students = users.filter(u => u.role === 'student');
    container.innerHTML = renderLessonsList(filteredLessons, students);
}

// ============================================
// СОЗДАНИЕ ЗАНЯТИЯ
// ============================================

/**
 * Открытие модального окна для создания занятия
 * @param {Date} selectedDate - Выбранная дата (опционально)
 */
function openLessonCreateModal(selectedDate = null) {
    currentEditingLessonId = null;
    
    const modal = document.getElementById('lessonModal');
    if (!modal) {
        // Если модальное окно не найдено, создаём его динамически
        createLessonModal();
        return;
    }
    
    document.getElementById('lessonModalTitle').textContent = 'Создать занятие';
    
    document.getElementById('lessonDateTime').value = selectedDate ? formatDateTimeForInput(selectedDate) : '';
    document.getElementById('lessonTitle').value = '';
    document.getElementById('lessonDescription').value = '';
    document.getElementById('lessonMeetLink').value = '';
    document.getElementById('lessonDuration').value = 60;
    
    loadStudentsToSelect();
    
    document.getElementById('materialsList').innerHTML = '';
    document.getElementById('lessonTasksList').innerHTML = '';
    
    modal.classList.add('active');
}

/**
 * Создание модального окна для занятия (если его нет в HTML)
 */
function createLessonModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'lessonModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 id="lessonModalTitle">Создать занятие</h3>
                <span class="close-modal" onclick="closeLessonModal()">&times;</span>
            </div>
            
            <div class="form-group">
                <label>Дата и время занятия *</label>
                <input type="datetime-local" id="lessonDateTime" class="form-control">
            </div>
            
            <div class="form-group">
                <label>Ученик *</label>
                <select id="lessonStudent" class="form-control">
                    <option value="">Выберите ученика...</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Ссылка на онлайн-встречу</label>
                <input type="url" id="lessonMeetLink" class="form-control" placeholder="https://meet.google.com/...">
            </div>
            
            <div class="form-group">
                <label>Тема занятия *</label>
                <input type="text" id="lessonTitle" class="form-control" placeholder="Например: Подготовка к сочинению">
            </div>
            
            <div class="form-group">
                <label>Продолжительность (минут)</label>
                <input type="number" id="lessonDuration" class="form-control" value="60" min="15" max="180">
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="lessonDescription" class="form-control" rows="3" placeholder="Описание занятия..."></textarea>
            </div>
            
            <div class="materials-section">
                <h4>📎 Материалы</h4>
                <div id="materialsList" class="materials-list"></div>
                <button class="btn-outline btn-small" type="button" onclick="addMaterial()">
                    <i class="fas fa-plus"></i> Добавить материал
                </button>
            </div>
            
            <div class="tasks-section">
                <h4>📝 Задания для выполнения</h4>
                <div id="lessonTasksList" class="tasks-checkbox-list"></div>
                <button class="btn-outline btn-small" type="button" onclick="openTaskSelectorModal()">
                    <i class="fas fa-plus"></i> Добавить задание
                </button>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn-outline" type="button" onclick="closeLessonModal()">Отмена</button>
                <button class="btn-primary" type="button" onclick="saveLesson()">
                    <i class="fas fa-save"></i> Сохранить
                </button>
                <button class="btn-outline" type="button" onclick="copyLesson()">
                    <i class="fas fa-copy"></i> Создать копию
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Форматирование даты для input[type="datetime-local"]
 * @param {Date} date - Дата для форматирования
 * @returns {string} Отформатированная строка
 */
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Загрузка списка учеников в селект
 */
function loadStudentsToSelect() {
    const select = document.getElementById('lessonStudent');
    if (!select) return;
    
    const users = getUsers();
    const students = users.filter(u => u.role === 'student');
    
    select.innerHTML = '<option value="">Выберите ученика...</option>' + 
        students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

/**
 * Добавление материала в занятие
 */
function addMaterial() {
    const container = document.getElementById('materialsList');
    if (!container) return;
    
    const materialId = 'mat' + Date.now() + Math.random();
    
    const div = document.createElement('div');
    div.className = 'material-item';
    div.dataset.materialId = materialId;
    div.innerHTML = `
        <select onchange="updateMaterialType('${materialId}', this.value)">
            <option value="text">Текст</option>
            <option value="link">Ссылка</option>
            <option value="file">Файл</option>
        </select>
        <input type="text" placeholder="Название" onchange="updateMaterialTitle('${materialId}', this.value)">
        <textarea placeholder="Содержимое" onchange="updateMaterialContent('${materialId}', this.value)"></textarea>
        <i class="fas fa-trash" onclick="removeMaterial('${materialId}')"></i>
    `;
    container.appendChild(div);
}

/**
 * Обновление типа материала
 */
function updateMaterialType(materialId, type) {
    // Можно добавить логику изменения типа
}

/**
 * Обновление названия материала
 */
function updateMaterialTitle(materialId, title) {
    // Можно добавить логику сохранения названия
}

/**
 * Обновление содержимого материала
 */
function updateMaterialContent(materialId, content) {
    // Можно добавить логику сохранения содержимого
}

/**
 * Удаление материала
 */
function removeMaterial(materialId) {
    const element = document.querySelector(`[data-material-id="${materialId}"]`);
    if (element) element.remove();
}

/**
 * Открытие модального окна выбора заданий для занятия
 */
function openTaskSelectorModal() {
    const modal = document.getElementById('taskSelectorModal');
    if (!modal) {
        createTaskSelectorModal();
        return;
    }
    
    const container = document.getElementById('availableTasksList');
    if (!container) return;
    
    const allTasks = getTasks();
    
    container.innerHTML = allTasks.map(task => {
        let typeIcon = '';
        if (task.type === 'multiple-choice') {
            typeIcon = task.checkMode === 'auto' ? '🤖' : '👤';
        } else if (task.type === 'matching') {
            typeIcon = task.matchingSubtype === 'pairs' ? '🎯' : '📊';
        } else if (task.type === 'write-word') {
            typeIcon = '✍️';
        }
        
        return `
            <div class="task-checkbox-item">
                <input type="checkbox" id="task_${task.id}" value="${task.id}">
                <label for="task_${task.id}">
                    <strong>${task.name}</strong> 
                    <span style="color: #64748b; font-size: 12px;">${typeIcon} ${getThemeName(task.theme)}</span>
                </label>
            </div>
        `;
    }).join('');
    
    modal.classList.add('active');
}

/**
 * Создание модального окна выбора заданий
 */
function createTaskSelectorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'taskSelectorModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Выберите задания</h3>
                <span class="close-modal" onclick="closeTaskSelectorModal()">&times;</span>
            </div>
            
            <div id="availableTasksList" class="tasks-checkbox-list"></div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn-outline" onclick="closeTaskSelectorModal()">Отмена</button>
                <button class="btn-primary" onclick="addSelectedTasksToLesson()">Добавить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Закрытие модального окна выбора заданий
 */
function closeTaskSelectorModal() {
    const modal = document.getElementById('taskSelectorModal');
    if (modal) modal.classList.remove('active');
}

/**
 * Добавление выбранных заданий в занятие
 */
function addSelectedTasksToLesson() {
    const container = document.getElementById('lessonTasksList');
    if (!container) return;
    
    document.querySelectorAll('#availableTasksList input:checked').forEach(cb => {
        const taskId = parseInt(cb.value);
        const allTasks = getTasks();
        const task = allTasks.find(t => t.id === taskId);
        
        if (task && !document.querySelector(`#lessonTasksList input[value="${taskId}"]`)) {
            const div = document.createElement('div');
            div.className = 'task-checkbox-item';
            div.innerHTML = `
                <input type="checkbox" id="lesson_task_${taskId}" value="${taskId}" checked disabled>
                <label for="lesson_task_${taskId}">${task.name}</label>
                <i class="fas fa-trash" onclick="this.parentElement.remove()" style="margin-left: auto; cursor: pointer; color: #ef4444;"></i>
            `;
            container.appendChild(div);
        }
    });
    
    closeTaskSelectorModal();
}

/**
 * Закрытие модального окна занятия
 */
function closeLessonModal() {
    const modal = document.getElementById('lessonModal');
    if (modal) modal.classList.remove('active');
    currentEditingLessonId = null;
}

/**
 * Проверка доступности временного слота
 * @param {string} studentId - ID ученика
 * @param {string} startTime - Время начала
 * @param {number} duration - Продолжительность в минутах
 * @param {number} excludeLessonId - ID занятия для исключения (при редактировании)
 * @returns {boolean} Доступен ли слот
 */
function isTimeSlotAvailable(studentId, startTime, duration = 60, excludeLessonId = null) {
    const lessons = getLessons();
    const start = new Date(startTime).getTime();
    const end = start + duration * 60 * 1000;
    
    return !lessons.some(lesson => {
        if (lesson.status === LessonStatus.CANCELLED) return false;
        if (excludeLessonId && lesson.id === excludeLessonId) return false;
        if (lesson.studentId !== studentId) return false;
        
        const lessonStart = new Date(lesson.startTime || lesson.date).getTime();
        const lessonEnd = lessonStart + (lesson.duration || 60) * 60 * 1000;
        
        return (start < lessonEnd && lessonStart < end);
    });
}

/**
 * Сохранение нового занятия
 */
function saveLesson() {
    const user = getCurrentUser();
    if (!user) {
        alert('Пользователь не авторизован');
        return;
    }
    
    const startTime = document.getElementById('lessonDateTime').value;
    const studentId = document.getElementById('lessonStudent').value;
    const meetLink = document.getElementById('lessonMeetLink').value;
    const title = document.getElementById('lessonTitle').value.trim();
    const description = document.getElementById('lessonDescription').value;
    const duration = parseInt(document.getElementById('lessonDuration')?.value) || 60;
    
    if (!startTime || !studentId || !title) {
        alert('Заполните обязательные поля: дата, ученик, тема занятия');
        return;
    }
    
    if (!isTimeSlotAvailable(studentId, startTime, duration)) {
        alert('Это время уже занято. Выберите другое время.');
        return;
    }
    
    // Собираем материалы
    const materials = [];
    document.querySelectorAll('#materialsList .material-item').forEach(item => {
        const type = item.querySelector('select')?.value || 'text';
        const titleEl = item.querySelector('input[type="text"]');
        const contentEl = item.querySelector('textarea');
        
        const title = titleEl?.value || '';
        const content = contentEl?.value || '';
        
        if (title && content) {
            materials.push({
                id: item.dataset.materialId || 'mat' + Date.now(),
                type,
                title,
                content
            });
        }
    });
    
    // Собираем задания
    const assignedTaskIds = [];
    document.querySelectorAll('#lessonTasksList input[type="checkbox"]').forEach(cb => {
        assignedTaskIds.push(parseInt(cb.value));
    });
    
    const lesson = {
        id: Date.now(),
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        date: new Date(startTime).toISOString(),
        duration: duration,
        meetLink: meetLink || '',
        status: LessonStatus.SCHEDULED,
        studentId,
        teacherId: user.id,
        materials: materials,
        assignedTaskIds: assignedTaskIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const lessons = getLessons();
    lessons.push(lesson);
    setLessons(lessons);
    
    closeLessonModal();
    
    // Обновляем список занятий
    loadAllLessons();
    
    // Обновляем дашборд
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие создано!');
}

/**
 * Копирование занятия
 */
function copyLesson() {
    alert('Функция копирования будет доступна в следующей версии');
}

// ============================================
// РЕДАКТИРОВАНИЕ ЗАНЯТИЯ
// ============================================

/**
 * Открытие модального окна для редактирования занятия
 * @param {number} lessonId - ID занятия
 */
function editLesson(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    currentEditingLessonId = lessonId;
    
    // Используем существующее модальное окно или создаём новое
    let modal = document.getElementById('lessonEditModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'lessonEditModal';
        document.body.appendChild(modal);
    }
    
    const students = getUsers().filter(u => u.role === 'student');
    const startDate = new Date(lesson.startTime || lesson.date);
    const dateValue = formatDateTimeForInput(startDate);
    
    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 800px;">
            <div class="modal-header">
                <h3>Редактировать занятие</h3>
                <span class="close-modal" onclick="closeLessonEditModal()">&times;</span>
            </div>
            
            <div class="form-group">
                <label>Дата и время занятия *</label>
                <input type="datetime-local" id="editLessonDateTime" value="${dateValue}">
            </div>
            
            <div class="form-group">
                <label>Ученик *</label>
                <select id="editLessonStudent">
                    <option value="">Выберите ученика...</option>
                    ${students.map(s => `
                        <option value="${s.id}" ${s.id === lesson.studentId ? 'selected' : ''}>${s.name}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label>Тема занятия *</label>
                <input type="text" id="editLessonTitle" value="${lesson.title || ''}">
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="editLessonDescription" rows="3">${lesson.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Ссылка на онлайн-встречу</label>
                <input type="url" id="editLessonMeetLink" value="${lesson.meetLink || ''}" placeholder="https://meet.google.com/...">
            </div>
            
            <div class="form-group">
                <label>Продолжительность (минут)</label>
                <input type="number" id="editLessonDuration" value="${lesson.duration || 60}" min="15" max="180">
            </div>
            
            <div class="form-group">
                <label>Статус</label>
                <select id="editLessonStatus">
                    <option value="scheduled" ${lesson.status === 'scheduled' ? 'selected' : ''}>Запланировано</option>
                    <option value="in_progress" ${lesson.status === 'in_progress' ? 'selected' : ''}>В процессе</option>
                    <option value="completed" ${lesson.status === 'completed' ? 'selected' : ''}>Завершено</option>
                    <option value="rescheduled" ${lesson.status === 'rescheduled' ? 'selected' : ''}>Перенесено</option>
                    <option value="cancelled" ${lesson.status === 'cancelled' ? 'selected' : ''}>Отменено</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn-outline" onclick="closeLessonEditModal()">Отмена</button>
                <button class="btn-primary" onclick="saveEditedLesson()">
                    <i class="fas fa-save"></i> Сохранить изменения
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

/**
 * Закрытие модального окна редактирования занятия
 */
function closeLessonEditModal() {
    const modal = document.getElementById('lessonEditModal');
    if (modal) modal.classList.remove('active');
    currentEditingLessonId = null;
}

/**
 * Сохранение изменений занятия
 */
function saveEditedLesson() {
    if (!currentEditingLessonId) {
        alert('Ошибка: занятие не найдено');
        return;
    }
    
    const date = document.getElementById('editLessonDateTime').value;
    const studentId = document.getElementById('editLessonStudent').value;
    const title = document.getElementById('editLessonTitle').value.trim();
    const description = document.getElementById('editLessonDescription').value;
    const meetLink = document.getElementById('editLessonMeetLink').value;
    const duration = parseInt(document.getElementById('editLessonDuration').value) || 60;
    const status = document.getElementById('editLessonStatus').value;
    
    if (!date || !studentId || !title) {
        alert('Заполните обязательные поля: дата, ученик, тема занятия');
        return;
    }
    
    // Проверяем, не занято ли время (исключая текущее занятие)
    if (!isTimeSlotAvailable(studentId, date, duration, currentEditingLessonId)) {
        alert('Это время уже занято другим занятием. Выберите другое время.');
        return;
    }
    
    const lessons = getLessons();
    const index = lessons.findIndex(l => l.id === currentEditingLessonId);
    
    if (index === -1) {
        alert('Занятие не найдено');
        return;
    }
    
    lessons[index] = {
        ...lessons[index],
        title,
        description,
        startTime: new Date(date).toISOString(),
        date: new Date(date).toISOString(),
        duration: duration,
        meetLink: meetLink || '',
        status: status,
        studentId,
        updatedAt: new Date().toISOString()
    };
    
    setLessons(lessons);
    
    closeLessonEditModal();
    loadAllLessons();
    
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Изменения сохранены!');
}

// ============================================
// УПРАВЛЕНИЕ СТАТУСОМ ЗАНЯТИЯ
// ============================================

/**
 * Начало занятия (изменение статуса на "в процессе")
 * @param {number} lessonId - ID занятия
 */
function startLesson(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    if (lesson.status === LessonStatus.CANCELLED) {
        alert('Невозможно начать отменённое занятие');
        return;
    }
    
    // Если есть ссылка на встречу, открываем её
    if (lesson.meetLink) {
        window.open(lesson.meetLink, '_blank');
    }
    
    // Обновляем статус
    lesson.status = LessonStatus.IN_PROGRESS;
    lesson.updatedAt = new Date().toISOString();
    setLessons(lessons);
    
    loadAllLessons();
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие начато!');
}

/**
 * Завершение занятия
 * @param {number} lessonId - ID занятия
 */
function completeLesson(lessonId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal(
            'Вы уверены, что хотите завершить это занятие?',
            function() {
                completeLessonAction(lessonId);
            },
            null,
            'Завершить занятие'
        );
    } else {
        if (confirm('Вы уверены, что хотите завершить это занятие?')) {
            completeLessonAction(lessonId);
        }
    }
}

/**
 * Действие завершения занятия
 * @param {number} lessonId - ID занятия
 */
function completeLessonAction(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    lesson.status = LessonStatus.COMPLETED;
    lesson.updatedAt = new Date().toISOString();
    setLessons(lessons);
    
    loadAllLessons();
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие завершено!');
}

/**
 * Отмена занятия
 * @param {number} lessonId - ID занятия
 */
function cancelLesson(lessonId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal(
            'Вы уверены, что хотите отменить это занятие?',
            function() {
                cancelLessonAction(lessonId);
            },
            null,
            'Отменить занятие'
        );
    } else {
        if (confirm('Вы уверены, что хотите отменить это занятие?')) {
            cancelLessonAction(lessonId);
        }
    }
}

/**
 * Действие отмены занятия
 * @param {number} lessonId - ID занятия
 */
function cancelLessonAction(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    lesson.status = LessonStatus.CANCELLED;
    lesson.updatedAt = new Date().toISOString();
    setLessons(lessons);
    
    loadAllLessons();
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие отменено');
}

/**
 * Перенос занятия
 * @param {number} lessonId - ID занятия
 */
function rescheduleLesson(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    // Открываем модалку с выбором новой даты
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'rescheduleModal';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    const currentDate = new Date(lesson.startTime || lesson.date);
    const dateValue = formatDateTimeForInput(currentDate);
    
    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Перенос занятия</h3>
                <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            
            <div class="form-group">
                <label>Новая дата и время *</label>
                <input type="datetime-local" id="rescheduleDateTime" value="${dateValue}">
            </div>
            
            <div class="form-group">
                <label>Причина переноса (опционально)</label>
                <textarea id="rescheduleReason" rows="2" placeholder="Укажите причину переноса..."></textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button class="btn-outline" onclick="this.closest('.modal').remove()">Отмена</button>
                <button class="btn-primary" onclick="confirmReschedule(${lessonId})">
                    <i class="fas fa-calendar-check"></i> Подтвердить перенос
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Подтверждение переноса занятия
 * @param {number} lessonId - ID занятия
 */
function confirmReschedule(lessonId) {
    const newDate = document.getElementById('rescheduleDateTime').value;
    const reason = document.getElementById('rescheduleReason').value;
    
    if (!newDate) {
        alert('Выберите новую дату и время');
        return;
    }
    
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    // Проверяем доступность слота
    if (!isTimeSlotAvailable(lesson.studentId, newDate, lesson.duration || 60, lessonId)) {
        alert('Это время уже занято. Выберите другое время.');
        return;
    }
    
    lesson.startTime = new Date(newDate).toISOString();
    lesson.date = new Date(newDate).toISOString();
    lesson.status = LessonStatus.RESCHEDULED;
    lesson.updatedAt = new Date().toISOString();
    if (reason) {
        lesson.rescheduleReason = reason;
    }
    
    setLessons(lessons);
    
    const modal = document.getElementById('rescheduleModal');
    if (modal) modal.remove();
    
    loadAllLessons();
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие перенесено!');
}

/**
 * Удаление занятия
 * @param {number} lessonId - ID занятия
 */
function deleteLesson(lessonId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal(
            'Вы уверены, что хотите удалить это занятие? Это действие нельзя отменить.',
            function() {
                deleteLessonAction(lessonId);
            },
            null,
            'Удалить занятие'
        );
    } else {
        if (confirm('Вы уверены, что хотите удалить это занятие? Это действие нельзя отменить.')) {
            deleteLessonAction(lessonId);
        }
    }
}

/**
 * Действие удаления занятия
 * @param {number} lessonId - ID занятия
 */
function deleteLessonAction(lessonId) {
    const lessons = getLessons();
    const filtered = lessons.filter(l => l.id !== lessonId);
    setLessons(filtered);
    
    loadAllLessons();
    if (typeof loadAdminData === 'function') {
        loadAdminData();
    }
    
    alert('Занятие удалено');
}

// ============================================
// ДЕТАЛЬНЫЙ ПРОСМОТР ЗАНЯТИЯ
// ============================================

/**
 * Открытие детальной страницы занятия
 * @param {number} lessonId - ID занятия
 */
function openLessonDetail(lessonId) {
    const lessons = getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        alert('Занятие не найдено');
        return;
    }
    
    const user = getCurrentUser();
    const users = getUsers();
    const student = users.find(u => u.id === lesson.studentId);
    
    const start = new Date(lesson.startTime || lesson.date);
    const dateStr = start.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long'
    });
    const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const yearStr = start.getFullYear();
    
    // Переключаемся на секцию деталей
    const detailSection = document.getElementById('lesson-detail');
    if (detailSection) {
        // Показываем секцию деталей
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
        detailSection.classList.add('active-section');
        document.getElementById('pageTitle').textContent = 'Занятие';
    }
    
    const container = document.getElementById('lessonDetailContainer');
    if (!container) return;
    
    let html = `
        <button class="btn-back" onclick="backFromLessonDetail()" style="margin-bottom: 16px;">
            <i class="fas fa-arrow-left"></i> Назад
        </button>
        
        <div class="lesson-detail-header">
            <div class="lesson-datetime">
                ${dateStr} в ${timeStr}
                <span class="lesson-year-badge">${yearStr}</span>
            </div>
            <div class="lesson-actions">
    `;
    
    if (user && user.role === 'admin') {
        html += `
            <button class="btn-edit btn-small" onclick="editLesson(${lesson.id})">
                <i class="fas fa-edit"></i> Ред.
            </button>
        `;
        
        if (lesson.status === LessonStatus.SCHEDULED || lesson.status === LessonStatus.RESCHEDULED) {
            html += `
                <button class="btn-success btn-small" onclick="startLesson(${lesson.id})">
                    <i class="fas fa-play"></i> Начать
                </button>
                <button class="btn-warning btn-small" onclick="rescheduleLesson(${lesson.id})">
                    <i class="fas fa-calendar-alt"></i> Перенести
                </button>
                <button class="btn-danger btn-small" onclick="cancelLesson(${lesson.id})">
                    <i class="fas fa-times"></i> Отменить
                </button>
            `;
        } else if (lesson.status === LessonStatus.IN_PROGRESS) {
            html += `
                <button class="btn-success btn-small" onclick="completeLesson(${lesson.id})">
                    <i class="fas fa-check"></i> Завершить
                </button>
            `;
        }
    } else if (user && user.role === 'student') {
        if (lesson.status === LessonStatus.SCHEDULED || lesson.status === LessonStatus.RESCHEDULED) {
            html += `
                <button class="btn-check btn-small" onclick="startLesson(${lesson.id})">
                    <i class="fas fa-play"></i> Начать
                </button>
            `;
        }
    }
    
    html += `
            </div>
        </div>
        
        ${lesson.meetLink ? `
            <div class="lesson-meet-link">
                <a href="${lesson.meetLink}" target="_blank" class="lesson-meet-btn">
                    <i class="fas fa-video"></i> Подключиться к занятию
                </a>
            </div>
        ` : ''}
        
        <div class="lesson-section">
            <h3>${lesson.title}</h3>
            ${lesson.description ? `<p style="color: #475569; line-height: 1.6;">${lesson.description}</p>` : ''}
            <div style="margin-top: 8px; color: #64748b; font-size: 14px;">
                <span>Ученик: <strong>${student?.name || 'Неизвестно'}</strong></span>
                <span style="margin-left: 16px;">Статус: <span class="badge ${getLessonStatusClass(lesson.status)}">${getLessonStatusText(lesson.status)}</span></span>
            </div>
        </div>
    `;
    
    // Материалы
    if (lesson.materials && lesson.materials.length > 0) {
        html += `
            <div class="lesson-section">
                <h3>📎 Материалы</h3>
                ${lesson.materials.map(m => {
                    if (m.type === 'link') {
                        return `
                            <div class="material-item">
                                <i class="fas fa-link" style="color: #4f46e5;"></i>
                                <a href="${m.content}" target="_blank" class="material-link-btn">${m.title}</a>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="material-item">
                                <i class="fas fa-file-alt" style="color: #4f46e5;"></i>
                                <div>
                                    <strong>${m.title}</strong>
                                    <p style="color: #64748b; margin-top: 4px; font-size: 13px;">${m.content}</p>
                                </div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }
    
    // Задания
    if (lesson.assignedTaskIds && lesson.assignedTaskIds.length > 0) {
        const allTasks = getTasks();
        const lessonTasks = allTasks.filter(t => lesson.assignedTaskIds.includes(t.id));
        
        if (lessonTasks.length > 0) {
            html += `
                <div class="lesson-section">
                    <h3>📝 Задания для выполнения</h3>
                    <div class="tasks-grid" style="margin-top: 16px;">
                        ${lessonTasks.map(task => {
                            const assignment = getAssignments().find(a => 
                                a.taskId === task.id && a.studentId === lesson.studentId
                            );
                            const status = assignment?.status || 'new';
                            
                            return `
                                <div class="task-card status-${status}" onclick="openStudentTaskFromLesson(${task.id}, '${lesson.studentId}')">
                                    <div class="task-card-header">
                                        <span class="task-theme">${getThemeName(task.theme)}</span>
                                        <span class="badge ${status === 'pending' ? 'badge-pending' : status === 'checked' ? 'badge-checked' : status === 'auto-checked' ? 'badge-auto-checked' : 'badge-new'}">
                                            ${getStatusText(status)}
                                        </span>
                                    </div>
                                    <div class="task-name" style="font-size: 15px;">${task.name}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

/**
 * Возврат из детального просмотра занятия
 */
function backFromLessonDetail() {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
        // Проверяем, откуда пришли
        if (document.getElementById('admin-day-lessons')?.classList.contains('active-section')) {
            switchToSection('admin-day-lessons');
        } else {
            switchToSection('admin-lessons');
        }
    } else {
        switchToSection('student-lessons');
    }
}

/**
 * Открытие задания из урока
 * @param {number} taskId - ID задания
 * @param {string} studentId - ID ученика
 */
function openStudentTaskFromLesson(taskId, studentId) {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
        const assignment = getAssignments().find(a => 
            a.taskId === taskId && a.studentId === studentId
        );
        if (assignment && typeof openReview === 'function') {
            openReview(assignment.id);
        } else {
            alert(`Задание "${getTasks().find(t => t.id === taskId)?.name || taskId}"`);
        }
    } else if (user && user.role === 'student') {
        if (typeof openStudentTask === 'function') {
            openStudentTask(taskId);
        } else {
            alert(`Открытие задания ${taskId}`);
        }
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Получение текста статуса урока
 * @param {string} status - Статус урока
 * @returns {string} Текст статуса
 */
function getLessonStatusText(status) {
    const statuses = {
        'scheduled': 'Запланировано',
        'rescheduled': 'Перенесено',
        'cancelled': 'Отменено',
        'completed': 'Завершено',
        'in_progress': 'В процессе'
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
 * Переключение на секцию
 * @param {string} sectionId - ID секции
 */
function switchToSection(sectionId) {
    // Используем глобальную функцию navigateTo если доступна
    if (typeof navigateTo === 'function') {
        navigateTo(sectionId);
    } else {
        // Простая реализация
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
        const target = document.getElementById(sectionId);
        if (target) target.classList.add('active-section');
    }
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем основные функции
window.renderAdminLessons = renderAdminLessons;
window.renderLessonsList = renderLessonsList;
window.filterLessons = filterLessons;
window.resetLessonFilters = resetLessonFilters;
window.loadAllLessons = loadAllLessons;

// Экспортируем функции создания/редактирования
window.openLessonCreateModal = openLessonCreateModal;
window.closeLessonModal = closeLessonModal;
window.saveLesson = saveLesson;
window.editLesson = editLesson;
window.closeLessonEditModal = closeLessonEditModal;
window.saveEditedLesson = saveEditedLesson;

// Экспортируем функции управления статусом
window.startLesson = startLesson;
window.completeLesson = completeLesson;
window.cancelLesson = cancelLesson;
window.rescheduleLesson = rescheduleLesson;
window.confirmReschedule = confirmReschedule;
window.deleteLesson = deleteLesson;

// Экспортируем функции детального просмотра
window.openLessonDetail = openLessonDetail;
window.backFromLessonDetail = backFromLessonDetail;

// Экспортируем функции материалов и заданий
window.addMaterial = addMaterial;
window.removeMaterial = removeMaterial;
window.updateMaterialType = updateMaterialType;
window.updateMaterialTitle = updateMaterialTitle;
window.updateMaterialContent = updateMaterialContent;
window.openTaskSelectorModal = openTaskSelectorModal;
window.closeTaskSelectorModal = closeTaskSelectorModal;
window.addSelectedTasksToLesson = addSelectedTasksToLesson;

// Экспортируем вспомогательные функции
window.isTimeSlotAvailable = isTimeSlotAvailable;
window.formatDateTimeForInput = formatDateTimeForInput;
window.loadStudentsToSelect = loadStudentsToSelect;
window.getLessonStatusText = getLessonStatusText;
window.getLessonStatusClass = getLessonStatusClass;
window.getLessonStatusColor = getLessonStatusColor;

// Сообщаем о загрузке модуля
console.log('📹 Модуль AdminLessons.js загружен');
