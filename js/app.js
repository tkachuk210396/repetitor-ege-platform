/**
 * ============================================
 * ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ (APP)
 * ============================================
 * 
 * Отвечает за:
 * - Инициализацию приложения
 * - Проверку авторизации
 * - Глобальные настройки
 * ============================================
 */

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('🚀 Запуск приложения Репетитор ЕГЭ');
    
    // Проверяем авторизацию
    const user = getCurrentUser ? getCurrentUser() : null;
    
    if (user) {
        console.log('👤 Пользователь авторизован:', user.name);
        // Загружаем интерфейс через auth.js
        if (typeof showApp === 'function') {
            showApp();
        } else {
            console.error('❌ Функция showApp не найдена');
        }
    } else {
        console.log('👤 Пользователь не авторизован');
        // Показываем форму авторизации
        document.getElementById('authBlock').style.display = 'flex';
        document.getElementById('appBlock').style.display = 'none';
    }
}

/**
 * Проверка состояния приложения
 */
function checkAppState() {
    console.log('🔍 Проверка состояния приложения...');
    
    // Проверяем наличие ключевых функций
    const requiredFunctions = [
        'getUsers', 'getLessons', 'getTasks', 'getAssignments', 'getCurrentUser',
        'renderStudentDashboard', 'renderStudentLessons', 'renderStudentTasks',
        'renderStudentProgress', 'renderStudentSettings',
        'renderAdminDashboard', 'renderAdminLessons', 'renderAdminTasks',
        'renderAdminReview', 'renderAdminStudents', 'renderAdminReports', 'renderAdminSettings'
    ];
    
    const missing = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
    if (missing.length > 0) {
        console.warn('⚠️ Отсутствуют функции:', missing.join(', '));
    } else {
        console.log('✅ Все функции загружены');
    }
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    checkAppState();
});

console.log('📦 Модуль app.js загружен');
