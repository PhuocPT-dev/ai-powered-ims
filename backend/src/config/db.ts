import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

//Kích hoạt đọc file .env
dotenv.config();

// tạo connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10, // Mở sẵn tối đa 10 cánh cửa
    queueLimit: 0  // Cho phép xếp hàng chờ nếu hết chỗ
})

// Test thử kết nối ngay lập tức

pool.getConnection().then((connection) => {
    console.log("Kết nối với Database thành công");
    connection.release(); // trả lại cửa cho hồ chứa để người khác dùng
}).catch((error) => {
    console.error("Kết nối thất bại", error);
})

// Xuất pool để các file khác dùng
export default pool;