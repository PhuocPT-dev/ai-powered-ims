import pool from "../config/db";

export class AnalyticsService {
    static async getDashboardStats() {
        const [
            [internCountRes],
            [taskStatsRes],
            [topInternsRes]
        ]: any = await Promise.all([
            pool.query(`SELECT COUNT(*) as total_interns FROM users WHERE role = 'INTERN'`),
            pool.query(`SELECT COUNT(*) as total_tasks, SUM(CASE WHEN status = 'DONE' OR status = 'EVALUATED' THEN 1 ELSE 0 END) as completed_tasks FROM tasks`),
            pool.query(`
                SELECT u.id, u.full_name, u.email, AVG(t.score) as average_score 
                FROM users u
                JOIN tasks t ON u.id = t.intern_id
                WHERE t.status = 'EVALUATED'
                GROUP BY u.id, u.full_name
                ORDER BY average_score DESC
                LIMIT 3
            `)
        ]);

        return {
            totalInterns: internCountRes[0].total_interns,
            totalTasks: taskStatsRes[0].total_tasks || 0,
            completedTasks: taskStatsRes[0].completed_tasks || 0,
            topInterns: topInternsRes
        };
    }

    // 1. Thống kê số lượng theo tháng (Biểu đồ)
    static async getMonthlyStats() {
        // Lấy số đơn ứng tuyển theo từng tháng (6 tháng gần nhất)
        const [monthlyApplications]: any = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total_applications
            FROM applications
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `);
        return monthlyApplications;
    }

    // 2. Thống kê theo từng Training Program
    static async getTrainingStats() {
        const [trainingStats]: any = await pool.query(`
            SELECT t.id, t.title, COUNT(it.intern_id) as total_interns,
            SUM(CASE WHEN it.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_interns
            FROM training_programs t
            LEFT JOIN intern_trainings it ON t.id = it.training_id
            GROUP BY t.id, t.title
        `);
        return trainingStats;
    }

    // 3. Thống kê KPI từng Intern cụ thể
    static async getInternKPI(internId: string) {
        const [[stats]]: any = await pool.query(`
            SELECT COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'DONE' OR status = 'EVALUATED' THEN 1 ELSE 0 END) as completed_tasks,
            AVG(score) as average_score
            FROM tasks
            WHERE intern_id = ?
        `, [internId]);
        return stats || { total_tasks: 0, completed_tasks: 0, average_score: 0 };
    }
}
