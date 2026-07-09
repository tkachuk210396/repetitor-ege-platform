/**
 * ============================================
 * МОДУЛЬ: КАЛЕНДАРЬ (SHARED)
 * ============================================
 * 
 * Отвечает за:
 * - Рендеринг мини-календаря
 * - Отображение занятий на датах
 * - Навигацию по месяцам
 * - Клик по дате для просмотра занятий
 * ============================================
 */

/**
 * Рендеринг мини-календаря в контейнере
 * @param {HTMLElement} container - Контейнер для календаря
 * @param {Array} lessons - Массив занятий
 * @param {Object} options - Опции (currentDate, onDayClick, role)
 */
function renderMiniCalendar(container, lessons, options = {}) {
    if (!container) return;
    
    const now = options.currentDate || new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const role = options.role || 'admin';
    const onDayClick = options.onDayClick || null;
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() || 7;
    const totalDays = lastDay.getDate();
    
    // Группируем занятия по датам
    const lessonsByDate = {};
    const user = getCurrentUser ? getCurrentUser() : null;
    
    lessons.forEach(lesson => {
        if (lesson.status === 'cancelled') return;
        
        // Для ученика показываем только его занятия
        if (role === 'student' && user && lesson.studentId !== user.id) return;
        
        const lessonDate = new Date(lesson.startTime || lesson.date);
        const dateKey = `${lessonDate.getFullYear()}-${lessonDate.getMonth() + 1}-${lessonDate.getDate()}`;
        
        if (!lessonsByDate[dateKey]) {
            lessonsByDate[dateKey] = [];
        }
        lessonsByDate[dateKey].push(lesson);
    });
    
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changeCalendarMonth(${year}, ${month}, '${role}', -1, '${container.id || 'calendar'}')">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="calendar-month">${monthNames[month]} ${year}</span>
            <button class="calendar-nav-btn" onclick="changeCalendarMonth(${year}, ${month}, '${role}', 1, '${container.id || 'calendar'}')">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="calendar-weekdays">
            ${weekDays.map(day => `<div>${day}</div>`).join('')}
        </div>
        <div class="calendar-days">
    `;
    
    // Пустые ячейки перед первым днём
    for (let i = 1; i < startDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Дни месяца
    for (let day = 1; day <= totalDays; day++) {
        const dateKey = `${year}-${month + 1}-${day}`;
        const hasLessons = lessonsByDate[dateKey] && lessonsByDate[dateKey].length > 0;
        const isToday = dateKey === todayKey;
        const lessonCount = lessonsByDate[dateKey]?.length || 0;
        
        let classes = 'calendar-day';
        if (hasLessons) classes += ' has-lessons';
        if (isToday) classes += ' today';
        
        const clickHandler = onDayClick 
            ? `onclick="(${onDayClick.toString()})(${year}, ${month + 1}, ${day}, '${role}')"` 
            : `onclick="onCalendarDayClick(${year}, ${month + 1}, ${day}, '${role}')"`;
        
        html += `<div class="${classes}" ${clickHandler}>
            <span>${day}</span>
            ${hasLessons && lessonCount > 1 ? `<span class="lesson-count">${lessonCount}</span>` : ''}
        </div>`;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    // Сохраняем текущий месяц для навигации
    container.dataset.year = year;
    container.dataset.month = month;
}

/**
 * Изменение месяца в календаре
 * @param {number} year - Текущий год
 * @param {number} month - Текущий месяц
 * @param {string} role - Роль пользователя ('admin' | 'student')
 * @param {number} delta - Смещение (-1 или 1)
 * @param {string} containerId - ID контейнера
 */
function changeCalendarMonth(year, month, role, delta, containerId) {
    const newDate = new Date(year, month + delta, 1);
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const lessons = getLessons ? getLessons() : [];
    const user = getCurrentUser ? getCurrentUser() : null;
    
    // Фильтруем занятия для ученика
    let filteredLessons = lessons;
    if (role === 'student' && user) {
        filteredLessons = lessons.filter(l => l.studentId === user.id);
    }
    
    renderMiniCalendar(container, filteredLessons, {
        currentDate: newDate,
        role: role,
        onDayClick: window._calendarOnDayClick || null
    });
}

/**
 * Обработчик клика по дню в календаре
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @param {number} day - День
 * @param {string} role - Роль пользователя
 */
function onCalendarDayClick(year, month, day, role) {
    const lessons = getLessons ? getLessons() : [];
    const user = getCurrentUser ? getCurrentUser() : null;
    
    // Фильтруем занятия для выбранной даты
    const dayLessons = lessons.filter(lesson => {
        const lessonDate = new Date(lesson.startTime || lesson.date);
        if (lessonDate.getFullYear() !== year || 
            lessonDate.getMonth() + 1 !== month || 
            lessonDate.getDate() !== day) {
            return false;
        }
        
        if (lesson.status === 'cancelled') return false;
        
        if (role === 'student' && user) {
            return lesson.studentId === user.id;
        }
        return true;
    });
    
    if (dayLessons.length === 0) {
        // Нет занятий в этот день
        const dateObj = new Date(year, month - 1, day);
        const dateStr = dateObj.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
        
        // Если есть функция создания занятия, предлагаем создать
        if (role === 'admin' && typeof openLessonCreateModal === 'function') {
            if (confirm(`Нет занятий на ${dateStr}. Создать новое занятие?`)) {
                openLessonCreateModal(dateObj);
            }
        } else {
            alert(`Нет занятий на ${dateStr}`);
        }
    } else if (dayLessons.length === 1) {
        // Одно занятие - открываем его детали
        if (typeof openLessonDetail === 'function') {
            openLessonDetail(dayLessons[0].id);
        } else if (typeof openStudentLessonDetail === 'function') {
            openStudentLessonDetail(dayLessons[0].id);
        } else {
            alert(`Занятие: ${dayLessons[0].title || 'Без названия'}`);
        }
    } else {
        // Несколько занятий - показываем список
        const dateObj = new Date(year, month - 1, day);
        const dateStr = dateObj.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
        
        // Показываем список занятий в модальном окне или переходим на страницу дня
        if (role === 'admin' && typeof showDayLessons === 'function') {
            showDayLessons(year, month, day, dayLessons);
        } else {
            showDayLessonsModal(dateStr, dayLessons);
        }
    }
}

/**
 * Показ списка занятий на день в модальном окне
 * @param {string} dateStr - Строка с датой
 * @param {Array} lessons - Массив занятий
 */
function showDayLessonsModal(dateStr, lessons) {
    const users = getUsers ? getUsers() : [];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'dayLessonsModal';
    modal.onclick = function(e) {
        if (e.target === this) this.remove();
    };
    
    let lessonsHtml = lessons.map(lesson => {
        const start = new Date(lesson.startTime || lesson.date);
        const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const student = users.find(u => u.id === lesson.studentId);
        
        return `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 8px;
                border: 1px solid #eef2f6;
                border-left: 4px solid #4f46e5;
                cursor: pointer;
                transition: 0.15s;
            " onclick="this.closest('.modal').remove(); 
                ${typeof openLessonDetail === 'function' ? `openLessonDetail(${lesson.id})` : 
                  typeof openStudentLessonDetail === 'function' ? `openStudentLessonDetail(${lesson.id})` : 
                  `alert('Занятие: ${lesson.title || 'Без названия'}')`}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${lesson.title || 'Без названия'}</strong>
                        <div style="color: #64748b; font-size: 13px;">
                            ${timeStr} · ${student ? student.name : 'Ученик не найден'}
                        </div>
                    </div>
                    <span class="badge badge-new">${getStatusText ? getStatusText(lesson.status) : lesson.status}</span>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation();">
            <div class="modal-header">
                <h3>📅 Занятия на ${dateStr}</h3>
                <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            ${lessonsHtml}
            <div style="text-align: right; margin-top: 16px;">
                <button class="btn-outline btn-small" onclick="this.closest('.modal').remove()">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Обновление календаря (перерендер)
 * @param {string} containerId - ID контейнера
 * @param {string} role - Роль пользователя
 */
function refreshCalendar(containerId, role = 'admin') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const lessons = getLessons ? getLessons() : [];
    const user = getCurrentUser ? getCurrentUser() : null;
    
    let filteredLessons = lessons;
    if (role === 'student' && user) {
        filteredLessons = lessons.filter(l => l.studentId === user.id);
    }
    
    const year = parseInt(container.dataset.year) || new Date().getFullYear();
    const month = parseInt(container.dataset.month) || new Date().getMonth();
    
    renderMiniCalendar(container, filteredLessons, {
        currentDate: new Date(year, month, 1),
        role: role,
        onDayClick: window._calendarOnDayClick || null
    });
}

/**
 * Установка обработчика клика по дню
 * @param {Function} handler - Функция-обработчик
 */
function setCalendarDayClickHandler(handler) {
    window._calendarOnDayClick = handler;
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем основные функции
window.renderMiniCalendar = renderMiniCalendar;
window.changeCalendarMonth = changeCalendarMonth;
window.onCalendarDayClick = onCalendarDayClick;
window.showDayLessonsModal = showDayLessonsModal;
window.refreshCalendar = refreshCalendar;
window.setCalendarDayClickHandler = setCalendarDayClickHandler;

// Сообщаем о загрузке модуля
console.log('📅 Модуль calendar.js загружен');
