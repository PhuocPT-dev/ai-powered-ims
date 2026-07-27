import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, GraduationCap, Calendar } from "lucide-react";
import { trainingApi } from "@/api/training.api";
import { toast } from "sonner";

interface TrainingProgram {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    coordinator_name: string;
}

export default function TrainingManagement() {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);

    // 1. useQuery lấy danh sách Khóa đào tạo
    const { data: programs = [], isLoading } = useQuery<TrainingProgram[]>({
        queryKey: ['training-programs'],
        queryFn: async () => {
            const res = await trainingApi.getAllPrograms();
            return res.status === 'success' ? res.data : [];
        }
    });

    // 2. Mutation tạo Khóa học mới
    const createProgramMutation = useMutation({
        mutationFn: (payload: { title: string; description: string; start_date: string; end_date: string }) =>
            trainingApi.createProgram(payload),
        onSuccess: () => {
            toast.success('Tạo khóa đào tạo thành công!');
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ['training-programs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    // 3. Mutation thêm Thực tập sinh vào Khóa học
    const enrollInternMutation = useMutation({
        mutationFn: ({ programId, internId }: { programId: number; internId: number }) =>
            trainingApi.enrollIntern(programId, internId),
        onSuccess: () => {
            toast.success('Đã thêm Intern vào khóa học!');
            queryClient.invalidateQueries({ queryKey: ['training-programs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Lỗi thêm học viên');
        }
    });

    const handleCreateProgram = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            title: String(formData.get('title') || ''),
            description: String(formData.get('description') || ''),
            start_date: String(formData.get('start_date') || ''),
            end_date: String(formData.get('end_date') || '')
        };
        createProgramMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-gray-500">Đang tải danh sách Khóa học...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                        Quản lý Khóa Đào Tạo
                    </h1>
                    <p className="text-gray-500 mt-1">Nơi theo dõi các chương trình đào tạo Thực tập sinh</p>
                </div>
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                    {showCreateForm ? 'Hủy Bỏ' : '+ Tạo Khóa Học Mới'}
                </button>
            </div>

            {showCreateForm && (
                <Card className="bg-indigo-50 border-indigo-100 shadow-inner">
                    <CardHeader>
                        <CardTitle className="text-indigo-800">Tạo Khóa Học Mới</CardTitle>
                        <CardDescription>Nhập thông tin để mở khóa đào tạo mới</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateProgram} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Tên Khóa Học</label>
                                    <input required name="title" className="mt-1 w-full border rounded-md p-2" placeholder="VD: Backend Nodejs 2026" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Mô Tả</label>
                                    <input required name="description" className="mt-1 w-full border rounded-md p-2" placeholder="Chi tiết..." />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Ngày Bắt Đầu</label>
                                    <input required type="date" name="start_date" className="mt-1 w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Ngày Kết Thúc</label>
                                    <input required type="date" name="end_date" className="mt-1 w-full border rounded-md p-2" />
                                </div>
                            </div>
                            <button type="submit" disabled={createProgramMutation.isPending} className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2">
                                {createProgramMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {createProgramMutation.isPending ? 'Đang tạo...' : 'Lưu Khóa Học'}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead className="w-[30%]">Tên Khóa Học</TableHead>
                                <TableHead>Thời Gian</TableHead>
                                <TableHead>Người Điều Phối</TableHead>
                                <TableHead className="text-right">Hành Động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-gray-500 italic">
                                        Chưa có khóa học nào trong hệ thống.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                programs.map((prog) => (
                                    <TableRow key={prog.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium text-gray-600">#{prog.id}</TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-gray-900">{prog.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{prog.description}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    {new Date(prog.start_date).toLocaleDateString('vi-VN')} - {new Date(prog.end_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {prog.coordinator_name ? prog.coordinator_name.charAt(0) : '?'}
                                                </div>
                                                <span className="text-sm font-medium">{prog.coordinator_name || 'Không xác định'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const form = e.currentTarget;
                                                    const internIdInput = form.elements.namedItem('intern_id') as HTMLInputElement;
                                                    const internId = Number(internIdInput.value);
                                                    enrollInternMutation.mutate({ programId: prog.id, internId }, {
                                                        onSuccess: () => form.reset()
                                                    });
                                                }}
                                                className="flex items-center justify-end gap-2"
                                            >
                                                <input required name="intern_id" type="number" placeholder="Intern ID" className="border rounded px-2 py-1 w-24 text-sm" />
                                                <button type="submit" disabled={enrollInternMutation.isPending} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded text-sm font-medium transition-colors">
                                                    + Thêm
                                                </button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
