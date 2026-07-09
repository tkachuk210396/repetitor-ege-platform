// Модуль авторизации
export default class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        return user || null;
    }
}
