import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applicationApi } from "@/api/application.api";
import { toast } from "sonner";

interface Application {
    id: number;
    job_id: number;
    candidate_id: number;
    cv_url: string;
    ai_summary: string;
    ai_score?: number | null;
    status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
}

export default function CVManagement() {
    const { id } = useParams();
    const queryClient = useQueryClient();

    // 1. Dùng useQuery lấy danh sách đơn xin việc theo Job ID
    const { data: applications = [], isLoading } = useQuery<Application[]>({
        queryKey: ['applications', id],
        queryFn: async () => {
            if (!id) return [];
            const responseData = await applicationApi.getApplicationsByJob(id);
            return responseData.data;
        },
        enabled: !!id // Chỉ tự động gọi API khi id tồn tại
    });

    // 2. Dùng useMutation cập nhật trạng thái đơn (Duyệt / Loại)
    const updateStatusMutation = useMutation({
        mutationFn: ({ appId, status }: { appId: number; status: string }) =>
            applicationApi.updateStatus(appId, status),
        onSuccess: (_, variables) => {
            toast.success(`Đã đánh dấu đơn này là: ${variables.status}`);
            // Làm mới dữ liệu cache 'applications' thuộc Job id hiện tại
            queryClient.invalidateQueries({ queryKey: ['applications', id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    });

    const handleUpdateStatus = (appId: number, status: string) => {
        updateStatusMutation.mutate({ appId, status });
    };

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Hồ Sơ Ứng Viên</h1>
                <p className="text-gray-500">Đang xem danh sách nộp vào Job #{id}</p>
            </div>
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[80px]">Mã Đơn</TableHead>
                            <TableHead>Link CV</TableHead>
                            <TableHead className="w-[120px] text-center">Điểm AI Chấm</TableHead>
                            <TableHead className="w-[300px]">AI Nhận Xét</TableHead>
                            <TableHead>Trạng Thái</TableHead>
                            <TableHead className="text-right">Quyết Định</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                                    Đang tải hồ sơ ứng viên...
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                                    Chưa có ứng viên nào nộp hồ sơ cho Job này.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium text-gray-600">#{app.id}</TableCell>
                                    <TableCell>
                                        <a href={app.cv_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                            Xem CV
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {app.ai_score !== null && app.ai_score !== undefined ? (
                                            <Badge className={`font-bold text-xs px-2.5 py-1 ${
                                                app.ai_score >= 8 ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' :
                                                app.ai_score >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50' :
                                                'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
                                            }`} variant="outline">
                                                ⭐ {app.ai_score}/10
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Chưa chấm</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 italic line-clamp-2" title={app.ai_summary}>
                                        {app.ai_summary}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                app.status === 'ACCEPTED' ? "text-green-700 border-green-300 bg-green-50" :
                                                    app.status === 'REJECTED' ? "text-red-700 border-red-300 bg-red-50" :
                                                        "text-yellow-700 border-yellow-300 bg-yellow-50"
                                            }
                                        >
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                                            disabled={app.status === 'ACCEPTED' || updateStatusMutation.isPending}
                                        >
                                            Duyệt
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                            disabled={app.status === 'REJECTED' || updateStatusMutation.isPending}
                                        >
                                            Loại
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
