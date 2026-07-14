/**
 * ============================================
 * МОДУЛЬ: АДМИН - УПРАВЛЕНИЕ ЗАДАНИЯМИ
 * ============================================
 * 
 * Отвечает за:
 * - Отображение списка всех заданий
 * - Фильтрацию заданий по типу
 * - Создание новых заданий (всех типов)
 * - Редактирование существующих заданий
 * - Сохранение заданий в localStorage
 * - Назначение заданий ученикам
 * ============================================
 */

/**
 * Глобальные переменные для работы с заданиями
 */
let currentEditingTaskId = null;
let leftItems = [];
let rightItems = [];
let distributionColumns = [];
let distributionWords = [];

/**
 * Рендеринг страницы "Задания" для администратора
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderAdminTasks(container) {
    // Всегда получаем актуальные данные из localStorage
    const currentTasks = getTasks();
    
    container.innerHTML = `
        <div class="section-header">
            <h2>Все задания</h2>
            <button class="btn-primary" onclick="openTaskTypeModal()">
                <i class="fas fa-plus"></i> Создать задание
            </button>
        </div>
        
        <div class="filter-bar">
            <button class="filter-btn active" onclick="filterAdminTasks('all', this)">Все</button>
            <button class="filter-btn" onclick="filterAdminTasks('multiple-choice', this)">Выбор ответа</button>
            <button class="filter-btn" onclick="filterAdminTasks('matching-pairs', this)">На соответствие</button>
            <button class="filter-btn" onclick="filterAdminTasks('matching-distribution', this)">Распределение</button>
            <button class="filter-btn" onclick="filterAdminTasks('write-word', this)">Написать слово</button>
            <button class="filter-btn" onclick="filterAdminTasks('text-work', this)">Работа с текстом</button>
            <button class="filter-btn" onclick="filterAdminTasks('essay', this)">Сочинение</button>
        </div>
        
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Тип</th>
                        <th>Тема</th>
                        <th>Доступность</th>
                        <th>Дата создания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody id="adminTasksTableBody">
                    ${renderTasksTable(currentTasks)}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Рендеринг таблицы заданий
 * @param {Array} tasksList - Массив заданий
 * @returns {string} HTML-строка
 */
function renderTasksTable(tasksList) {
    if (!tasksList || !tasksList.length) {
        return '<tr><td colspan="6" style="text-align: center; padding: 40px;">Нет заданий</td></tr>';
    }
    
    return tasksList.map(task => {
        const availabilityLabel = getAvailabilityLabel(task.availability, task.availableFor);
        const availabilityClass = getAvailabilityClass(task.availability);
        
        return `
            <tr>
                <td><strong>${task.name || 'Без названия'}</strong></td>
                <td><span class="badge badge-new">${getTaskTypeName(task.type, task.matchingSubtype)}</span></td>
                <td>${getThemeName(task.theme)}</td>
                <td><span class="badge ${availabilityClass}">${availabilityLabel}</span></td>
                <td>${task.createdAt || '-'}</td>
                <td>
                    <button class="btn-outline btn-small" onclick="editTask(${task.id})">
                        <i class="fas fa-edit"></i> Ред.
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteTask(${task.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 30px; font-size: 12px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Фильтрация заданий по типу
 * @param {string} filter - Тип для фильтрации
 * @param {HTMLElement} btn - Кнопка фильтра
 */
function filterAdminTasks(filter, btn) {
    document.querySelectorAll('#currentSection .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    const currentTasks = getTasks();
    let filtered = currentTasks;
    
    if (filter === 'multiple-choice') {
        filtered = currentTasks.filter(t => t.type === 'multiple-choice');
    } else if (filter === 'matching-pairs') {
        filtered = currentTasks.filter(t => t.type === 'matching' && t.matchingSubtype === 'pairs');
    } else if (filter === 'matching-distribution') {
        filtered = currentTasks.filter(t => t.type === 'matching' && t.matchingSubtype === 'distribution');
    } else if (filter === 'write-word') {
        filtered = currentTasks.filter(t => t.type === 'write-word');
    } else if (filter === 'text-work') {
        filtered = currentTasks.filter(t => t.type === 'text-work');
    } else if (filter === 'essay') {
        filtered = currentTasks.filter(t => t.type === 'essay');
    }
    
    const tbody = document.getElementById('adminTasksTableBody');
    if (tbody) {
        tbody.innerHTML = renderTasksTable(filtered);
    }
}

/**
 * Редактирование задания
 * @param {number} taskId - ID задания
 */
function editTask(taskId) {
    const task = getTasks().find(t => t.id === taskId);
    if (!task) {
        alert('Задание не найдено');
        return;
    }
    
    if (task.type === 'multiple-choice') {
        openTaskModal(taskId);
    } else if (task.type === 'matching') {
        if (task.matchingSubtype === 'pairs') {
            openMatchingTaskModal(task);
        } else if (task.matchingSubtype === 'distribution') {
            openDistributionTaskModal(task);
        }
    } else if (task.type === 'write-word') {
        openWriteWordModal(taskId);
    } else if (task.type === 'text-work' || task.type === 'essay') {
        openTextWorkModal(taskId);
    } else {
        alert('Редактирование этого типа задания временно недоступно');
    }
}

/**
 * Удаление задания
 * @param {number} taskId - ID задания
 */
function deleteTask(taskId) {
    showConfirmModal(
        'Вы уверены, что хотите удалить это задание? Все связанные данные (назначения, ответы учеников) также будут удалены.',
        function() {
            // Получаем все задания
            let allTasks = getTasks();
            // Удаляем задание
            allTasks = allTasks.filter(t => t.id !== taskId);
            setTasks(allTasks);
            
            // Удаляем все назначения, связанные с этим заданием
            let allAssignments = getAssignments();
            allAssignments = allAssignments.filter(a => a.taskId !== taskId);
            setAssignments(allAssignments);
            
            // Обновляем список
            const currentSection = document.getElementById('currentSection');
            if (currentSection) {
                renderAdminTasks(currentSection);
            }
            
            // Обновляем дашборд
            if (typeof loadAdminData === 'function') {
                loadAdminData();
            }
            
            alert('Задание удалено');
        },
        null,
        'Удаление задания'
    );
}

// ============================================
// МОДАЛЬНОЕ ОКНО ВЫБОРА ТИПА ЗАДАНИЯ
// ============================================

/**
 * Открытие модального окна выбора типа задания
 */
function openTaskTypeModal() {
    const existingModal = document.getElementById('taskTypeModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'taskTypeModal';
    modal.onclick = function(e) { if (e.target === modal) closeTaskTypeModal(); };
    
    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3>Выберите тип задания</h3>
                <span class="close-modal" onclick="closeTaskTypeModal()">&times;</span>
            </div>
            <div class="task-type-selector">
                <div class="task-type-card" onclick="selectTaskType('multiple-choice')">
                    <div class="task-type-icon"><i class="fas fa-check-square"></i></div>
                    <div class="task-type-title">Выбрать варианты ответа</div>
                    <div class="task-type-desc">Создание заданий с выбором ответов и пропусками</div>
                </div>
                <div class="task-type-card" onclick="selectTaskType('matching')">
                    <div class="task-type-icon"><i class="fas fa-link"></i></div>
                    <div class="task-type-title">Установить соответствие</div>
                    <div class="task-type-desc">Задания на соответствие и распределение по столбцам</div>
                </div>
                <div class="task-type-card" onclick="selectTaskType('write-word')">
                    <div class="task-type-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="task-type-title">Написать слово</div>
                    <div class="task-type-desc">Ввод ответа словом с проверкой</div>
                </div>
                <div class="task-type-card" onclick="selectTaskType('text-work')">
                    <div class="task-type-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="task-type-title">Работа с текстом</div>
                    <div class="task-type-desc">Задания на анализ текста, поиск ошибок</div>
                </div>
                <div class="task-type-card" onclick="selectTaskType('enhanced-matching')">
                    <div class="task-type-icon"><i class="fas fa-project-diagram"></i></div>
                    <div class="task-type-title">Анализ + Соответствие</div>
                    <div class="task-type-desc">Подчеркивание членов предложения + соединение линиями</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeTaskTypeModal() {
    const modal = document.getElementById('taskTypeModal');
    if (modal) modal.remove();
}

function selectTaskType(type) {
    closeTaskTypeModal();
    if (type === 'multiple-choice') openTaskModal();
    else if (type === 'matching') openMatchingSubtypeModal();
    else if (type === 'write-word') openWriteWordModal();
    else if (type === 'text-work' || type === 'essay') openTextWorkModal();
    else if (type === 'enhanced-matching') {
        if (typeof openEnhancedMatchingTaskModal === 'function') {
            openEnhancedMatchingTaskModal();
        } else {
            alert('Модуль расширенного соответствия не загружен');
        }
    }
    else alert('Этот тип задания будет доступен в следующей версии');
}

// ============================================
// ЗАДАНИЯ "ВЫБРАТЬ ВАРИАНТЫ ОТВЕТА"
// ============================================

/**
 * Открытие модального окна для создания/редактирования задания "Выбрать варианты ответа"
 * @param {number} taskId - ID задания (null для создания нового)
 */
function openTaskModal(taskId = null) {
    currentEditingTaskId = taskId;
    const modal = document.getElementById('taskModal');
    if (!modal) return;
    
    if (taskId) {
        const task = getTasks().find(t => t.id === taskId);
        if (!task) { alert('Задание не найдено'); return; }
        
        document.getElementById('taskModalTitle').textContent = 'Редактировать задание';
        document.getElementById('taskTheme').value = task.theme || 'orthography';
        document.getElementById('taskName').value = task.name || '';
        document.querySelector(`input[name="checkMode"][value="${task.checkMode || 'auto'}"]`).checked = true;
        document.querySelector(`input[name="availability"][value="${task.availability || 'all'}"]`).checked = true;
        
        if (task.availability === 'selective') {
            document.getElementById('studentSelector').style.display = 'block';
            loadStudentCheckboxList(task.availableFor || []);
        } else {
            document.getElementById('studentSelector').style.display = 'none';
        }
        
        document.getElementById('subtasksContainer').innerHTML = '';
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => renderSubtaskCard(subtask));
        } else {
            addSubtask();
        }
    } else {
        document.getElementById('taskModalTitle').textContent = 'Создать задание';
        document.getElementById('taskTheme').value = 'orthography';
        document.getElementById('taskName').value = '';
        document.querySelector('input[name="checkMode"][value="auto"]').checked = true;
        document.querySelector('input[name="availability"][value="all"]').checked = true;
        document.getElementById('studentSelector').style.display = 'none';
        document.getElementById('subtasksContainer').innerHTML = '';
        addSubtask();
    }
    
    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    currentEditingTaskId = null;
}

// ========== ДОСТУПНОСТЬ ==========

function selectAvailability(type) {
    document.querySelector(`input[name="availability"][value="${type}"]`).checked = true;
    document.getElementById('studentSelector').style.display = type === 'selective' ? 'block' : 'none';
    if (type === 'selective') loadStudentCheckboxList();
}

function loadStudentCheckboxList(selectedIds = []) {
    const container = document.getElementById('studentList');
    if (!container) return;
    const students = getUsers().filter(u => u.role === 'student');
    container.innerHTML = students.map(s => `
        <div class="student-checkbox">
            <input type="checkbox" id="student_${s.id}" value="${s.id}" ${selectedIds.includes(s.id) ? 'checked' : ''}>
            <label for="student_${s.id}">${s.name} (${s.email})</label>
        </div>
    `).join('');
}

// ========== ПОДЗАДАНИЯ ==========

function addSubtask() { renderSubtaskCard(null); updateSubtaskNumbers(); }

function renderSubtaskCard(subtask = null) {
    const container = document.getElementById('subtasksContainer');
    if (!container) return;
    
    const subtaskId = subtask?.id || 'subtask' + Date.now();
    const div = document.createElement('div');
    div.className = 'subtask-card';
    div.dataset.subtaskId = subtaskId;
    
    div.innerHTML = `
        <div class="subtask-header">
            <div class="subtask-title"><span class="subtask-number">#${container.children.length + 1}</span> Подзадание</div>
            <div class="subtask-actions">
                <button onclick="duplicateSubtask(this)" title="Дублировать"><i class="fas fa-copy"></i></button>
                <button onclick="moveSubtaskUp(this)" title="Вверх"><i class="fas fa-arrow-up"></i></button>
                <button onclick="moveSubtaskDown(this)" title="Вниз"><i class="fas fa-arrow-down"></i></button>
                <button onclick="removeSubtask(this)" title="Удалить"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="subtask-content">
            <div class="form-group">
                <label>Описание подзадания</label>
                <textarea class="subtask-description" rows="2" placeholder="Например: Вставьте пропущенные буквы">${subtask?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Текст с пропусками</label>
                <textarea class="subtask-interactive" rows="3" placeholder="Пример: дерев{gap}ый, ветре{gap}ый">${subtask?.interactive || ''}</textarea>
                <div class="form-hint">Используйте {gap} для обозначения пропусков</div>
            </div>
            <div class="form-group">
                <label>🖼️ Изображение (необязательно)</label>
                <div class="subtask-image-upload ${subtask?.image ? 'has-image' : ''}">
                    <input type="file" accept="image/*" onchange="handleSubtaskImage(this, '${subtaskId}')" style="display:none;" id="imageInput_${subtaskId}">
                    <button class="btn-outline btn-small" onclick="document.getElementById('imageInput_${subtaskId}').click()">
                        <i class="fas fa-image"></i> ${subtask?.image ? 'Заменить изображение' : 'Загрузить изображение'}
                    </button>
                    <div class="subtask-image-preview" id="imagePreview_${subtaskId}" style="${subtask?.image ? '' : 'display:none;'}">
                        ${subtask?.image ? `<img src="${subtask.image}" alt=""><span class="remove-image" onclick="removeSubtaskImage('${subtaskId}')"><i class="fas fa-trash"></i> Удалить</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>💡 Пояснение (ученик увидит после проверки)</label>
                <textarea class="subtask-explanation" rows="2" placeholder="Пояснение к правильному ответу...">${subtask?.explanation || ''}</textarea>
            </div>
            <div class="gaps-section">
                <div class="gaps-header">
                    <h4 style="font-size:14px;">⚙️ Настройки пропусков</h4>
                    <button class="insert-gap-btn btn-small" onclick="insertGapInSubtask(this)">Вставить {gap}</button>
                </div>
                <div class="subtask-gaps"></div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Варианты ответа</label>
                <div class="subtask-options"></div>
                <button class="add-option-btn btn-small" onclick="addOptionToSubtask(this)">+ Добавить вариант</button>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    
    if (subtask) {
        const gapsContainer = div.querySelector('.subtask-gaps');
        if (subtask.gaps) subtask.gaps.forEach(gap => renderGapCard(gapsContainer, gap));
        const optionsContainer = div.querySelector('.subtask-options');
        if (subtask.options) subtask.options.forEach(opt => addOptionRow(optionsContainer, opt));
    }
}

function updateSubtaskNumbers() {
    document.querySelectorAll('#subtasksContainer .subtask-card').forEach((card, i) => {
        const num = card.querySelector('.subtask-number');
        if (num) num.textContent = `#${i + 1}`;
    });
}

function duplicateSubtask(btn) {
    const card = btn.closest('.subtask-card');
    const clone = card.cloneNode(true);
    clone.dataset.subtaskId = 'subtask' + Date.now();
    clone.querySelector('.subtask-description').value = '';
    clone.querySelector('.subtask-interactive').value = '';
    clone.querySelector('.subtask-gaps').innerHTML = '';
    clone.querySelector('.subtask-options').innerHTML = '';
    card.parentNode.insertBefore(clone, card.nextSibling);
    updateSubtaskNumbers();
}

function moveSubtaskUp(btn) {
    const card = btn.closest('.subtask-card');
    const prev = card.previousElementSibling;
    if (prev) { card.parentNode.insertBefore(card, prev); updateSubtaskNumbers(); }
}

function moveSubtaskDown(btn) {
    const card = btn.closest('.subtask-card');
    const next = card.nextElementSibling;
    if (next) { card.parentNode.insertBefore(next, card); updateSubtaskNumbers(); }
}

function removeSubtask(btn) {
    const cards = document.querySelectorAll('#subtasksContainer .subtask-card');
    if (cards.length <= 1) { alert('Должно быть хотя бы одно подзадание'); return; }
    btn.closest('.subtask-card').remove();
    updateSubtaskNumbers();
}

// ========== ИЗОБРАЖЕНИЯ ==========

function handleSubtaskImage(input, subtaskId) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Размер изображения не должен превышать 5MB'); return; }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`imagePreview_${subtaskId}`);
        preview.style.display = 'block';
        preview.innerHTML = `<img src="${e.target.result}" alt=""><span class="remove-image" onclick="removeSubtaskImage('${subtaskId}')"><i class="fas fa-trash"></i> Удалить</span>`;
        preview.parentElement.classList.add('has-image');
        preview.parentElement.querySelector('button').innerHTML = '<i class="fas fa-image"></i> Заменить изображение';
    };
    reader.readAsDataURL(file);
}

function removeSubtaskImage(subtaskId) {
    const preview = document.getElementById(`imagePreview_${subtaskId}`);
    preview.style.display = 'none';
    preview.innerHTML = '';
    preview.parentElement.classList.remove('has-image');
    document.getElementById(`imageInput_${subtaskId}`).value = '';
    preview.parentElement.querySelector('button').innerHTML = '<i class="fas fa-image"></i> Загрузить изображение';
}

// ========== ПРОПУСКИ ==========

function insertGapInSubtask(btn) {
    const textarea = btn.closest('.subtask-content').querySelector('.subtask-interactive');
    const start = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, start) + '{gap}' + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start + 5, start + 5);
    addGapToSubtask(btn);
}

function addGapToSubtask(btn) {
    const gapsContainer = btn.closest('.subtask-content').querySelector('.subtask-gaps');
    renderGapCard(gapsContainer, { id: 'gap' + Date.now(), type: 'input', correct: '' });
}

function renderGapCard(container, gap) {
    const div = document.createElement('div');
    div.className = 'gap-card';
    div.dataset.gapId = gap.id;
    
    let optionsHtml = '';
    if (gap.type === 'input') {
        optionsHtml = `<input type="text" class="gap-correct-input" placeholder="Правильный ответ" value="${gap.correct || ''}">`;
    } else {
        const gapOptions = gap.options || [];
        optionsHtml = gapOptions.map((opt, idx) => `
            <div class="gap-option-row">
                <input type="text" class="gap-option-text" placeholder="Вариант ${idx + 1}" value="${opt}">
                <input type="radio" name="correct_${gap.id}" value="${opt}" ${gap.correct === opt ? 'checked' : ''}>
                <i class="fas fa-trash remove-gap-option" onclick="this.closest('.gap-option-row').remove()"></i>
            </div>
        `).join('');
        if (gapOptions.length === 0) {
            optionsHtml += `<div class="gap-option-row"><input type="text" class="gap-option-text" placeholder="Вариант 1"><input type="radio" name="correct_${gap.id}" value=""><i class="fas fa-trash remove-gap-option" onclick="this.closest('.gap-option-row').remove()"></i></div>`;
        }
        optionsHtml += `<button class="add-gap-option" onclick="addGapOption(this, '${gap.id}')">+ Добавить вариант</button>`;
    }
    
    div.innerHTML = `
        <div class="gap-header">
            <span class="gap-id">${gap.id}</span>
            <div class="gap-type">
                <label><input type="radio" name="type_${gap.id}" value="input" ${gap.type==='input'?'checked':''} onchange="updateGapType(this, '${gap.id}')"> Ввод</label>
                <label><input type="radio" name="type_${gap.id}" value="select" ${gap.type==='select'?'checked':''} onchange="updateGapType(this, '${gap.id}')"> Выбор</label>
            </div>
        </div>
        <div class="gap-options">${optionsHtml}</div>
        <button class="delete-gap" onclick="this.closest('.gap-card').remove()">🗑️ Удалить пропуск</button>
    `;
    container.appendChild(div);
}

function updateGapType(radio, gapId) {
    const optionsContainer = radio.closest('.gap-card').querySelector('.gap-options');
    if (radio.value === 'input') {
        optionsContainer.innerHTML = `<input type="text" class="gap-correct-input" placeholder="Правильный ответ">`;
    } else {
        optionsContainer.innerHTML = `
            <div class="gap-option-row"><input type="text" class="gap-option-text" placeholder="Вариант 1"><input type="radio" name="correct_${gapId}" value=""><i class="fas fa-trash remove-gap-option" onclick="this.closest('.gap-option-row').remove()"></i></div>
            <button class="add-gap-option" onclick="addGapOption(this, '${gapId}')">+ Добавить вариант</button>
        `;
    }
}

function addGapOption(btn, gapId) {
    const container = btn.closest('.gap-options');
    const count = container.querySelectorAll('.gap-option-row').length + 1;
    const div = document.createElement('div');
    div.className = 'gap-option-row';
    div.innerHTML = `<input type="text" class="gap-option-text" placeholder="Вариант ${count}"><input type="radio" name="correct_${gapId}" value=""><i class="fas fa-trash remove-gap-option" onclick="this.parentElement.remove()"></i>`;
    container.insertBefore(div, btn);
}

// ========== ВАРИАНТЫ ОТВЕТА ==========

function addOptionToSubtask(btn) {
    addOptionRow(btn.closest('.subtask-content').querySelector('.subtask-options'));
}

function addOptionRow(container, opt = null) {
    const div = document.createElement('div');
    div.className = `option-item ${opt?.correct ? 'correct' : ''}`;
    div.innerHTML = `
        <input type="text" class="option-text" value="${opt?.text || ''}" placeholder="Текст варианта">
        <input type="checkbox" class="option-correct" ${opt?.correct ? 'checked' : ''} onchange="this.closest('.option-item').classList.toggle('correct', this.checked)">
        <span style="font-size:12px;color:#64748b;">верный</span>
        <i class="fas fa-trash remove-option" onclick="this.parentElement.remove()"></i>
    `;
    container.appendChild(div);
}

// ========== СОХРАНЕНИЕ ЗАДАНИЯ ==========

function saveTask() {
    const theme = document.getElementById('taskTheme').value;
    const name = document.getElementById('taskName').value.trim();
    const checkMode = document.querySelector('input[name="checkMode"]:checked')?.value || 'auto';
    const availability = document.querySelector('input[name="availability"]:checked')?.value || 'all';
    
    if (!name) { alert('Введите название задания'); return; }
    
    let availableFor = [];
    if (availability === 'selective') {
        document.querySelectorAll('#studentList input:checked').forEach(cb => availableFor.push(cb.value));
        if (availableFor.length === 0) { alert('Выберите хотя бы одного ученика'); return; }
    }
    
    const subtasks = [];
    const cards = document.querySelectorAll('#subtasksContainer .subtask-card');
    
    for (const [index, card] of cards.entries()) {
        const subtaskId = card.dataset.subtaskId;
        const description = card.querySelector('.subtask-description')?.value?.trim();
        const interactive = card.querySelector('.subtask-interactive')?.value?.trim();
        const explanation = card.querySelector('.subtask-explanation')?.value?.trim() || '';
        
        if (!description) { alert(`Заполните описание для подзадания #${index + 1}`); return; }
        if (!interactive) { alert(`Заполните текст с пропусками для подзадания #${index + 1}`); return; }
        
        const gapCount = (interactive.match(/\{gap\}/g) || []).length;
        const configuredGaps = card.querySelectorAll('.gap-card');
        if (gapCount !== configuredGaps.length) {
            alert(`В подзадании #${index + 1}: ${gapCount} меток {gap}, но настроено ${configuredGaps.length} пропусков.`);
            return;
        }
        
        const gaps = [];
        for (const gapCard of configuredGaps) {
            const gapId = gapCard.dataset.gapId;
            const type = gapCard.querySelector('input[type="radio"]:checked')?.value || 'input';
            const gap = { id: gapId, type };
            
            if (type === 'input') {
                gap.correct = gapCard.querySelector('.gap-correct-input')?.value || '';
            } else {
                const options = [];
                let correctValue = '';
                gapCard.querySelectorAll('.gap-option-row').forEach(row => {
                    const text = row.querySelector('.gap-option-text')?.value?.trim();
                    if (text) {
                        options.push(text);
                        if (row.querySelector('input[type="radio"]')?.checked) correctValue = text;
                    }
                });
                if (options.length === 0) { alert(`В подзадании #${index + 1}: пропуск ${gapId} должен иметь варианты`); return; }
                if (!correctValue) { alert(`В подзадании #${index + 1}: выберите правильный вариант для пропуска ${gapId}`); return; }
                gap.options = options;
                gap.correct = correctValue;
            }
            gaps.push(gap);
        }
        
        const options = [];
        card.querySelectorAll('.option-item').forEach(item => {
            const text = item.querySelector('.option-text')?.value?.trim();
            if (text) options.push({ text, correct: item.querySelector('.option-correct')?.checked || false });
        });
        if (options.length === 0) { alert(`Добавьте варианты ответа для подзадания #${index + 1}`); return; }
        
        const imagePreview = card.querySelector('.subtask-image-preview img');
        const image = imagePreview ? imagePreview.src : '';
        
        subtasks.push({ id: subtaskId, description, interactive, explanation, gaps, options, image });
    }
    
    const taskId = currentEditingTaskId || Date.now();
    const task = {
        id: taskId, type: 'multiple-choice', theme, name, checkMode, availability, availableFor, subtasks,
        createdAt: currentEditingTaskId ? (getTasks().find(t => t.id === taskId)?.createdAt || new Date().toLocaleDateString()) : new Date().toLocaleDateString()
    };
    
    const allTasks = getTasks();
    if (currentEditingTaskId) {
        const idx = allTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) allTasks[idx] = task; else allTasks.push(task);
    } else {
        allTasks.push(task);
    }
    
    localStorage.setItem(Config.TASKS_KEY, JSON.stringify(allTasks));
    updateMultipleChoiceAssignments(task);
    closeTaskModal();
    if (typeof loadAdminData === 'function') loadAdminData();
    const currentSection = document.getElementById('currentSection');
    if (currentSection) renderAdminTasks(currentSection);
    alert('Задание сохранено!');
}

function updateMultipleChoiceAssignments(task) {
    const currentAssignments = JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    const filtered = currentAssignments.filter(a => a.taskId !== task.id);
    const students = getUsers().filter(u => u.role === 'student');
    
    if (task.availability === 'all') {
        students.forEach(s => filtered.push({ id: Date.now() + Math.random(), studentId: s.id, taskId: task.id, status: 'new', subtaskAnswers: {}, comments: [], reviewComments: [] }));
    } else if (task.availability === 'selective' && task.availableFor) {
        task.availableFor.forEach(sid => {
            if (students.some(s => s.id === sid)) filtered.push({ id: Date.now() + Math.random(), studentId: sid, taskId: task.id, status: 'new', subtaskAnswers: {}, comments: [], reviewComments: [] });
        });
    }
    
    localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(filtered));
}

// ============================================
// ЗАДАНИЯ "УСТАНОВИТЬ СООТВЕТСТВИЕ" (MATCHING)
// ============================================

// ========== ВЫБОР ПОДТИПА ==========

function openMatchingSubtypeModal() {
    document.getElementById('matchingSubtypeModal').classList.add('active');
}

function closeMatchingSubtypeModal() {
    document.getElementById('matchingSubtypeModal').classList.remove('active');
}

function selectMatchingSubtype(subtype) {
    closeMatchingSubtypeModal();
    currentEditingTaskId = null;
    
    if (subtype === 'pairs') {
        openMatchingTaskModal();
    } else if (subtype === 'distribution') {
        openDistributionTaskModal();
    }
}

// ========== ЗАДАНИЕ НА СООТВЕТСТВИЕ (PAIRS) ==========

function openMatchingTaskModal(task = null) {
    const modal = document.getElementById('matchingTaskModal');
    document.getElementById('matchingModalTitle').textContent = task ? 'Редактировать задание' : 'Создать задание на соответствие';
    
    if (task) {
        currentEditingTaskId = task.id;
        document.getElementById('matchingTheme').value = task.theme;
        document.getElementById('matchingName').value = task.name;
        document.getElementById('matchingDescription').value = task.description || '';
        document.getElementById('leftColumnName').value = task.leftColumnName || 'ОШИБКИ';
        document.getElementById('rightColumnName').value = task.rightColumnName || 'ПРЕДЛОЖЕНИЯ';
        
        leftItems = task.leftItems.map(item => ({...item}));
        rightItems = task.rightItems.map(item => ({...item}));
    } else {
        currentEditingTaskId = null;
        document.getElementById('matchingTheme').value = 'grammar';
        document.getElementById('matchingName').value = '';
        document.getElementById('matchingDescription').value = '';
        document.getElementById('leftColumnName').value = 'ОШИБКИ';
        document.getElementById('rightColumnName').value = 'ПРЕДЛОЖЕНИЯ';
        
        leftItems = [
            { id: 'l' + Date.now() + '1', label: 'А', text: '' },
            { id: 'l' + Date.now() + '2', label: 'Б', text: '' },
            { id: 'l' + Date.now() + '3', label: 'В', text: '' }
        ];
        rightItems = [
            { id: 'r' + Date.now() + '1', number: '1', text: '' },
            { id: 'r' + Date.now() + '2', number: '2', text: '' },
            { id: 'r' + Date.now() + '3', number: '3', text: '' }
        ];
    }
    
    renderLeftItems();
    renderRightItems();
    renderCorrectAnswers(task);
    
    modal.classList.add('active');
}

function closeMatchingTaskModal() {
    document.getElementById('matchingTaskModal').classList.remove('active');
    leftItems = [];
    rightItems = [];
    currentEditingTaskId = null;
}

function renderLeftItems() {
    const container = document.getElementById('leftColumnItems');
    container.innerHTML = leftItems.map(item => `
        <div class="column-item">
            <input type="text" class="item-label" value="${item.label}" placeholder="Обозначение" data-id="${item.id}" onchange="updateLeftLabel('${item.id}', this.value)" style="width: 60px;">
            <input type="text" value="${item.text}" placeholder="Введите текст..." data-id="${item.id}" onchange="updateLeftText('${item.id}', this.value)">
            <i class="fas fa-trash remove-item" onclick="removeLeftItem('${item.id}')"></i>
        </div>
    `).join('');
}

function renderRightItems() {
    const container = document.getElementById('rightColumnItems');
    container.innerHTML = rightItems.map(item => `
        <div class="column-item">
            <input type="text" class="item-number" value="${item.number}" placeholder="№" data-id="${item.id}" onchange="updateRightNumber('${item.id}', this.value)" style="width: 60px;">
            <input type="text" value="${item.text}" placeholder="Введите текст..." data-id="${item.id}" onchange="updateRightText('${item.id}', this.value)">
            <i class="fas fa-trash remove-item" onclick="removeRightItem('${item.id}')"></i>
        </div>
    `).join('');
}

function renderCorrectAnswers(task = null) {
    const container = document.getElementById('correctAnswers');
    container.innerHTML = leftItems.map(item => {
        let selectedRightId = '';
        if (task && task.correctPairs) {
            const correctPair = task.correctPairs.find(p => p.leftId === item.id);
            selectedRightId = correctPair ? correctPair.rightId : '';
        }
        
        return `
            <div class="correct-answer-row">
                <span class="left-label">${item.label || '?'}</span>
                <span class="left-text">${item.text || '(не заполнено)'}</span>
                <span>→</span>
                <select data-left-id="${item.id}">
                    <option value="">Выберите...</option>
                    ${rightItems.map(right => `
                        <option value="${right.id}" ${selectedRightId === right.id ? 'selected' : ''}>
                            ${right.number}. ${right.text || '(не заполнено)'}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }).join('');
}

function updateLeftLabel(id, value) {
    const item = leftItems.find(i => i.id === id);
    if (item) item.label = value;
    renderCorrectAnswers();
}

function updateLeftText(id, value) {
    const item = leftItems.find(i => i.id === id);
    if (item) item.text = value;
    renderCorrectAnswers();
}

function updateRightNumber(id, value) {
    const item = rightItems.find(i => i.id === id);
    if (item) item.number = value;
}

function updateRightText(id, value) {
    const item = rightItems.find(i => i.id === id);
    if (item) item.text = value;
}

function addLeftItem() {
    leftItems.push({
        id: 'l' + Date.now() + Math.random(),
        label: '',
        text: ''
    });
    renderLeftItems();
    renderCorrectAnswers();
}

function addRightItem() {
    rightItems.push({
        id: 'r' + Date.now() + Math.random(),
        number: '',
        text: ''
    });
    renderRightItems();
    renderCorrectAnswers();
}

function removeLeftItem(id) {
    if (leftItems.length <= 2) {
        alert('Должно быть минимум 2 пункта в левом столбце');
        return;
    }
    leftItems = leftItems.filter(i => i.id !== id);
    renderLeftItems();
    renderCorrectAnswers();
}

function removeRightItem(id) {
    if (rightItems.length <= 2) {
        alert('Должно быть минимум 2 пункта в правом столбце');
        return;
    }
    rightItems = rightItems.filter(i => i.id !== id);
    renderRightItems();
    renderCorrectAnswers();
}

function saveMatchingTask() {
    const emptyLeft = leftItems.some(i => !i.text.trim() || !i.label.trim());
    if (emptyLeft) {
        alert('Заполните все пункты левого столбца (обозначение и текст)');
        return;
    }
    
    const emptyRight = rightItems.some(i => !i.text.trim() || !i.number.toString().trim());
    if (emptyRight) {
        alert('Заполните все пункты правого столбца (текст и номер)');
        return;
    }
    
    const correctPairs = [];
    document.querySelectorAll('#correctAnswers select').forEach(select => {
        const leftId = select.getAttribute('data-left-id');
        const rightId = select.value;
        if (leftId && rightId) {
            correctPairs.push({ leftId, rightId });
        }
    });
    
    if (correctPairs.length !== leftItems.length) {
        alert('Укажите правильные ответы для всех пунктов');
        return;
    }
    
    const theme = document.getElementById('matchingTheme').value;
    const name = document.getElementById('matchingName').value.trim();
    const description = document.getElementById('matchingDescription').value.trim();
    const leftColumnName = document.getElementById('leftColumnName').value.trim();
    const rightColumnName = document.getElementById('rightColumnName').value.trim();
    
    if (!name) {
        alert('Введите название задания');
        return;
    }
    
    const taskId = currentEditingTaskId || Date.now();
    
    const task = {
        id: taskId,
        type: 'matching',
        matchingSubtype: 'pairs',
        theme,
        name,
        description,
        leftColumnName,
        rightColumnName,
        leftItems: leftItems.map(({id, label, text}) => ({id, label, text})),
        rightItems: rightItems.map(({id, number, text}) => ({id, number, text})),
        correctPairs,
        createdAt: currentEditingTaskId 
            ? (getTasks().find(t => t.id === taskId)?.createdAt || new Date().toLocaleDateString())
            : new Date().toLocaleDateString()
    };
    
    const allTasks = getTasks();
    if (currentEditingTaskId) {
        const idx = allTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) allTasks[idx] = task;
    } else {
        allTasks.push(task);
    }
    
    localStorage.setItem(Config.TASKS_KEY, JSON.stringify(allTasks));
    
    // Обновить назначения
    updateMatchingAssignments(task);
    
    closeMatchingTaskModal();
    
    if (typeof loadAdminData === 'function') loadAdminData();
    
    const currentSection = document.getElementById('currentSection');
    if (currentSection && document.getElementById('admin-tasks')?.classList.contains('active-section')) {
        renderAdminTasks(currentSection);
    }
    
    alert('Задание сохранено!');
}

function updateMatchingAssignments(task) {
    const currentAssignments = JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    const filtered = currentAssignments.filter(a => a.taskId !== task.id);
    
    const students = getUsers().filter(u => u.role === 'student');
    students.forEach(student => {
        filtered.push({
            id: Date.now() + Math.random(),
            studentId: student.id,
            taskId: task.id,
            status: 'new',
            answers: {},
            comments: [],
            reviewComments: []
        });
    });
    
    localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(filtered));
}

// ========== ЗАДАНИЕ НА РАСПРЕДЕЛЕНИЕ (DISTRIBUTION) ==========

function openDistributionTaskModal(task = null) {
    const modal = document.getElementById('distributionTaskModal');
    document.getElementById('distributionModalTitle').textContent = task ? 'Редактировать задание' : 'Создать задание на распределение';
    
    if (task) {
        currentEditingTaskId = task.id;
        document.getElementById('distributionTheme').value = task.theme;
        document.getElementById('distributionName').value = task.name;
        document.getElementById('distributionDescription').value = task.description || '';
        
        distributionColumns = task.columns.map(col => ({...col}));
        distributionWords = [...task.words];
    } else {
        currentEditingTaskId = null;
        document.getElementById('distributionTheme').value = 'orthography';
        document.getElementById('distributionName').value = '';
        document.getElementById('distributionDescription').value = '';
        
        distributionColumns = [
            { id: 'col' + Date.now() + '1', name: '' },
            { id: 'col' + Date.now() + '2', name: '' }
        ];
        distributionWords = [];
    }
    
    renderDistributionColumns();
    renderDistributionWords();
    renderDistributionCorrectAnswers(task);
    
    modal.classList.add('active');
}

function closeDistributionTaskModal() {
    document.getElementById('distributionTaskModal').classList.remove('active');
    distributionColumns = [];
    distributionWords = [];
    currentEditingTaskId = null;
}

function renderDistributionColumns() {
    const container = document.getElementById('distributionColumns');
    container.innerHTML = distributionColumns.map((col, index) => `
        <div class="column-config-row">
            <input type="text" value="${col.name}" placeholder="Название столбца" data-id="${col.id}" onchange="updateColumnName('${col.id}', this.value)">
            ${index >= 2 ? `<i class="fas fa-trash remove-item" onclick="removeDistributionColumn('${col.id}')"></i>` : ''}
        </div>
    `).join('');
}

function renderDistributionWords() {
    const container = document.getElementById('distributionWords');
    container.innerHTML = distributionWords.map((word, index) => `
        <div class="word-item-config">
            <input type="text" value="${word}" placeholder="Слово" data-index="${index}" onchange="updateWord(${index}, this.value)">
            <i class="fas fa-trash remove-item" onclick="removeWord(${index})"></i>
        </div>
    `).join('');
}

function renderDistributionCorrectAnswers(task = null) {
    const container = document.getElementById('distributionCorrectAnswers');
    container.innerHTML = distributionWords.map((word, index) => {
        let selectedColumnId = '';
        if (task && task.correctAnswers) {
            const correctAnswer = task.correctAnswers.find(a => a.word === word);
            selectedColumnId = correctAnswer ? correctAnswer.columnId : '';
        }
        
        return `
            <div class="word-answer-row">
                <span class="word-text">${word}</span>
                <span>→</span>
                <select data-word-index="${index}">
                    <option value="">Выберите столбец...</option>
                    ${distributionColumns.map(col => `
                        <option value="${col.id}" ${selectedColumnId === col.id ? 'selected' : ''}>
                            ${col.name}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }).join('');
}

function updateColumnName(id, value) {
    const col = distributionColumns.find(c => c.id === id);
    if (col) col.name = value;
    renderDistributionCorrectAnswers();
}

function addColumn() {
    distributionColumns.push({
        id: 'col' + Date.now() + Math.random(),
        name: `Столбец ${distributionColumns.length + 1}`
    });
    renderDistributionColumns();
    renderDistributionCorrectAnswers();
}

function removeDistributionColumn(id) {
    if (distributionColumns.length <= 2) {
        alert('Должно быть минимум 2 столбца');
        return;
    }
    distributionColumns = distributionColumns.filter(c => c.id !== id);
    renderDistributionColumns();
    renderDistributionCorrectAnswers();
}

function addWord() {
    const input = document.getElementById('newWordInput');
    const newWord = input.value.trim();
    if (newWord) {
        distributionWords.push(newWord);
        input.value = '';
        renderDistributionWords();
        renderDistributionCorrectAnswers();
    }
}

function updateWord(index, value) {
    distributionWords[index] = value;
    renderDistributionCorrectAnswers();
}

function removeWord(index) {
    if (distributionWords.length <= 2) {
        alert('Должно быть минимум 2 слова');
        return;
    }
    distributionWords.splice(index, 1);
    renderDistributionWords();
    renderDistributionCorrectAnswers();
}

function saveDistributionTask() {
    const emptyColumns = distributionColumns.some(c => !c.name.trim());
    if (emptyColumns) {
        alert('Заполните названия всех столбцов');
        return;
    }
    
    const emptyWords = distributionWords.some(w => !w.trim());
    if (emptyWords) {
        alert('Заполните все слова');
        return;
    }
    
    const correctAnswers = [];
    document.querySelectorAll('#distributionCorrectAnswers select').forEach(select => {
        const wordIndex = select.getAttribute('data-word-index');
        const columnId = select.value;
        if (wordIndex && columnId) {
            correctAnswers.push({
                word: distributionWords[wordIndex],
                columnId
            });
        }
    });
    
    if (correctAnswers.length !== distributionWords.length) {
        alert('Укажите правильный столбец для всех слов');
        return;
    }
    
    const theme = document.getElementById('distributionTheme').value;
    const name = document.getElementById('distributionName').value.trim();
    const description = document.getElementById('distributionDescription').value.trim();
    
    if (!name) {
        alert('Введите название задания');
        return;
    }
    
    const taskId = currentEditingTaskId || Date.now();
    
    const task = {
        id: taskId,
        type: 'matching',
        matchingSubtype: 'distribution',
        theme,
        name,
        description,
        columns: distributionColumns.map(({id, name}) => ({id, name})),
        words: [...distributionWords],
        correctAnswers,
        createdAt: currentEditingTaskId 
            ? (getTasks().find(t => t.id === taskId)?.createdAt || new Date().toLocaleDateString())
            : new Date().toLocaleDateString()
    };
    
    const allTasks = getTasks();
    if (currentEditingTaskId) {
        const idx = allTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) allTasks[idx] = task;
    } else {
        allTasks.push(task);
    }
    
    localStorage.setItem(Config.TASKS_KEY, JSON.stringify(allTasks));
    
    updateMatchingAssignments(task);
    
    closeDistributionTaskModal();
    
    if (typeof loadAdminData === 'function') loadAdminData();
    
    const currentSection = document.getElementById('currentSection');
    if (currentSection && document.getElementById('admin-tasks')?.classList.contains('active-section')) {
        renderAdminTasks(currentSection);
    }
    
    alert('Задание сохранено!');
}

// ============================================
// ЗАДАНИЯ "НАПИСАТЬ СЛОВО" (WRITE-WORD)
// ============================================

function selectWriteWordAvailability(type) {
    document.querySelector(`input[name="writeWordAvailability"][value="${type}"]`).checked = true;
    const selector = document.getElementById('writeWordStudentSelector');
    if (type === 'selective') {
        selector.style.display = 'block';
        loadWriteWordStudentList();
    } else {
        selector.style.display = 'none';
    }
}

function loadWriteWordStudentList(selectedIds = []) {
    const container = document.getElementById('writeWordStudentSelector');
    const users = getUsers();
    const students = users.filter(u => u.role === 'student');
    
    container.innerHTML = students.map(student => `
        <div class="student-checkbox">
            <input type="checkbox" id="ww_${student.id}" value="${student.id}" ${selectedIds.includes(student.id) ? 'checked' : ''}>
            <label for="ww_${student.id}">${student.name} (${student.email})</label>
        </div>
    `).join('');
}

function toggleWriteWordTextArea(show) {
    document.getElementById('writeWordTextGroup').style.display = show ? 'block' : 'none';
}

function addWriteWordAnswerField(value = '') {
    const container = document.getElementById('writeWordCorrectAnswersContainer');
    const div = document.createElement('div');
    div.className = 'correct-answer-row';
    div.innerHTML = `
        <input type="text" placeholder="Верный вариант ответа" value="${value.replace(/"/g, '&quot;')}">
        <i class="fas fa-trash remove-answer" onclick="this.parentElement.remove()"></i>
    `;
    container.appendChild(div);
}

function openWriteWordModal(taskId = null) {
    currentEditingTaskId = taskId;
    const modal = document.getElementById('writeWordModal');
    document.getElementById('writeWordModalTitle').textContent = taskId ? 'Редактировать задание' : 'Создать задание: написать слово';

    if (taskId) {
        const task = getTasks().find(t => t.id === taskId);
        if (task && task.type === 'write-word') {
            document.getElementById('writeWordTheme').value = task.theme;
            document.getElementById('writeWordName').value = task.name;
            
            document.querySelector(`input[name="writeWordCheckMode"][value="${task.checkMode || 'auto'}"]`).checked = true;
            document.querySelector(`input[name="writeWordAvailability"][value="${task.availability || 'all'}"]`).checked = true;

            const includeText = !!task.workText;
            document.getElementById('writeWordIncludeText').checked = includeText;
            toggleWriteWordTextArea(includeText);
            if (includeText) document.getElementById('writeWordText').value = task.workText;

            document.getElementById('writeWordDescription').value = task.description || '';

            const answersContainer = document.getElementById('writeWordCorrectAnswersContainer');
            answersContainer.innerHTML = '';
            if (task.correctAnswers && task.correctAnswers.length) {
                task.correctAnswers.forEach(ans => addWriteWordAnswerField(ans));
            } else {
                addWriteWordAnswerField();
            }

            if (task.availability === 'selective') {
                document.getElementById('writeWordStudentSelector').style.display = 'block';
                loadWriteWordStudentList(task.availableFor || []);
            } else {
                document.getElementById('writeWordStudentSelector').style.display = 'none';
            }
        }
    } else {
        // Режим создания — пустые поля
        document.getElementById('writeWordTheme').value = 'orthography';
        document.getElementById('writeWordName').value = '';
        document.querySelector('input[name="writeWordCheckMode"][value="auto"]').checked = true;
        document.querySelector('input[name="writeWordAvailability"][value="all"]').checked = true;
        document.getElementById('writeWordIncludeText').checked = false;
        toggleWriteWordTextArea(false);
        document.getElementById('writeWordText').value = '';
        document.getElementById('writeWordDescription').value = '';
        document.getElementById('writeWordCorrectAnswersContainer').innerHTML = '';
        addWriteWordAnswerField();
        document.getElementById('writeWordStudentSelector').style.display = 'none';
    }
    modal.classList.add('active');
}

function closeWriteWordModal() {
    document.getElementById('writeWordModal').classList.remove('active');
    currentEditingTaskId = null;
}

function saveWriteWordTask() {
    const theme = document.getElementById('writeWordTheme').value;
    const name = document.getElementById('writeWordName').value.trim();
    if (!name) { alert('Введите название'); return; }

    const checkMode = document.querySelector('input[name="writeWordCheckMode"]:checked')?.value || 'auto';
    const availability = document.querySelector('input[name="writeWordAvailability"]:checked')?.value || 'all';
    
    let availableFor = [];
    if (availability === 'selective') {
        document.querySelectorAll('#writeWordStudentSelector input:checked').forEach(cb => availableFor.push(cb.value));
    }

    const includeText = document.getElementById('writeWordIncludeText').checked;
    const workText = includeText ? document.getElementById('writeWordText').value : '';

    const description = document.getElementById('writeWordDescription').value;

    const answerInputs = document.querySelectorAll('#writeWordCorrectAnswersContainer .correct-answer-row input');
    const correctAnswers = [];
    answerInputs.forEach(inp => {
        const val = inp.value.trim();
        if (val) correctAnswers.push(val);
    });

    if (correctAnswers.length === 0) {
        alert('Укажите хотя бы один верный вариант ответа');
        return;
    }

    const taskId = currentEditingTaskId || Date.now();
    
    const task = {
        id: taskId,
        type: 'write-word',
        theme,
        name,
        checkMode,
        availability,
        availableFor,
        workText,
        description,
        correctAnswers,
        createdAt: currentEditingTaskId 
            ? (getTasks().find(t => t.id === taskId)?.createdAt || new Date().toLocaleDateString())
            : new Date().toLocaleDateString()
    };

    const allTasks = getTasks();
    if (currentEditingTaskId) {
        const idx = allTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) allTasks[idx] = task;
    } else {
        allTasks.push(task);
    }
    localStorage.setItem(Config.TASKS_KEY, JSON.stringify(allTasks));

    updateWriteWordAssignments(task);

    closeWriteWordModal();
    
    if (typeof loadAdminData === 'function') loadAdminData();
    
    const currentSection = document.getElementById('currentSection');
    if (currentSection && document.getElementById('admin-tasks')?.classList.contains('active-section')) {
        renderAdminTasks(currentSection);
    }
    
    alert('Задание сохранено!');
}

function updateWriteWordAssignments(task) {
    const currentAssignments = JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    let updated = currentAssignments.filter(a => a.taskId !== task.id);
    
    const students = getUsers().filter(u => u.role === 'student');
    if (task.availability === 'all') {
        students.forEach(s => {
            updated.push({
                id: Date.now() + Math.random(),
                studentId: s.id,
                taskId: task.id,
                status: 'new',
                studentAnswer: '',
                comments: [],
                reviewComments: []
            });
        });
    } else if (task.availability === 'selective' && task.availableFor) {
        task.availableFor.forEach(sid => {
            updated.push({
                id: Date.now() + Math.random(),
                studentId: sid,
                taskId: task.id,
                status: 'new',
                studentAnswer: '',
                comments: [],
                reviewComments: []
            });
        });
    }
    
    localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(updated));
}

// ============================================
// ЗАДАНИЯ "РАБОТА С ТЕКСТОМ" (TEXT-WORK)
// ============================================

function toggleTextWorkType() {
    const type = document.getElementById('textWorkType').value;
    const autoCheckSection = document.getElementById('textWorkAutoCheckSection');
    const checkModeAuto = document.querySelector('input[name="textWorkCheckMode"][value="auto"]');
    const checkModeManual = document.querySelector('input[name="textWorkCheckMode"][value="manual"]');
    
    if (type === 'essay') {
        // Сочинение — только ручная проверка, скрываем авто-поля
        autoCheckSection.style.display = 'none';
        if (checkModeManual) checkModeManual.checked = true;
        if (checkModeAuto) checkModeAuto.disabled = true;
    } else {
        // Работа с текстом — можно выбрать авто или ручную
        if (checkModeAuto) checkModeAuto.disabled = false;
        toggleTextWorkCheckMode();
    }
}

function toggleTextWorkCheckMode() {
    const checkMode = document.querySelector('input[name="textWorkCheckMode"]:checked')?.value;
    const autoCheckSection = document.getElementById('textWorkAutoCheckSection');
    const type = document.getElementById('textWorkType').value;
    
    if (type === 'essay') {
        autoCheckSection.style.display = 'none';
    } else if (checkMode === 'auto') {
        autoCheckSection.style.display = 'block';
    } else {
        autoCheckSection.style.display = 'none';
    }
}

function selectTextWorkAvailability(type) {
    document.querySelector(`input[name="textWorkAvailability"][value="${type}"]`).checked = true;
    const selector = document.getElementById('textWorkStudentSelector');
    if (type === 'selective') {
        selector.style.display = 'block';
        loadTextWorkStudentList();
    } else {
        selector.style.display = 'none';
    }
}

function loadTextWorkStudentList(selectedIds = []) {
    const container = document.getElementById('textWorkStudentSelector');
    const users = getUsers();
    const students = users.filter(u => u.role === 'student');
    
    container.innerHTML = students.map(student => `
        <div class="student-checkbox">
            <input type="checkbox" id="tw_${student.id}" value="${student.id}" ${selectedIds.includes(student.id) ? 'checked' : ''}>
            <label for="tw_${student.id}">${student.name} (${student.email})</label>
        </div>
    `).join('');
}

function openTextWorkModal(taskId = null) {
    currentEditingTaskId = taskId;
    const modal = document.getElementById('textWorkModal');
    document.getElementById('textWorkModalTitle').textContent = taskId ? 'Редактировать задание' : 'Создать задание: работа с текстом';

    if (taskId) {
        const task = getTasks().find(t => t.id === taskId);
        if (task && (task.type === 'text-work' || task.type === 'essay')) {
            document.getElementById('textWorkType').value = task.type === 'essay' ? 'essay' : 'text-work';
            document.getElementById('textWorkTheme').value = task.theme || 'text';
            document.getElementById('textWorkName').value = task.name || '';
            document.getElementById('textWorkDescription').value = task.description || '';
            document.getElementById('textWorkSource').value = task.sourceText || '';
            
            document.querySelector(`input[name="textWorkCheckMode"][value="${task.checkMode || 'auto'}"]`).checked = true;
            document.querySelector(`input[name="textWorkAvailability"][value="${task.availability || 'all'}"]`).checked = true;
            
            if (task.type === 'text-work' && task.checkMode === 'auto') {
                document.getElementById('textWorkCorrect').value = task.correctText || '';
                document.getElementById('textWorkGapCount').value = task.gapCount || 5;
            }
            
            if (task.availability === 'selective') {
                document.getElementById('textWorkStudentSelector').style.display = 'block';
                loadTextWorkStudentList(task.availableFor || []);
            } else {
                document.getElementById('textWorkStudentSelector').style.display = 'none';
            }
        }
    } else {
        document.getElementById('textWorkType').value = 'text-work';
        document.getElementById('textWorkTheme').value = 'text';
        document.getElementById('textWorkName').value = '';
        document.getElementById('textWorkDescription').value = '';
        document.getElementById('textWorkSource').value = '';
        document.getElementById('textWorkCorrect').value = '';
        document.getElementById('textWorkGapCount').value = 5;
        
        document.querySelector('input[name="textWorkCheckMode"][value="auto"]').checked = true;
        document.querySelector('input[name="textWorkAvailability"][value="all"]').checked = true;
        
        document.getElementById('textWorkStudentSelector').style.display = 'none';
    }
    
    toggleTextWorkType();
    modal.classList.add('active');
}

function closeTextWorkModal() {
    document.getElementById('textWorkModal').classList.remove('active');
    currentEditingTaskId = null;
}

function saveTextWorkTask() {
    const type = document.getElementById('textWorkType').value;
    const theme = document.getElementById('textWorkTheme').value;
    const name = document.getElementById('textWorkName').value.trim();
    const description = document.getElementById('textWorkDescription').value.trim();
    const sourceText = document.getElementById('textWorkSource').value;
    const checkMode = document.querySelector('input[name="textWorkCheckMode"]:checked')?.value || 'manual';
    const availability = document.querySelector('input[name="textWorkAvailability"]:checked')?.value || 'all';
    
    if (!name) { alert('Введите название задания'); return; }
    if (!sourceText) { alert('Введите исходный текст'); return; }
    
    let availableFor = [];
    if (availability === 'selective') {
        document.querySelectorAll('#textWorkStudentSelector input:checked').forEach(cb => availableFor.push(cb.value));
        if (availableFor.length === 0) {
            alert('Выберите хотя бы одного ученика');
            return;
        }
    }
    
    let correctText = '';
    let gapCount = 0;
    
    if (type === 'text-work' && checkMode === 'auto') {
        correctText = document.getElementById('textWorkCorrect').value;
        gapCount = parseInt(document.getElementById('textWorkGapCount').value) || 0;
        
        if (!correctText) {
            alert('Введите верный текст для автоматической проверки');
            return;
        }
        if (gapCount <= 0) {
            alert('Укажите количество пропусков (больше 0)');
            return;
        }
    }
    
    const taskId = currentEditingTaskId || Date.now();
    
    const task = {
        id: taskId,
        type: type,
        theme,
        name,
        description,
        checkMode,
        availability,
        availableFor,
        sourceText,
        correctText,
        gapCount,
        createdAt: currentEditingTaskId 
            ? (getTasks().find(t => t.id === taskId)?.createdAt || new Date().toLocaleDateString())
            : new Date().toLocaleDateString()
    };
    
    const allTasks = getTasks();
    if (currentEditingTaskId) {
        const idx = allTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) allTasks[idx] = task;
    } else {
        allTasks.push(task);
    }
    localStorage.setItem(Config.TASKS_KEY, JSON.stringify(allTasks));

    updateTextWorkAssignments(task);

    closeTextWorkModal();
    
    if (typeof loadAdminData === 'function') loadAdminData();
    
    const currentSection = document.getElementById('currentSection');
    if (currentSection && document.getElementById('admin-tasks')?.classList.contains('active-section')) {
        renderAdminTasks(currentSection);
    }
    
    alert('Задание сохранено!');
}

function updateTextWorkAssignments(task) {
    const currentAssignments = JSON.parse(localStorage.getItem(Config.ASSIGNMENTS_KEY) || '[]');
    let updated = currentAssignments.filter(a => a.taskId !== task.id);
    
    const students = getUsers().filter(u => u.role === 'student');
    if (task.availability === 'all') {
        students.forEach(s => {
            updated.push({
                id: Date.now() + Math.random(),
                studentId: s.id,
                taskId: task.id,
                status: 'new',
                studentAnswer: '',
                comments: [],
                reviewComments: []
            });
        });
    } else if (task.availability === 'selective' && task.availableFor) {
        task.availableFor.forEach(sid => {
            updated.push({
                id: Date.now() + Math.random(),
                studentId: sid,
                taskId: task.id,
                status: 'new',
                studentAnswer: '',
                comments: [],
                reviewComments: []
            });
        });
    }
    
    localStorage.setItem(Config.ASSIGNMENTS_KEY, JSON.stringify(updated));
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Получение названия доступности задания
 */
function getAvailabilityLabel(availability, availableFor = []) {
    if (availability === 'all') {
        return '👥 Всем ученикам';
    } else if (availability === 'selective') {
        return `👤 Выборочно (${availableFor?.length || 0} уч.)`;
    }
    return '👥 Всем ученикам';
}

/**
 * Получение CSS-класса для доступности задания
 */
function getAvailabilityClass(availability) {
    if (availability === 'all') {
        return 'badge-available-all';
    } else if (availability === 'selective') {
        return 'badge-available-selective';
    }
    return 'badge-available-all';
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем основные функции
window.renderAdminTasks = renderAdminTasks;
window.renderTasksTable = renderTasksTable;
window.filterAdminTasks = filterAdminTasks;
window.editTask = editTask;
window.deleteTask = deleteTask;

// Экспортируем функции для модальных окон
window.openTaskTypeModal = openTaskTypeModal;
window.closeTaskTypeModal = closeTaskTypeModal;
window.selectTaskType = selectTaskType;

// Экспортируем функции для заданий "Выбрать варианты ответа"
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.selectAvailability = selectAvailability;
window.loadStudentCheckboxList = loadStudentCheckboxList;
window.addSubtask = addSubtask;
window.renderSubtaskCard = renderSubtaskCard;
window.duplicateSubtask = duplicateSubtask;
window.moveSubtaskUp = moveSubtaskUp;
window.moveSubtaskDown = moveSubtaskDown;
window.removeSubtask = removeSubtask;
window.handleSubtaskImage = handleSubtaskImage;
window.removeSubtaskImage = removeSubtaskImage;
window.insertGapInSubtask = insertGapInSubtask;
window.renderGapCard = renderGapCard;
window.updateGapType = updateGapType;
window.addGapOption = addGapOption;
window.addOptionToSubtask = addOptionToSubtask;
window.addOptionRow = addOptionRow;
window.saveTask = saveTask;

// Экспортируем функции для заданий "Соответствие"
window.openMatchingSubtypeModal = openMatchingSubtypeModal;
window.closeMatchingSubtypeModal = closeMatchingSubtypeModal;
window.selectMatchingSubtype = selectMatchingSubtype;
window.openMatchingTaskModal = openMatchingTaskModal;
window.closeMatchingTaskModal = closeMatchingTaskModal;
window.renderLeftItems = renderLeftItems;
window.renderRightItems = renderRightItems;
window.renderCorrectAnswers = renderCorrectAnswers;
window.addLeftItem = addLeftItem;
window.addRightItem = addRightItem;
window.removeLeftItem = removeLeftItem;
window.removeRightItem = removeRightItem;
window.saveMatchingTask = saveMatchingTask;

// Экспортируем функции для заданий "Распределение"
window.openDistributionTaskModal = openDistributionTaskModal;
window.closeDistributionTaskModal = closeDistributionTaskModal;
window.renderDistributionColumns = renderDistributionColumns;
window.renderDistributionWords = renderDistributionWords;
window.renderDistributionCorrectAnswers = renderDistributionCorrectAnswers;
window.addColumn = addColumn;
window.removeDistributionColumn = removeDistributionColumn;
window.addWord = addWord;
window.removeWord = removeWord;
window.saveDistributionTask = saveDistributionTask;

// Экспортируем функции для заданий "Написать слово"
window.selectWriteWordAvailability = selectWriteWordAvailability;
window.loadWriteWordStudentList = loadWriteWordStudentList;
window.toggleWriteWordTextArea = toggleWriteWordTextArea;
window.addWriteWordAnswerField = addWriteWordAnswerField;
window.openWriteWordModal = openWriteWordModal;
window.closeWriteWordModal = closeWriteWordModal;
window.saveWriteWordTask = saveWriteWordTask;

// Экспортируем функции для заданий "Работа с текстом"
window.toggleTextWorkType = toggleTextWorkType;
window.toggleTextWorkCheckMode = toggleTextWorkCheckMode;
window.selectTextWorkAvailability = selectTextWorkAvailability;
window.loadTextWorkStudentList = loadTextWorkStudentList;
window.openTextWorkModal = openTextWorkModal;
window.closeTextWorkModal = closeTextWorkModal;
window.saveTextWorkTask = saveTextWorkTask;

// Экспортируем вспомогательные функции
window.getAvailabilityLabel = getAvailabilityLabel;
window.getAvailabilityClass = getAvailabilityClass;

// Сообщаем о загрузке модуля
console.log('📚 Модуль AdminTasks.js загружен');
