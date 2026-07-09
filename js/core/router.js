// Навигация по страницам
export default class Router {
    constructor() {
        this.routes = {};
    }
    
    addRoute(path, handler) {
        this.routes[path] = handler;
    }
    
    navigate(path) {
        if (this.routes[path]) {
            this.routes[path]();
        }
    }
}
