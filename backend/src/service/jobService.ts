import pool from "../config/db";
import { AppError } from "../utils/AppError";

interface CreateJobDto {
    title: string;
    description: string;
    salary?: string;
    location?: string;
}

export class JobService {
    static async createJob(jobData: CreateJobDto, employerId: number) {
        const { title, description, salary, location } = jobData;
        const [result]: any = await pool.query(
            `INSERT INTO jobs (title, description, salary, location, employer_id)
            VALUES (?,?,?,?,?)`,
            [title, description, salary, location, employerId]

        );
        return result.insertId;
    }

    static async getAllJobs(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        // BẢO MẬT: Không dùng SELECT * để tối ưu tốc độ mạng và bảo mật
        const [jobs]: any = await pool.query(
            'SELECT id, title, description, salary, location, employer_id, status, created_at FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [[{ total }]]: any = await pool.query('SELECT COUNT(*) as total FROM jobs');
        return { jobs, total, page, limit };
    }

    static async deleteJob(jobId: number) {
        // SOFT DELETE: Chỉ cập nhật trạng thái thành 'CLOSED' thay vì xóa vật lý
        const [result]: any = await pool.query("UPDATE jobs SET status = 'CLOSED' WHERE id = ?", [jobId]);
        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy tin tuyển dụng!", 404);
        }
    }
}