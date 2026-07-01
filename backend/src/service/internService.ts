import pool from "../config/db";

export class InternService {
    static async getRoleByUserId(userId: number) {
        const [users]: any = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0].role : null;
    }

    static async createProfile(userId: number, university: string, major: string, skills: string, emergencyContact: string) {
        const [result]: any = await pool.query(
            `INSERT INTO intern_profiles(user_id, university, major, skills, emergency_contact)
            VALUES(? ,? ,? , ?, ?)`,
            [userId, university, major, skills, emergencyContact]
        );
        return result.insertId;
    }

    static async getProfileByUserId(userId: string) {
        const [profiles]: any = await pool.query(
            'SELECT id, user_id, university, major, skills, emergency_contact, created_at FROM intern_profiles WHERE user_id = ?', 
            [userId]
        );
        return profiles.length > 0 ? profiles[0] : null;
    }

    static async updateProfile(userId: string, university: string, major: string, skills: string, emergencyContact: string) {
        const [result]: any = await pool.query(
            `UPDATE intern_profiles SET university = ?, major = ? , skills = ?, emergency_contact = ? 
            WHERE user_id = ?`,
            [university, major, skills, emergencyContact, userId]
        );
        return result.affectedRows > 0;
    }

    static async getAllInterns() {
        const [interns]: any = await pool.query(
            'SELECT id, full_name, email FROM users WHERE role = "INTERN"'
        );
        return interns;
    }

    static async getInternSkillData(userId: number) {
        // Lấy profile
        const [profiles]: any = await pool.query(
            'SELECT university, major, skills FROM intern_profiles WHERE user_id = ?',
            [userId]
        );
        const profile = profiles.length > 0 ? profiles[0] : null;
        if (profile && profile.skills) {
            try {
                profile.skills = JSON.parse(profile.skills);
            } catch (e) {
                profile.skills = [];
            }
        }

        // Lấy danh sách tasks đã hoàn thành & chấm điểm
        const [tasks]: any = await pool.query(
            `SELECT title, description, score FROM tasks 
             WHERE intern_id = ? AND status = 'EVALUATED'`,
            [userId]
        );

        return { profile, tasks };
    }
}
