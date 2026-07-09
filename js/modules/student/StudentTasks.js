export default class StudentTasks {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">📝 Мои задания</h1>
                
                <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="btn btn-primary" style="padding: 8px 20px; font-size: 13px;">Все</button>
                    <button class="btn" style="padding: 8px 20px; font-size: 13px; background: #f1f5f9;">🆕 Новые</button>
                    <button class="btn" style="padding: 8px 20px; font-size: 13px; background: #f1f5f9;">⏳ На проверке</button>
                    <button class="btn" style="padding: 8px 20px; font-size: 13px; background: #f1f5f9;">✅ Выполнено</button>
                </div>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">У вас пока нет заданий</h3>
                    <p style="color: #64748b;">Когда репетитор добавит задание, оно появится здесь.</p>
                </div>
            </div>
        `;
    }
}
