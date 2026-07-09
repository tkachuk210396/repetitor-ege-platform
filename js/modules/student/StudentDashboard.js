export default class StudentDashboard {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">🏠 Моя панель</h1>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white;">
                        <div style="font-size: 14px; opacity: 0.8;">📊 Прогресс</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white;">
                        <div style="font-size: 14px; opacity: 0.8;">✅ Выполнено</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white;">
                        <div style="font-size: 14px; opacity: 0.8;">⏳ В работе</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white;">
                        <div style="font-size: 14px; opacity: 0.8;">📅 Занятий</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">Добро пожаловать на платформу!</h3>
                    <p style="color: #64748b;">Здесь вы можете видеть свой прогресс и выполнять задания.</p>
                </div>
            </div>
        `;
    }
}
