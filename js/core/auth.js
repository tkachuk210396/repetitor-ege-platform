// ============================================
// МОДУЛЬ АВТОРИЗАЦИИ
// ============================================

export default class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        return user || null;
    }
    
    register(name, email, password, role = 'student') {
        // Проверяем, есть ли уже такой пользователь
        if (this.users.some(u => u.email === email)) {
            return null;
        }
        
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password,
            role
        };
        
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return newUser;
    }
    
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }
}
