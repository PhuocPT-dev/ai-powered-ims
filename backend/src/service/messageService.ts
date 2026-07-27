import pool from "../config/db";
import { MessageRow, UserRow } from "../types/database";

export class MessageService {
    // Lấy toàn bộ lịch sử tin nhắn giữa 2 người
    static async getChatHistory(userId: number, partnerId: number) {
        const [messages] = await pool.query<MessageRow[]>(
            `SELECT id, sender_id, receiver_id, content, created_at 
             FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?)
             ORDER BY created_at ASC`,
            [userId, partnerId, partnerId, userId]
        );
        return messages;
    }

    // Lấy danh bạ người dùng dựa trên vai trò
    static async getContacts(userId: number, role: string) {
        let query = '';

        if (role === 'INTERN') {
            // Intern: Có quyền liên hệ với Mentor, HR, Coordinator, Admin
            query = `SELECT id, full_name, email, role FROM users 
                     WHERE role IN ('MENTOR', 'HR', 'COORDINATOR', 'ADMIN') AND is_active = TRUE`;
        } else {
            // Quản lý: Có quyền liên hệ với toàn bộ Interns
            query = `SELECT id, full_name, email, role FROM users 
                     WHERE role = 'INTERN' AND is_active = TRUE`;
        }
        const [contacts] = await pool.query<UserRow[]>(query);
        return contacts;
    }
}