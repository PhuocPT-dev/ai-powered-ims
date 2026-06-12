import { Outlet, Link } from "react-router-dom"; // Món đồ nghề tạo lỗ hổng

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-gray-50">

            {/* 1. Thanh Menu Bên Trái (Sidebar) */}
            <aside className="w-64 bg-zinc-900 text-white flex flex-col shadow-lg z-10">
                <div className="h-16 flex items-center px-6 text-xl font-bold border-b border-zinc-800 tracking-wider">
                    🤖 AI-IMS
                </div>

                {/* 👇 Code tạo các nút bấm Menu 👇 */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {/* Nút hiện tại đang chọn thì có màu xanh */}
                    <Link to="/dashboard" className="block px-4 py-3 rounded-md bg-blue-600 text-white font-medium shadow-sm">
                        📊 Tổng Quan
                    </Link>
                    {/* Các nút chưa chọn thì có màu xám, rê chuột (hover) vào sẽ sáng lên */}
                    <Link to="/dashboard/jobs" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                        💼 Quản Lý Việc Làm
                    </Link>
                    <Link to="/dashboard/cvs" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                        📄 Quản Lý CV
                    </Link>
                    <Link to="/dashboard/interns" className="block px-4 py-3 rounded-md text-zinc-400 font-medium hover:bg-zinc-800 hover:text-white transition-colors">
                        🎓 Thực Tập Sinh
                    </Link>
                </nav>

                {/* Thêm Nút Đăng xuất ở dưới cùng Sidebar cho xịn */}
                <div className="p-4 border-t border-zinc-800">
                    <Link to="/login" className="block text-center px-4 py-2 rounded-md text-red-400 font-medium hover:bg-zinc-800 transition-colors">
                        🚪 Đăng xuất
                    </Link>
                </div>
            </aside>

            {/* Phần cột to đùng bên phải */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* 2. Thanh Header Ở Trên Cùng */}
                <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm z-0">
                    <h2 className="text-lg font-semibold text-gray-700">Trang Tổng Quan</h2>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">Xin chào, HR!</span>
                        {/* Cục tròn Avatar */}
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
                            HR
                        </div>
                    </div>
                </header>

                {/* 3. Lỗ hổng ở giữa để nhét nội dung (Trái tim của React Router) */}
                <main className="flex-1 overflow-auto p-6">

                    {/* 👇 Thẻ <Outlet /> này giống như một cái cổng không gian. 
                        Người dùng bấm vào menu nào, ruột của menu đó sẽ tự động được Bơm ra từ cái lỗ này! */}
                    <Outlet />

                </main>

            </div>
        </div>
    );
}
