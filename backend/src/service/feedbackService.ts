import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { FeedbackRow, UserRow } from "../types/database";

export class FeedbackService {
    static async createFeedback(internId: number, mentorId: number, rating: number, comment: string, isAnonymous: boolean) {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO feedbacks (intern_id, mentor_id, rating, comment, is_anonymous) 
             VALUES (?, ?, ?, ?, ?)`,
            [internId, mentorId, rating, comment, isAnonymous]
        );
        return result.insertId;
    }

    static async getFeedbacksByMentor(mentorId: string) {
        const [feedbacks] = await pool.query<FeedbackRow[]>(
            `SELECT f.id, f.rating, f.comment, f.is_anonymous, f.created_at, 
            IF(f.is_anonymous = 1, 'Ẩn danh', u.full_name) as intern_name
            FROM feedbacks f
            JOIN users u ON f.intern_id = u.id
            WHERE f.mentor_id = ?
            ORDER BY f.created_at DESC`,
            [mentorId]
        );
        return feedbacks;
    }

    static async getMentors() {
        const [mentors] = await pool.query<UserRow[]>("SELECT id, full_name, email FROM users WHERE role = 'MENTOR'");
        return mentors;
    }
}
