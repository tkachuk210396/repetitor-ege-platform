/**
 * ============================================
 * МОДУЛЬ: МОИ УРОКИ (УЧЕНИК)
 * ============================================
 * 
 * Отвечает за:
 * - Отображение списка уроков ученика в виде карточек
 * - Фильтрацию уроков по статусу
 * - Отображение статистики по урокам
 * - Открытие детальной страницы урока
 * - Подключение к онлайн-встрече
 * ============================================
 */

/**
 * Рендеринг страницы "Мои уроки" для ученика
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderStudentLessons(container) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Получаем уроки ученика
    const allLessons = getLessons();
    const userLessons = allLessons.filter(l => l.studentId === user.id);
    
    // Статистика
    const totalLessons = userLessons.length;
    const completed = userLessons.filter(l => l.status === 'completed').length;
    const scheduled = userLessons.filter(l => l.status === 'scheduled' || l.status === 'rescheduled').length;
    const upcoming = userLessons.filter(l => {
        const lessonDate = new Date(l.startTime || l.date);
        return lessonDate >= new Date() && (l.status === 'scheduled' || l.status === 'rescheduled');
    }).length;
    
    container.innerHTML = `
        <!-- Верхняя панель -->
        <div class="top-bar">
            <h1 class="page-title">📹 Мои уроки</h1>
            <div class="role-indicator">👤 Ученик</div>
        </div>
        
        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card student">
                <div class="stat-title">📊 Всего уроков</div>
                <div class="stat-number">${totalLessons}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">✅ Пройдено</div>
                <div class="stat-number">${completed}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">📅 Запланировано</div>
                <div class="stat-number">${scheduled}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">🔜 Ближайшие</div>
                <div class="stat-number">${upcoming}</div>
            </div>
        </div>
        
        <!-- Фильтры -->
        <div class="filter-bar">
            <button class="filter-btn active" data-filter="all" onclick="filterStudentLessons('all', this)">Все уроки</button>
            <button class="filter-btn" data-filter="scheduled" onclick="filterStudentLessons('scheduled', this)">📅 Запланированы</button>
            <button class="filter-btn" data-filter="completed" onclick="filterStudentLessons('completed', this)">✅ Пройдены</button>
            <button class="filter-btn" data-filter="rescheduled" onclick="filterStudentLessons('rescheduled', this)">🔄 Перенесены</button>
            <button class="filter-btn" data-filter="cancelled" onclick="filterStudentLessons('cancelled', this)">❌ Отменены</button>
        </div>
        
        <!-- Список уроков -->
        <div id="studentLessonsList">
            ${renderLessonsCards(userLessons)}
        </div>
    `;
}

/**
 * Рендеринг карточек уроков
 * @param {Array} lessons - Массив уроков
 * @returns {string} HTML-строка
 */
function renderLessonsCards(lessons) {
    if (!lessons || lessons.length === 0) {
        return `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 24px; border: 1px solid #eef2f6;">
                <i class="fas fa-calendar-plus" style="font-size: 48px; color: #4f46e5; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px;">Нет уроков</h3>
                <p style="color: #64748b;">У вас пока нет запланированных уроков</p>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Свяжитесь с репетитором для записи</p>
            </div>
        `;
    }
    
    // Сортируем по дате (сначала ближайшие)
    const sorted = [...lessons].sort((a, b) => {
        const dateA = new Date(a.startTime || a.date);
        const dateB = new Date(b.startTime || b.date);
        return dateA - dateB;
    });
    
    return sorted.map(lesson => {
        const start = new Date(lesson.startTime || lesson.date);
        const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const isToday = start.toDateString() === new Date().toDateString();
        const isUpcoming = start >= new Date() && (lesson.status === 'scheduled' || lesson.status === 'rescheduled');
        
        let dateDisplay = dateStr;
        if (isToday) dateDisplay = 'Сегодня';
        
        const statusText = getLessonStatusText(lesson.status);
        const statusClass = getLessonStatusClass(lesson.status);
        const statusColor = getLessonStatusColor(lesson.status);
        
        // Ищем преподавателя
        const users = getUsers();
        const teacher = users.find(u => u.id === lesson.teacherId);
        const teacherName = teacher ? teacher.name : 'Репетитор';
        
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
            " onclick="openStudentLessonDetail(${lesson.id})">
                <div style="flex: 1; min-width: 200px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${lesson.title || 'Урок'}</h3>
                        <span class="badge ${statusClass}">${statusText}</span>
                        ${isUpcoming ? '<span class="badge badge-new" style="background: #dbeafe; color: #1e40af;">🔜 Скоро</span>' : ''}
                    </div>
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
                        <i class="far fa-calendar-alt" style="margin-right: 4px;"></i>
                        ${dateDisplay} в ${timeStr}
                        <span style="margin: 0 8px;">·</span>
                        <i class="fas fa-user-graduate" style="margin-right: 4px;"></i>
                        ${teacherName}
                    </div>
                    ${lesson.description ? `
                        <div style="color: #64748b; font-size: 14px; margin-top: 6px; line-height: 1.5;">
                            ${lesson.description}
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${lesson.meetLink && (lesson.status === 'scheduled' || lesson.status === 'rescheduled') ? `
                        <a href="${lesson.meetLink}" target="_blank" class="btn-primary" style="
                            padding: 8px 16px;
                            background: #4f46e5;
                            color: white;
                            border: none;
                            border-radius: 30px;
                            font-weight: 600;
                            font-size: 13px;
                            text-decoration: none;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            transition: 0.15s;
                        " onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'"
                        onclick="event.stopPropagation();">
                            <i class="fas fa-video"></i> Присоединиться
                        </a>
                    ` : ''}
                    <button class="btn-outline" onclick="event.stopPropagation(); openStudentLessonDetail(${lesson.id})" style="
                        padding: 8px 16px;
                        background: white;
                        border: 2px solid #e2e8f0;
                        border-radius: 30px;
                        color: #334155;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: 0.15s;
                    " onmouseover="this.style.borderColor='#4f46e5'" onmouseout="this.style.borderColor='#e2e8f0'">
                        <i class="fas fa-info-circle"></i> Подробнее
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Фильтрация уроков по статусу
 * @param {string} filter - Статус для фильтрации
 * @param {HTMLElement} btn - Кнопка фильтра
 */
function filterStudentLessons(filter, btn) {
    // Обновляем активную кнопку
    document.querySelectorAll('#currentSection .filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    
    const user = getCurrentUser();
    if (!user) return;
    
    const allLessons = getLessons();
    let filtered = allLessons.filter(l => l.studentId === user.id);
    
    if (filter !== 'all') {
        filtered = filtered.filter(l => l.status === filter);
    }
    
    const container = document.getElementById('studentLessonsList');
    if (container) {
        container.innerHTML = renderLessonsCards(filtered);
    }
}

/**
 * Открытие детальной страницы урока для ученика
 * @param {number} lessonId - ID урока
 */
function openStudentLessonDetail(lessonId) {
    const lesson = getLessons().find(l => l.id === lessonId);
    if (!lesson) {
        alert('Урок не найден');
        return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    const users = getUsers();
    const teacher = users.find(u => u.id === lesson.teacherId);
    const teacherName = teacher ? teacher.name : 'Репетитор';
    
    const start = new Date(lesson.startTime || lesson.date);
    const dateStr = start.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const isUpcoming = start >= new Date() && (lesson.status === 'scheduled' || lesson.status === 'rescheduled');
    const statusText = getLessonStatusText(lesson.status);
    const statusColor = getLessonStatusColor(lesson.status);
    
    // Проверяем, есть ли у ученика назначенные задания для этого урока
    const lessonTasks = [];
    if (lesson.assignedTaskIds && lesson.assignedTaskIds.length > 0) {
        const allTasks = getTasks();
        lesson.assignedTaskIds.forEach(taskId => {
            const task = allTasks.find(t => t.id === taskId);
            if (task) {
                const assignment = getAssignments().find(a => a.taskId === taskId && a.studentId === user.id);
                lessonTasks.push({
                    ...task,
                    status: assignment?.status || 'new'
                });
            }
        });
    }
    
    // Создаём модальное окно с деталями урока
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'lessonDetailModal';
    modal.onclick = function(e) {
        if (e.target === this) closeLessonDetailModal();
    };
    
    let html = `
        <div class="modal-content" style="max-width: 800px;" onclick="event.stopPropagation();">
            <div class="modal-header">
                <h3>📹 ${lesson.title || 'Урок'}</h3>
                <span class="close-modal" onclick="closeLessonDetailModal()">&times;</span>
            </div>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
                <span class="badge ${getLessonStatusClass(lesson.status)}" style="font-size: 14px; padding: 6px 16px;">${statusText}</span>
                ${isUpcoming ? '<span class="badge badge-new" style="background: #dbeafe; color: #1e40af; font-size: 14px; padding: 6px 16px;">🔜 Скоро</span>' : ''}
            </div>
            
            <div style="color: #64748b; font-size: 15px; margin-bottom: 16px;">
                <div style="margin-bottom: 4px;">
                    <i class="far fa-calendar-alt" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                    ${dateStr} в ${timeStr}
                </div>
                <div style="margin-bottom: 4px;">
                    <i class="fas fa-user-graduate" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                    ${teacherName}
                </div>
                ${lesson.duration ? `
                    <div style="margin-bottom: 4px;">
                        <i class="fas fa-clock" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                        ${lesson.duration} мин.
                    </div>
                ` : ''}
                ${lesson.meetLink ? `
                    <div style="margin-bottom: 4px;">
                        <i class="fas fa-link" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                        <a href="${lesson.meetLink}" target="_blank" style="color: #4f46e5; text-decoration: none;">${lesson.meetLink}</a>
                    </div>
                ` : ''}
            </div>
            
            ${lesson.description ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 4px;">📝 Описание:</strong>
                    <p style="color: #334155; line-height: 1.6; margin: 0;">${lesson.description}</p>
                </div>
            ` : ''}
            
            ${lesson.materials && lesson.materials.length > 0 ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 8px;">📎 Материалы урока:</strong>
                    ${lesson.materials.map(m => `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                            <i class="fas fa-${m.type === 'link' ? 'link' : 'file-alt'}" style="color: #4f46e5;"></i>
                            ${m.type === 'link' ? 
                                `<a href="${m.content}" target="_blank" style="color: #4f46e5; text-decoration: none;">${m.title}</a>` :
                                `<span>${m.title}: ${m.content}</span>`
                            }
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${lessonTasks.length > 0 ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 8px;">📝 Задания к уроку:</strong>
                    ${lessonTasks.map(task => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                            <span>${task.name}</span>
                            <span class="badge ${task.status === 'pending' ? 'badge-pending' : task.status === 'checked' ? 'badge-checked' : task.status === 'auto-checked' ? 'badge-auto-checked' : 'badge-new'}">${getStatusText(task.status)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px;">
                ${lesson.meetLink && isUpcoming ? `
                    <a href="${lesson.meetLink}" target="_blank" class="btn-primary" style="text-decoration: none;">
                        <i class="fas fa-video"></i> Присоединиться к уроку
                    </a>
                ` : ''}
                <button class="btn-outline" onclick="closeLessonDetailModal()">Закрыть</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

/**
 * Закрытие модального окна с деталями урока
 */
function closeLessonDetailModal() {
    const modal = document.getElementById('lessonDetailModal');
    if (modal) modal.remove();
}

/**
 * Получение текста статуса урока
 * @param {string} status - Статус урока
 * @returns {string} Текст статуса
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

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем главную функцию
window.renderStudentLessons = renderStudentLessons;

// Экспортируем функции фильтрации и деталей
window.filterStudentLessons = filterStudentLessons;
window.openStudentLessonDetail = openStudentLessonDetail;
window.closeLessonDetailModal = closeLessonDetailModal;

// Экспортируем вспомогательные функции
window.getLessonStatusText = getLessonStatusText;
window.getLessonStatusClass = getLessonStatusClass;
window.getLessonStatusColor = getLessonStatusColor;

// Сообщаем о загрузке модуля
console.log('📹 Модуль StudentLessons.js загружен');
