import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { UserRow } from "../types/database";

export class AdminService {
    static async toggleUserStatus(userId: string, is_active: boolean) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [is_active, userId]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(userId: string, hashedPassword: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        return result.affectedRows > 0;
    }

    static async getUserById(userId: string) {
        const [users] = await pool.query<UserRow[]>(
            'SELECT full_name, email FROM users WHERE id = ?', 
            [userId]
        );
        return users.length > 0 ? users[0] : null;
    }

    static async getAllUsers() {
        const [users] = await pool.query<UserRow[]>(
            `SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`
        );
        return users;
    }

    static async createUser(fullName: string, email: string, role: string, hashedPassword: string) {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO users (full_name, email, role, password) VALUES (?, ?, ?, ?)`,
            [fullName, email, role, hashedPassword]
        );
        return result.insertId;
    }

    static async updateUserRole(userId: string, role: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET role = ? WHERE id = ?', 
            [role, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteUser(userId: number) {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }
}
