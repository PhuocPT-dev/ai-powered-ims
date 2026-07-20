import dotenv from 'dotenv';
dotenv.config(); // Phải gọi đầu tiên trước mọi module khác!
import helmet from 'helmet';
import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import cors from 'cors';
import internRoutes from './routes/internRoutes';
import adminRoutes from './routes/adminRoutes';
import interviewRoutes from './routes/interviewRoutes';
import trainingRoutes from './routes/trainingRoutes';
import taskRoutes from './routes/taskRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { createServer } from 'http';
import { setupSocket } from './config/socket';
import messageRoutes from './routes/messageRoutes';


import pool from './config/db';


const app = express();

app.use(helmet());
// BẢO MẬT: Chỉ bật Swagger (Tài liệu API) khi Code/Test. Tắt khi đem lên Production.
if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
}
const PORT = Number(process.env.PORT) || 5000;

// BẢO MẬT: Cấu hình CORS Whitelist (Chỉ cho phép Frontend của ta gọi API)
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // giúp server đọc được dữ liệu dạng JSON, giới hạn 10kb chống DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//API Route thử nghiệm Health Check chuẩn
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
    } catch {
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});
// API Route Đăng ký
app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobRoutes);
// Khai báo API Route quản lý đơn ứng tuyển
app.use('/api/applications', applicationRoutes);

//Khai báo API Route quản lý hồ sơ thực tập sinh
app.use('/api/interns', internRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/interviews', interviewRoutes);

app.use('/api/trainings', trainingRoutes);

app.use('/api/tasks', taskRoutes);

app.use('/api/feedbacks', feedbackRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/messages', messageRoutes);



// Khai báo Error handler global
app.use(errorHandler);

// Tạo HTTP Server bọc quanh Express app
const server = createServer(app);
// Tích hợp Socket.io vào HTTP Server
setupSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with WebSockets enabled!`);
});
