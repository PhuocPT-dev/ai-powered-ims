import pool from "../config/db";

export class JobService {
    static async createJob(jobData: any, employerId: number) {
        const { title, description, salary, location } = jobData;
        const [result]: any = await pool.query(
            `INSERT INTO jobs (title, description, salary, location, employer_id)
            VALUES (?,?,?,?,?)`,
            [title, description, salary, location, employerId]

        );
        return result.insertId;
    }

    static async getAllJobs() {
        const [jobs]: any = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        return jobs;
    }
}