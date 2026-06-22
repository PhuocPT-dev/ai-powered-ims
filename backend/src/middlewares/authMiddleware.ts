import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface JwtPayload {
    id: number;
    role: 'ADMIN' | 'HR' | 'COORDINATOR' | 'MENTOR' | 'INTERN' | 'CANDIDATE';
    iat?: number;
    exp?: number;
}

// mở rộng cấu trúc Request của Express để nó có cái túi 'user' đựng thông tin khách
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Không tìm thấy Thẻ (Token). vui lòng đăng nhập!" });
        return;
    }

    // Cắt lấy chuỗi Token (Loại bỏ chữ Bearer ở đầu)
    const token = authHeader.split(' ')[1];

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET is not defined in environment variables');
        }
        const secretKey = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        // 4. Vượt qua bài soi! Thẻ là THẬT.
        // Lấy thông tin in trên thẻ (id, role) nhét vào túi req.user của khách. 
        // Để lát nữa đi vào Controller, các phòng ban biết khách này là ai.
        req.user = decoded;

        //5 .Mở cửa cho đi tiếp
        next();

    } catch (error) {
        // Nếu thẻ làm giả, hoặc thẻ đã quá hạn 1 ngày (hàm jwt.verify sẽ văng lỗi xuống đây)
        res.status(403).json({ message: "Thẻ giả mạo hoặc đã hết hạn!" });
    }

}

// Đây là một "Nhà máy" chuyên sản xuất ra các anh bảo vệ tùy theo từng phòng.
// Cú pháp dấu ba chấm (...allowedRoles) giúp ta truyền vào bao nhiêu chức vụ cũng được (VD: 'ADMIN', 'HR')
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        //
        const userRole = req.user?.role

        if (!userRole) {
            res.status(403).json({ message: "Bạn không có quyền truy cập" })
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                message: `Từ chối truy cập: Chức vụ ${userRole} không có quyền vào phòng này!`
            })
            return;
        }

        // Nếu qua hết vòng kiểm tra, cho đi tiếp
        next();
    }
}