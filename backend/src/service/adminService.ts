import pool from "../config/db";

export class AdminService {
    static async toggleUserStatus(userId: string, is_active: boolean) {
        const [result]: any = await pool.query('UPDATE users SET is_active = ? WHERE id = ?',
            [is_active, userId]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(userId: string, hashedPassword: string) {
        const [result]: any = await pool.query('UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        return result.affectedRows > 0;
    }

    static async getUserById(userId: string) {
        const [users]: any = await pool.query('SELECT full_name, email FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0] : null;
    }

    static async getAllUsers() {
        const [users]: any = await pool.query(
            `SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`
        );
        return users;
    }

    static async createUser(fullName: string, email: string, role: string, hashedPassword: string) {
        const [result]: any = await pool.query(
            `INSERT INTO users (full_name, email, role, password) VALUES (?, ?, ?, ?)`,
            [fullName, email, role, hashedPassword]
        );
        return result.insertId;
    }

    static async updateUserRole(userId: string, role: string) {
        const [result]: any = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        return result.affectedRows > 0;
    }
}
