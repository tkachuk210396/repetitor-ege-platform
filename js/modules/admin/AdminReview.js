export default class AdminReview {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">✅ Проверка работ</h1>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">Нет работ на проверку</h3>
                    <p style="color: #64748b;">Когда ученики отправят задания, они появятся здесь.</p>
                </div>
            </div>
        `;
    }
}
