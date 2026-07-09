/**
 * ============================================
 * МОДУЛЬ: МОЙ ПРОГРЕСС (УЧЕНИК)
 * ============================================
 * 
 * Отвечает за:
 * - Отображение графиков прогресса по заданиям
 * - Отображение графиков по пробным экзаменам (КИМам)
 * - Отображение графиков теоретических знаний
 * - Переключение между типами графиков (в среднем / лучший результат)
 * - Отображение блока "Можно улучшить" с точками роста
 * ============================================
 */

// ============================================
// ДАННЫЕ ДЛЯ ГРАФИКОВ
// ============================================

/**
 * Данные по практическим заданиям
 * В реальном приложении данные берутся из хранилища
 */
const PRACTICE_DATA = [
    { id: 1, name: 'Правописание Н и НН', avg: 65, best: 85 },
    { id: 2, name: 'Приставки ПРЕ-/ПРИ-', avg: 70, best: 90 },
    { id: 3, name: 'Паронимы (задание 5)', avg: 78, best: 95 },
    { id: 4, name: 'Синтаксические нормы', avg: 48, best: 65 },
    { id: 5, name: 'Пунктуация в ССП', avg: 85, best: 100 },
    { id: 6, name: 'Обособленные члены', avg: 55, best: 75 },
    { id: 7, name: 'Вводные конструкции', avg: 72, best: 88 },
    { id: 8, name: 'СПП с придаточными', avg: 52, best: 70 }
];

/**
 * Данные по пробным экзаменам (КИМам)
 */
const EXAM_DATA = [
    { id: 1, name: 'КИМ 15.04.2026', avg: 42, best: 56 },
    { id: 2, name: 'КИМ 29.04.2026', avg: 56, best: 68 },
    { id: 3, name: 'КИМ 13.05.2026', avg: 67, best: 79 },
    { id: 4, name: 'КИМ 27.05.2026', avg: 51, best: 63 },
    { id: 5, name: 'КИМ 10.06.2026', avg: 73, best: 82 },
    { id: 6, name: 'КИМ 24.06.2026', avg: 79, best: 91 },
    { id: 7, name: 'КИМ 08.07.2026', avg: 60, best: 74 },
    { id: 8, name: 'КИМ 22.07.2026', avg: 85, best: 92 }
];

/**
 * Данные по теоретическим знаниям
 */
const THEORY_DATA = {
    orthography: [
        { id: 1, name: 'Корни с чередованием', score: 72 },
        { id: 2, name: 'Приставки ПРЕ-/ПРИ-', score: 68 },
        { id: 3, name: 'Н/НН в причастиях', score: 55 },
        { id: 4, name: 'О/Ё после шипящих', score: 85 },
        { id: 5, name: 'И/Ы после Ц', score: 90 },
        { id: 6, name: 'Суффиксы прилагательных', score: 78 }
    ],
    punctuation: [
        { id: 1, name: 'Запятые в ССП', score: 88 },
        { id: 2, name: 'Обособление определений', score: 62 },
        { id: 3, name: 'Вводные слова', score: 70 },
        { id: 4, name: 'СПП с придаточными', score: 48 },
        { id: 5, name: 'Тире и двоеточие', score: 75 }
    ],
    text: [
        { id: 1, name: 'Средства связи в тексте', score: 82 },
        { id: 2, name: 'Типы речи', score: 65 },
        { id: 3, name: 'Выразительные средства', score: 58 },
        { id: 4, name: 'Анализ текста (задание 22-26)', score: 70 }
    ]
};

/**
 * Данные для блока "Можно улучшить" — Теория и практика
 */
const IMPROVE_THEORY_PRACTICE = [
    { theme: 'Орфография', tasks: [
        { id: 1, name: 'Н/НН в причастиях', percent: 55 },
        { id: 2, name: 'Приставки ПРЕ-/ПРИ-', percent: 68 }
    ]},
    { theme: 'Пунктуация', tasks: [
        { id: 3, name: 'СПП с придаточными', percent: 48 },
        { id: 4, name: 'Обособление определений', percent: 62 }
    ]},
    { theme: 'Работа с текстом', tasks: [
        { id: 5, name: 'Выразительные средства', percent: 58 }
    ]}
];

/**
 * Данные для блока "Можно улучшить" — Пробные экзамены
 */
const IMPROVE_EXAMS = [
    {
        date: '29.06.2026',
        errors: [
            { id: 101, name: 'Задание 4 (орфоэпия)', score: 2, maxScore: 4 },
            { id: 102, name: 'Задание 8 (синтаксис)', score: 3, maxScore: 6 },
            { id: 103, name: 'Задание 21 (пунктуация)', score: 1, maxScore: 4 }
        ]
    },
    {
        date: '20.07.2026',
        errors: [
            { id: 201, name: 'Задание 5 (паронимы)', score: 2, maxScore: 5 },
            { id: 202, name: 'Задание 12 (личные окончания)', score: 1, maxScore: 4 }
        ]
    },
    {
        date: '10.08.2026',
        errors: [
            { id: 301, name: 'Задание 14 (слитное написание)', score: 3, maxScore: 5 },
            { id: 302, name: 'Задание 17 (обособления)', score: 2, maxScore: 4 },
            { id: 303, name: 'Задание 19 (СПП)', score: 1, maxScore: 3 }
        ]
    }
];

// ============================================
// СОСТОЯНИЕ ГРАФИКОВ
// ============================================

let practiceChartType = 'both';
let examChartType = 'both';
let activeTheoryLines = ['orthography', 'punctuation', 'text'];

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА
// ============================================

/**
 * Рендеринг страницы прогресса
 * @param {HTMLElement} container - Контейнер для рендеринга
 */
function renderStudentProgress(container) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Формируем HTML
    container.innerHTML = `
        <!-- Верхняя панель -->
        <div class="top-bar">
            <div>
                <h1 class="page-title">📊 Мой прогресс</h1>
                <div class="greeting">Детальная статистика по всем направлениям</div>
            </div>
            <div class="role-indicator">👤 Ученик</div>
        </div>

        <!-- График 1: Практические задания -->
        <div class="block" style="margin-bottom:20px;">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-pencil-alt" style="color:#4f46e5;"></i> Практические задания</span>
                <span style="font-size:12px; color:#94a3b8;">По основным темам</span>
            </div>
            <div class="chart-type-selector" id="practiceTypeSelector">
                <button class="chart-type-btn active" data-type="both" onclick="switchPracticeChart('both', this)">📊 Обе линии</button>
                <button class="chart-type-btn" data-type="avg" onclick="switchPracticeChart('avg', this)">📈 В среднем</button>
                <button class="chart-type-btn" data-type="best" onclick="switchPracticeChart('best', this)">📈 Лучший результат</button>
            </div>
            <div class="chart-container" id="practiceChart">
                <svg class="chart-svg" id="practiceSvg"></svg>
                <div class="chart-tooltip" id="practiceTooltip"></div>
            </div>
            <div class="chart-legend" id="practiceLegend">
                <span class="legend-item"><span class="legend-dot blue"></span> В среднем</span>
                <span class="legend-item"><span class="legend-dot green"></span> Лучший результат</span>
            </div>
        </div>

        <!-- График 2: Пробные экзамены -->
        <div class="block" style="margin-bottom:20px;">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-file-alt" style="color:#f59e0b;"></i> Пробные экзамены</span>
                <span style="font-size:12px; color:#94a3b8;">По КИМам</span>
            </div>
            <div class="chart-type-selector" id="examTypeSelector">
                <button class="chart-type-btn active" data-type="both" onclick="switchExamChart('both', this)">📊 Обе линии</button>
                <button class="chart-type-btn" data-type="avg" onclick="switchExamChart('avg', this)">📈 В среднем</button>
                <button class="chart-type-btn" data-type="best" onclick="switchExamChart('best', this)">📈 Лучший результат</button>
            </div>
            <div class="chart-container" id="examChart">
                <svg class="chart-svg" id="examSvg"></svg>
                <div class="chart-tooltip" id="examTooltip"></div>
            </div>
            <div class="chart-legend" id="examLegend">
                <span class="legend-item"><span class="legend-dot blue"></span> В среднем</span>
                <span class="legend-item"><span class="legend-dot green"></span> Лучший результат</span>
            </div>
        </div>

        <!-- График 3: Теоретические знания -->
        <div class="block" style="margin-bottom:20px;">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-book" style="color:#8b5cf6;"></i> Теоретические знания</span>
                <span style="font-size:12px; color:#94a3b8;">По темам</span>
            </div>
            <div class="chart-controls" id="theoryControls">
                <button class="btn-toggle color-1 active" data-theme="orthography" onclick="toggleTheoryLine('orthography', this)">📝 Орфография</button>
                <button class="btn-toggle color-2 active" data-theme="punctuation" onclick="toggleTheoryLine('punctuation', this)">🔖 Пунктуация</button>
                <button class="btn-toggle color-3 active" data-theme="text" onclick="toggleTheoryLine('text', this)">📄 Работа с текстом</button>
            </div>
            <div class="chart-container" id="theoryChart">
                <svg class="chart-svg" id="theorySvg"></svg>
                <div class="chart-tooltip" id="theoryTooltip"></div>
            </div>
            <div class="chart-legend" id="theoryLegend">
                <span class="legend-item"><span class="legend-dot blue"></span> Орфография</span>
                <span class="legend-item"><span class="legend-dot green"></span> Пунктуация</span>
                <span class="legend-item"><span class="legend-dot orange"></span> Работа с текстом</span>
            </div>
        </div>

        <!-- Блок "Можно улучшить" -->
        <div class="block" style="margin-top:20px;">
            <div class="block-header">
                <span class="block-title"><i class="fas fa-arrow-up" style="color:#ef4444;"></i> Можно улучшить</span>
                <span style="font-size:12px; color:#94a3b8;">Точки роста</span>
            </div>

            <!-- Теория и практические задания -->
            <div style="margin-bottom:20px;">
                <h4 style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-graduation-cap" style="color:#4f46e5;"></i> Теория и практические задания
                </h4>
                <div id="theoryPracticeList"></div>
            </div>

            <!-- Пробные экзамены -->
            <div>
                <h4 style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-clipboard-list" style="color:#f59e0b;"></i> Пробные экзамены
                </h4>
                <div id="examErrorList"></div>
            </div>
        </div>
    `;
    
    // Рендерим графики
    setTimeout(() => {
        renderPracticeChart();
        renderExamChart();
        renderTheoryChart();
        renderImproveBlocks();
    }, 50);
}

// ============================================
// УТИЛИТЫ ДЛЯ ГРАФИКОВ
// ============================================

/**
 * Получение максимального значения из данных
 */
function getMaxValue(data, keys) {
    let max = 0;
    data.forEach(d => {
        keys.forEach(k => {
            if (d[k] > max) max = d[k];
        });
    });
    return max * 1.15 || 100;
}

/**
 * Построение графика на SVG
 */
function buildChart(svgId, data, keys, colors, tooltipId, onPointClick, type = 'both') {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    
    const rect = svg.parentElement?.getBoundingClientRect();
    const width = (rect?.width || 800) - 40;
    const height = 220;
    
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '';

    const padding = { top: 20, bottom: 30, left: 30, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxVal = getMaxValue(data, keys);

    // Определяем, какие линии показывать
    let visibleKeys = [];
    if (type === 'both') visibleKeys = keys;
    else if (type === 'avg') visibleKeys = [keys[0]];
    else if (type === 'best') visibleKeys = [keys[1]];
    else visibleKeys = [keys[0]];

    // Рисуем линии
    visibleKeys.forEach((key, ki) => {
        const color = colors[ki % colors.length];
        const points = data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
            const y = padding.top + chartHeight - (d[key] / maxVal) * chartHeight;
            return { x, y, value: d[key], label: d.name };
        });

        // Линия
        let pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);

        // Точки
        points.forEach((p, idx) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', p.x);
            circle.setAttribute('cy', p.y);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '1.5');
            circle.style.cursor = 'pointer';
            circle.dataset.index = idx;
            circle.dataset.key = key;
            circle.dataset.value = p.value;
            circle.dataset.label = p.label;
            circle.dataset.id = data[idx].id;

            circle.addEventListener('mouseenter', function(e) {
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) {
                    const keyLabel = key === 'avg' ? 'В среднем' : 'Лучший';
                    tooltip.innerHTML = `<strong>${this.dataset.label}</strong><br>${keyLabel}: ${this.dataset.value}%`;
                    tooltip.style.left = (p.x + 10) + 'px';
                    tooltip.style.top = (p.y - 30) + 'px';
                    tooltip.classList.add('visible');
                }
            });
            circle.addEventListener('mouseleave', function() {
                const tooltip = document.getElementById(tooltipId);
                if (tooltip) tooltip.classList.remove('visible');
            });
            circle.addEventListener('click', function() {
                if (onPointClick) onPointClick(data[idx].id);
            });

            svg.appendChild(circle);
        });
    });

    // Оси
    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', padding.left);
    axisY.setAttribute('y1', padding.top);
    axisY.setAttribute('x2', padding.left);
    axisY.setAttribute('y2', padding.top + chartHeight);
    axisY.setAttribute('stroke', '#e2e8f0');
    axisY.setAttribute('stroke-width', '1');
    svg.appendChild(axisY);

    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', padding.left);
    axisX.setAttribute('y1', padding.top + chartHeight);
    axisX.setAttribute('x2', padding.left + chartWidth);
    axisX.setAttribute('y2', padding.top + chartHeight);
    axisX.setAttribute('stroke', '#e2e8f0');
    axisX.setAttribute('stroke-width', '1');
    svg.appendChild(axisX);

    // Подписи оси X (каждая вторая)
    data.forEach((d, i) => {
        if (i % 2 !== 0 && i !== data.length - 1) return;
        const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', padding.top + chartHeight + 18);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '9');
        text.setAttribute('fill', '#94a3b8');
        text.textContent = d.name.length > 8 ? d.name.substring(0, 6) + '…' : d.name;
        svg.appendChild(text);
    });

    // Подписи оси Y
    [0, 50, 100].forEach(val => {
        const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 8);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#94a3b8');
        text.textContent = val + '%';
        svg.appendChild(text);
    });
}

// ============================================
// РЕНДЕРИНГ ГРАФИКОВ
// ============================================

/**
 * Рендеринг графика практических заданий
 */
function renderPracticeChart() {
    buildChart(
        'practiceSvg', 
        PRACTICE_DATA, 
        ['avg', 'best'], 
        ['#4f46e5', '#10b981'],
        'practiceTooltip',
        (id) => {
            const task = PRACTICE_DATA.find(t => t.id === id);
            if (task) {
                alert(`Переход к практическому заданию: ${task.name}\n(раздел "Задания")`);
            }
        },
        practiceChartType
    );
}

/**
 * Рендеринг графика пробных экзаменов
 */
function renderExamChart() {
    buildChart(
        'examSvg', 
        EXAM_DATA, 
        ['avg', 'best'], 
        ['#4f46e5', '#10b981'],
        'examTooltip',
        (id) => {
            const exam = EXAM_DATA.find(e => e.id === id);
            if (exam) {
                alert(`Переход к пробному экзамену: ${exam.name}\n(раздел "Задания")`);
            }
        },
        examChartType
    );
}

/**
 * Рендеринг графика теоретических знаний
 */
function renderTheoryChart() {
    const svg = document.getElementById('theorySvg');
    if (!svg) return;
    
    const rect = svg.parentElement?.getBoundingClientRect();
    const width = (rect?.width || 800) - 40;
    const height = 220;
    
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '';

    const padding = { top: 20, bottom: 30, left: 30, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Конфигурация тем
    const themeMap = {
        orthography: { data: THEORY_DATA.orthography, color: '#4f46e5', label: 'Орфография' },
        punctuation: { data: THEORY_DATA.punctuation, color: '#10b981', label: 'Пунктуация' },
        text: { data: THEORY_DATA.text, color: '#f59e0b', label: 'Работа с текстом' }
    };

    // Вычисляем максимальное значение
    let maxVal = 0;
    activeTheoryLines.forEach(key => {
        const theme = themeMap[key];
        if (theme) {
            theme.data.forEach(d => {
                if (d.score > maxVal) maxVal = d.score;
            });
        }
    });
    maxVal = maxVal * 1.15 || 100;

    // Рисуем линии для активных тем
    activeTheoryLines.forEach((themeKey) => {
        const theme = themeMap[themeKey];
        if (!theme || !theme.data.length) return;

        const points = theme.data.map((d, i) => {
            const x = padding.left + (i / (theme.data.length - 1 || 1)) * chartWidth;
            const y = padding.top + chartHeight - (d.score / maxVal) * chartHeight;
            return { x, y, value: d.score, label: d.name };
        });

        // Линия
        let pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('stroke', theme.color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);

        // Точки
        points.forEach((p) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', p.x);
            circle.setAttribute('cy', p.y);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', theme.color);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '1.5');
            circle.style.cursor = 'pointer';
            circle.dataset.label = p.label;
            circle.dataset.value = p.value;
            circle.dataset.theme = themeKey;

            circle.addEventListener('mouseenter', function(e) {
                const tooltip = document.getElementById('theoryTooltip');
                if (tooltip) {
                    const themeLabel = themeMap[this.dataset.theme]?.label || '';
                    tooltip.innerHTML = `<strong>${this.dataset.label}</strong><br>${themeLabel}: ${this.dataset.value}%`;
                    tooltip.style.left = (p.x + 10) + 'px';
                    tooltip.style.top = (p.y - 30) + 'px';
                    tooltip.classList.add('visible');
                }
            });
            circle.addEventListener('mouseleave', function() {
                const tooltip = document.getElementById('theoryTooltip');
                if (tooltip) tooltip.classList.remove('visible');
            });
            circle.addEventListener('click', function() {
                alert(`Переход к теоретическому тесту: ${this.dataset.label}\n(раздел "Задания")`);
            });

            svg.appendChild(circle);
        });
    });

    // Оси
    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', padding.left);
    axisY.setAttribute('y1', padding.top);
    axisY.setAttribute('x2', padding.left);
    axisY.setAttribute('y2', padding.top + chartHeight);
    axisY.setAttribute('stroke', '#e2e8f0');
    axisY.setAttribute('stroke-width', '1');
    svg.appendChild(axisY);

    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', padding.left);
    axisX.setAttribute('y1', padding.top + chartHeight);
    axisX.setAttribute('x2', padding.left + chartWidth);
    axisX.setAttribute('y2', padding.top + chartHeight);
    axisX.setAttribute('stroke', '#e2e8f0');
    axisX.setAttribute('stroke-width', '1');
    svg.appendChild(axisX);

    // Подписи оси Y
    [0, 50, 100].forEach(val => {
        const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 8);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#94a3b8');
        text.textContent = val + '%';
        svg.appendChild(text);
    });
}

// ============================================
// УПРАВЛЕНИЕ ГРАФИКАМИ
// ============================================

/**
 * Переключение типа графика практических заданий
 */
function switchPracticeChart(type, btn) {
    practiceChartType = type;
    document.querySelectorAll('#practiceTypeSelector .chart-type-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderPracticeChart();
}

/**
 * Переключение типа графика пробных экзаменов
 */
function switchExamChart(type, btn) {
    examChartType = type;
    document.querySelectorAll('#examTypeSelector .chart-type-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderExamChart();
}

/**
 * Переключение линии на графике теоретических знаний
 */
function toggleTheoryLine(theme, btn) {
    const idx = activeTheoryLines.indexOf(theme);
    if (idx !== -1) {
        activeTheoryLines.splice(idx, 1);
        btn.classList.remove('active');
    } else {
        activeTheoryLines.push(theme);
        btn.classList.add('active');
    }
    renderTheoryChart();
}

// ============================================
// БЛОК "МОЖНО УЛУЧШИТЬ"
// ============================================

/**
 * Рендеринг блока "Можно улучшить"
 */
function renderImproveBlocks() {
    // Теория и практика
    const tpContainer = document.getElementById('theoryPracticeList');
    if (tpContainer) {
        tpContainer.innerHTML = IMPROVE_THEORY_PRACTICE.map(cat => `
            <div class="improve-card">
                <div class="card-title">${cat.theme}</div>
                ${cat.tasks.map(task => `
                    <div class="improve-item">
                        <span class="item-name">${task.name}</span>
                        <span class="item-percent"><span class="done">${task.percent}%</span> / 100%</span>
                        <button class="btn-improve" onclick="handleImproveTask(${task.id}, '${task.name}')">Улучшить</button>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    // Пробные экзамены
    const examContainer = document.getElementById('examErrorList');
    if (examContainer) {
        examContainer.innerHTML = IMPROVE_EXAMS.map(exam => `
            <div class="improve-card">
                <div class="card-title">📋 Экзамен ${exam.date}</div>
                ${exam.errors.map(err => `
                    <div class="improve-item" style="border-left-color:#f59e0b;">
                        <span class="item-name">${err.name}</span>
                        <span class="item-percent" style="color:#ef4444;">
                            ${err.score} из ${err.maxScore} баллов
                        </span>
                        <button class="btn-improve" onclick="handleImproveExam(${err.id}, '${err.name}')">Улучшить</button>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
}

/**
 * Обработчик кнопки "Улучшить" для заданий
 */
function handleImproveTask(taskId, taskName) {
    // Проверяем, есть ли у пользователя задание для улучшения
    const user = getCurrentUser();
    if (!user) return;
    
    // Ищем задание в хранилище
    const allTasks = getTasks();
    const task = allTasks.find(t => t.id === taskId);
    
    if (task) {
        // Переходим к выполнению задания
        if (typeof openStudentTask === 'function') {
            openStudentTask(taskId);
        } else {
            alert(`Переход к заданию: ${taskName}\n(раздел "Задания")`);
        }
    } else {
        // Если задание не найдено, предлагаем создать быструю тренировку
        alert(`Быстрая тренировка по теме: ${taskName}\nБудет доступна в следующей версии.`);
    }
}

/**
 * Обработчик кнопки "Улучшить" для экзаменов
 */
function handleImproveExam(errorId, errorName) {
    alert(`Быстрая тренировка по теме: ${errorName}\nБудет доступна в следующей версии.`);
}

// ============================================
// ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ
// ============================================

// Экспортируем главную функцию
window.renderStudentProgress = renderStudentProgress;

// Экспортируем функции управления графиками
window.switchPracticeChart = switchPracticeChart;
window.switchExamChart = switchExamChart;
window.toggleTheoryLine = toggleTheoryLine;

// Экспортируем обработчики
window.handleImproveTask = handleImproveTask;
window.handleImproveExam = handleImproveExam;

// Экспортируем функции рендеринга графиков (для обновления при resize)
window.renderPracticeChart = renderPracticeChart;
window.renderExamChart = renderExamChart;
window.renderTheoryChart = renderTheoryChart;
window.renderImproveBlocks = renderImproveBlocks;

// Сообщаем о загрузке модуля
console.log('📊 Модуль StudentProgress.js загружен');
console.log('📈 Данные загружены:');
console.log('  📝 Практика:', PRACTICE_DATA.length, 'заданий');
console.log('  📋 Экзамены:', EXAM_DATA.length, 'КИМов');
console.log('  📚 Теория:', 
    THEORY_DATA.orthography.length + 
    THEORY_DATA.punctuation.length + 
    THEORY_DATA.text.length, 'тем');
