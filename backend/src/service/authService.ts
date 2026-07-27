import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { UserRow } from "../types/database";

export class AuthService {
    static async getUserByEmail(email: string) {
        const [users] = await pool.query<UserRow[]>(
            'SELECT id, email, password, full_name, role, is_active FROM users WHERE email = ?',
            [email]
        );
        return users.length > 0 ? users[0] : null;
    }

    static async createUser(email: string, hashedPassword: string, fullName: string, phone: string, role: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, fullName, phone, role]
        );
        return result.insertId;
    }

    static async getUserById(id: number) {
        const [users] = await pool.query<UserRow[]>(
            'SELECT id, email, full_name, role FROM users WHERE id = ?',
            [id]
        );
        return users.length > 0 ? users[0] : null;
    }

    static async getUserPasswordHashById(id: number) {
        const [users] = await pool.query<UserRow[]>(
            'SELECT password FROM users WHERE id = ?',
            [id]
        );
        return users.length > 0 ? users[0].password : null;
    }

    static async updatePassword(id: number, hashedPassword: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }
}
