import pool from "../config/db";

export class InterviewService {
    static async getApplicationInfo(applicationId: string) {
        const [applications]: any = await pool.query(
            `SELECT u.email, u.full_name, j.title FROM applications a
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON  a.job_id = j.id
            WHERE a.id= ?
            `,
            [applicationId]
        );
        return applications.length > 0 ? applications[0] : null;
    }

    static async scheduleInterview(applicationId: string, coordinatorId: number, interviewTime: string, meetingLink: string) {
        await pool.query(
            `INSERT INTO interviews (application_id, coordinator_id, interview_time, meeting_link) 
            VALUES (?, ?, ?, ?)`,
            [applicationId, coordinatorId, interviewTime, meetingLink]
        );
    }
}
