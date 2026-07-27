import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { AppError } from "../utils/AppError";
import { JobRow, TotalCountRow } from "../types/database";

interface CreateJobDto {
    title: string;
    description: string;
    salary?: string;
    location?: string;
}

export class JobService {
    static async createJob(jobData: CreateJobDto, employerId: number) {
        const { title, description, salary, location } = jobData;
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO jobs (title, description, salary, location, employer_id)
            VALUES (?,?,?,?,?)`,
            [title, description, salary, location, employerId]
        );
        return result.insertId;
    }

    static async getAllJobs(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;
        // BẢO MẬT: Không dùng SELECT * để tối ưu tốc độ mạng và bảo mật
        const [jobs] = await pool.query<JobRow[]>(
            "SELECT id, title, description, salary, location, employer_id, status, created_at FROM jobs WHERE status = 'OPEN' ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [limit, offset]
        );
        const [[{ total }]] = await pool.query<TotalCountRow[]>("SELECT COUNT(*) as total FROM jobs WHERE status = 'OPEN'");
        return { jobs, total, page, limit };
    }

    static async deleteJob(jobId: number) {
        // SOFT DELETE: Chỉ cập nhật trạng thái thành 'CLOSED' thay vì xóa vật lý
        const [result] = await pool.query<ResultSetHeader>("UPDATE jobs SET status = 'CLOSED' WHERE id = ?", [jobId]);
        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy tin tuyển dụng!", 404);
        }
    }
}