import pool from '../config/db';

async function initDB() {
    try {
        // câu lệnh SQQQQQL thuần tạo bảng Users
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users(
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                role ENUM ('ADMIN', 'COORDINATOR','MENTOR','CANDIDATE', 'INTERN') DEFAULT 'CANDIDATE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;
        // Ra lệnh cho MysQQL thực thi
        await pool.query(createUsersTableQuery);
        console.log("✅ Đã tạo thành công bảng 'users' (hoặc bảng đã tồn tại).");
    } catch (error) {
        console.error("Lỗi khi tạo bảng ", error);
    } finally {
        process.exit(); // Tắt script sau khi chạy xong
    }
}

// chạy thử
initDB();