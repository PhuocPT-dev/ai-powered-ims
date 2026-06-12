import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout'; // Lấy cái vỏ Tivi
import DashboardOverview from './pages/hr/DashboardOverview'; // Lấy cái ruột
import JobManagement from './pages/hr/JobManagement';
import CVManagement from './pages/hr/CVManagement';


import CareersPage from './pages/public/Careers';
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
          <Route path="jobs" element={<JobManagement />} />
          <Route path="jobs/:id" element={<CVManagement />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
