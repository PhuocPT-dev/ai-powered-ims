import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { InterviewRow } from "../types/database";

export class InterviewService {
    static async getApplicationInfo(applicationId: string) {
        const [applications] = await pool.query<InterviewRow[]>(
            `SELECT u.email, u.full_name, j.title FROM applications a
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ?
            `,
            [applicationId]
        );
        return applications.length > 0 ? applications[0] : null;
    }

    static async scheduleInterview(applicationId: string, coordinatorId: number, interviewTime: string, meetingLink: string) {
        await pool.query<ResultSetHeader>(
            `INSERT INTO interviews (application_id, coordinator_id, interview_time, meeting_link) 
            VALUES (?, ?, ?, ?)`,
            [applicationId, coordinatorId, interviewTime, meetingLink]
        );
    }

    static async getAllInterviews() {
        const [interviews] = await pool.query<InterviewRow[]>(
            `SELECT i.id, i.interview_time, i.meeting_link, i.status, i.created_at,
            u.full_name as candidate_name, u.email as candidate_email,
            j.title as job_title
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY i.interview_time DESC`
        );
        return interviews;
    }

    static async getMyInterviews(candidateId: number) {
        const [interviews] = await pool.query<InterviewRow[]>(
            `SELECT i.id, i.interview_time, i.meeting_link, i.status, i.created_at,
            j.title as job_title, u.full_name as coordinator_name
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN users u ON i.coordinator_id = u.id
            WHERE a.candidate_id = ?
            ORDER BY i.interview_time DESC`,
            [candidateId]
        );
        return interviews;
    }

    static async updateStatus(interviewId: string, status: string) {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE interviews SET status = ? WHERE id = ?',
            [status, interviewId]
        );
        return result.affectedRows > 0;
    }
}
