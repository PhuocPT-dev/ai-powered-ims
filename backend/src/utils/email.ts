import nodemailer from 'nodemailer'

// Khởi tạo Transporter (Cổng giao tiếp email)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho các port khác (như 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export class EmailService {
    // Hàm nhận nhiệm vụ: Gửi cho ai? Tiêu đề là gì? Nội dung viết gì?
    static async sendMail(to: string, subject: string, text: string): Promise<boolean> {
        try {
            // cấu hình người gửi, tiêu đề, nội dung
            const mailOptions = {
                from: `"Phòng nhân sự IMS" <${process.env.EMAIL_USER}>`,
                to: to, //Người nhận
                subject: subject, // Tiêu đề
                text: text // Nội dung 
            }
            // Gủi mail
            const info = await transporter.sendMail(mailOptions);
            console.log("Đã gửi email thành công tới:", to);
            return true;
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            return false;
        }
    }


}