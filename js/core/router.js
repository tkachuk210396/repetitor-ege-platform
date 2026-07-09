// ============================================
// МОДУЛЬ НАВИГАЦИИ
// ============================================

export default class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        // Слушаем изменение URL
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    }
    
    addRoute(path, handler) {
        this.routes[path] = handler;
    }
    
    navigate(path) {
        window.location.hash = path;
        this.handleRoute();
    }
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.currentRoute = hash;
        
        if (this.routes[hash]) {
            this.routes[hash]();
        }
    }
}
