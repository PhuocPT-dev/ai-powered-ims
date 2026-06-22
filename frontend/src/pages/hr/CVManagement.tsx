import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
}

export default function CVManagement() {
    // 💡 KIẾN THỨC MỚI: Dùng useParams để Lấy cái ID của Job từ trên thanh URL xuống (Vd: URL là /jobs/5 thì id = 5)
    const { id } = useParams();

    const [applications, setApplications] = useState<Application[]>([]);

    const fetchApplications = async () => {
        try {
            if (id) {
                const responseData = await applicationApi.getApplicationsByJob(id);
                setApplications(responseData.data)
            }
        } catch (error) {
            toast.error("Không thể tải danh sách hồ sơ")
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [id]);

    const handleUpdateStatus = async (appId: number, status: string) => {
        try {
            await applicationApi.updateStatus(appId, status);
            toast.success(`Đã đánh dấu đơn này là: ${status}`);
            // Gọi lại hàm fetch để tải lại dữ liệu mới
            fetchApplications();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
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
                            <TableHead className="w-[300px]">AI Nhận Xét</TableHead>
                            <TableHead>Trạng Thái</TableHead>
                            <TableHead className="text-right">Quyết Định</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium text-gray-600">#{app.id}</TableCell>
                                <TableCell>
                                    <a href={app.cv_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                        Xem CV
                                    </a>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 italic line-clamp-2" title={app.ai_summary}>
                                    {app.ai_summary}
                                </TableCell>
                                {/* Badge đổi màu tùy theo trạng thái */}
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
                                        disabled={app.status === 'ACCEPTED'} // Nếu đã Duyệt rồi thì làm mờ nút đi không cho bấm nữa
                                    >
                                        Duyệt
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                        disabled={app.status === 'REJECTED'}
                                    >
                                        Loại
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Nếu chưa có ai nộp đơn thì hiện dòng này cho đỡ trống */}
                        {applications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                                    Chưa có ứng viên nào nộp hồ sơ cho Job này.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

