/**
 * ============================================
 * МОДУЛЬ АВТОРИЗАЦИИ
 * ============================================
 * 
 * Отвечает за:
 * - Вход в систему
 * - Регистрацию новых пользователей
 * - Выход из системы
 * - Проверку авторизации
 * - Отображение интерфейса после авторизации
 * ============================================
 */

/**
 * Переключение вкладок авторизации (Вход / Регистрация)
 * @param {string} tab - 'login' или 'register'
 */
function switchAuthTab(tab) {
    // Обновляем активную вкладку
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Показываем нужную форму
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

/**
 * Показывает ошибку в форме авторизации
 * @param {string} type - 'login' или 'register'
 * @param {string} message - Текст ошибки
 */
function showError(type, message) {
    const errorEl = document.getElementById(type + 'Error');
    if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = message;
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
}

/**
 * Обработчик регистрации нового пользователя
 * Создаёт учётную запись с ролью 'student'
 */
function handleRegister() {
    // Получаем данные из формы
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    // Валидация
    if (!name || !email || !password) {
        showError('register', 'Заполните все поля');
        return;
    }
    
    if (password !== confirm) {
        showError('register', 'Пароли не совпадают');
        return;
    }
    
    if (password.length < 6) {
        showError('register', 'Пароль должен содержать минимум 6 символов');
        return;
    }
    
    // Проверяем, не занят ли email
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showError('register', 'Email уже используется');
        return;
    }
    
    // Создаём нового пользователя
    const newUser = {
        id: 'u' + Date.now(),
        name: name,
        email: email,
        password: password,
        role: 'student' // По умолчанию все новые пользователи - ученики
    };
    
    // Сохраняем в хранилище
    users.push(newUser);
    setUsers(users);
    
    // Автоматически авторизуем
    localStorage.setItem(Config.AUTH_KEY, JSON.stringify(newUser));
    
    // Показываем приложение
    showApp();
}

/**
 * Обработчик входа в систему
 * Проверяет email и пароль, авторизует пользователя
 */
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('login', 'Введите email и пароль');
        return;
    }
    
    // Ищем пользователя в хранилище
    const user = getUsers().find(u => u.email === email && u.password === password);
    
    if (user) {
        // Сохраняем сессию
        localStorage.setItem(Config.AUTH_KEY, JSON.stringify(user));
        // Показываем приложение
        showApp();
    } else {
        showError('login', 'Неверный email или пароль');
    }
}

/**
 * Выход из системы
 * Очищает сессию и показывает форму авторизации
 */
function logout() {
    localStorage.removeItem(Config.AUTH_KEY);
    document.getElementById('authBlock').style.display = 'flex';
    document.getElementById('appBlock').style.display = 'none';
}

/**
 * Проверка авторизации при загрузке страницы
 */
function checkAuth() {
    const user = getCurrentUser();
    if (user) {
        showApp();
    }
}

/**
 * Показывает основное приложение после авторизации
 * Настраивает интерфейс в зависимости от роли пользователя
 */
function showApp() {
    // Скрываем форму авторизации, показываем приложение
    document.getElementById('authBlock').style.display = 'none';
    document.getElementById('appBlock').style.display = 'block';
    
    const user = getCurrentUser();
    if (!user) return;
    
    // Заполняем информацию о пользователе в сайдбаре
    document.getElementById('userName').textContent = user.name;
    
    // Инициалы для аватара
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    // Роль пользователя
    const roleText = user.role === 'admin' ? 'Администратор' : 'Ученик';
    document.getElementById('userRole').textContent = roleText;
    document.getElementById('roleIndicator').textContent = user.role === 'admin' ? '👨‍🏫 Админ' : '👤 Ученик';
    
    // Строим навигацию в зависимости от роли
    buildNavigation(user.role);
    
    // Переходим на соответствующую страницу
    const defaultSection = user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
    navigateTo(defaultSection);
}

/**
 * Автоматическая проверка авторизации при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

/**
 * Глобальные функции для использования в HTML (onclick)
 */
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
