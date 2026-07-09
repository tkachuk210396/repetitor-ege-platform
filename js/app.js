// Главный файл приложения
import Auth from './core/auth.js';
import Storage from './core/storage.js';
import Router from './core/router.js';

const auth = new Auth();
const storage = new Storage();
const router = new Router();

console.log('Приложение запущено!');
