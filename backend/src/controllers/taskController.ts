import { Request, Response } from "express";
import pool from "../config/db";

export class TaskController {
    // MENTOR GIAO TASK CHO INTERN
    static async createTask(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, mentor_id, intern_id, deadline } = req.body;
            // 
            const [users]: any = await pool.query(
                'SELECT id, role FROM users WHERE id IN (?, ?)',
                [mentor_id, intern_id]
            );
            let isMentorValid = false;
            let isInternValid = false;

            for (let user of users) {
                if (user.id === mentor_id && user.role === 'MENTOR') isMentorValid = true;
                if (user.id === intern_id && user.role === 'INTERN') isInternValid = true;
            }

            // Kiểm tra MENTOR và INTERN hợp lệ không
            if (!isMentorValid || !isInternValid) {
                res.status(400).json({ message: "Bảo vệ: Lỗi phân quyền! Chỉ Mentor mới được phép giao việc cho Intern!" });
                return;
            }
            // Hợp lệ đi tiếp
            const [result]: any = await pool.query(
                `INSERT INTO tasks (title, description, mentor_id, intern_id, deadline)
                VALUES (?,?,?,?,?)`,
                [title, description, mentor_id, intern_id, deadline]
            );
            res.status(201).json({
                status: "success",
                message: "Đã giao Task cho Intern thành công!",
                taskId: result.insertId
            })
        } catch (error) {
            console.error("Lỗi giao task:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    // Xem danh sách Task (Intern xem)
    static async getTasksByIntern(req: Request, res: Response): Promise<void> {
        try {
            const internId = req.params.internId;

            // Viết truy vấn SELECT lấy công việc
            const [tasks]: any = await pool.query(
                `SELECT t.id, t.title, t.description, t.status, t.created_at, u.full_name AS mentor_name 
                FROM tasks t
                JOIN users u ON t.mentor_id = u.id
                WHERE t.intern_id = ?
                ORDER BY t.created_at DESC`,
                [internId]
            );

            // Trả về dữ liệu cho Frontend
            res.status(200).json({
                status: "success",
                message: "Lấy danh sách công việc thành công!",
                data: tasks
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách task:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    // Intern Cập nhật trạng thái task
    static async updateTaskStatus(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.taskId;
            const { status } = req.body;

            // Chỉ cho phép Intern thay đổi trạng thái Task từ "TODO" sang "IN_PROGRESS" hoặc "DONE"
            if (status === 'EVALUATED') {
                res.status(403).json({ message: "Ăn gian hả? Intern không có quyền tự chấm điểm bài làm!" });
                return;
            }

            const [result]: any = await pool.query(
                `UPDATE tasks SET status = ? WHERE id = ?`,
                [status, taskId]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Không tìm thấy Task!" });
                return;
            }
            res.status(200).json({
                status: "success",
                message: "Cập nhật trạng thái task thành công!",
                data: result
            });
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái task:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    //Mentor đánh giá task
    static async evaluateTask(req: Request, res: Response): Promise<void> {
        try {
            const taskId = req.params.taskId;
            const { score } = req.body;
            // 
            if (score < 0 || score > 10) {
                res.status(400).json({ message: "Ràng buộc dữ liệu: Điểm số phải nằm trong khoảng từ 0 đến 10!" });
                return;
            }
            const [result]: any = await pool.query(
                `UPDATE tasks SET status = 'EVALUATED', score = ? WHERE id = ?`,
                [score, taskId]
            );
            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Không tìm thấy Task để chấm điểm!" });
                return;
            }
            res.status(200).json({
                status: "success",
                message: `Đã nghiệm thu và chấm ${score} điểm cho Task này!`,
                data: result
            });
        } catch (error) {
            console.error("Lỗi chấm điểm task:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

}