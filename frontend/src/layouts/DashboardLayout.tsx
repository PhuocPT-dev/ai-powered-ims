import { Outlet, NavLink, useNavigate } from "react-router-dom";
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

    const navLinkClass = ({ isActive }: { isActive: boolean }) => 
        `block px-4 py-3 rounded-md font-medium transition-colors ${
            isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`;

    const adminNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `block px-4 py-3 rounded-md font-medium transition-colors ${
            isActive ? 'bg-red-600 text-white shadow-sm' : 'text-red-400 hover:bg-zinc-800 hover:text-red-300'
        }`;

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
                        <NavLink to="/dashboard" end className={navLinkClass}>
                            📊 Tổng Quan
                        </NavLink>
                    )}

                    {/* Quản lý Tuyển dụng: Chỉ dành cho HR và ADMIN */}
                    {canSee(['ADMIN', 'HR']) && (
                        <NavLink to="/dashboard/jobs" className={navLinkClass}>
                            💼 Quản Lý Việc Làm
                        </NavLink>
                    )}

                    {/* Quản lý Thực tập sinh: Dành cho MENTOR, HR, ADMIN */}
                    {canSee(['ADMIN', 'HR', 'MENTOR']) && (
                        <NavLink to="/dashboard/interns" className={navLinkClass}>
                            🎓 Thực Tập Sinh
                        </NavLink>
                    )}

                    {/* Xem ý kiến phản hồi của Intern: Dành cho MENTOR, ADMIN, HR */}
                    {canSee(['ADMIN', 'HR', 'MENTOR']) && (
                        <NavLink to="/dashboard/feedbacks" className={navLinkClass}>
                            💬 Nhận Xét Từ Intern
                        </NavLink>
                    )}

                    {/* Bảng Công Việc Kanban: INTERN, MENTOR, ADMIN đều phải xem được */}
                    {canSee(['ADMIN', 'MENTOR', 'INTERN']) && (
                        <NavLink to="/dashboard/tasks" className={navLinkClass}>
                            📌 Bảng Công Việc
                        </NavLink>
                    )}

                    {/* Phát triển kỹ năng: Chỉ Intern và Admin xem được */}
                    {canSee(['ADMIN', 'INTERN']) && (
                        <NavLink to="/dashboard/skills" className={navLinkClass}>
                            📈 Phát Triển Kỹ Năng
                        </NavLink>
                    )}

                    {/* Quản lý Đào tạo và Phỏng vấn: Dành cho COORDINATOR, ADMIN */}
                    {canSee(['ADMIN', 'COORDINATOR']) && (
                        <NavLink to="/dashboard/trainings" className={navLinkClass}>
                            🏫 Khóa Đào Tạo
                        </NavLink>
                    )}
                    
                    {canSee(['ADMIN', 'COORDINATOR', 'HR']) && (
                        <NavLink to="/dashboard/interviews" className={navLinkClass}>
                            🗓️ Lịch Phỏng Vấn
                        </NavLink>
                    )}

                    {/* Quản lý Hệ thống: Dành cho ADMIN */}
                    {canSee(['ADMIN']) && (
                        <div className="pt-4 mt-2 border-t border-zinc-800">
                            <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Quản Trị Tối Cao</p>
                            <NavLink to="/dashboard/users" className={adminNavLinkClass}>
                                🛡️ Quản Lý User
                            </NavLink>
                        </div>
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
