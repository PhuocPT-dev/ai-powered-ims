const pdfParse = require('pdf-parse');

export class PDFService {
    // Hàm này nhận vào một đường link web (.pdf) và trả về toàn bộ chữ bên trong
    static async extractTextFromUrl(url: string): Promise<string> {
        try {
            // 1. Đi tới đường link và tải file PDF đó về
            const response = await fetch(url);

            // 2. Chuyển nó thành "cục dữ liệu nhị phân" (Buffer) mà máy tính hiểu
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 3. Đưa cho thư viện chuyên gia pdf-parse "bóc" ra chữ
            const pdfData = await pdfParse(buffer);

            // Trả về toàn bộ đoạn chữ đó
            return pdfData.text;

        } catch (error) {
            console.error("Lỗi khi đọc file PDF:", error);
            // Nếu rủi ro ứng viên nộp file rác, ta trả về câu này
            return "Không thể đọc được nội dung CV từ file này.";
        }
    }
}
