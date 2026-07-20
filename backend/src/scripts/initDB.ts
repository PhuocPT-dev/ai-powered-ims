import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db';

async function initDB() {
    try {
        // câu lệnh SQL thuần tạo bảng Users
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users(
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                role ENUM ('ADMIN', 'HR', 'COORDINATOR','MENTOR','CANDIDATE', 'INTERN') DEFAULT 'CANDIDATE',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;
        // Ra lệnh cho MysQQL thực thi
        await pool.query(createUsersTableQuery);
        console.log("✅ Đã tạo thành công bảng 'users' (hoặc bảng đã tồn tại).");

        // Tạo bảng Jobs
        const createJobsTableQuery = `
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                salary VARCHAR(100),
                location VARCHAR(255),
                employer_id INT NOT NULL,
                status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
                )`
        await pool.query(createJobsTableQuery);
        console.log("✅ Đã tạo thành công bảng 'jobs'.");

        // Tạo bảng Applications(đơn nộp CV)
        const createApplicationsTableQuery = `
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id INT NOT NULL,
                candidate_id INT NOT NULL,
                cv_url VARCHAR(500) NOT NULL,
                ai_score INT,
                ai_summary TEXT,
                status ENUM('PENDING','REVIEWING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_applications_candidate_job (candidate_id, job_id),
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `
        await pool.query(createApplicationsTableQuery);
        console.log("✅ Đã tạo thành công bảng 'applications'.");

        //Tạo bảng intern_profiles (Hồ sơ Thực tập sinh)
        const createInternProfilesTableQuery = `
            CREATE TABLE IF NOT EXISTS intern_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                university VARCHAR(255),
                major VARCHAR(255),
                skills JSON,
                emergency_contact VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createInternProfilesTableQuery);
        console.log("✅ Đã tạo thành công bảng 'intern_profiles'.");

        // Tạo bảng interviews (phỏng vấn)
        const createInterviewsTableQuery = `
            CREATE TABLE IF NOT EXISTS interviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                coordinator_id INT NOT NULL,
                interview_time DATETIME NOT NULL,
                meeting_link VARCHAR(255),
                status ENUM('SCHEDULED', 'COMPLETED', 'CANCELED') DEFAULT 'SCHEDULED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
                FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createInterviewsTableQuery);
        console.log("✅ Đã tạo thành công bảng 'interviews'.");

        // Tạo bảng training_programs (danh sách khóa học)
        const createTrainingProgramsQuery = `
            CREATE TABLE IF NOT EXISTS training_programs ( 
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                coordinator_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createTrainingProgramsQuery);
        console.log("✅ Đã tạo thành công bảng 'training_programs'.");

        // Tạo bảng intern_trainings: Bảng điểm danh (Nối Intern với Khóa học).
        const createInternTrainingsTableQuery = `
             CREATE TABLE IF NOT EXISTS intern_trainings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                intern_id INT NOT NULL,
                training_id INT NOT NULL,
                status ENUM('ENROLLED', 'COMPLETED', 'FAILED') DEFAULT 'ENROLLED',
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_intern_training (intern_id, training_id),
                FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (training_id) REFERENCES training_programs(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createInternTrainingsTableQuery);
        console.log("✅ Đã tạo thành công bảng 'intern_trainings'.");

        // Tạo bảng tasks 
        const createTasksTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                mentor_id INT NOT NULL,
                intern_id INT NOT NULL,
                deadline DATETIME,
                status ENUM('TODO', 'IN_PROGRESS', 'DONE', 'EVALUATED') DEFAULT 'TODO',
                score INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_tasks_intern_status (intern_id, status),
                 FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
                 FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE
                )
        `;
        await pool.query(createTasksTableQuery);
        console.log("✅ Đã tạo thành công bảng 'tasks'.");

        // Tạo bảng feedbacks
        const createFeedbacksTableQuery = `
            CREATE TABLE IF NOT EXISTS feedbacks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                intern_id INT NOT NULL,
                mentor_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createFeedbacksTableQuery);
        console.log("✅ Đã tạo thành công bảng 'feedbacks'.");

        // Tạo bảng messages để lưu lịch sử chat thời gian thực
        const createMessagesTableQuery = `
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_chat_users (sender_id, receiver_id),
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createMessagesTableQuery);
        console.log("✅ Đã tạo thành công bảng 'messages'.");


    } catch (error) {
        console.error("Lỗi khi tạo bảng ", error);
    } finally {
        process.exit(); // Tắt script sau khi chạy xong
    }
}

// chạy thử
initDB();