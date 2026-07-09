/**
 * ============================================
 * МОДУЛЬ: ДАШБОРД УЧЕНИКА
 * ============================================
 * 
 * Отвечает за:
 * - Отображение статистики ученика
 * - Календарь с расписанием
 * - Ближайшие уроки
 * - Последние задания
 * ============================================
 */

/**
 * Рендеринг дашборда ученика
 */
function renderStudentDashboard(container) {
    console.log('📊 Рендеринг дашборда ученика');
    
    const user = getCurrentUser();
    if (!user) return;
    
    const lessons = getLessons().filter(l => l.studentId === user.id);
    const assignments = getAssignments().filter(a => a.studentId === user.id);
    
    const completed = assignments.filter(a => a.status === 'checked' || a.status === 'auto-checked').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const progress = assignments.length ? Math.round(completed / assignments.length * 100) : 0;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card student">
                <div class="stat-title">📊 Прогресс</div>
                <div class="stat-number">${progress}%</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">✅ Выполнено</div>
                <div class="stat-number">${completed}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">⏳ В работе</div>
                <div class="stat-number">${pending}</div>
            </div>
            <div class="stat-card student">
                <div class="stat-title">📅 Занятий</div>
                <div class="stat-number">${lessons.length}</div>
            </div>
        </div>
        
        <div class="dashboard-layout">
            <div class="calendar-column">
                <div class="calendar-section">
                    <h2>🗓️ Моё расписание</h2>
                    <div id="studentDashboardCalendar" class="calendar-container"></div>
                </div>
            </div>
            
            <div class="content-column">
                <div class="section-header" style="margin-top: 0;">
                    <h2>📹 Ближайшие уроки</h2>
                </div>
                ${renderUpcomingLessons(lessons, true)}
            </div>
        </div>
        
        <div class="section-header">
            <h2>📝 Мои последние задания</h2>
            <button class="btn-outline btn-small" onclick="navigateTo('student-tasks')">Все →</button>
        </div>
        <div class="tasks-grid" id="studentRecentTasks"></div>
    `;
    
    // Рендерим календарь
    setTimeout(() => {
        const calendarContainer = document.getElementById('studentDashboardCalendar');
        if (calendarContainer && typeof renderMiniCalendar === 'function') {
            renderMiniCalendar(calendarContainer, lessons, { role: 'student' });
        }
    }, 0);
    
    // Рендерим последние задания
    loadStudentRecentTasks();
}

/**
 * Рендеринг ближайших уроков
 */
function renderUpcomingLessons(lessons, isStudent = false) {
    const now = new Date();
    const upcoming = lessons
        .filter(l => new Date(l.startTime || l.date) >= now && l.status !== 'cancelled')
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
        
        return `
            <div class="card" style="margin-bottom: 12px; border-left: 4px solid #4f46e5; padding: 16px 20px; background: white; border-radius: 16px; border: 1px solid #eef2f6;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <strong style="font-size: 16px; display: block; margin-bottom: 4px;">${lesson.title || 'Без названия'}</strong>
                        <div style="color: #64748b; font-size: 13px;">
                            <i class="far fa-calendar-alt" style="margin-right: 4px;"></i>
                            ${dateStr} в ${timeStr}
                        </div>
                        ${!isStudent && student ? `<div style="color: #64748b; font-size: 13px;">👤 ${student.name}</div>` : ''}
                        ${lesson.meetLink ? `
                            <a href="${lesson.meetLink}" target="_blank" style="color: #4f46e5; font-size: 13px; text-decoration: none; margin-top: 4px; display: inline-block;">
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
 * Загрузка последних заданий ученика
 */
function loadStudentRecentTasks() {
    const user = getCurrentUser();
    const container = document.getElementById('studentRecentTasks');
    if (!container) return;
    
    const studentAssignments = getAssignments().filter(a => a.studentId === user.id);
    const recent = studentAssignments.slice(-3).reverse();
    
    if (!recent.length) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Нет заданий</p>';
        return;
    }
    
    container.innerHTML = recent.map(a => {
        const task = getTasks().find(t => t.id === a.taskId);
        if (!task) return '';
        
        return `
            <div class="task-card status-${a.status}" onclick="openStudentTask(${task.id})">
                <div class="task-card-header">
                    <span class="task-theme">${getThemeName(task.theme)}</span>
                    <span class="badge ${a.status === 'pending' ? 'badge-pending' : a.status === 'checked' ? 'badge-checked' : a.status === 'auto-checked' ? 'badge-auto-checked' : 'badge-new'}">${getStatusText(a.status)}</span>
                </div>
                <div class="task-name">${task.name}</div>
                <div class="task-desc">${task.description || task.subtasks?.[0]?.description?.substring(0, 60) || ''}</div>
                <div class="task-meta">
                    <span><i class="far fa-calendar"></i> ${a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'Новое'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Экспортируем в глобальную область видимости
window.renderStudentDashboard = renderStudentDashboard;

console.log('📊 Модуль StudentDashboard.js загружен');
