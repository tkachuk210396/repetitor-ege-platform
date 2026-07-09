export default class AdminLessons {
    render() {
        return `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h1 style="font-size: 24px; font-weight: 700;">📹 Занятия</h1>
                    <button class="btn btn-primary" onclick="alert('Создание занятия будет доступно позже')">
                        + Создать занятие
                    </button>
                </div>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">Здесь будут ваши занятия</h3>
                    <p style="color: #64748b;">Добавьте первое занятие, нажав кнопку выше.</p>
                </div>
            </div>
        `;
    }
}
