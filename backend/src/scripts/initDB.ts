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
                role ENUM ('ADMIN', 'COORDINATOR','MENTOR','CANDIDATE', 'INTERN') DEFAULT 'CANDIDATE',
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
                )`
        await pool.query(createJobsTableQuery);
        console.log("✅ Đã tạo thành công bảng 'jobs'.");

        // Tạo bảng Applications(đơn nộp CV)
        await pool.query('DROP TABLE IF EXISTS applications;');
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
                skills TEXT,
                emergency_contact VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await pool.query(createInternProfilesTableQuery);
        console.log("✅ Đã tạo thành công bảng 'intern_profiles'.");

    } catch (error) {
        console.error("Lỗi khi tạo bảng ", error);
    } finally {
        process.exit(); // Tắt script sau khi chạy xong
    }
}

// chạy thử
initDB();