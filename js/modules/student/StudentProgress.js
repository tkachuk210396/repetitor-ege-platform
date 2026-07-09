export default class StudentProgress {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">📊 Мой прогресс</h1>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                    <div style="background: white; border: 1px solid #eef2f6; border-radius: 16px; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">📝</div>
                        <div style="font-size: 14px; color: #64748b;">Всего заданий</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: white; border: 1px solid #eef2f6; border-radius: 16px; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">✅</div>
                        <div style="font-size: 14px; color: #64748b;">Выполнено</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📈</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">Статистика появится после выполнения заданий</h3>
                    <p style="color: #64748b;">Выполняйте задания, чтобы отслеживать свой прогресс.</p>
                </div>
            </div>
        `;
    }
}
