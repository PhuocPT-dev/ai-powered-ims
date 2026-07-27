import { RowDataPacket } from 'mysql2/promise';

/**
 * Database Row Interfaces extending mysql2 RowDataPacket
 */

export interface UserRow extends RowDataPacket {
    id: number;
    full_name: string;
    email: string;
    role: string;
    password?: string;
    phone?: string;
    is_active?: boolean;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface InternProfileRow extends RowDataPacket {
    id: number;
    user_id: number;
    university: string;
    major: string;
    skills: string | string[];
    emergency_contact: string;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface JobRow extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    salary?: string;
    location?: string;
    employer_id?: number;
    status?: string;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface ApplicationRow extends RowDataPacket {
    id: number;
    job_id: number;
    candidate_id: number;
    cv_url: string;
    ai_summary?: string;
    ai_score?: number | null;
    status: string;
    created_at?: Date | string;
    updated_at?: Date | string;
    candidate_name?: string;
    job_title?: string;
    email?: string;
    full_name?: string;
}

export interface TaskRow extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    mentor_id: number;
    intern_id: number;
    deadline?: Date | string;
    status: string;
    score?: number | null;
    created_at?: Date | string;
    updated_at?: Date | string;
    intern_name?: string;
}

export interface TrainingProgramRow extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    start_date: Date | string;
    end_date: Date | string;
    coordinator_id?: number;
    coordinator_name?: string;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface InternTrainingRow extends RowDataPacket {
    id: number;
    intern_id: number;
    training_id: number;
    status: string;
    enrolled_at?: Date | string;
    intern_training_id?: number;
    full_name?: string;
    email?: string;
    program_id?: number;
    title?: string;
    description?: string;
    start_date?: Date | string;
    end_date?: Date | string;
    coordinator_name?: string;
    coordinator_email?: string;
}

export interface InterviewRow extends RowDataPacket {
    id: number;
    application_id: number;
    coordinator_id?: number;
    interview_time: Date | string;
    meeting_link: string;
    status: string;
    created_at?: Date | string;
    updated_at?: Date | string;
    candidate_name?: string;
    candidate_email?: string;
    job_title?: string;
    coordinator_name?: string;
    email?: string;
    full_name?: string;
    title?: string;
}

export interface FeedbackRow extends RowDataPacket {
    id: number;
    intern_id: number;
    mentor_id: number;
    rating: number;
    comment: string;
    is_anonymous: boolean | number;
    created_at?: Date | string;
    updated_at?: Date | string;
    intern_name?: string;
}

export interface MessageRow extends RowDataPacket {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at?: Date | string;
}

// Statistical / Aggregate Query Row Interfaces
export interface TotalCountRow extends RowDataPacket {
    total: number;
    total_interns?: number;
    total_tasks?: number;
    completed_tasks?: number;
}

export interface MonthlyAppStatsRow extends RowDataPacket {
    month: string;
    total_applications: number;
}

export interface TrainingStatsRow extends RowDataPacket {
    id: number;
    title: string;
    total_interns: number;
    completed_interns: number;
}

export interface InternKPIStatsRow extends RowDataPacket {
    total_tasks: number;
    completed_tasks: number;
    average_score: number | null;
}

export interface TopInternRow extends RowDataPacket {
    id: number;
    full_name: string;
    email: string;
    average_score: number;
}
