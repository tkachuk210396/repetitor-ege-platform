export default class AdminDashboard {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">📊 Панель администратора</h1>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        <div style="color: #64748b; font-size: 14px;">👥 Учеников</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        <div style="color: #64748b; font-size: 14px;">📅 Занятий</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        <div style="color: #64748b; font-size: 14px;">⏳ На проверке</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        <div style="color: #64748b; font-size: 14px;">📚 Заданий</div>
                        <div style="font-size: 32px; font-weight: 700; margin-top: 4px;">0</div>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">Добро пожаловать в панель администратора!</h3>
                    <p style="color: #64748b;">Здесь вы можете управлять учениками, занятиями и заданиями.</p>
                </div>
            </div>
        `;
    }
}
