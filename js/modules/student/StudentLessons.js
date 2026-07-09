export default class StudentLessons {
    render() {
        return `
            <div>
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">📹 Мои уроки</h1>
                
                <div style="background: #f1f5f9; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                    <h3 style="font-weight: 600; margin-bottom: 8px;">У вас пока нет уроков</h3>
                    <p style="color: #64748b;">Когда репетитор назначит занятие, оно появится здесь.</p>
                </div>
            </div>
        `;
    }
}
