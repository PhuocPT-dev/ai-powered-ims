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
}
