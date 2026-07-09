// ============================================
// ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ============================================

// Импортируем модули
import Auth from './core/auth.js';
import Storage from './core/storage.js';
import Router from './core/router.js';

// Импортируем страницы
import AdminDashboard from './modules/admin/AdminDashboard.js';
import AdminLessons from './modules/admin/AdminLessons.js';
import AdminTasks from './modules/admin/AdminTasks.js';
import AdminReview from './modules/admin/AdminReview.js';

import StudentDashboard from './modules/student/StudentDashboard.js';
import StudentLessons from './modules/student/StudentLessons.js';
import StudentTasks from './modules/student/StudentTasks.js';
import StudentProgress from './modules/student/StudentProgress.js';

// Импортируем тестовые данные
import { initTestData } from '../data/initData.js';

// ============================================
// ГЛАВНЫЙ КЛАСС ПРИЛОЖЕНИЯ
// ============================================
class App {
    constructor() {
        // Инициализируем компоненты
        this.auth = new Auth();
        this.storage = new Storage();
        this.router = new Router();
        this.currentUser = null;
        
        // Инициализируем тестовые данные
        initTestData();
        
        // Запускаем приложение
        this.init();
    }
    
    init() {
        // Проверяем, есть ли пользователь в localStorage
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
    }
    
    showLoginPage() {
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div style="max-width: 400px; margin: 60px auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h1 style="text-align: center; font-size: 28px; margin-bottom: 8px;">📚 Репетитор ЕГЭ</h1>
                <p style="text-align: center; color: #64748b; margin-bottom: 32px;">Вход в систему</p>
                
                <div id="loginForm">
                    <div style="margin-bottom: 16px;">
                        <label style="font-weight: 600; display: block; margin-bottom: 4px;">Email</label>
                        <input type="email" id="loginEmail" placeholder="email@example.com" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="font-weight: 600; display: block; margin-bottom: 4px;">Пароль</label>
                        <input type="password" id="loginPassword" placeholder="••••••••" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px;">
                    </div>
                    <button onclick="window.app.login()" style="width: 100%; padding: 14px; background: #4f46e5; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer;">
                        Войти
                    </button>
                </div>
                
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 13px; color: #64748b; text-align: center;">Тестовые аккаунты:</p>
                    <div style="display: flex; gap: 16px; justify-content: center; font-size: 13px; color: #94a3b8; margin-top: 8px;">
                        <div><strong>Админ:</strong> admin@ege.ru / admin123</div>
                        <div><strong>Ученик:</strong> anna@student.ru / student123</div>
                    </div>
                </div>
            </div>
        `;
        
        // Сохраняем ссылку на приложение для использования в onclick
        window.app = this;
    }
    
    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = this.auth.login(email, password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showMainApp();
        } else {
            alert('Неверный email или пароль!');
        }
    }
    
    showMainApp() {
        const container = document.getElementById('content-container');
        const user = this.currentUser;
        
        // Определяем навигацию в зависимости от роли
        const navItems = user.role === 'admin' ? [
            { id: 'dashboard', label: '📊 Главная', icon: 'fa-home' },
            { id: 'lessons', label: '📹 Занятия', icon: 'fa-video' },
            { id: 'tasks', label: '📝 Задания', icon: 'fa-tasks' },
            { id: 'review', label: '✅ Проверка', icon: 'fa-check-double' }
        ] : [
            { id: 'dashboard', label: '🏠 Моя панель', icon: 'fa-home' },
            { id: 'lessons', label: '📹 Мои уроки', icon: 'fa-video' },
            { id: 'tasks', label: '📝 Мои задания', icon: 'fa-tasks' },
            { id: 'progress', label: '📊 Мой прогресс', icon: 'fa-chart-line' }
        ];
        
        container.innerHTML = `
            <div style="display: flex; gap: 24px; min-height: 80vh;">
                <!-- Сайдбар -->
                <div style="width: 240px; background: white; border-radius: 24px; padding: 20px; border: 1px solid #eef2f6;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 60px; height: 60px; background: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 24px; color: white;">
                            ${user.name.charAt(0)}
                        </div>
                        <div style="font-weight: 600; margin-top: 8px;">${user.name}</div>
                        <div style="font-size: 12px; color: #94a3b8;">${user.role === 'admin' ? '👨‍🏫 Администратор' : '👤 Ученик'}</div>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                        ${navItems.map(item => `
                            <div onclick="window.app.navigateTo('${item.id}')" 
                                 style="padding: 10px 16px; border-radius: 12px; cursor: pointer; margin-bottom: 4px; transition: 0.15s; 
                                        ${window.currentPage === item.id ? 'background: #4f46e5; color: white;' : ''}"
                                 onmouseover="this.style.background='${window.currentPage === item.id ? '#4f46e5' : '#f1f5f9'}'"
                                 onmouseout="this.style.background='${window.currentPage === item.id ? '#4f46e5' : 'transparent'}'">
                                ${item.label}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px;">
                        <div onclick="window.app.logout()" style="padding: 10px 16px; border-radius: 12px; cursor: pointer; color: #ef4444;">
                            🚪 Выйти
                        </div>
                    </div>
                </div>
                
                <!-- Контент -->
                <div id="pageContent" style="flex: 1; background: white; border-radius: 24px; padding: 24px; border: 1px solid #eef2f6;">
                    ${this.renderPage('dashboard')}
                </div>
            </div>
        `;
        
        // Сохраняем текущую страницу
        window.currentPage = 'dashboard';
        window.app = this;
    }
    
    renderPage(pageId) {
        const user = this.currentUser;
        
        if (user.role === 'admin') {
            switch(pageId) {
                case 'dashboard': return new AdminDashboard().render();
                case 'lessons': return new AdminLessons().render();
                case 'tasks': return new AdminTasks().render();
                case 'review': return new AdminReview().render();
                default: return '<h2>Страница не найдена</h2>';
            }
        } else {
            switch(pageId) {
                case 'dashboard': return new StudentDashboard().render();
                case 'lessons': return new StudentLessons().render();
                case 'tasks': return new StudentTasks().render();
                case 'progress': return new StudentProgress().render();
                default: return '<h2>Страница не найдена</h2>';
            }
        }
    }
    
    navigateTo(pageId) {
        window.currentPage = pageId;
        const content = document.getElementById('pageContent');
        if (content) {
            content.innerHTML = this.renderPage(pageId);
        }
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(el => {
            // Простая логика подсветки
            const label = el.textContent.trim();
            const pageMap = {
                '📊 Главная': 'dashboard',
                '📹 Занятия': 'lessons',
                '📝 Задания': 'tasks',
                '✅ Проверка': 'review',
                '🏠 Моя панель': 'dashboard',
                '📹 Мои уроки': 'lessons',
                '📝 Мои задания': 'tasks',
                '📊 Мой прогресс': 'progress'
            };
            const page = pageMap[label] || '';
            el.style.background = page === pageId ? '#4f46e5' : 'transparent';
            el.style.color = page === pageId ? 'white' : '';
        });
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLoginPage();
    }
}

// ============================================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================
const app = new App();
window.app = app;
