/**
 * ============================================
 * МОДУЛЬ: ВЫПОЛНЕНИЕ ЗАДАНИЙ УЧЕНИКОМ
 * ============================================
 * 
 * Отвечает за:
 * - Отображение интерфейса выполнения задания
 * - Обработку ответов на все типы заданий
 * - Автоматическую и ручную проверку
 * - Отображение результатов
 * - Работу с комментариями
 * - Режим исправления ошибок
 * ============================================
 */

/**
 * Рендеринг страницы выполнения задания
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderStudentTaskExecution(container) {
    // Секция рендерится динамически через openStudentTask
    // Здесь только заглушка
    container.innerHTML = `
        <button class="btn-back" onclick="backToTasks()" style="margin-bottom: 16px;">
            <i class="fas fa-arrow-left"></i> Назад к заданиям
        </button>
        <div id="taskExecutionContainer"></div>
    `;
}

/**
 * Открытие задания для выполнения
 * @param {number} taskId - ID задания
 */
function openStudentTask(taskId) {
    navigateTo('student-task-execution');
    
    setTimeout(() => {
        const container = document.getElementById('taskExecutionContainer');
        if (!container) {
            console.error('taskExecutionContainer не найден');
            return;
        }
        
        const task = getTasks().find(t => t.id === taskId);
        const user = getCurrentUser();
        const assignment = getAssignments().find(a => a.taskId === taskId && a.studentId === user.id);
        
        if (!task) {
            container.innerHTML = '<p>Задание не найдено</p>';
            return;
        }
        
        // Определяем тип задания и рендерим соответствующий интерфейс
        if (task.type === 'multiple-choice') {
            renderMultipleChoiceTask(task, assignment);
        } else if (task.type === 'matching') {
            if (task.enhanced === true) {
                renderInteractiveMatchingTask(task, assignment);
            } else if (task.matchingSubtype === 'pairs') {
                renderMatchingPairsTask(task, assignment);
            } else if (task.matchingSubtype === 'distribution') {
                renderDistributionTask(task, assignment);
            }
        } else if (task.type === 'write-word') {
            renderWriteWordTask(task, assignment);
        } else if (task.type === 'text-work') {
            renderTextWorkTask(task, assignment);
        } else if (task.type === 'essay') {
            renderEssayTask(task, assignment);
        } else {
            container.innerHTML = '<p>Тип задания не поддерживается</p>';
        }
    }, 50);
}

// ============================================
// 1. MULTIPLE-CHOICE (ВЫБОР ВАРИАНТОВ ОТВЕТА)
// ============================================

let currentFixingTaskId = null;

function renderMultipleChoiceTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const isChecked = assignment?.status === 'auto-checked' && task.checkMode === 'auto';
    const isFixing = assignment?.fixMode === true;
    const disabled = (assignment?.status === 'pending' || assignment?.status === 'checked' || (assignment?.status === 'auto-checked' && !isFixing));
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        ${isFixing ? '<div class="fix-progress">🔧 Режим исправления ошибок. Исправьте только неверные ответы.</div>' : ''}
    `;
    
    task.subtasks.forEach((subtask, index) => {
        const sa = assignment?.subtaskAnswers?.[subtask.id] || { answers: {}, selectedOptions: [] };
        
        if (subtask.image) {
            html += `<div class="subtask-image-display"><img src="${subtask.image}" alt=""></div>`;
        }
        
        // Текст с пропусками
        let text = subtask.interactive || '';
        let resultHtml = '';
        let lastIndex = 0;
        const regex = /\{gap\}/g;
        let match;
        let gapIdx = 0;
        
        while ((match = regex.exec(text)) !== null) {
            resultHtml += escapeHtml(text.substring(lastIndex, match.index));
            const gap = subtask.gaps[gapIdx++];
            if (gap) {
                const answer = sa.answers?.[gap.id] || '';
                const showResults = isChecked && !isFixing;
                const isCorrect = answer === gap.correct;
                
                let fieldClass = 'gap-widget';
                if (gap.correct && gap.correct.length <= 1) fieldClass += ' small';
                if (gap.correct && gap.correct.length > 3) fieldClass += ' large';
                if (showResults) fieldClass += isCorrect ? ' gap-correct' : ' gap-incorrect';
                
                const isDisabled = disabled || (isFixing && isCorrect);
                
                if (gap.type === 'select') {
                    resultHtml += `<span class="${fieldClass}"><select data-gap-id="${gap.id}" data-subtask-id="${subtask.id}" ${isDisabled ? 'disabled' : ''}>`;
                    resultHtml += '<option value="">...</option>';
                    (gap.options || []).forEach(opt => {
                        resultHtml += `<option value="${opt}" ${answer===opt?'selected':''}>${opt}</option>`;
                    });
                    resultHtml += '</select></span>';
                } else {
                    resultHtml += `<span class="${fieldClass}"><input type="text" data-gap-id="${gap.id}" data-subtask-id="${subtask.id}" value="${escapeHtml(answer)}" placeholder="..." ${isDisabled ? 'disabled' : ''}></span>`;
                }
            }
            lastIndex = match.index + 5;
        }
        resultHtml += escapeHtml(text.substring(lastIndex));
        
        html += `<div class="subtask-execution"><h4>${index + 1}. ${subtask.description}</h4><div class="interactive-content">${resultHtml}</div>`;
        
        // Блок ответов после проверки
        if (isChecked && !isFixing) {
            html += `<div class="correct-answer-reveal">`;
            
            // Ваш ответ
            html += `<div class="answer-block"><strong><i class="fas fa-pencil-alt" style="color:#4f46e5;margin-right:6px;"></i>Ваш ответ:</strong><br>`;
            let hasAnswer = false;
            subtask.gaps.forEach(gap => {
                const ua = sa.answers?.[gap.id] || '';
                if (ua.trim()) { hasAnswer = true; html += `<span style="color:${ua===gap.correct?'#10b981':'#ef4444'};">• ${escapeHtml(ua)}</span><br>`; }
            });
            subtask.options.forEach((opt, idx) => {
                if (sa.selectedOptions?.includes(idx)) { hasAnswer = true; html += `<span style="color:${opt.correct?'#10b981':'#ef4444'};">• ${opt.text}</span><br>`; }
            });
            if (!hasAnswer) html += '<span style="color:#94a3b8;">(нет ответа)</span><br>';
            html += `</div>`;
            
            // Верный ответ
            html += `<div class="answer-block"><strong><i class="fas fa-check-circle" style="color:#10b981;margin-right:6px;"></i>Верный ответ:</strong><br>`;
            subtask.gaps.forEach(gap => { html += `<span style="color:#10b981;">• ${gap.correct}</span><br>`; });
            subtask.options.filter(o => o.correct).forEach(opt => { html += `<span style="color:#10b981;">• ${opt.text}</span><br>`; });
            html += `</div>`;
            
            // Пояснение
            if (subtask.explanation) {
                html += `<div class="answer-block"><strong><i class="fas fa-lightbulb" style="color:#f59e0b;margin-right:6px;"></i>Пояснение:</strong><br><span style="color:#334155;">${subtask.explanation}</span></div>`;
            }
            
            html += `</div>`;
        }
        
        // Варианты ответа с индикаторами
        html += `<div class="answer-options"><h5>Выберите правильные варианты:</h5>`;
        
        subtask.options.forEach((opt, idx) => {
            const isSelected = sa.selectedOptions?.includes(idx) || false;
            const showResults = isChecked && !isFixing;
            const isOptionDisabled = disabled || (isFixing && isSelected && opt.correct);
            
            let indicatorHtml = '';
            if (showResults) {
                if (opt.correct && isSelected) {
                    indicatorHtml = '<span class="correct-indicator correct"><i class="fas fa-check"></i></span>';
                } else if (!opt.correct && isSelected) {
                    indicatorHtml = '<span class="correct-indicator incorrect-blue"><i class="fas fa-times"></i></span>';
                } else if (opt.correct && !isSelected) {
                    indicatorHtml = '<span class="correct-indicator correct" style="opacity:0.4;"><i class="fas fa-check"></i></span>';
                }
            }
            
            html += `
                <div class="answer-option ${isSelected ? 'selected' : ''} ${isOptionDisabled ? 'disabled-option' : ''}" 
                     onclick="toggleMultipleChoiceOption(this, ${idx}, '${subtask.id}')">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} ${isOptionDisabled ? 'disabled' : ''}
                           onclick="event.stopPropagation(); toggleMultipleChoiceOption(this.closest('.answer-option'), ${idx}, '${subtask.id}');">
                    <label style="cursor:pointer;">${opt.text}</label>
                    ${indicatorHtml}
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    // Результаты
    if (isChecked && !isFixing) {
        let totalCorrect = 0, totalMax = 0;
        task.subtasks.forEach(subtask => {
            const sa = assignment?.subtaskAnswers?.[subtask.id] || { answers: {}, selectedOptions: [] };
            subtask.gaps.forEach(gap => {
                if ((sa.answers?.[gap.id] || '') === gap.correct) totalCorrect++;
                totalMax++;
            });
            const correctOptions = subtask.options.filter(o => o.correct);
            totalMax += correctOptions.length;
            subtask.options.forEach((opt, idx) => {
                if (opt.correct && sa.selectedOptions?.includes(idx)) totalCorrect++;
            });
        });
        html += `<div class="auto-result"><div class="auto-result-header"><span class="auto-result-title">📊 Результат</span><span class="auto-result-score">${totalCorrect}/${totalMax}</span></div></div>`;
    }
    
    // Кнопки действий
    html += '<div class="action-buttons">';
    if (task.checkMode === 'auto' && (!assignment || assignment.status === 'new')) {
        html += `<button class="btn-check" onclick="checkMultipleChoiceTask(${task.id})"><i class="fas fa-check-circle"></i> Проверить</button>`;
    }
    if (task.checkMode === 'manual' && (!assignment || assignment.status === 'new')) {
        html += `<button class="btn-submit" onclick="submitManualTask(${task.id})"><i class="fas fa-paper-plane"></i> Отправить на проверку</button>`;
    }
    if (isChecked && !isFixing) {
        html += `<button class="btn-fix-errors" onclick="startFixErrors(${task.id})"><i class="fas fa-wrench"></i> Исправить ошибки</button>`;
    }
    if (isFixing) {
        html += `<button class="btn-check" onclick="recheckAfterFix(${task.id})"><i class="fas fa-check-circle"></i> Проверить исправления</button>`;
    }
    if (assignment?.status === 'pending') {
        html += '<div style="color:#eab308;font-weight:600;">⏳ Ожидает проверки репетитора</div>';
    }
    html += '</div>';
    
    html += renderCommentsSection(assignment, task.id);
    container.innerHTML = html;
}

function toggleMultipleChoiceOption(element, optionIndex, subtaskId) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (!checkbox || checkbox.disabled || element.classList.contains('disabled-option')) return;
    
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
        element.classList.add('selected');
    } else {
        element.classList.remove('selected');
    }
}

function checkMultipleChoiceTask(taskId) {
    const answers = {};
    
    document.querySelectorAll('[data-gap-id]').forEach(el => {
        const gapId = el.getAttribute('data-gap-id');
        const subtaskId = el.getAttribute('data-subtask-id');
        if (!answers[subtaskId]) answers[subtaskId] = { answers: {}, selectedOptions: [] };
        answers[subtaskId].answers[gapId] = el.value || '';
    });
    
    document.querySelectorAll('.subtask-execution').forEach(subtaskEl => {
        const firstInput = subtaskEl.querySelector('[data-subtask-id]');
        if (!firstInput) return;
        const subtaskId = firstInput.getAttribute('data-subtask-id');
        if (!answers[subtaskId]) answers[subtaskId] = { answers: {}, selectedOptions: [] };
        answers[subtaskId].selectedOptions = [];
        
        subtaskEl.querySelectorAll('.answer-option').forEach((optEl, idx) => {
            if (optEl.querySelector('input[type="checkbox"]')?.checked) {
                answers[subtaskId].selectedOptions.push(idx);
            }
        });
    });
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    const existingIdx = allAssignments.findIndex(a => a.taskId === taskId && a.studentId === user.id);
    
    const assignment = {
        id: existingIdx !== -1 ? allAssignments[existingIdx].id : Date.now(),
        studentId: user.id, taskId, status: 'auto-checked', subtaskAnswers: answers,
        comments: existingIdx !== -1 ? (allAssignments[existingIdx].comments || []) : [],
        reviewComments: existingIdx !== -1 ? (allAssignments[existingIdx].reviewComments || []) : [],
        submittedAt: new Date().toISOString(), fixMode: false
    };
    
    if (existingIdx !== -1) allAssignments[existingIdx] = assignment;
    else allAssignments.push(assignment);
    
    setAssignments(allAssignments);
    openStudentTask(taskId);
}

function submitManualTask(taskId) {
    const gapAnswers = {};
    document.querySelectorAll('[data-gap-id]').forEach(el => {
        const gapId = el.getAttribute('data-gap-id');
        const subtaskId = el.getAttribute('data-subtask-id');
        if (!gapAnswers[subtaskId]) gapAnswers[subtaskId] = { answers: {}, selectedOptions: [] };
        gapAnswers[subtaskId].answers[gapId] = el.value || '';
    });
    
    document.querySelectorAll('.subtask-execution').forEach(subtaskEl => {
        const firstInput = subtaskEl.querySelector('[data-subtask-id]');
        if (!firstInput) return;
        const subtaskId = firstInput.getAttribute('data-subtask-id');
        if (!gapAnswers[subtaskId]) gapAnswers[subtaskId] = { answers: {}, selectedOptions: [] };
        gapAnswers[subtaskId].selectedOptions = [];
        subtaskEl.querySelectorAll('.answer-option').forEach((optEl, idx) => {
            if (optEl.querySelector('input[type="checkbox"]')?.checked) {
                gapAnswers[subtaskId].selectedOptions.push(idx);
            }
        });
    });
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    const existingIdx = allAssignments.findIndex(a => a.taskId === taskId && a.studentId === user.id);
    
    const assignment = {
        id: existingIdx !== -1 ? allAssignments[existingIdx].id : Date.now(),
        studentId: user.id, taskId, status: 'pending', subtaskAnswers: gapAnswers,
        comments: existingIdx !== -1 ? (allAssignments[existingIdx].comments || []) : [],
        reviewComments: existingIdx !== -1 ? (allAssignments[existingIdx].reviewComments || []) : [],
        submittedAt: new Date().toISOString(), fixMode: false
    };
    
    if (existingIdx !== -1) allAssignments[existingIdx] = assignment;
    else allAssignments.push(assignment);
    
    setAssignments(allAssignments);
    alert('Задание отправлено на проверку!');
    backToTasks();
}

function startFixErrors(taskId) {
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    const idx = allAssignments.findIndex(a => a.taskId === taskId && a.studentId === user.id);
    if (idx !== -1) {
        allAssignments[idx].fixMode = true;
        setAssignments(allAssignments);
    }
    openStudentTask(taskId);
}

function recheckAfterFix(taskId) {
    checkMultipleChoiceTask(taskId);
}

// ============================================
// 2. MATCHING PAIRS (СООТВЕТСТВИЕ)
// ============================================

function renderMatchingPairsTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const savedAnswers = assignment?.answers || {};
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    const isChecked = assignment?.status === 'auto-checked';
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        <div class="execution-description">${task.description || 'Установите соответствие между элементами'}</div>
        
        <div class="matching-layout">
            <div class="left-column">
                <div class="column-title">${task.leftColumnName || 'Левый столбец'}</div>
                <div class="left-items">
                    ${task.leftItems.map(item => `
                        <div class="left-item"><strong>${item.label}</strong> ${item.text}</div>
                    `).join('')}
                </div>
            </div>
            <div class="right-column">
                <div class="column-title">${task.rightColumnName || 'Правый столбец'}</div>
                <div class="right-items">
                    ${task.rightItems.map(item => `
                        <div class="right-item">${item.text} <strong>${item.number}</strong></div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="matching-selectors">
            <h3>Укажите соответствие</h3>
    `;
    
    task.leftItems.forEach(left => {
        const userAnswer = savedAnswers[left.id];
        const isCorrect = isChecked && userAnswer === task.correctPairs.find(p => p.leftId === left.id)?.rightId;
        
        let rowClass = '';
        let indicatorHtml = '';
        
        if (isChecked) {
            rowClass = isCorrect ? 'correct' : 'incorrect';
            indicatorHtml = `
                <span class="correct-indicator ${isCorrect ? 'correct' : 'incorrect'}">
                    <i class="fas fa-${isCorrect ? 'check' : 'times'}"></i>
                </span>
            `;
        }
        
        html += `
            <div class="selector-row ${rowClass}">
                <span class="left-ref">${left.label}</span>
                <span class="left-text">${left.text}</span>
                <select data-left-id="${left.id}" ${disabled ? 'disabled' : ''} onchange="updateMatchingAnswer('${left.id}', this.value, ${task.id})">
                    <option value="">Выберите...</option>
                    ${task.rightItems.map(right => `
                        <option value="${right.id}" ${userAnswer === right.id ? 'selected' : ''}>${right.number}</option>
                    `).join('')}
                </select>
                ${indicatorHtml}
            </div>
        `;
    });
    
    html += `</div>`;
    
    if (isChecked) {
        let correct = 0;
        task.correctPairs.forEach(pair => {
            if (savedAnswers[pair.leftId] === pair.rightId) correct++;
        });
        html += `<div class="auto-result"><div class="auto-result-header"><span class="auto-result-title">📊 Результат</span><span class="auto-result-score">${correct}/${task.leftItems.length}</span></div></div>`;
    }
    
    html += renderCommentsSection(assignment, task.id);
    
    if (!assignment || assignment.status === 'new') {
        html += `<div class="action-buttons"><button class="btn-check" onclick="checkMatchingPairsTask(${task.id})"><i class="fas fa-check-circle"></i> Проверить</button></div>`;
    }
    
    container.innerHTML = html;
}

function updateMatchingAnswer(leftId, value, taskId) {
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'new', answers: {}, comments: [], reviewComments: [] };
        allAssignments.push(assignment);
    }
    
    assignment.answers[leftId] = value;
    const idx = allAssignments.findIndex(a => a.id === assignment.id);
    if (idx !== -1) allAssignments[idx] = assignment;
    setAssignments(allAssignments);
}

function checkMatchingPairsTask(taskId) {
    const answers = {};
    document.querySelectorAll('[data-left-id]').forEach(select => {
        const leftId = select.getAttribute('data-left-id');
        const value = select.value;
        if (value) answers[leftId] = value;
    });
    
    const task = getTasks().find(t => t.id === taskId);
    
    if (Object.keys(answers).length !== task.leftItems.length) {
        alert('Выберите ответы для всех пунктов');
        return;
    }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'auto-checked', answers, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'auto-checked';
        assignment.answers = answers;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    
    let correct = 0;
    task.correctPairs.forEach(pair => {
        if (answers[pair.leftId] === pair.rightId) correct++;
    });
    assignment.score = `${correct}/${task.leftItems.length}`;
    
    setAssignments(allAssignments);
    openStudentTask(taskId);
}

// ============================================
// 3. DISTRIBUTION (РАСПРЕДЕЛЕНИЕ)
// ============================================

let selectedDistributionWord = null;

function renderDistributionTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const savedState = assignment?.answers || {};
    const isChecked = assignment?.status === 'auto-checked';
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    const isFixing = assignment?.fixMode === true;
    
    const columnWords = {};
    task.columns.forEach(col => {
        columnWords[col.id] = savedState[col.id] || [];
    });
    
    const availableWords = task.words.filter(word => 
        !Object.values(columnWords).some(arr => arr.includes(word))
    );
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        <div class="execution-description">${task.description || 'Распределите слова по столбцам'}</div>
        ${isFixing ? '<div class="fix-progress">🔧 Режим исправления ошибок. Исправьте только неверные ответы.</div>' : ''}
        
        <div class="distribution-layout">
            <div class="words-pool">
                <h4>
                    Слова для распределения
                    ${selectedDistributionWord ? `<span class="selected-word-info">✓ Выбрано: ${selectedDistributionWord}</span>` : ''}
                </h4>
                <div class="words-grid">
                    ${availableWords.map(word => `
                        <span class="word-item ${selectedDistributionWord === word ? 'selected' : ''}" 
                              onclick="selectDistributionWord('${word}')">${word}</span>
                    `).join('')}
                    ${availableWords.length === 0 ? '<p style="color: #64748b;">Все слова распределены</p>' : ''}
                </div>
            </div>
            
            <div class="distribution-columns">
    `;
    
    task.columns.forEach(col => {
        const correctForColumn = task.correctAnswers.filter(ca => ca.columnId === col.id).map(ca => ca.word);
        const showCorrect = isChecked && !isFixing;
        
        html += `
            <div class="dist-column" data-column-id="${col.id}">
                <div class="dist-column-header">${col.name}</div>
                <div class="dist-column-words">
        `;
        
        if (columnWords[col.id].length === 0 && showCorrect) {
            html += `<div style="color:#94a3b8; text-align:center; padding:20px;">Нет слов</div>`;
        }
        
        columnWords[col.id].forEach(word => {
            const isCorrect = showCorrect && correctForColumn.includes(word);
            const wordClass = showCorrect ? (isCorrect ? 'correct-answer' : 'incorrect-answer') : '';
            const showRemove = !disabled || (isFixing && !isCorrect);
            
            html += `
                <div class="dist-column-word ${wordClass}">
                    ${word}
                    ${showRemove && !showCorrect ? `
                        <span class="remove-word" onclick="removeWordFromDistributionColumn('${col.id}', '${word}', ${task.id})">
                            <i class="fas fa-times"></i>
                        </span>
                    ` : ''}
                </div>
            `;
        });
        
        if (isChecked && !isFixing && columnWords[col.id].length === 0) {
            // Показываем правильные ответы, если колонка пуста
            const correctWords = correctForColumn.filter(w => !Object.values(columnWords).some(arr => arr.includes(w)));
            if (correctWords.length > 0) {
                html += `<div style="color:#10b981; font-size:12px; margin-top:8px;">Правильно: ${correctWords.join(', ')}</div>`;
            }
        }
        
        html += `
                </div>
                ${!disabled || isFixing ? `
                    <div class="column-controls">
                        <button class="column-btn add-btn ${selectedDistributionWord ? 'active' : ''}" 
                                onclick="addWordToDistributionColumn('${col.id}', ${task.id})" 
                                ${!selectedDistributionWord ? 'disabled' : ''}>
                            ${selectedDistributionWord ? `Добавить "${selectedDistributionWord}"` : 'Выберите слово'}
                        </button>
                        <button class="column-btn" onclick="clearDistributionColumn('${col.id}', ${task.id})" 
                                ${columnWords[col.id].length === 0 ? 'disabled' : ''}>
                            Очистить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    if (isChecked && !isFixing) {
        let correct = 0;
        task.correctAnswers.forEach(correctAns => {
            const userColumn = Object.entries(columnWords).find(([colId, words]) => 
                words.includes(correctAns.word)
            )?.[0];
            if (userColumn === correctAns.columnId) correct++;
        });
        html += `<div class="auto-result"><div class="auto-result-header"><span class="auto-result-title">📊 Результат</span><span class="auto-result-score">${correct}/${task.words.length}</span></div></div>`;
    }
    
    html += renderCommentsSection(assignment, task.id);
    
    if (!assignment || assignment.status === 'new') {
        const allWordsDistributed = Object.values(columnWords).flat().length === task.words.length;
        html += `
            <div class="action-buttons">
                <button class="btn-check" onclick="checkDistributionTask(${task.id})" 
                        ${!allWordsDistributed ? 'disabled' : ''}>
                    ${allWordsDistributed ? 'Проверить' : 'Распределите все слова'}
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function selectDistributionWord(word) {
    selectedDistributionWord = word;
    document.querySelectorAll('.word-item').forEach(el => {
        el.classList.remove('selected');
        if (el.textContent === word) el.classList.add('selected');
    });
    document.querySelectorAll('.column-btn.add-btn').forEach(btn => {
        if (selectedDistributionWord) {
            btn.disabled = false;
            btn.classList.add('active');
            btn.textContent = `Добавить "${selectedDistributionWord}"`;
        } else {
            btn.disabled = true;
            btn.classList.remove('active');
            btn.textContent = 'Выберите слово';
        }
    });
}

function addWordToDistributionColumn(columnId, taskId) {
    if (!selectedDistributionWord) {
        alert('Сначала выберите слово');
        return;
    }
    
    const task = getTasks().find(t => t.id === taskId);
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'new', answers: {}, comments: [], reviewComments: [] };
        allAssignments.push(assignment);
    }
    
    if (!assignment.answers) assignment.answers = {};
    if (!assignment.answers[columnId]) assignment.answers[columnId] = [];
    
    task.columns.forEach(col => {
        if (assignment.answers[col.id]) {
            assignment.answers[col.id] = assignment.answers[col.id].filter(w => w !== selectedDistributionWord);
        }
    });
    
    if (!assignment.answers[columnId].includes(selectedDistributionWord)) {
        assignment.answers[columnId].push(selectedDistributionWord);
    }
    
    const idx = allAssignments.findIndex(a => a.id === assignment.id);
    if (idx !== -1) allAssignments[idx] = assignment;
    setAssignments(allAssignments);
    
    selectedDistributionWord = null;
    renderDistributionTask(task, assignment);
}

function removeWordFromDistributionColumn(columnId, word, taskId) {
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (assignment && assignment.answers && assignment.answers[columnId]) {
        assignment.answers[columnId] = assignment.answers[columnId].filter(w => w !== word);
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
        setAssignments(allAssignments);
    }
    
    const task = getTasks().find(t => t.id === taskId);
    renderDistributionTask(task, assignment);
}

function clearDistributionColumn(columnId, taskId) {
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (assignment && assignment.answers) {
        assignment.answers[columnId] = [];
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
        setAssignments(allAssignments);
    }
    
    const task = getTasks().find(t => t.id === taskId);
    renderDistributionTask(task, assignment);
}

function checkDistributionTask(taskId) {
    const task = getTasks().find(t => t.id === taskId);
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment || !assignment.answers) {
        alert('Сначала распределите слова по столбцам');
        return;
    }
    
    const distributedWords = Object.values(assignment.answers).flat();
    if (distributedWords.length !== task.words.length) {
        alert('Распределите все слова по столбцам');
        return;
    }
    
    let correct = 0;
    task.correctAnswers.forEach(correctAns => {
        const userColumn = Object.entries(assignment.answers).find(([colId, words]) => 
            words.includes(correctAns.word)
        )?.[0];
        if (userColumn === correctAns.columnId) correct++;
    });
    
    assignment.status = 'auto-checked';
    assignment.score = `${correct}/${task.words.length}`;
    assignment.submittedAt = new Date().toISOString();
    const idx = allAssignments.findIndex(a => a.id === assignment.id);
    if (idx !== -1) allAssignments[idx] = assignment;
    setAssignments(allAssignments);
    
    openStudentTask(taskId);
}

// ============================================
// 4. WRITE-WORD (НАПИСАТЬ СЛОВО)
// ============================================

function renderWriteWordTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const userAnswer = assignment?.studentAnswer || '';
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    const isChecked = assignment?.status === 'auto-checked';
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        ${task.workText ? `<div class="execution-description">${task.workText.replace(/\n/g, '<br>')}</div>` : ''}
        <div class="execution-description"><strong>Задание:</strong> ${task.description}</div>
        <div class="student-answer-field">
            <label><strong>Ваш ответ:</strong></label>
            <input type="text" id="writeWordStudentInput" value="${userAnswer}" placeholder="Введите слово..." ${disabled ? 'disabled' : ''} style="width:100%; max-width:400px; padding:12px; border:2px solid #4f46e5; border-radius:12px;">
        </div>
    `;
    
    if (isChecked) {
        const isCorrect = task.correctAnswers.includes(userAnswer.trim());
        html += `
            <div class="auto-result">
                <div class="auto-result-header">
                    <span class="auto-result-title">📊 Результат</span>
                    <span class="auto-result-score">${isCorrect ? '✓ Верно' : '✗ Неверно'}</span>
                </div>
                ${!isCorrect ? `<p style="color:#64748b;">Правильные варианты: ${task.correctAnswers.join('; ')}</p>` : ''}
            </div>
        `;
    }
    
    html += renderCommentsSection(assignment, task.id);
    
    if (!assignment || assignment.status === 'new') {
        if (task.checkMode === 'auto') {
            html += `<div class="action-buttons"><button class="btn-check" onclick="checkWriteWordTask(${task.id})"><i class="fas fa-check-circle"></i> Проверить</button></div>`;
        } else {
            html += `<div class="action-buttons"><button class="btn-submit" onclick="submitWriteWordTask(${task.id})"><i class="fas fa-paper-plane"></i> Отправить на проверку</button></div>`;
        }
    }
    
    container.innerHTML = html;
}

function checkWriteWordTask(taskId) {
    const input = document.getElementById('writeWordStudentInput');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) { alert('Введите ответ'); return; }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'auto-checked', studentAnswer: answer, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'auto-checked';
        assignment.studentAnswer = answer;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    setAssignments(allAssignments);
    openStudentTask(taskId);
}

function submitWriteWordTask(taskId) {
    const input = document.getElementById('writeWordStudentInput');
    if (!input) return;
    const answer = input.value.trim();
    if (!answer) { alert('Введите ответ'); return; }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'pending', studentAnswer: answer, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'pending';
        assignment.studentAnswer = answer;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    setAssignments(allAssignments);
    alert('Отправлено на проверку!');
    backToTasks();
}

// ============================================
// 5. TEXT-WORK (РАБОТА С ТЕКСТОМ)
// ============================================

function renderTextWorkTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const userAnswer = assignment?.studentAnswer || task.sourceText || '';
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    const isChecked = assignment?.status === 'auto-checked';
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        <div class="execution-description">${task.description || ''}</div>
        <div class="execution-description" style="background: #f8fafc; padding: 20px; border-radius: 16px; white-space: pre-wrap;">${task.sourceText || ''}</div>
    `;
    
    if (!disabled) {
        html += `
            <div class="tools-panel">
                <div class="tool-group">
                    <span style="font-size: 12px; color: #64748b; margin-right: 4px;">Выделить:</span>
                    <button class="tool-btn color-yellow" onclick="applyHighlight('yellow')" title="Жёлтый">A</button>
                    <button class="tool-btn color-green" onclick="applyHighlight('green')" title="Зелёный">A</button>
                    <button class="tool-btn color-blue" onclick="applyHighlight('blue')" title="Синий">A</button>
                    <button class="tool-btn color-pink" onclick="applyHighlight('pink')" title="Розовый">A</button>
                    <button class="tool-btn color-orange" onclick="applyHighlight('orange')" title="Оранжевый">A</button>
                </div>
                <div class="tool-group">
                    <span style="font-size: 12px; color: #64748b; margin-right: 4px;">Подчеркнуть:</span>
                    <select id="underlineSelect" class="underline-select" onchange="applyUnderline(this.value)">
                        <option value="">Выбрать...</option>
                        <option value="subject">Подлежащее</option>
                        <option value="predicate">Сказуемое</option>
                        <option value="attribute">Определение</option>
                        <option value="object">Дополнение</option>
                        <option value="adverbial">Обстоятельство</option>
                    </select>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="form-group">
            <label>Ваш ответ:</label>
            <textarea id="textWorkStudentAnswer" class="text-work-field" rows="10" 
                placeholder="Отредактируйте текст здесь..." 
                ${disabled ? 'disabled' : ''}>${userAnswer}</textarea>
        </div>
    `;
    
    if (isChecked && task.checkMode === 'auto') {
        const score = calculateTextWorkScore(task, assignment);
        html += `
            <div class="check-result">
                <div class="check-result-header">
                    <span class="check-result-title">📊 Результат проверки</span>
                    <span class="check-result-score ${getScoreClass(score)}">${score}%</span>
                </div>
            </div>
        `;
    }
    
    html += renderCommentsSection(assignment, task.id);
    
    if (!assignment || assignment.status === 'new') {
        if (task.checkMode === 'auto') {
            html += `<div class="action-buttons"><button class="btn-check" onclick="checkTextWorkTask(${task.id})"><i class="fas fa-check-circle"></i> Проверить</button></div>`;
        } else {
            html += `<div class="action-buttons"><button class="btn-submit" onclick="submitTextWorkTask(${task.id})"><i class="fas fa-paper-plane"></i> Отправить на проверку</button></div>`;
        }
    }
    
    container.innerHTML = html;
}

function checkTextWorkTask(taskId) {
    const textarea = document.getElementById('textWorkStudentAnswer');
    if (!textarea) return;
    const answer = textarea.value;
    if (!answer.trim()) { alert('Введите ответ'); return; }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'auto-checked', studentAnswer: answer, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'auto-checked';
        assignment.studentAnswer = answer;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    setAssignments(allAssignments);
    openStudentTask(taskId);
}

function submitTextWorkTask(taskId) {
    const textarea = document.getElementById('textWorkStudentAnswer');
    if (!textarea) return;
    const answer = textarea.value;
    if (!answer.trim()) { alert('Введите ответ'); return; }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'pending', studentAnswer: answer, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'pending';
        assignment.studentAnswer = answer;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    setAssignments(allAssignments);
    alert('Отправлено на проверку!');
    backToTasks();
}

function calculateTextWorkScore(task, assignment) {
    if (!task.correctText || !assignment?.studentAnswer) return 0;
    
    const correctWords = task.correctText.split(/\s+/);
    const studentWords = assignment.studentAnswer.split(/\s+/);
    const gapCount = task.gapCount || correctWords.length;
    
    let matchedWords = 0;
    const maxLen = Math.min(correctWords.length, studentWords.length);
    
    for (let i = 0; i < maxLen; i++) {
        if (correctWords[i].toLowerCase() === studentWords[i].toLowerCase()) {
            matchedWords++;
        }
    }
    
    if (gapCount === 0) return 0;
    return Math.round((matchedWords / gapCount) * 100);
}

function getScoreClass(score) {
    if (score >= 90) return 'perfect';
    if (score >= 60) return 'good';
    return 'bad';
}

function applyHighlight(color) {
    const textarea = document.getElementById('textWorkStudentAnswer');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
        const wrapper = `<span class="highlight-${color}">${selectedText}</span>`;
        textarea.value = textarea.value.substring(0, start) + wrapper + textarea.value.substring(end);
    }
}

function applyUnderline(type) {
    if (!type) return;
    
    const textarea = document.getElementById('textWorkStudentAnswer');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
        const classMap = {
            'subject': 'underline-subject',
            'predicate': 'underline-predicate',
            'attribute': 'underline-attribute',
            'object': 'underline-object',
            'adverbial': 'underline-adverbial'
        };
        const cssClass = classMap[type] || '';
        const wrapper = `<span class="${cssClass}">${selectedText}</span>`;
        textarea.value = textarea.value.substring(0, start) + wrapper + textarea.value.substring(end);
    }
    
    document.getElementById('underlineSelect').value = '';
}

// ============================================
// 6. ESSAY (СОЧИНЕНИЕ)
// ============================================

function renderEssayTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const userAnswer = assignment?.studentAnswer || '';
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked';
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        <div class="execution-description">${task.description || ''}</div>
        <div class="execution-description" style="background: #f8fafc; padding: 20px; border-radius: 16px; white-space: pre-wrap;">${task.sourceText || ''}</div>
        <div class="form-group">
            <label>Ваш ответ (сочинение):</label>
            <textarea id="essayStudentAnswer" class="text-work-field" rows="12" 
                placeholder="Напишите сочинение здесь..." 
                ${disabled ? 'disabled' : ''}>${userAnswer}</textarea>
        </div>
    `;
    
    html += renderCommentsSection(assignment, task.id);
    
    if (!assignment || assignment.status === 'new') {
        html += `<div class="action-buttons"><button class="btn-submit" onclick="submitEssayTask(${task.id})"><i class="fas fa-paper-plane"></i> Отправить на проверку</button></div>`;
    }
    
    container.innerHTML = html;
}

function submitEssayTask(taskId) {
    const textarea = document.getElementById('essayStudentAnswer');
    if (!textarea) return;
    const answer = textarea.value;
    if (!answer.trim()) { alert('Напишите сочинение'); return; }
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'pending', studentAnswer: answer, comments: [], reviewComments: [], submittedAt: new Date().toISOString() };
        allAssignments.push(assignment);
    } else {
        assignment.status = 'pending';
        assignment.studentAnswer = answer;
        assignment.submittedAt = new Date().toISOString();
        const idx = allAssignments.findIndex(a => a.id === assignment.id);
        if (idx !== -1) allAssignments[idx] = assignment;
    }
    setAssignments(allAssignments);
    alert('Отправлено на проверку!');
    backToTasks();
}

// ============================================
// 7. INTERACTIVE MATCHING (АНАЛИЗ + СООТВЕТСТВИЕ)
// ============================================

function renderInteractiveMatchingTask(task, assignment) {
    const container = document.getElementById('taskExecutionContainer');
    if (!container) return;
    
    const isChecked = assignment?.status === 'auto-checked';
    const savedConnections = assignment?.connections || [];
    const savedWordMarkers = assignment?.savedWordMarkers || {};
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    
    let html = `
        <div class="execution-header">
            <span class="execution-theme">${getThemeName(task.theme)}</span>
            <span class="execution-status ${assignment?.status || 'new'}">${getStatusText(assignment?.status || 'new')}</span>
        </div>
        <div class="execution-title">${task.name}</div>
        <div class="execution-description">${task.description || ''}</div>
        <div class="matching-lines-container" id="matchingLinesContainer" style="position: relative;">
            <div class="matching-col">
                <h4>${task.leftColumnName || 'ПРЕДЛОЖЕНИЯ'}</h4>
                <div class="matching-items" id="leftColumnItemsList">
    `;
    
    task.leftItems.forEach((item, leftIdx) => {
        const leftId = item.id;
        const isConnected = savedConnections.some(c => c.leftId === leftId);
        const words = (item.text || '').split(/(\s+)/).filter(w => w.trim().length > 0);
        
        html += `<div class="matching-item ${isConnected ? 'connected' : ''}" data-left-id="${leftId}">
            <span class="item-badge">${item.label || String.fromCharCode(65 + leftIdx)}</span>
            <div class="item-text">`;
        
        words.forEach((word, wordIdx) => {
            const markerKey = `${leftId}_${wordIdx}`;
            const userMarker = savedWordMarkers[markerKey];
            const displayMarker = userMarker || (isChecked ? (item.wordMarkers?.[wordIdx] || '') : '');
            const markerClass = displayMarker ? `word-${displayMarker}` : '';
            const isWordClickable = !disabled || (isChecked && assignment?.fixMode);
            html += `<span class="${isWordClickable ? 'clickable-word-item ' : ''}${markerClass}" 
                      data-left-id="${leftId}" data-word-idx="${wordIdx}"
                      style="${!isWordClickable ? 'cursor:default;' : ''}">${escapeHtml(word)}</span> `;
        });
        
        if (isChecked && item.wordMarkers) {
            html += `<div style="margin-top: 8px; font-size: 11px;">`;
            words.forEach((word, wordIdx) => {
                const userMarker = savedWordMarkers[`${leftId}_${wordIdx}`] || '';
                const isCorrect = userMarker === item.wordMarkers[wordIdx];
                html += `<span style="margin-right: 6px; ${isCorrect ? 'color:#10b981' : 'color:#ef4444'}">${word.substring(0, 15)}: ${isCorrect ? '✓' : '✗'}</span>`;
            });
            html += `</div>`;
        }
        
        html += `</div>${isConnected ? `<button class="delete-connection-btn" onclick="event.stopPropagation(); deleteInteractiveConnection('${leftId}', ${task.id})">✗</button>` : ''}</div>`;
    });
    
    html += `
            </div>
        </div>
        <div class="matching-col">
            <h4>${task.rightColumnName || 'СХЕМЫ'}</h4>
            <div class="matching-items" id="rightColumnItemsList">
    `;
    
    task.rightItems.forEach((item) => {
        const isConnected = savedConnections.some(c => c.rightId === item.id);
        html += `<div class="matching-item ${isConnected ? 'connected' : ''}" data-right-id="${item.id}">
            <span class="item-badge">${item.number}</span>
            <span class="item-text">${item.text}</span>
        </div>`;
    });
    
    html += `
            </div>
        </div>
        <canvas id="linesCanvas" class="lines-canvas"></canvas>
    </div>`;
    
    if (isChecked) {
        let correctConnections = 0;
        savedConnections.forEach(conn => {
            if (task.correctPairs.some(p => p.leftId === conn.leftId && p.rightId === conn.rightId)) correctConnections++;
        });
        let correctWords = 0, totalWords = 0;
        task.leftItems.forEach(item => {
            if (item.wordMarkers) {
                Object.keys(item.wordMarkers).forEach(wordIdx => {
                    const userMarker = savedWordMarkers[`${item.id}_${wordIdx}`] || '';
                    if (userMarker === item.wordMarkers[wordIdx]) correctWords++;
                    totalWords++;
                });
            }
        });
        html += `<div class="auto-result"><div class="auto-result-header">
            <span class="auto-result-title">📊 Результат</span>
            <span class="auto-result-score">Соединения: ${correctConnections}/${task.leftItems.length}${totalWords ? ` | Слова: ${correctWords}/${totalWords}` : ''}</span>
        </div></div>`;
    }
    
    html += renderCommentsSection(assignment, task.id);
    
    html += `<div class="action-buttons">`;
    if (!isChecked && (!assignment || assignment.status === 'new')) {
        html += `<button class="btn-check" onclick="submitInteractiveMatching(${task.id})">Проверить</button>`;
    }
    if (isChecked) {
        html += `<button class="btn-fix-errors" onclick="startFixInteractiveMatching(${task.id})">Исправить ошибки</button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
    
    initInteractiveMatchingEvents(task, assignment);
}

function initInteractiveMatchingEvents(task, assignment) {
    const isChecked = assignment?.status === 'auto-checked';
    const disabled = assignment?.status === 'pending' || assignment?.status === 'checked' || assignment?.status === 'auto-checked';
    const isFixing = assignment?.fixMode === true;
    
    // Клики по словам для выделения
    document.querySelectorAll('.clickable-word-item').forEach(span => {
        span.addEventListener('click', (e) => { 
            e.stopPropagation();
            if (disabled && !isFixing) return;
            showStudentWordTooltip(span, task.id); 
        });
    });
    
    // Клики по элементам для соединения
    let currentSelected = null;
    const leftItems = document.querySelectorAll('#leftColumnItemsList .matching-item');
    const rightItems = document.querySelectorAll('#rightColumnItemsList .matching-item');
    
    if (!disabled || isFixing) {
        leftItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isChecked && !isFixing) return;
                if (currentSelected) { currentSelected.el.classList.remove('selected'); currentSelected = null; }
                item.classList.add('selected');
                currentSelected = { type: 'left', el: item, id: item.getAttribute('data-left-id') };
            });
        });
        
        rightItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isChecked && !isFixing) return;
                if (currentSelected && currentSelected.type === 'left') {
                    const leftId = currentSelected.id;
                    const rightId = item.getAttribute('data-right-id');
                    let connections = assignment?.connections ? [...assignment.connections] : [];
                    connections = connections.filter(c => c.leftId !== leftId);
                    connections.push({ leftId, rightId });
                    const user = getCurrentUser();
                    let allAssignments = getAssignments();
                    let ass = allAssignments.find(a => a.taskId === task.id && a.studentId === user.id);
                    if (!ass) { ass = { id: Date.now(), studentId: user.id, taskId: task.id, status: 'new', connections: [], savedWordMarkers: {}, comments: [] }; allAssignments.push(ass); }
                    ass.connections = connections;
                    const idx = allAssignments.findIndex(a=>a.id===ass.id);
                    if(idx!==-1) allAssignments[idx]=ass;
                    setAssignments(allAssignments);
                    currentSelected.el.classList.remove('selected');
                    currentSelected = null;
                    renderInteractiveMatchingTask(task, ass);
                } else {
                    if(currentSelected) currentSelected.el.classList.remove('selected');
                    item.classList.add('selected');
                    currentSelected = { type: 'right', el: item, id: item.getAttribute('data-right-id') };
                }
            });
        });
    }
    
    // Рисуем линии
    setTimeout(() => drawInteractiveLines(task), 100);
    window.addEventListener('resize', () => drawInteractiveLines(task));
    window.addEventListener('scroll', () => drawInteractiveLines(task));
}

function drawInteractiveLines(task) {
    const canvas = document.getElementById('linesCanvas');
    const container = document.getElementById('matchingLinesContainer');
    if (!canvas || !container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const user = getCurrentUser();
    const assignment = getAssignments().find(a => a.taskId === task.id && a.studentId === user.id);
    if (!assignment) return;
    
    (assignment.connections || []).forEach(conn => {
        const leftEl = document.querySelector(`.matching-item[data-left-id="${conn.leftId}"]`);
        const rightEl = document.querySelector(`.matching-item[data-right-id="${conn.rightId}"]`);
        if (leftEl && rightEl) {
            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const startX = leftRect.right - containerRect.left;
            const startY = (leftRect.top + leftRect.bottom)/2 - containerRect.top;
            const endX = rightRect.left - containerRect.left;
            const endY = (rightRect.top + rightRect.bottom)/2 - containerRect.top;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Стрелка
            const angle = Math.atan2(endY - startY, endX - startX);
            const arrowSize = 10;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI/6), endY - arrowSize * Math.sin(angle - Math.PI/6));
            ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI/6), endY - arrowSize * Math.sin(angle + Math.PI/6));
            ctx.fill();
        }
    });
}

function deleteInteractiveConnection(leftId, taskId) {
    const user = getCurrentUser();
    let allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    if (assignment) {
        assignment.connections = (assignment.connections || []).filter(c => c.leftId !== leftId);
        const idx = allAssignments.findIndex(a=>a.id===assignment.id);
        if(idx!==-1) allAssignments[idx]=assignment;
        setAssignments(allAssignments);
    }
    const task = getTasks().find(t => t.id === taskId);
    renderInteractiveMatchingTask(task, assignment);
}

function showStudentWordTooltip(targetSpan, taskId) {
    const existing = document.querySelector('.sentence-tooltip');
    if(existing) existing.remove();
    
    const rect = targetSpan.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'sentence-tooltip';
    tooltip.style.top = rect.bottom + window.scrollY + 'px';
    tooltip.style.left = rect.left + window.scrollX + 'px';
    
    const options = [
        { type: 'subject', icon: 'fa-user-graduate', label: 'Подлежащее (одна черта)' },
        { type: 'predicate', icon: 'fa-running', label: 'Сказуемое (две черты)' },
        { type: 'object', icon: 'fa-circle', label: 'Дополнение (пунктир)' },
        { type: 'attribute', icon: 'fa-waveform', label: 'Определение (волнистая)' },
        { type: 'adverbial', icon: 'fa-location-dot', label: 'Обстоятельство (точки)' },
        { type: 'clear', icon: 'fa-eraser', label: 'Снять выделение' }
    ];
    
    options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'tooltip-option';
        div.innerHTML = `<i class="fas ${opt.icon}"></i> ${opt.label}`;
        div.onclick = () => {
            const leftId = targetSpan.getAttribute('data-left-id');
            const wordIdx = targetSpan.getAttribute('data-word-idx');
            const markerKey = `${leftId}_${wordIdx}`;
            targetSpan.classList.remove('word-subject', 'word-predicate', 'word-object', 'word-attribute', 'word-adverbial');
            if (opt.type !== 'clear') {
                targetSpan.classList.add(`word-${opt.type}`);
                saveStudentWordMarker(taskId, markerKey, opt.type);
            } else {
                saveStudentWordMarker(taskId, markerKey, '');
            }
            tooltip.remove();
        };
        tooltip.appendChild(div);
    });
    
    document.body.appendChild(tooltip);
    setTimeout(() => {
        document.addEventListener('click', function remove(e) { if (!tooltip.contains(e.target)) { tooltip.remove(); document.removeEventListener('click', remove); } });
    }, 10);
}

function saveStudentWordMarker(taskId, markerKey, markerType) {
    const user = getCurrentUser();
    let allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    if (!assignment) { 
        assignment = { id: Date.now(), studentId: user.id, taskId, status: 'new', connections: [], savedWordMarkers: {}, comments: [] }; 
        allAssignments.push(assignment); 
    }
    if (!assignment.savedWordMarkers) assignment.savedWordMarkers = {};
    if (markerType) assignment.savedWordMarkers[markerKey] = markerType;
    else delete assignment.savedWordMarkers[markerKey];
    const idx = allAssignments.findIndex(a=>a.id===assignment.id);
    if(idx!==-1) allAssignments[idx]=assignment;
    setAssignments(allAssignments);
}

function submitInteractiveMatching(taskId) {
    const user = getCurrentUser();
    let allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    if (!assignment) return alert('Ошибка: задание не найдено');
    
    const task = getTasks().find(t => t.id === taskId);
    
    let correctConnections = 0;
    (assignment.connections || []).forEach(conn => {
        if (task.correctPairs.some(p => p.leftId === conn.leftId && p.rightId === conn.rightId)) correctConnections++;
    });
    
    let correctWords = 0, totalWords = 0;
    task.leftItems.forEach(item => {
        if (item.wordMarkers) {
            Object.keys(item.wordMarkers).forEach(wordIdx => {
                const userMarker = assignment.savedWordMarkers?.[`${item.id}_${wordIdx}`] || '';
                if (userMarker === item.wordMarkers[wordIdx]) correctWords++;
                totalWords++;
            });
        }
    });
    
    assignment.status = 'auto-checked';
    const idx = allAssignments.findIndex(a=>a.id===assignment.id);
    if(idx!==-1) allAssignments[idx]=assignment;
    setAssignments(allAssignments);
    
    let message = `Проверено! Соединений: ${correctConnections}/${task.leftItems.length}`;
    if (totalWords > 0) message += `, слов: ${correctWords}/${totalWords}`;
    alert(message);
    
    renderInteractiveMatchingTask(task, assignment);
}

function startFixInteractiveMatching(taskId) {
    const user = getCurrentUser();
    let allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    if (assignment) { 
        assignment.fixMode = true;
        const idx = allAssignments.findIndex(a=>a.id===assignment.id);
        if(idx!==-1) allAssignments[idx]=assignment;
        setAssignments(allAssignments);
    }
    const task = getTasks().find(t => t.id === taskId);
    renderInteractiveMatchingTask(task, assignment);
}

// ============================================
// 8. КОММЕНТАРИИ
// ============================================

function renderCommentsSection(assignment, taskId) {
    if (!assignment) {
        return `
            <div class="comments-section">
                <h3>💬 Комментарии</h3>
                <div class="comments-list"></div>
                <div class="comment-input-area">
                    <textarea id="commentText" placeholder="Напишите комментарий..."></textarea>
                    <button onclick="addComment(${taskId})">Отправить</button>
                </div>
            </div>
        `;
    }
    
    const allComments = [
        ...(assignment.comments || []).map(c => ({ ...c, role: 'student' })),
        ...(assignment.reviewComments || []).map(c => ({ ...c, role: 'tutor' }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const isDisabled = assignment.status === 'checked' || assignment.status === 'auto-checked';
    
    return `
        <div class="comments-section">
            <h3>💬 Комментарии</h3>
            <div class="comments-list">
                ${allComments.map(c => `
                    <div class="comment ${c.role === 'student' ? 'student' : 'tutor'}">
                        <div class="comment-header">
                            <span>${c.role === 'student' ? 'Вы' : 'Репетитор'}</span>
                            <span>${new Date(c.date).toLocaleString()}</span>
                        </div>
                        <div class="comment-text">${c.text}</div>
                    </div>
                `).join('')}
            </div>
            <div class="comment-input-area">
                <textarea id="commentText" placeholder="Напишите комментарий..." ${isDisabled ? 'disabled' : ''}></textarea>
                <button onclick="addComment(${taskId})" ${isDisabled ? 'disabled' : ''}>Отправить</button>
            </div>
        </div>
    `;
}

function addComment(taskId) {
    const text = document.getElementById('commentText')?.value;
    if (!text) return;
    
    const user = getCurrentUser();
    const allAssignments = getAssignments();
    let assignment = allAssignments.find(a => a.taskId === taskId && a.studentId === user.id);
    
    if (!assignment) {
        assignment = {
            id: Date.now(),
            studentId: user.id,
            taskId,
            status: 'new',
            answers: {},
            subtaskAnswers: {},
            comments: [],
            reviewComments: []
        };
        allAssignments.push(assignment);
    }
    
    if (!assignment.comments) assignment.comments = [];
    assignment.comments.push({
        text,
        date: new Date().toISOString()
    });
    
    const idx = allAssignments.findIndex(a => a.id === assignment.id);
    if (idx !== -1) allAssignments[idx] = assignment;
    setAssignments(allAssignments);
    
    document.getElementById('commentText').value = '';
    openStudentTask(taskId);
}

// ============================================
// 9. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function backToTasks() {
    navigateTo('student-tasks');
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

window.renderStudentTaskExecution = renderStudentTaskExecution;
window.openStudentTask = openStudentTask;
window.backToTasks = backToTasks;

// Экспортируем функции для всех типов заданий
window.renderMultipleChoiceTask = renderMultipleChoiceTask;
window.renderMatchingPairsTask = renderMatchingPairsTask;
window.renderDistributionTask = renderDistributionTask;
window.renderWriteWordTask = renderWriteWordTask;
window.renderTextWorkTask = renderTextWorkTask;
window.renderEssayTask = renderEssayTask;
window.renderInteractiveMatchingTask = renderInteractiveMatchingTask;

// Экспортируем функции проверки
window.checkMultipleChoiceTask = checkMultipleChoiceTask;
window.checkMatchingPairsTask = checkMatchingPairsTask;
window.checkDistributionTask = checkDistributionTask;
window.checkWriteWordTask = checkWriteWordTask;
window.checkTextWorkTask = checkTextWorkTask;
window.submitManualTask = submitManualTask;
window.submitWriteWordTask = submitWriteWordTask;
window.submitTextWorkTask = submitTextWorkTask;
window.submitEssayTask = submitEssayTask;
window.submitInteractiveMatching = submitInteractiveMatching;

// Экспортируем функции исправления
window.startFixErrors = startFixErrors;
window.recheckAfterFix = recheckAfterFix;
window.startFixInteractiveMatching = startFixInteractiveMatching;

// Экспортируем функции комментариев
window.renderCommentsSection = renderCommentsSection;
window.addComment = addComment;

console.log('📝 Модуль StudentTaskExecution.js загружен');
