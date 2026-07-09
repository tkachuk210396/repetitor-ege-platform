// ============================================
// ТЕСТОВЫЕ ДАННЫЕ
// ============================================

export function initTestData() {
    // Проверяем, есть ли уже пользователи
    if (!localStorage.getItem('users')) {
        const users = [
            {
                id: 'admin_1',
                name: 'Анна Николаева',
                email: 'admin@ege.ru',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: 'student_1',
                name: 'Анна К.',
                email: 'anna@student.ru',
                password: 'student123',
                role: 'student'
            },
            {
                id: 'student_2',
                name: 'Дмитрий М.',
                email: 'dmitry@student.ru',
                password: 'student123',
                role: 'student'
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Проверяем, есть ли уже задания
    if (!localStorage.getItem('tasks')) {
        const tasks = [
            {
                id: 1,
                title: 'Правописание Н и НН',
                description: 'Вставьте пропущенные буквы в словах',
                type: 'multiple-choice',
                theme: 'orthography'
            },
            {
                id: 2,
                title: 'Знаки препинания в ССП',
                description: 'Расставьте знаки препинания в сложносочинённых предложениях',
                type: 'multiple-choice',
                theme: 'punctuation'
            }
        ];
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Проверяем, есть ли уже занятия
    if (!localStorage.getItem('lessons')) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const lessons = [
            {
                id: 1001,
                title: 'Подготовка к сочинению',
                description: 'Разбираем структуру сочинения и критерии оценивания',
                startTime: tomorrow.toISOString(),
                duration: 60,
                meetLink: 'https://meet.google.com/abc-defg-hij',
                status: 'scheduled',
                studentId: 'student_1',
                teacherId: 'admin_1'
            }
        ];
        localStorage.setItem('lessons', JSON.stringify(lessons));
    }
    
    // Проверяем, есть ли уже назначения заданий
    if (!localStorage.getItem('assignments')) {
        const assignments = [
            {
                id: 1001,
                studentId: 'student_1',
                taskId: 1,
                status: 'new',
                submittedAt: null
            }
        ];
        localStorage.setItem('assignments', JSON.stringify(assignments));
    }
}
