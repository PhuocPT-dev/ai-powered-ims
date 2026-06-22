import pool from "../config/db";
import { AppError } from "../utils/AppError";

export class TaskService {
    static async createTask(mentorId: number, internId: number, title: string, description: string, deadline: string) {
        const [result]: any = await pool.query(
            'INSERT INTO tasks (title, description, mentor_id, intern_id, deadline) VALUES (?, ?, ?, ?, ?)',
            [title, description, mentorId, internId, deadline]
        );
        return result.insertId;
    }

    static async getTasksByIntern(internId: number) {
        const [rows] = await pool.query(
            `SELECT id, title, description, deadline, status, score, mentor_id 
             FROM tasks 
             WHERE intern_id = ? 
             ORDER BY created_at DESC`,
            [internId]
        );
        return rows;
    }

    static async updateTaskStatus(taskId: string, internId: number, newStatus: string) {
        const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
        if (!validStatuses.includes(newStatus)) {
            throw new AppError("Trạng thái không hợp lệ!", 400);
        }

        const [result]: any = await pool.query(
            'UPDATE tasks SET status = ? WHERE id = ? AND intern_id = ?',
            [newStatus, taskId, internId]
        );
        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy Task hoặc bạn không có quyền sửa bài của người khác!", 404);
        }
        return true;
    }

    // Chấm điểm (Chỉ dành cho MENTOR)
    static async evaluateTask(taskId: string, mentorId: number, score: number) {
        if (score < 0 || score > 100) {
            throw new AppError("Điểm số phải từ 0 đến 100!", 400);
        }

        const [tasks]: any = await pool.query(
            'SELECT status FROM tasks WHERE id = ? AND mentor_id = ?',
            [taskId, mentorId]
        );
        if (tasks.length === 0) {
            throw new AppError("Không tìm thấy Task hoặc bạn không có quyền chấm bài này!", 404);
        }
        //Check xem đã nộp bài chưa!
        if (tasks[0].status !== 'DONE') {
            throw new AppError("Intern chưa nộp bài (Task chưa DONE) nên không thể chấm điểm!", 400);
        }
        // Cập nhật điểm
        const [result]: any = await pool.query(
            'UPDATE tasks SET status = "EVALUATED", score = ? WHERE id = ?',
            [score, taskId]
        );
        if (result.affectedRows === 0) {
            throw new AppError("Không thể chấm điểm! Task không tồn tại hoặc bạn không phải Mentor giao việc này.", 403);
        }
        return true;
    }
}