import pool from "../config/db";

export class AuthService {
    static async getUserByEmail(email: string) {
        const [users]: any = await pool.query(
            'SELECT id, email, password, full_name, role, is_active FROM users WHERE email = ?',
            [email]
        );
        return users.length > 0 ? users[0] : null;
    }

    static async createUser(email: string, hashedPassword: string, fullName: string, phone: string, role: string) {
        const [result]: any = await pool.query(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, fullName, phone, role]
        );
        return result.insertId;
    }

    static async getUserById(id: number) {
        const [users]: any = await pool.query(
            'SELECT id, email, full_name, role FROM users WHERE id = ?',
            [id]
        );
        return users.length > 0 ? users[0] : null;
    }
}
