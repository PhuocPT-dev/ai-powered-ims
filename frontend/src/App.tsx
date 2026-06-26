import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout'; // Lấy cái vỏ Tivi
import DashboardOverview from './pages/hr/DashboardOverview'; // Lấy cái ruột
import JobManagement from './pages/hr/JobManagement';
import InternManagement from './pages/hr/InternManagement';
import TaskBoard from './pages/intern/TaskBoard';
import TaskManagement from './pages/mentor/TaskManagement';
import CVManagement from './pages/hr/CVManagement';
import TrainingManagement from './pages/coordinator/TrainingManagement';
import InterviewManagement from './pages/coordinator/InterviewManagement';
import UserManagement from './pages/admin/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import CareersPage from './pages/public/Careers';
import SkillTracking from './pages/intern/SkillTracking';
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      {/* Treo chuông báo Toaster lên trần nhà */}
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Nếu người dùng lỡ gõ vào trang chủ, đá họ văng sang trang Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Đây là một cái khung trống màu xám nhạt, lát nữa ta sẽ nhét Form Login vào đây */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 👇 2. Đấu thêm đường dây cho Cổng Ứng viên (Đứng độc lập) 👇 */}
        <Route path="/careers" element={<CareersPage />} />

        {/* Đây là cái Khung chính */}
        <Route path="/dashboard" element={<DashboardLayout />} >
          {/* Cổng để nhét ruột vào */}
          <Route index element={<DashboardOverview />} />
          {/* 🔒ProtectedRoute bảo vệ khu vực HR 🔒 */}
          <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
            <Route path="jobs" element={<JobManagement />} />
            <Route path="jobs/:id" element={<CVManagement />} />
          </Route>

          {/* 🛡️ CỬA CHUYÊN DỤNG CHO TASK BOARD 🛡️ */}
          {/* Chỉ INTERN, MENTOR, ADMIN mới được bước vào đây */}
          <Route element={<ProtectedRoute allowedRoles={['INTERN', 'MENTOR', 'ADMIN']} />}>
            <Route path="tasks" element={<TaskBoard />} />
          </Route>

          {/* 🛡️ CỬA CHO INTERN THEO DÕI KỸ NĂNG & PHẢN HỒI 🛡️ */}
          <Route element={<ProtectedRoute allowedRoles={['INTERN', 'ADMIN']} />}>
            <Route path="skills" element={<SkillTracking />} />
          </Route>

          {/* 🛡️ CỬA CHO MENTOR QUẢN LÝ TASK 🛡️ */}
          <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
            <Route path="mentor/tasks" element={<TaskManagement />} />
          </Route>

          {/* 🛡️ CỬA QUẢN LÝ THỰC TẬP SINH 🛡️ */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MENTOR']} />}>
            <Route path="interns" element={<InternManagement />} />
          </Route>

          {/* 🛡️ CỬA CHO ĐIỀU PHỐI VIÊN (COORDINATOR) 🛡️ */}
          <Route element={<ProtectedRoute allowedRoles={['COORDINATOR', 'ADMIN']} />}>
            <Route path="trainings" element={<TrainingManagement />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['COORDINATOR', 'ADMIN', 'HR']} />}>
            <Route path="interviews" element={<InterviewManagement />} />
          </Route>

          {/* 🛡️ CỬA TỐI CAO DÀNH CHO ADMIN 🛡️ */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="users" element={<UserManagement />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
