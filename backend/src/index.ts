import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRouter';
import applicationRoutes from './routes/applicationRoutes';
import cors from 'cors';
import internRoutes from './routes/internRoutes';
import adminRoutes from './routes/adminRoutes';
import interviewRoutes from './routes/interviewRoutes';
import trainingRoutes from './routes/trainingRoutes';
import './config/db';


const app = express();
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

//Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})