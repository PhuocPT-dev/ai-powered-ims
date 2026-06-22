import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // Hàm tiện ích: Giúp code JSX ngắn gọn hơn. 
    // Nếu Role hiện tại nằm trong mảng allowedRoles thì mới trả về true (hiển thị)
    const canSee = (allowedRoles: string[]) => {
        if (!user?.role) return false;
        return allowedRoles.includes(user.role);
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">

            {/* 1. Thanh Menu Bên Trái (Sidebar) */}
            <aside className="w-64 bg-zinc-900 text-white flex flex-col shadow-lg z-10">
                <div className="h-16 flex items-center px-6 text-xl font-bold border-b border-zinc-800 tracking-wider">
                    🤖 AI-IMS
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">

                    {/* Tổng quan: ADMIN, HR, MENTOR, COORDINATOR xem được. INTERN thì KHÔNG */}
                    {canSee(['ADMIN', 'HR', 'MENTOR', 'COORDINATOR']) && (
                        <Link to="/dashboard" className="block px-4 py-3 rounded-md bg-blue-600 text-white font-medium shadow-sm">
                            📊 Tổng Quan
                        </Link>
                    )}

                    {/* Quản lý Tuyển dụng: Chỉ dành cho HR và ADMIN */}
                    {canSee(['ADMIN', 'HR']) && (
                        <>
                            <Link to="/dashboard/jobs" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                                💼 Quản Lý Việc Làm
                            </Link>
                            <Link to="/dashboard/cvs" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                                📄 Quản Lý CV
                            </Link>
                        </>
                    )}

                    {/* Quản lý Thực tập sinh: Dành cho MENTOR, HR, ADMIN */}
                    {canSee(['ADMIN', 'HR', 'MENTOR']) && (
                        <Link to="/dashboard/interns" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                            🎓 Thực Tập Sinh
                        </Link>
                    )}

                    {/* Bảng Công Việc Kanban: INTERN, MENTOR, ADMIN đều phải xem được */}
                    {canSee(['ADMIN', 'MENTOR', 'INTERN']) && (
                        <Link to="/dashboard/tasks" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                            📌 Bảng Công Việc
                        </Link>
                    )}

                </nav>

                <div className="p-4 border-t border-zinc-800">
                    {/* Nút đăng xuất sẽ xóa sạch Token và Role */}
                    <button
                        onClick={handleLogout}
                        className="w-full text-center block px-4 py-2 rounded-md text-red-400 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        🚪 Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Phần cột to đùng bên phải */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm z-0">
                    <h2 className="text-lg font-semibold text-gray-700">Trang Tổng Quan</h2>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">Xin chào, {user?.full_name || 'Khách'}!</span>
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
