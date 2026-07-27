import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { TrainingProgramRow, InternTrainingRow } from "../types/database";

export class TrainingService {
    static async getAllPrograms() {
        const [programs] = await pool.query<TrainingProgramRow[]>(
            `SELECT t.id, t.title, t.description, t.start_date, t.end_date, t.created_at, u.full_name as coordinator_name 
            FROM training_programs t
            LEFT JOIN users u ON t.coordinator_id = u.id
            ORDER BY t.created_at DESC`
        );
        return programs;
    }

    static async createProgram(title: string, description: string, startDate: string, endDate: string, coordinatorId: number) {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO training_programs (title, description, start_date, end_date, coordinator_id)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, startDate, endDate, coordinatorId]
        );
        return result.insertId;
    }

    static async getTrainingProgramInfo(trainingId: string) {
        const [trainings] = await pool.query<TrainingProgramRow[]>(
            'SELECT id, coordinator_id FROM training_programs WHERE id = ?', 
            [trainingId]
        );
        return trainings.length > 0 ? trainings[0] : null;
    }

    static async isInternEnrolled(internId: number, trainingId: string) {
        const [existing] = await pool.query<InternTrainingRow[]>(
            'SELECT id FROM intern_trainings WHERE intern_id = ? AND training_id = ?',
            [internId, trainingId]
        );
        return existing.length > 0;
    }

    static async enrollIntern(internId: number, trainingId: string) {
        await pool.query<ResultSetHeader>(
            `INSERT INTO intern_trainings (intern_id, training_id) VALUES (?, ?)`,
            [internId, trainingId]
        );
    }

    static async getProgramById(trainingId: string) {
        const [programs] = await pool.query<TrainingProgramRow[]>(
            `SELECT t.*, u.full_name as coordinator_name 
            FROM training_programs t
            LEFT JOIN users u ON t.coordinator_id = u.id
            WHERE t.id = ?`,
            [trainingId]
        );
        return programs.length > 0 ? programs[0] : null;
    }

    static async getProgramMembers(trainingId: string) {
        const [members] = await pool.query<InternTrainingRow[]>(
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
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE intern_trainings SET status = ? WHERE id = ?',
            [status, internTrainingId]
        );
        return result.affectedRows > 0;
    }

    static async deleteProgram(trainingId: string) {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM training_programs WHERE id = ?', [trainingId]);
        return result.affectedRows > 0;
    }

    static async getInternTrainings(internId: number) {
        const [programs] = await pool.query<InternTrainingRow[]>(
            `SELECT it.id as intern_training_id, it.status, it.enrolled_at,
            t.id as program_id, t.title, t.description, t.start_date, t.end_date,
            u.full_name as coordinator_name, u.email as coordinator_email
            FROM intern_trainings it
            JOIN training_programs t ON it.training_id = t.id
            LEFT JOIN users u ON t.coordinator_id = u.id
            WHERE it.intern_id = ?
            ORDER BY t.start_date ASC`,
            [internId]
        );
        return programs;
    }
}
