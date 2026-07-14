/**
 * ============================================
 * МОДУЛЬ: АДМИН - ГЛАВНАЯ (ДАШБОРД)
 * ============================================
 * 
 * Отвечает за:
 * - Отображение статистики (ученики, занятия, задания, проверки)
 * - Рендеринг мини-календаря с занятиями
 * - Отображение ближайших занятий
 * - Отображение заданий на проверке
 * ============================================
 */

/**
 * Рендеринг дашборда администратора
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderAdminDashboard(container) {
    const user = getCurrentUser();
    const students = getUsers().filter(u => u.role === 'student');
    const lessons = getLessons();
    const tasks = getTasks();
    const assignments = getAssignments();
    
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const weeklyLessonCount = getWeeklyLessonsCount(lessons);
    
    container.innerHTML = `
        <!-- Статистика -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">👥 Учеников</div>
                <div class="stat-number">${students.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">📅 Занятия на неделе</div>
                <div class="stat-number">${weeklyLessonCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">⏳ На проверке</div>
                <div class="stat-number">${pendingCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">📚 Всего заданий</div>
                <div class="stat-number">${tasks.length}</div>
            </div>
        </div>
        
        <!-- Дашборд с календарём -->
        <div class="dashboard-layout">
            <div class="calendar-column">
                <div class="calendar-section">
                    <h2>🗓️ Расписание</h2>
                    <div id="adminDashboardCalendar" class="calendar-container"></div>
                </div>
            </div>
            
            <div class="content-column">
                <div class="section-header" style="margin-top: 0;">
                    <h2>📹 Ближайшие занятия</h2>
                    <button class="btn-outline btn-small" onclick="navigateTo('admin-lessons')">Все занятия</button>
                </div>
                <div id="upcomingLessonsContainer">${renderUpcomingLessons(lessons, false)}</div>
            </div>
        </div>
        
        <!-- Задания на проверке -->
        <div class="section-header">
            <h2>⏳ Требуют проверки</h2>
            <button class="btn-outline btn-small" onclick="navigateTo('admin-review')">Все →</button>
        </div>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Ученик</th>
                        <th>Задание</th>
                        <th>Тип</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderPendingTasks(assignments, tasks, students)}
                </tbody>
            </table>
        </div>
    `;
    
    // Рендерим календарь
    setTimeout(() => {
        const calendarContainer = document.getElementById('adminDashboardCalendar');
        if (calendarContainer) {
            renderMiniCalendar(calendarContainer, lessons, { role: 'admin' });
        }
    }, 0);
}

/**
 * Получение количества занятий на текущей неделе
 * @param {Array} lessons - Массив занятий
 * @returns {number} Количество занятий на неделе
 */
function getWeeklyLessonsCount(lessons) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return lessons.filter(l => {
        const lessonDate = new Date(l.startTime || l.date);
        return lessonDate >= startOfWeek && lessonDate <= endOfWeek && l.status !== 'cancelled';
    }).length;
}

/**
 * Рендеринг ближайших занятий
 * @param {Array} lessons - Массив занятий
 * @param {boolean} isStudent - Режим ученика (для фильтрации)
 * @returns {string} HTML-строка
 */
function renderUpcomingLessons(lessons, isStudent = false) {
    const now = new Date();
    const upcoming = lessons
        .filter(l => {
            const lessonDate = new Date(l.startTime || l.date);
            return lessonDate >= now && l.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date))
        .slice(0, 6);
    
    if (!upcoming.length) {
        return '<p style="text-align: center; color: #64748b; padding: 20px;">Нет ближайших занятий</p>';
    }
    
    return upcoming.map(lesson => {
        const start = new Date(lesson.startTime || lesson.date);
        const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        const student = isStudent ? null : getUsers().find(u => u.id === lesson.studentId);
        const isToday = start.toDateString() === now.toDateString();
        const isTomorrow = new Date(start).setHours(0,0,0,0) === new Date(new Date().setDate(now.getDate() + 1)).setHours(0,0,0,0);
        
        let dateDisplay = dateStr;
        if (isToday) dateDisplay = 'Сегодня';
        else if (isTomorrow) dateDisplay = 'Завтра';
        
        return `
            <div class="card" style="margin-bottom: 12px; border-left: 4px solid #4f46e5; padding: 16px 20px; background: white; border-radius: 16px; border: 1px solid #eef2f6; cursor: pointer;" onclick="openLessonDetail(${lesson.id})">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="font-size: 16px; display: block; margin-bottom: 4px;">${lesson.title || 'Без названия'}</strong>
                        <div style="color: #64748b; font-size: 13px;">
                            <i class="far fa-calendar-alt" style="margin-right: 4px;"></i>
                            ${dateDisplay} в ${timeStr}
                        </div>
                        ${!isStudent && student ? `<div style="color: #64748b; font-size: 13px; margin-top: 4px;">👤 ${student.name}</div>` : ''}
                        ${lesson.meetLink ? `
                            <a href="${lesson.meetLink}" target="_blank" style="color: #4f46e5; font-size: 13px; text-decoration: none; margin-top: 4px; display: inline-block;" onclick="event.stopPropagation();">
                                <i class="fas fa-video"></i> Присоединиться
                            </a>
                        ` : ''}
                    </div>
                    <span class="badge badge-new">${getStatusText(lesson.status)}</span>
                </div>
                ${lesson.description ? `<div style="color: #64748b; font-size: 13px; margin-top: 8px;">${lesson.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Рендеринг заданий на проверке
 * @param {Array} assignments - Массив назначений
 * @param {Array} tasks - Массив заданий
 * @param {Array} students - Массив учеников
 * @returns {string} HTML-строка
 */
function renderPendingTasks(assignments, tasks, students) {
    const pending = assignments.filter(a => a.status === 'pending').slice(0, 5);
    
    if (!pending.length) {
        return '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Нет работ на проверку</td></tr>';
    }
    
    return pending.map(a => {
        const task = tasks.find(t => t.id === a.taskId);
        const student = students.find(s => s.id === a.studentId);
        const taskType = task ? getTaskTypeName(task.type, task.matchingSubtype) : '?';
        
        return `
            <tr>
                <td>${student?.name || '?'}</td>
                <td>${task?.name || '?'}</td>
                <td><span class="badge">${taskType}</span></td>
                <td>${a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '-'}</td>
                <td>
                    <button class="btn-outline btn-small" onclick="openReviewDetail(${a.id})">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Рендеринг мини-календаря (использует shared модуль)
 * @param {HTMLElement} container - Контейнер для календаря
 * @param {Array} lessons - Массив занятий
 */
function renderMiniCalendar(container, lessons) {
    if (typeof renderCalendar === 'function') {
        renderCalendar(container, lessons, { role: 'admin' });
    } else if (typeof renderMiniCalendar === 'function') {
        renderMiniCalendar(container, lessons, { role: 'admin' });
    } else {
        // Простая версия календаря если модуль не загружен
        renderSimpleCalendar(container, lessons);
    }
}

/**
 * Простая версия календаря (если shared модуль не загружен)
 * @param {HTMLElement} container - Контейнер для календаря
 * @param {Array} lessons - Массив занятий
 */
function renderSimpleCalendar(container, lessons) {
    if (!container) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() || 7;
    const totalDays = lastDay.getDate();
    
    const lessonsByDate = {};
    lessons.forEach(lesson => {
        if (lesson.status === 'cancelled') return;
        const lessonDate = new Date(lesson.startTime || lesson.date);
        const dateKey = `${lessonDate.getFullYear()}-${lessonDate.getMonth() + 1}-${lessonDate.getDate()}`;
        if (!lessonsByDate[dateKey]) lessonsByDate[dateKey] = [];
        lessonsByDate[dateKey].push(lesson);
    });
    
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    
    let html = `
        <div class="calendar-header">
            <span class="calendar-month">${monthNames[month]} ${year}</span>
        </div>
        <div class="calendar-weekdays">
            ${weekDays.map(day => `<div>${day}</div>`).join('')}
        </div>
        <div class="calendar-days">
    `;
    
    for (let i = 1; i < startDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dateKey = `${year}-${month + 1}-${day}`;
        const hasLessons = lessonsByDate[dateKey] && lessonsByDate[dateKey].length > 0;
        const isToday = dateKey === todayKey;
        const lessonCount = lessonsByDate[dateKey]?.length || 0;
        
        let classes = 'calendar-day';
        if (hasLessons) classes += ' has-lessons';
        if (isToday) classes += ' today';
        
        html += `<div class="${classes}" onclick="onCalendarDayClick(${year}, ${month + 1}, ${day}, 'admin')">
            <span>${day}</span>
            ${hasLessons && lessonCount > 1 ? `<span class="lesson-count">${lessonCount}</span>` : ''}
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Открытие деталей задания на проверке
 * @param {number} assignmentId - ID назначения
 */
function openReviewDetail(assignmentId) {
    // Если есть функция открытия проверки из модуля AdminReview
    if (typeof openReview === 'function') {
        openReview(assignmentId);
    } else {
        alert(`Детальный просмотр работы #${assignmentId}`);
    }
}

/**
 * Открытие деталей занятия
 * @param {number} lessonId - ID занятия
 */
function openLessonDetail(lessonId) {
    // Если есть функция открытия деталей занятия
    if (typeof openLessonDetail === 'function') {
        openLessonDetail(lessonId);
    } else if (typeof showLessonDetailModal === 'function') {
        const lesson = getLessons().find(l => l.id === lessonId);
        if (lesson) {
            showLessonDetailModal(lesson, { isStudent: false });
        }
    } else {
        alert(`Детали занятия #${lessonId}`);
    }
}

/**
 * Загрузка данных админа для обновления
 */
function loadAdminData() {
    // Обновляем статистику на дашборде
    const students = getUsers().filter(u => u.role === 'student');
    const lessons = getLessons();
    const tasks = getTasks();
    const assignments = getAssignments();
    
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const weeklyLessonCount = getWeeklyLessonsCount(lessons);
    
    // Обновляем элементы на странице, если они существуют
    const statStudents = document.getElementById('adminStatStudents');
    if (statStudents) statStudents.textContent = students.length;
    
    const statPending = document.getElementById('adminStatPending');
    if (statPending) statPending.textContent = pendingCount;
    
    const statTasks = document.getElementById('adminStatTasks');
    if (statTasks) statTasks.textContent = tasks.length;
    
    const statWeekly = document.getElementById('adminWeeklyLessons');
    if (statWeekly) statWeekly.textContent = weeklyLessonCount;
    
    // Обновляем календарь
    const calendarContainer = document.getElementById('adminDashboardCalendar');
    if (calendarContainer) {
        renderMiniCalendar(calendarContainer, lessons);
    }
    
    // Обновляем ближайшие занятия
    const upcomingContainer = document.getElementById('upcomingLessonsContainer');
    if (upcomingContainer) {
        upcomingContainer.innerHTML = renderUpcomingLessons(lessons, false);
    }
    
    // Обновляем список заданий на проверке
    const pendingContainer = document.querySelector('#admin-dashboard .table-wrapper tbody');
    if (pendingContainer) {
        const studentsList = getUsers().filter(u => u.role === 'student');
        pendingContainer.innerHTML = renderPendingTasks(assignments, tasks, studentsList);
    }
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем основную функцию
window.renderAdminDashboard = renderAdminDashboard;

// Экспортируем вспомогательные функции
window.getWeeklyLessonsCount = getWeeklyLessonsCount;
window.renderUpcomingLessons = renderUpcomingLessons;
window.renderPendingTasks = renderPendingTasks;
window.renderMiniCalendar = renderMiniCalendar;
window.renderSimpleCalendar = renderSimpleCalendar;
window.openReviewDetail = openReviewDetail;
window.openLessonDetail = openLessonDetail;
window.loadAdminData = loadAdminData;

// Сообщаем о загрузке модуля
console.log('📊 Модуль AdminDashboard.js загружен');
