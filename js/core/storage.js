/**
 * ============================================
 * МОДУЛЬ ХРАНИЛИЩА (STORAGE)
 * ============================================
 * 
 * Отвечает за:
 * - Работу с localStorage
 * - Геттеры и сеттеры для всех сущностей
 * ============================================
 */

/**
 * Конфигурация ключей для localStorage
 */
const Config = {
    AUTH_KEY: 'ege_tutor_auth_v1',
    USERS_KEY: 'ege_tutor_users_v1',
    LESSONS_KEY: 'ege_tutor_lessons_v1',
    TASKS_KEY: 'ege_tutor_tasks_v1',
    ASSIGNMENTS_KEY: 'ege_tutor_assignments_v1'
};

/**
 * Получить всех пользователей
 */
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(Config.USERS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении пользователей:', e);
        return [];
    }
}

/**
 * Сохранить пользователей
 */
function setUsers(data) {
    try {
        localStorage.setItem(Config.USERS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении пользователей:', e);
    }
}

/**
 * Получить все занятия
 */
function getLessons() {
    try {
        return JSON.parse(localStorage.getItem(Config.LESSONS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении занятий:', e);
        return [];
    }
}

/**
 * Сохранить занятия
 */
function setLessons(data) {
    try {
        localStorage.setItem(Config.LESSONS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении занятий:', e);
    }
}

/**
 * Получить все задания
 */
function getTasks() {
    try {
        return JSON.parse(localStorage.getItem(Config.TASKS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении заданий:', e);
        return [];
    }
}

/**
 * Сохранить задания
 */
function setTasks(data) {
    try {
        localStorage.setItem(Config.TASKS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении заданий:', e);
    }
}

/**
 * Получить все назначения
 */
function getAssignments() {
    try {
        return JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    } catch (e) {
        console.error('Ошибка при получении назначений:', e);
        return [];
    }
}

/**
 * Сохранить назначения
 */
function setAssignments(data) {
    try {
        localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка при сохранении назначений:', e);
    }
}

/**
 * Получить текущего авторизованного пользователя
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(Config.AUTH_KEY));
    } catch (e) {
        console.error('Ошибка при получении текущего пользователя:', e);
        return null;
    }
}

// Экспортируем в глобальную область видимости
window.Config = Config;
window.getUsers = getUsers;
window.setUsers = setUsers;
window.getLessons = getLessons;
window.setLessons = setLessons;
window.getTasks = getTasks;
window.setTasks = setTasks;
window.getAssignments = getAssignments;
window.setAssignments = setAssignments;
window.getCurrentUser = getCurrentUser;

console.log('📦 Модуль storage.js загружен');
