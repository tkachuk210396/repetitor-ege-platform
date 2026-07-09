// ============================================
// МОДУЛЬ РАБОТЫ С ХРАНИЛИЩЕМ
// ============================================

export default class Storage {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }
    
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    getItem(key) {
        return localStorage.getItem(key);
    }
    
    setItem(key, value) {
        localStorage.setItem(key, value);
    }
    
    remove(key) {
        localStorage.removeItem(key);
    }
}
