import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// lấy api key từ file env
const apiKey = process.env.GEMINI_API_KEY || "";


const genAI = new GoogleGenerativeAI(apiKey);

export class AIService {
    static async analyzeCV(cvText: string): Promise<{ score: number; summary: string }> {
        try {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: {
                                type: SchemaType.INTEGER,
                                description: "Điểm đánh giá tổng quan của CV trên thang điểm từ 1 đến 10"
                            },
                            summary: {
                                type: SchemaType.STRING,
                                description: "Đánh giá chi tiết CV bao gồm: Kỹ năng công nghệ nổi bật; Điểm mạnh và Điểm yếu."
                            }
                        },
                        required: ["score", "summary"]
                    }
                }
            });

            const prompt = `
            Hãy đóng vai là một Giám đốc nhân sự IT khó tính.
            Hãy đọc nội dung CV sau đây và đánh giá chi tiết:
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
            
            const parsedData = JSON.parse(responseText);
            return {
                score: Number(parsedData.score) || 0,
                summary: parsedData.summary || "Không có đánh giá chi tiết."
            };

        } catch (error) {
            console.error("Error analyzing CV:", error);
            return {
                score: 0,
                summary: "Xảy ra lỗi khi phân tích CV"
            };
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

