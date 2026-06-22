import { Request, Response } from "express";
import pool from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";

export class AnalyticsController {
    static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
        // đếm tổng số lượng intern đang làm việc
        const [internCountRes]: any = await pool.query(
            `SELECT COUNT(*) as total_interns FROM users WHERE role = 'INTERN'`
        );

        // Thống kê tình trạng công việc
        const [taskStatsRes]: any = await pool.query(
            `SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'DONE' OR status = 'EVALUATED' THEN 1 ELSE 0 END) as completed_tasks
            FROM tasks
            `
        );
        // Bảng intern xuất sắc
        const [topInternsRes]: any = await pool.query(
            `SELECT u.id, u.full_name, u.email, AVG(t.score) as average_score 
            FROM users u
            JOIN tasks t ON u.id = t.intern_id
            WHERE t.status = 'EVALUATED'
            GROUP BY u.id, u.full_name
            ORDER BY average_score DESC
            LIMIT 3
            `
        )
        const totalInterns = internCountRes[0].total_interns;
        const totalTasks = taskStatsRes[0].total_tasks || 0;
        const completedTasks = taskStatsRes[0].completed_tasks || 0;

        // Tỷ lệ hoàn thành 
        const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        res.json({
            status: "success",
            data: {
                total_interns: totalInterns,
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    completion_rate_percent: completionRate
                },
                top_interns: topInternsRes
            }
        });
    });
} 