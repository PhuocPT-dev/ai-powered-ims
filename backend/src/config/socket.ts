import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import pool from "./db";
import { JwtPayload } from "../middlewares/authMiddleware";

// Nơi ghi nhớ trạng thái online: userId -> socketId
const userSocketMap = new Map<string, string>();

export const setupSocket = (server: HttpServer) => {
    // Khởi tạo socket.io
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    // 🛡️ BẢO MẬT: Middleware xác thực JWT Token trước khi thiết lập kết nối Socket
    io.use((socket, next) => {
        // Lấy token từ thuộc tính auth gửi kèm khi handshake
        const token = socket.handshake.auth?.token;
        
        if (!token) {
            return next(new Error("Authentication error: Không tìm thấy Token xác thực!"));
        }

        try {
            if (!process.env.JWT_SECRET) {
                return next(new Error("Server error: JWT_SECRET chưa được cấu hình!"));
            }
            // Xác thực token và lấy payload giải mã
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
            socket.data.user = decoded; // 👈 Lưu an toàn vào socket.data.user theo chuẩn của Socket.io
            next();
        } catch (err) {
            return next(new Error("Authentication error: Token không hợp lệ hoặc đã hết hạn!"));
        }
    });

    io.on("connection", (socket) => {
        // Lấy thông tin user đã được xác thực từ socket.data.user
        const user = socket.data.user as JwtPayload;
        if (!user) {
            socket.disconnect(true);
            return;
        }

        const userIdStr = String(user.id);
        // Tự động đưa user vào danh bạ online dựa trên token
        userSocketMap.set(userIdStr, socket.id);
        console.log(`🔌 User [${userIdStr}] (Vai trò: ${user.role}) đã online qua Socket: ${socket.id}`);

        // Lắng nghe tin nhắn chat gửi lên từ client
        socket.on("send_message", async (data: {
            receiver_id: number;
            content: string;
        }) => {
            const { receiver_id, content } = data;
            const senderId = user.id; // 👈 Đặt tên biến camelCase chuẩn convention JS/TS

            // 🛡️ VALIDATE: Chặn tin nhắn rỗng hoặc thiếu người nhận
            if (!receiver_id || !content.trim()) return;

            try {
                // Lưu tin nhắn vào Database (map sang cột snake_case khi query)
                const [result]: any = await pool.query(
                    "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
                    [senderId, receiver_id, content]
                );
                
                const messageId = result.insertId;
                const messageObj = {
                    id: messageId,
                    sender_id: senderId,
                    receiver_id,
                    content,
                    created_at: new Date().toISOString()
                };

                // Gửi phản hồi lại cho chính người gửi để cập nhật UI lập tức
                socket.emit("receive_message", messageObj);

                // Tra cứu danh bạ xem người nhận có đang online không
                const receiverSocketId = userSocketMap.get(String(receiver_id));
                if (receiverSocketId) {
                    // Gửi tiếp cho người nhận thời gian thực
                    io.to(receiverSocketId).emit("receive_message", messageObj);
                }
            } catch (error) {
                console.error('❌ Lỗi khi gửi tin nhắn qua Socket:', error);
            }
        });

        // Khi người dùng ngắt kết nối
        socket.on("disconnect", () => {
            console.log(`🔌 Thiết bị ngắt kết nối Socket: ${socket.id}`);
            // Xóa user khỏi danh bạ online an toàn để giải phóng bộ nhớ RAM
            userSocketMap.delete(userIdStr);
            console.log(`👤 User [${userIdStr}] đã offline.`);
        });
    });
};