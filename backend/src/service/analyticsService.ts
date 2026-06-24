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
}
