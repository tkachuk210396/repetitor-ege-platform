/**
 * ============================================
 * МОДУЛЬ РОУТЕРА (ROUTER)
 * ============================================
 * 
 * Отвечает за:
 * - Навигацию между разделами приложения
 * - Построение меню навигации
 * - Рендеринг контента в зависимости от роли пользователя
 * - Маршрутизацию между страницами
 * ============================================
 */

/**
 * Конфигурация навигации для разных ролей
 */
const NAV_CONFIG = {
    admin: [
        { id: 'admin-dashboard', icon: 'fa-home', label: 'Главная' },
        { id: 'admin-lessons', icon: 'fa-video', label: 'Занятия' },
        { id: 'admin-tasks', icon: 'fa-tasks', label: 'Задания' },
        { id: 'admin-review', icon: 'fa-check-double', label: 'Проверка' },
        { id: 'admin-students', icon: 'fa-users', label: 'Ученики' },
        { id: 'admin-reports', icon: 'fa-chart-line', label: 'Отчёты' },
        { id: 'admin-settings', icon: 'fa-cog', label: 'Настройки' }
    ],
    student: [
        { id: 'student-dashboard', icon: 'fa-home', label: 'Моя панель' },
        { id: 'student-lessons', icon: 'fa-video', label: 'Мои уроки' },
        { id: 'student-tasks', icon: 'fa-tasks', label: 'Мои задания' },
        { id: 'student-task-execution', icon: 'fa-play', label: 'Выполнение' },
        { id: 'student-progress', icon: 'fa-chart-line', label: 'Мой прогресс' },
        { id: 'student-settings', icon: 'fa-cog', label: 'Настройки' }
    ]
};

/**
 * Карта рендеринга разделов
 * Связывает ID раздела с функцией рендеринга
 */
const SECTION_RENDERERS = {
    // Админские разделы
    'admin-dashboard': window.renderAdminDashboard || function() { console.warn('renderAdminDashboard not defined'); },
    'admin-lessons': window.renderAdminLessons || function() { console.warn('renderAdminLessons not defined'); },
    'admin-tasks': window.renderAdminTasks || function() { console.warn('renderAdminTasks not defined'); },
    'admin-review': window.renderAdminReview || function() { console.warn('renderAdminReview not defined'); },
    'admin-students': window.renderAdminStudents || function() { console.warn('renderAdminStudents not defined'); },
    'admin-reports': window.renderAdminReports || function() { console.warn('renderAdminReports not defined'); },
    'admin-settings': window.renderAdminSettings || function() { console.warn('renderAdminSettings not defined'); },
    
    // Студенческие разделы
    'student-dashboard': window.renderStudentDashboard || function() { console.warn('renderStudentDashboard not defined'); },
    'student-lessons': window.renderStudentLessons || function() { console.warn('renderStudentLessons not defined'); },
    'student-tasks': window.renderStudentTasks || function() { console.warn('renderStudentTasks not defined'); },
    'student-task-execution': renderStudentTaskExecution,
    'student-progress': window.renderStudentProgress || function() { console.warn('renderStudentProgress not defined'); },
    'student-settings': window.renderStudentSettings || function() { console.warn('renderStudentSettings not defined'); }
};

/**
 * Специальный рендерер для выполнения заданий учеником
 */
function renderStudentTaskExecution(container) {
    container.innerHTML = `
        <button class="btn-back" onclick="backToTasks()" style="margin-bottom: 16px;">
            <i class="fas fa-arrow-left"></i> Назад к заданиям
        </button>
        <div id="taskExecutionContainer"></div>
    `;
}

/**
 * Построение навигационного меню
 * @param {string} role - Роль пользователя ('admin' | 'student')
 */
function buildNavigation(role) {
    const nav = document.getElementById('mainNav');
    const items = NAV_CONFIG[role] || [];
    
    nav.innerHTML = items.map((item, index) => {
        // Добавляем разделитель перед настройками
        const divider = item.id.includes('settings') ? '<div class="nav-divider"></div>' : '';
        return divider + `
            <div class="nav-item" data-section="${item.id}" onclick="navigateTo('${item.id}')">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </div>
        `;
    }).join('');
}

/**
 * Навигация к указанному разделу
 * @param {string} sectionId - ID раздела
 */
function navigateTo(sectionId) {
    // Обновляем активный пункт меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    // Обновляем заголовок страницы
    const allItems = [...NAV_CONFIG.admin, ...NAV_CONFIG.student];
    const found = allItems.find(i => i.id === sectionId);
    document.getElementById('pageTitle').textContent = found ? found.label : sectionId;
    
    // Создаём контейнер для секции
    const container = document.getElementById('sectionContainer');
    container.innerHTML = '<div class="section active-section" id="currentSection"></div>';
    
    // Рендерим секцию
    renderSection(sectionId);
}

/**
 * Рендеринг указанной секции
 * @param {string} sectionId - ID раздела
 */
function renderSection(sectionId) {
    const container = document.getElementById('currentSection');
    if (!container) return;
    
    // Проверяем, есть ли рендерер для этого раздела
    const renderer = SECTION_RENDERERS[sectionId];
    
    if (renderer) {
        try {
            renderer(container);
        } catch (e) {
            console.error(`Ошибка при рендеринге раздела ${sectionId}:`, e);
            container.innerHTML = `
                <div class="card" style="padding: 40px; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3>Ошибка загрузки раздела</h3>
                    <p style="color: #64748b;">Пожалуйста, обновите страницу или обратитесь к администратору</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">${e.message}</p>
                </div>
            `;
        }
    } else {
        container.innerHTML = `
            <div class="card" style="padding: 40px; text-align: center;">
                <i class="fas fa-code" style="font-size: 48px; color: #4f46e5; margin-bottom: 16px;"></i>
                <h3>Раздел в разработке</h3>
                <p style="color: #64748b;">${sectionId}</p>
            </div>
        `;
    }
}

/**
 * Возврат к списку заданий
 */
function backToTasks() {
    navigateTo('student-tasks');
}

// Сообщаем о загрузке модуля
console.log('🧭 Модуль router.js загружен');
console.log('📋 Доступные разделы:');
console.log('  👨‍💼 Админ:', NAV_CONFIG.admin.map(i => i.label).join(', '));
console.log('  👨‍🎓 Ученик:', NAV_CONFIG.student.map(i => i.label).join(', '));
