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
 * ============================================
 */

/**
 * Переключение вкладок авторизации
 */
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

/**
 * Показывает ошибку в форме авторизации
 */
function showError(type, message) {
    const errorEl = document.getElementById(type + 'Error');
    if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = message;
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
}

/**
 * Обработчик регистрации
 */
function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
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
    
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showError('register', 'Email уже используется');
        return;
    }
    
    const newUser = {
        id: 'u' + Date.now(),
        name: name,
        email: email,
        password: password,
        role: 'student'
    };
    
    users.push(newUser);
    setUsers(users);
    localStorage.setItem(Config.AUTH_KEY, JSON.stringify(newUser));
    showApp();
}

/**
 * Обработчик входа
 */
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('login', 'Введите email и пароль');
        return;
    }
    
    const user = getUsers().find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem(Config.AUTH_KEY, JSON.stringify(user));
        showApp();
    } else {
        showError('login', 'Неверный email или пароль');
    }
}

/**
 * Выход из системы
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
 */
function showApp() {
    document.getElementById('authBlock').style.display = 'none';
    document.getElementById('appBlock').style.display = 'block';
    
    const user = getCurrentUser();
    if (!user) return;
    
    document.getElementById('userName').textContent = user.name;
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userRole').textContent = user.role === 'admin' ? 'Администратор' : 'Ученик';
    document.getElementById('roleIndicator').textContent = user.role === 'admin' ? '👨‍🏫 Админ' : '👤 Ученик';
    
    buildNavigation(user.role);
    const defaultSection = user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
    navigateTo(defaultSection);
}

// Автоматическая проверка при загрузке
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Экспортируем в глобальную область видимости
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.checkAuth = checkAuth;
window.showApp = showApp;

console.log('🔐 Модуль auth.js загружен');
