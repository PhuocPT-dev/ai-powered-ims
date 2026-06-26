import pool from "../config/db";

export class TrainingService {
    static async getAllPrograms() {
        const [programs]: any = await pool.query(
            `SELECT t.id, t.title, t.description, t.start_date, t.end_date, t.created_at, u.full_name as coordinator_name 
            FROM training_programs t
            LEFT JOIN users u ON t.coordinator_id = u.id
            ORDER BY t.created_at DESC`
        );
        return programs;
    }

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

    static async getProgramById(trainingId: string) {
        const [programs]: any = await pool.query(
            `SELECT t.*, u.full_name as coordinator_name 
            FROM training_programs t
            LEFT JOIN users u ON t.coordinator_id = u.id
            WHERE t.id = ?`,
            [trainingId]
        );
        return programs.length > 0 ? programs[0] : null;
    }

    static async getProgramMembers(trainingId: string) {
        const [members]: any = await pool.query(
            `SELECT it.id as intern_training_id, it.status, it.enrolled_at,
            u.id as intern_id, u.full_name, u.email
            FROM intern_trainings it
            JOIN users u ON it.intern_id = u.id
            WHERE it.training_id = ?
            ORDER BY it.enrolled_at DESC`,
            [trainingId]
        );
        return members;
    }

    static async updateInternStatus(internTrainingId: string, status: string) {
        const [result]: any = await pool.query(
            'UPDATE intern_trainings SET status = ? WHERE id = ?',
            [status, internTrainingId]
        );
        return result.affectedRows > 0;
    }

    static async deleteProgram(trainingId: string) {
        const [result]: any = await pool.query('DELETE FROM training_programs WHERE id = ?', [trainingId]);
        return result.affectedRows > 0;
    }
}
