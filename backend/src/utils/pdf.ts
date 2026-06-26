import pdfParse from 'pdf-parse';

export class PDFService {
    // Hàm này nhận vào một đường link web (.pdf) và trả về toàn bộ chữ bên trong
    static async extractTextFromUrl(url: string): Promise<string> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Hủy sau 10 giây nếu treo tải

        try {
            // 1. Đi tới đường link và tải file PDF đó về với signal timeout
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Tải file thất bại với mã HTTP ${response.status}`);
            }

            // 2. Bảo mật & Validation: Kiểm tra Content-Type
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/pdf')) {
                throw new Error(`Định dạng không hợp lệ. Phải là application/pdf, nhận được: ${contentType}`);
            }

            // 3. Bảo mật: Giới hạn kích thước file (Tối đa 5MB) tránh cạn kiệt RAM
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
                throw new Error("Kích thước file PDF vượt quá giới hạn cho phép (Tối đa 5MB)");
            }

            // 4. Chuyển nó thành "cục dữ liệu nhị phân" (Buffer) mà máy tính hiểu
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 5. Đưa cho thư viện chuyên gia pdf-parse "bóc" ra chữ
            const pdfData = await pdfParse(buffer);

            // Trả về toàn bộ đoạn chữ đó
            return pdfData.text;

        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error("Lỗi: Tải file PDF quá thời gian (Timeout 10s):", url);
                return "Không thể tải file CV do kết nối bị quá hạn (Timeout 10 giây).";
            }
            console.error("Lỗi khi đọc file PDF:", error.message || error);
            return `Không thể đọc được nội dung CV từ file này. Chi tiết: ${error.message || 'Lỗi không xác định'}`;
        }
    }
}
