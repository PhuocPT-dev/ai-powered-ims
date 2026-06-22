import { useEffect, useState } from 'react';
import { taskApi, type Task } from '../../api/task.api';
import { toast } from 'sonner';

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    // Đi lấy dữ liệu từ Backend
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await taskApi.getMyTasks();
            setTasks(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi tải công việc");
        } finally {
            setLoading(false);
        }
    };

    // Gọi hàm fetchTasks ngay khi vừa mở trang
    useEffect(() => {
        fetchTasks();
    }, []);

    // Hàm xử lý khi Intern bấm nút chuyển cột
    const handleMoveTask = async (taskId: number, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        try {
            await taskApi.updateStatus(taskId, newStatus);
            toast.success("Đã báo cáo tiến độ thành công!");
            fetchTasks(); // Tải lại bảng để thấy Task bay sang cột mới
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật");
        }
    };

    // Hàm tiện ích: Lọc ra các Task theo trạng thái để nhét vào 4 cột tương ứng
    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">📌 Bảng Công Việc (Kanban Board)</h1>

            {/* Khung Grid chia làm 4 cột bằng nhau trên màn hình lớn */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* ---------------- CỘT 1: TODO (CẦN LÀM) ---------------- */}
                <div className="bg-gray-200 rounded-xl p-4 min-h-[500px] border border-gray-300">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span> CẦN LÀM ({getTasksByStatus('TODO').length})
                    </h2>
                    <div className="space-y-4">
                        {getTasksByStatus('TODO').map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                <p className="text-xs text-red-500 mt-3 font-medium">Hạn: {new Date(task.deadline).toLocaleDateString('vi-VN')}</p>
                                {/* Nút bấm đẩy Task sang ĐANG LÀM */}
                                <button
                                    onClick={() => handleMoveTask(task.id, 'IN_PROGRESS')}
                                    className="w-full mt-4 bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-100 transition"
                                >
                                    Bắt đầu làm ➡️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------------- CỘT 2: IN_PROGRESS (ĐANG LÀM) ---------------- */}
                <div className="bg-blue-50 rounded-xl p-4 min-h-[500px] border border-blue-200">
                    <h2 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span> ĐANG LÀM ({getTasksByStatus('IN_PROGRESS').length})
                    </h2>
                    <div className="space-y-4">
                        {getTasksByStatus('IN_PROGRESS').map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition">
                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                {/* Nút bấm đẩy Task sang NỘP BÀI */}
                                <button
                                    onClick={() => handleMoveTask(task.id, 'DONE')}
                                    className="w-full mt-4 bg-green-50 text-green-600 font-bold py-2 rounded-lg text-sm hover:bg-green-100 transition"
                                >
                                    Nộp bài (Hoàn thành) ✅
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------------- CỘT 3: DONE (CHỜ CHẤM ĐIỂM) ---------------- */}
                <div className="bg-green-50 rounded-xl p-4 min-h-[500px] border border-green-200">
                    <h2 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span> CHỜ CHẤM ĐIỂM ({getTasksByStatus('DONE').length})
                    </h2>
                    <div className="space-y-4">
                        {getTasksByStatus('DONE').map(task => (
                            // Thêm opacity-80 để làm mờ nhẹ, biểu thị là không sửa được nữa
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 opacity-80">
                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                {/* Không có nút bấm nào ở đây cả, chỉ có nhãn dán */}
                                <span className="inline-block mt-3 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                    Đang chờ Mentor chấm ⏳
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------------- CỘT 4: EVALUATED (ĐÃ CÓ ĐIỂM) ---------------- */}
                <div className="bg-purple-50 rounded-xl p-4 min-h-[500px] border border-purple-200">
                    <h2 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span> ĐÃ CHẤM ĐIỂM ({getTasksByStatus('EVALUATED').length})
                    </h2>
                    <div className="space-y-4">
                        {getTasksByStatus('EVALUATED').map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                <div className="mt-3 p-2 bg-gray-50 rounded border flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Điểm số:</span>
                                    {/* Điểm trên 80 thì hiện màu xanh, dưới thì màu đỏ */}
                                    <span className={`text-xl font-bold ${task.score && task.score >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                                        {task.score}/100
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
