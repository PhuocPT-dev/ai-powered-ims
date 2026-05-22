import 'dotenv/config'; // Dòng này cực quan trọng: Ép hệ thống mở két sắt .env để lấy API Key
import { AIService } from '../utils/ai';

async function runTest() {
    console.log("⏳ Đang gọi Giám đốc AI dậy làm việc. Vui lòng chờ khoảng 3 giây...");

    // Tưởng tượng đây là một chiếc CV cực kỳ "ảo tưởng" của một bạn sinh viên
    const fakeCV = `
        Tôi tên là Nguyễn Văn Ngây Thơ. 
        Tôi là sinh viên năm 4 ngành CNTT. 
        Kỹ năng của tôi bao gồm: HTML, CSS, JavaScript ở mức cơ bản, và biết copy code từ ChatGPT. 
        Tôi từng làm đồ án môn học "Quản lý quán trà chanh" bằng Winform C#. 
        Thế mạnh: Rất nhiệt huyết, hay đi trễ nhưng về sớm.
        Mục tiêu nghề nghiệp: Mong muốn mức lương khởi điểm 25 triệu/tháng vì em nghe nói IT lương ngàn đô.
    `;

    // Quăng tờ CV cho AI đọc và lấy kết quả
    const aiResponse = await AIService.analyzeCV(fakeCV);

    // In kết quả ra màn hình đen
    console.log("\n=============================================");
    console.log("📜 BẢN NHẬN XÉT CỦA GIÁM ĐỐC AI GEMINI 2.0:");
    console.log("=============================================");
    console.log(aiResponse);
    console.log("=============================================\n");
}

runTest();
