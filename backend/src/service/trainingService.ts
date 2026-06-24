import pool from "../config/db";

export class TrainingService {
    static async createProgram(title: string, description: string, startDate: string, endDate: string, coordinatorId: number) {
        const [result]: any = await pool.query(
            `INSERT INTO training_programs (title, description, start_date, end_date, coordinator_id)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, startDate, endDate, coordinatorId]
        );
        return result.insertId;
    }

    static async getTrainingProgramInfo(trainingId: string) {
        const [trainings]: any = await pool.query(
            'SELECT id, coordinator_id FROM training_programs WHERE id = ?', 
            [trainingId]
        );
        return trainings.length > 0 ? trainings[0] : null;
    }

    static async getUserRole(userId: number) {
        const [users]: any = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0].role : null;
    }

    static async isInternEnrolled(internId: number, trainingId: string) {
        const [existing]: any = await pool.query(
            'SELECT id FROM intern_trainings WHERE intern_id = ? AND training_id = ?',
            [internId, trainingId]
        );
        return existing.length > 0;
    }

    static async enrollIntern(internId: number, trainingId: string) {
        await pool.query(
            `INSERT INTO intern_trainings (intern_id, training_id) VALUES (?, ?)`,
            [internId, trainingId]
        );
    }
}
