import { Request, Response } from "express";
import pool from "../config/db";
import { PasswordUtil } from '../utils/password';
import jwt from "jsonwebtoken";



export class AuthController {
    // Hàm xử lý đăng ký (Dùng static gỏi thẳng từ class mà không cần tạo Object)
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, full_name, phone } = req.body;

            if (!email || !password || !full_name) {
                res.status(400).json({ message: "Vui lòng điền đủ email, password và họ tên!" });
                return;
            }

            // Bước 2: Kiểm tra xem Email đã bị ai dùng để đăng ký chưa?
            // CHÚ Ý: Dấu ? ở đây là kỹ thuật Query Parameters để chống SQL Injection (Chặn hacker chèn mã độc).
            // Thư viện mysql2 sẽ tự động lấy mảng [email] ở dưới thế vào dấu ?.
            const [existingUsers]: any = await pool.query(
                'SELECT * FROM users WHERE email = ?', [email]
            );
            if (existingUsers.length > 0) {
                res.status(400).json({ message: "Email này đã được sử dụng!" });
                return;
            }

            // Bước 3: Mã hóa (Băm) mật khẩu bằng công cụ ta vừa tạo ở Task 6
            const hashedPassword = await PasswordUtil.hash(password);

            //Bước 4: Lưu người dùng mới và Database
            //Role mặc định trong CSDL đã cài sawnx là 'CANDIDATE', nên ta không cần INSERT cột role nữa
            const [result] = await pool.query(
                'INSERT INTO users (email, password, full_name, phone) VALUES (?, ?, ?, ?)',
                [email, hashedPassword, full_name, phone]
            );
            // Bước 5: Báo cáo thành công về cho Frontend
            res.status(201).json({
                status: "success",
                message: "Đăng ký thành công!"
            })
        } catch (error) {
            // Bước Gom Lỗi: Nếu bất kỳ dòng code nào ở trên bị sập, nó sẽ văng xuống đây
            // Server không bị chết, mà sẽ trả về báo lỗi lịch sự cho người dùng.
            console.error("Lỗi Đăng ký:", error);
            res.status(500).json({ message: "Lỗi hệ thống (Server Error)!" });
        }
    }
    //Hàm xử lý Đăng nhập
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: "Vui lòng nhập đủ email và mật khẩu" });
                return;
            }
            // Bước 1: Tìm người dùng trong Database bằng email
            const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

            // Bước 2: Kiểm tra xem Email có tồn tại không?
            if (users.length === 0) {
                res.status(401).json({ message: "Email hoặc mật khẩu không chính xác!" });
                return;
            }

            // Bước 3: Lấy thông tin người dùng ra
            const user = users[0];

            // Bước 4: So sanh mật khẩu
            const isMatch = await PasswordUtil.compare(password, user.password);

            if (!isMatch) {
                res.status(401).json({ message: "Email hoặc mật khẩu không chính xác!" });
                return;
            }

            // Bước 5 : đan nhập thành công => tiến hành cấp thẻ thông hành (JWT)
            // Lấy con dấu từ file .env 
            const secretKey = process.env.JWT_SECRET || 'fallback_secret'

            const token = jwt.sign(
                { id: user.id, role: user.role },
                secretKey,
                { expiresIn: '1d' }
            );

            // Bước 6: Trả thông tin user và Token về cho Frontend
            // ta không trả toàn bộ thông tin user (vd : password), mà chỉ trả những gì Frontend cần

            res.status(200).json({
                status: "success",
                message: "Đăng nhập thành công!",
                data: {
                    token: token,
                    user: {
                        id: user.id,
                        full_name: user.full_name,
                        role: user.role
                    }
                }
            });

        } catch (error) {
            console.error("Lỗi Đăng nhập:", error);
            res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    }
}

