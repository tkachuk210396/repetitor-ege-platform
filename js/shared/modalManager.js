/**
 * ============================================
 * МОДУЛЬ: УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ (SHARED)
 * ============================================
 * 
 * Отвечает за:
 * - Создание и отображение модальных окон
 * - Закрытие модальных окон
 * - Управление состоянием модальных окон
 * - Создание различных типов модальных окон
 * ============================================
 */

/**
 * Открытие модального окна
 * @param {string|HTMLElement} modal - ID или DOM-элемент модального окна
 * @param {Object} options - Опции модального окна
 * @param {Function} options.onOpen - Колбэк при открытии
 * @param {Function} options.onClose - Колбэк при закрытии
 * @param {boolean} options.closeOnOverlay - Закрывать по клику на оверлей (по умолчанию true)
 */
function openModal(modal, options = {}) {
    const modalElement = typeof modal === 'string' ? document.getElementById(modal) : modal;
    if (!modalElement) {
        console.error('Модальное окно не найдено:', modal);
        return;
    }
    
    // Добавляем класс active
    modalElement.classList.add('active');
    modalElement.style.display = 'flex';
    
    // Сохраняем текущий активный модал
    document._currentModal = modalElement;
    
    // Вызываем колбэк при открытии
    if (options.onOpen && typeof options.onOpen === 'function') {
        options.onOpen();
    }
    
    // Блокируем скролл страницы
    document.body.style.overflow = 'hidden';
    
    // Закрытие по клику на оверлей
    if (options.closeOnOverlay !== false) {
        modalElement.addEventListener('click', function onOverlayClick(e) {
            if (e.target === this) {
                closeModal(modalElement, options);
            }
        });
    }
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function onEscape(e) {
        if (e.key === 'Escape' && document._currentModal === modalElement) {
            closeModal(modalElement, options);
            document.removeEventListener('keydown', onEscape);
        }
    });
}

/**
 * Закрытие модального окна
 * @param {string|HTMLElement} modal - ID или DOM-элемент модального окна
 * @param {Object} options - Опции
 * @param {Function} options.onClose - Колбэк при закрытии
 */
function closeModal(modal, options = {}) {
    const modalElement = typeof modal === 'string' ? document.getElementById(modal) : modal;
    if (!modalElement) {
        console.error('Модальное окно не найдено:', modal);
        return;
    }
    
    // Удаляем класс active
    modalElement.classList.remove('active');
    modalElement.style.display = 'none';
    
    // Очищаем текущий модал
    if (document._currentModal === modalElement) {
        document._currentModal = null;
    }
    
    // Восстанавливаем скролл
    document.body.style.overflow = '';
    
    // Вызываем колбэк при закрытии
    if (options.onClose && typeof options.onClose === 'function') {
        options.onClose();
    }
}

/**
 * Закрытие всех активных модальных окон
 */
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    document._currentModal = null;
    document.body.style.overflow = '';
}

/**
 * Создание модального окна с контентом
 * @param {Object} config - Конфигурация модального окна
 * @param {string} config.id - ID модального окна
 * @param {string} config.title - Заголовок модального окна
 * @param {string|HTMLElement} config.content - Контент модального окна
 * @param {Array} config.buttons - Массив кнопок [{label, onClick, class}]
 * @param {Object} config.options - Опции модального окна
 * @returns {HTMLElement} Созданное модальное окно
 */
function createModal(config = {}) {
    const {
        id = 'modal_' + Date.now(),
        title = '',
        content = '',
        buttons = [],
        options = {}
    } = config;
    
    // Проверяем, существует ли уже модальное окно с таким ID
    let modal = document.getElementById(id);
    
    if (modal) {
        // Обновляем существующее
        modal.innerHTML = buildModalHTML(title, content, buttons);
        return modal;
    }
    
    // Создаём новое модальное окно
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;
    modal.style.display = 'none';
    modal.innerHTML = buildModalHTML(title, content, buttons);
    
    document.body.appendChild(modal);
    
    return modal;
}

/**
 * Построение HTML-кода модального окна
 * @param {string} title - Заголовок
 * @param {string|HTMLElement} content - Контент
 * @param {Array} buttons - Массив кнопок
 * @returns {string} HTML-код
 */
function buildModalHTML(title, content, buttons) {
    const contentStr = typeof content === 'string' ? content : content.outerHTML || '';
    
    return `
        <div class="modal-content" onclick="event.stopPropagation();">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close-modal" onclick="closeModal(this.closest('.modal'))">&times;</span>
            </div>
            <div class="modal-body">
                ${contentStr}
            </div>
            ${buttons.length > 0 ? `
                <div class="modal-footer" style="display:flex; gap:12px; justify-content:flex-end; margin-top:24px;">
                    ${buttons.map(btn => `
                        <button class="${btn.class || 'btn-primary'}" onclick="${btn.onClick ? btn.onClick.toString() : 'closeModal(this.closest(\'.modal\'))'}">
                            ${btn.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Открытие модального окна с сообщением
 * @param {string} message - Сообщение для отображения
 * @param {string} type - Тип сообщения ('info', 'success', 'warning', 'error')
 * @param {string} title - Заголовок
 * @param {Function} onClose - Колбэк при закрытии
 */
function showMessageModal(message, type = 'info', title = '', onClose = null) {
    const icons = {
        'info': '<i class="fas fa-info-circle" style="color: #4f46e5; font-size: 48px;"></i>',
        'success': '<i class="fas fa-check-circle" style="color: #10b981; font-size: 48px;"></i>',
        'warning': '<i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 48px;"></i>',
        'error': '<i class="fas fa-times-circle" style="color: #ef4444; font-size: 48px;"></i>'
    };
    
    const titles = {
        'info': 'Информация',
        'success': 'Успешно',
        'warning': 'Внимание',
        'error': 'Ошибка'
    };
    
    const modalId = 'messageModal_' + Date.now();
    const modal = createModal({
        id: modalId,
        title: title || titles[type] || 'Сообщение',
        content: `
            <div style="text-align: center; padding: 20px;">
                ${icons[type] || icons.info}
                <p style="margin-top: 16px; font-size: 16px; color: #1e293b;">${message}</p>
            </div>
        `,
        buttons: [
            { label: 'OK', class: 'btn-primary', onClick: function() {
                closeModal(modalId);
                if (onClose) onClose();
            }}
        ]
    });
    
    openModal(modal);
}

/**
 * Открытие модального окна с подтверждением
 * @param {string} message - Сообщение для подтверждения
 * @param {Function} onConfirm - Колбэк при подтверждении
 * @param {Function} onCancel - Колбэк при отмене
 * @param {string} title - Заголовок
 */
function showConfirmModal(message, onConfirm, onCancel = null, title = 'Подтверждение') {
    const modalId = 'confirmModal_' + Date.now();
    const modal = createModal({
        id: modalId,
        title: title,
        content: `
            <div style="padding: 16px 0;">
                <p style="font-size: 16px; color: #1e293b;">${message}</p>
            </div>
        `,
        buttons: [
            { label: 'Отмена', class: 'btn-outline', onClick: function() {
                closeModal(modalId);
                if (onCancel) onCancel();
            }},
            { label: 'Подтвердить', class: 'btn-primary', onClick: function() {
                closeModal(modalId);
                if (onConfirm) onConfirm();
            }}
        ]
    });
    
    openModal(modal);
}

/**
 * Открытие модального окна с формой
 * @param {Object} config - Конфигурация формы
 * @param {string} config.title - Заголовок
 * @param {Array} config.fields - Массив полей [{type, label, id, value, placeholder, options}]
 * @param {Function} config.onSubmit - Колбэк при отправке
 * @param {Function} config.onCancel - Колбэк при отмене
 * @param {string} config.submitLabel - Текст кнопки отправки
 */
function showFormModal(config = {}) {
    const {
        title = 'Форма',
        fields = [],
        onSubmit = null,
        onCancel = null,
        submitLabel = 'Сохранить'
    } = config;
    
    const modalId = 'formModal_' + Date.now();
    
    let formHtml = fields.map(field => {
        const required = field.required ? 'required' : '';
        const value = field.value || '';
        
        if (field.type === 'textarea') {
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <textarea id="${field.id}" placeholder="${field.placeholder || ''}" ${required} rows="${field.rows || 3}">${value}</textarea>
                </div>
            `;
        } else if (field.type === 'select') {
            const optionsHtml = (field.options || []).map(opt => `
                <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>
            `).join('');
            
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <select id="${field.id}" ${required}>
                        <option value="">Выберите...</option>
                        ${optionsHtml}
                    </select>
                </div>
            `;
        } else if (field.type === 'checkbox') {
            const checked = value ? 'checked' : '';
            return `
                <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="${field.id}" ${checked}>
                    <label for="${field.id}" style="margin: 0;">${field.label}</label>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder || ''}" value="${value}" ${required}>
                </div>
            `;
        }
    }).join('');
    
    const modal = createModal({
        id: modalId,
        title: title,
        content: `
            <div class="form-container">
                ${formHtml}
            </div>
        `,
        buttons: [
            { label: 'Отмена', class: 'btn-outline', onClick: function() {
                closeModal(modalId);
                if (onCancel) onCancel();
            }},
            { label: submitLabel, class: 'btn-primary', onClick: function() {
                const formData = {};
                fields.forEach(field => {
                    const el = document.getElementById(field.id);
                    if (el) {
                        if (field.type === 'checkbox') {
                            formData[field.id] = el.checked;
                        } else {
                            formData[field.id] = el.value;
                        }
                    }
                });
                
                if (onSubmit) onSubmit(formData);
                closeModal(modalId);
            }}
        ]
    });
    
    openModal(modal);
}

/**
 * Открытие модального окна с загрузкой (спиннер)
 * @param {string} message - Сообщение для отображения
 */
function showLoadingModal(message = 'Загрузка...') {
    const modalId = 'loadingModal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = createModal({
            id: modalId,
            title: 'Пожалуйста, подождите',
            content: `
                <div style="text-align: center; padding: 30px 20px;">
                    <div class="spinner" style="
                        width: 48px;
                        height: 48px;
                        border: 4px solid #e2e8f0;
                        border-top: 4px solid #4f46e5;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 16px;
                    "></div>
                    <p style="color: #64748b;">${message}</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `,
            buttons: []
        });
    } else {
        // Обновляем сообщение
        const messageEl = modal.querySelector('.modal-body p');
        if (messageEl) messageEl.textContent = message;
    }
    
    openModal(modal, { closeOnOverlay: false });
}

/**
 * Закрытие модального окна с загрузкой
 */
function closeLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        closeModal(modal);
    }
}

/**
 * Создание модального окна с деталями урока/занятия
 * @param {Object} lesson - Объект урока
 * @param {Object} options - Опции
 * @param {boolean} options.isStudent - Режим ученика
 * @param {Function} options.onJoin - Колбэк при подключении
 * @param {Function} options.onClose - Колбэк при закрытии
 */
function showLessonDetailModal(lesson, options = {}) {
    const {
        isStudent = false,
        onJoin = null,
        onClose = null
    } = options;
    
    const users = getUsers ? getUsers() : [];
    const teacher = users.find(u => u.id === lesson.teacherId);
    const student = users.find(u => u.id === lesson.studentId);
    
    const start = new Date(lesson.startTime || lesson.date);
    const dateStr = start.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    const timeStr = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const isUpcoming = start >= new Date() && (lesson.status === 'scheduled' || lesson.status === 'rescheduled');
    const statusText = getLessonStatusText ? getLessonStatusText(lesson.status) : lesson.status;
    const statusColor = getLessonStatusColor ? getLessonStatusColor(lesson.status) : '#4f46e5';
    
    const modalId = 'lessonDetailModal_' + Date.now();
    
    let buttons = [
        { label: 'Закрыть', class: 'btn-outline', onClick: function() {
            closeModal(modalId);
            if (onClose) onClose();
        }}
    ];
    
    if (lesson.meetLink && isUpcoming) {
        buttons.unshift({
            label: '<i class="fas fa-video"></i> Присоединиться',
            class: 'btn-primary',
            onClick: function() {
                if (onJoin) onJoin(lesson);
                window.open(lesson.meetLink, '_blank');
            }
        });
    }
    
    let materialsHtml = '';
    if (lesson.materials && lesson.materials.length > 0) {
        materialsHtml = `
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <strong style="display: block; margin-bottom: 8px;">📎 Материалы урока:</strong>
                ${lesson.materials.map(m => `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                        <i class="fas fa-${m.type === 'link' ? 'link' : 'file-alt'}" style="color: #4f46e5;"></i>
                        ${m.type === 'link' ? 
                            `<a href="${m.content}" target="_blank" style="color: #4f46e5; text-decoration: none;">${m.title}</a>` :
                            `<span>${m.title}: ${m.content}</span>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const modal = createModal({
        id: modalId,
        title: `📹 ${lesson.title || 'Урок'}`,
        content: `
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
                <span class="badge" style="background: ${statusColor}; color: white; font-size: 14px; padding: 6px 16px; border-radius: 30px;">
                    ${statusText}
                </span>
                ${isUpcoming ? '<span class="badge badge-new" style="background: #dbeafe; color: #1e40af; font-size: 14px; padding: 6px 16px;">🔜 Скоро</span>' : ''}
            </div>
            
            <div style="color: #64748b; font-size: 15px; margin-bottom: 16px;">
                <div style="margin-bottom: 4px;">
                    <i class="far fa-calendar-alt" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                    ${dateStr} в ${timeStr}
                </div>
                <div style="margin-bottom: 4px;">
                    <i class="fas fa-user-graduate" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                    ${isStudent ? teacher?.name || 'Репетитор' : student?.name || 'Ученик'}
                </div>
                ${lesson.duration ? `
                    <div style="margin-bottom: 4px;">
                        <i class="fas fa-clock" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                        ${lesson.duration} мин.
                    </div>
                ` : ''}
                ${lesson.meetLink ? `
                    <div style="margin-bottom: 4px;">
                        <i class="fas fa-link" style="margin-right: 8px; color: #4f46e5; width: 20px;"></i>
                        <a href="${lesson.meetLink}" target="_blank" style="color: #4f46e5; text-decoration: none;">${lesson.meetLink}</a>
                    </div>
                ` : ''}
            </div>
            
            ${lesson.description ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 4px;">📝 Описание:</strong>
                    <p style="color: #334155; line-height: 1.6; margin: 0;">${lesson.description}</p>
                </div>
            ` : ''}
            
            ${materialsHtml}
        `,
        buttons: buttons
    });
    
    openModal(modal);
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем основные функции
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.createModal = createModal;
window.showMessageModal = showMessageModal;
window.showConfirmModal = showConfirmModal;
window.showFormModal = showFormModal;
window.showLoadingModal = showLoadingModal;
window.closeLoadingModal = closeLoadingModal;
window.showLessonDetailModal = showLessonDetailModal;

// Сообщаем о загрузке модуля
console.log('📦 Модуль modalManager.js загружен');
