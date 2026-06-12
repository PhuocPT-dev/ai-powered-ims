import helmet from 'helmet';
import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRouter';
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
import './config/db';


const app = express();

app.use(helmet());
app.use(cors());
setupSwagger(app);
const PORT = 5000;

// khai báo middleware 
app.use(cors());
app.use(express.json()); // giúp server đọc được dữ liệu dạng JSON từ Frontend gửi lên

//API Route thử nghiệm
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: "success",
        message: "AI-Powered IMS Backend is running smoothly!"
    })
})
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


// Khai báo Error handler global
app.use(errorHandler);

//Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})