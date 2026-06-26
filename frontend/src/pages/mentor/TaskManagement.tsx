import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ClipboardList, PlusCircle, Clock, CheckCircle, AlertCircle, PlayCircle } from "lucide-react";
import { taskApi, type Task } from "@/api/task.api";
import apiClient from "@/api/client";
import { toast } from "sonner";

export default function TaskManagement() {
    // State danh sách
    const [tasks, setTasks] = useState<(Task & { intern_name?: string })[]>([]);
    const [interns, setInterns] = useState<{ id: number; full_name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State Modal Chấm Điểm
    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [evaluatingTask, setEvaluatingTask] = useState<Task | null>(null);
    const [score, setScore] = useState<string>("");

    // State Modal Giao Việc
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        intern_id: "",
        deadline: ""
    });

    // Hàm gọi API lấy danh sách Task
    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await taskApi.getMentorTasks();
            setTasks(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách công việc!");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm gọi API lấy danh sách Intern để đổ vào thẻ Select
    const fetchInterns = async () => {
        try {
            const res = await apiClient.get("/interns");
            setInterns(res.data.data);
        } catch (error) {
            toast.error("Không thể tải danh sách Intern. Vui lòng thử lại!");
        }
    };

    // Chạy khi mở trang
    useEffect(() => {
        fetchTasks();
        fetchInterns();
    }, []);

    // Xử lý Giao việc
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await taskApi.createTask({
                title: newTask.title,
                description: newTask.description,
                intern_id: Number(newTask.intern_id),
                deadline: newTask.deadline
            });
            toast.success("Đã giao việc thành công!");
            setIsCreateModalOpen(false); // Đóng Modal
            setNewTask({ title: "", description: "", intern_id: "", deadline: "" }); // Xóa sạch form
            fetchTasks(); // Load lại bảng
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi giao việc!");
        }
    };

    // Xử lý Chấm điểm
    const handleEvaluateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!evaluatingTask) return;
        try {
            await taskApi.evaluateTask(evaluatingTask.id, Number(score));
            toast.success("Đã nghiệm thu và chấm điểm thành công!");
            setIsEvaluateModalOpen(false);
            setEvaluatingTask(null);
            setScore("");
            fetchTasks(); // Load lại bảng
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi chấm điểm!");
        }
    };

    const openEvaluateModal = (task: Task) => {
        setEvaluatingTask(task);
        setScore(task.score ? task.score.toString() : "");
        setIsEvaluateModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'TODO': return <Badge variant="secondary" className="bg-zinc-200 text-zinc-700"><AlertCircle className="w-3 h-3 mr-1" /> Cần làm</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-500 hover:bg-blue-600"><PlayCircle className="w-3 h-3 mr-1" /> Đang xử lý</Badge>;
            case 'DONE': return <Badge className="bg-yellow-500 hover:bg-yellow-600"><CheckCircle className="w-3 h-3 mr-1" /> Chờ chấm điểm</Badge>;
            case 'EVALUATED': return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Đã hoàn thành</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Thanh Tiêu đề và Nút Thêm mới */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Công việc</h1>
                    <p className="text-muted-foreground mt-1">Theo dõi tiến độ và giao việc cho Thực tập sinh</p>
                </div>

                {/* --- MODAL GIAO VIỆC NẰM Ở ĐÂY --- */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" /> Giao Task Mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-slate-800">🚀 Giao Công Việc Mới</DialogTitle>
                        </DialogHeader>

                        {/* Form nhập liệu */}
                        <form onSubmit={handleCreateTask} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Người nhận (Intern) <span className="text-red-500">*</span></Label>
                                {/* Dùng thẻ select mặc định nhưng phủ Class của Tailwind để đẹp như Shadcn */}
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newTask.intern_id}
                                    onChange={(e) => setNewTask({ ...newTask, intern_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>-- Chọn Thực tập sinh --</option>
                                    {interns.map(i => (
                                        <option key={i.id} value={i.id}>{i.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tiêu đề Công việc <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="VD: Cắt HTML/CSS trang Landing Page..."
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mô tả chi tiết <span className="text-red-500">*</span></Label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Yêu cầu cụ thể, tài liệu tham khảo..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hạn chót (Deadline) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    required
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Giao việc ngay
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* ------------------------------- */}

                {/* --- MODAL CHẤM ĐIỂM NẰM Ở ĐÂY --- */}
                <Dialog open={isEvaluateModalOpen} onOpenChange={setIsEvaluateModalOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-slate-800">📝 Chấm Điểm Nghiệm Thu</DialogTitle>
                        </DialogHeader>
                        
                        {evaluatingTask && (
                            <form onSubmit={handleEvaluateTask} className="space-y-4 py-2">
                                <div className="bg-slate-50 p-3 rounded-md text-sm mb-4">
                                    <p><span className="font-semibold text-slate-600">Công việc:</span> {evaluatingTask.title}</p>
                                    <p className="mt-1"><span className="font-semibold text-slate-600">Trạng thái:</span> Intern đã báo cáo hoàn thành.</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Điểm số (0 - 100) <span className="text-red-500">*</span></Label>
                                    <Input 
                                        type="number" 
                                        min="0" max="100"
                                        placeholder="VD: 85" 
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        required 
                                    />
                                </div>
                                
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEvaluateModalOpen(false)}>
                                        Hủy bỏ
                                    </Button>
                                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        Hoàn tất chấm điểm
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
                {/* ------------------------------- */}

            </div>

            {/* Bảng dữ liệu (Giữ nguyên như Cũ) */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg flex items-center text-slate-700">
                        <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />
                        Danh sách Đã giao
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Tên Công Việc</th>
                                    <th className="px-6 py-4 font-semibold">Người Nhận</th>
                                    <th className="px-6 py-4 font-semibold">Trạng Thái</th>
                                    <th className="px-6 py-4 font-semibold">Hạn Chót</th>
                                    <th className="px-6 py-4 font-semibold text-center">Điểm số</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-slate-500">Đang tải dữ liệu...</td></tr>
                                ) : tasks.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-slate-500">Bạn chưa giao công việc nào.</td></tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800">{task.title}</p>
                                                <p className="text-xs text-slate-400 font-normal mt-1 truncate max-w-xs" title={task.description}>
                                                    {task.description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-blue-600">
                                                {task.intern_name || `ID: ${task.intern_id}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(task.status)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                                    {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {task.status === 'EVALUATED' ? (
                                                    <span className="font-bold text-green-600 text-lg">{task.score}</span>
                                                ) : task.status === 'DONE' ? (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                                        onClick={() => openEvaluateModal(task)}
                                                    >
                                                        Chấm điểm
                                                    </Button>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
