import { GoogleGenerativeAI } from "@google/generative-ai";

// lấy api key từ file env
const apiKey = process.env.GEMINI_API_KEY || "";


const genAI = new GoogleGenerativeAI(apiKey);

export class AIService {
    static async analyzeCV(cvText: string): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            Hãy đóng vai là một Giám đốc nhân sự IT khó tính.
            Hãy đọc nội dung CV sau đây và đánh giá ngắn gọn theo 3 ý sau:
            1. Kỹ năng công nghệ nổi bật.
            2. Điểm mạnh và Điểm yếu.
            3. Chấm điểm tổng quan (Từ 1 đến 10).

            
            Đây là nội dung CV của ứng viên:
            ---
            ${cvText}
            ---
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return responseText;

        } catch (error) {
            console.error("Error analyzing CV:", error);
            return "Xảy ra lỗi khi phân tích CV";
        }
    }

    static async generateContent(prompt: string): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error generating content via AI:", error);
            return "Xảy ra lỗi khi nhận phản hồi từ AI";
        }
    }
}

