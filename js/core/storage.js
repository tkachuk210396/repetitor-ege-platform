// Работа с хранилищем данных
export default class Storage {
    get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }
    
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}
