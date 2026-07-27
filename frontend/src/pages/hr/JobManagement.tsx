import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateJobDialog } from "./CreateJobDialog";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jobApi } from "@/api/job.api";

interface Job {
    id: number;
    title: string;
    description: string;
    salary: number;
    location: string;
    department: string;
    status: 'OPEN' | 'CLOSED';
    created_at: string;
}

export default function JobManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: jobs = [], isLoading } = useQuery<Job[]>({
        queryKey: ['jobs'],
        queryFn: async () => {
            const responseData = await jobApi.getAllJobs();
            return responseData.data.jobs;
        }
    });

    const deleteJobMutation = useMutation({
        mutationFn: (jobId: number) => jobApi.deleteJob(jobId),
        onSuccess: () => {
            toast.success("Xóa tin tuyển dụng thành công!");

            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi xóa tin tuyển dụng!");
        }
    });

    const handleDeleteJob = (jobId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")) return;
        deleteJobMutation.mutate(jobId);
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
    };

    return (
        <div className="space-y-6">
            {/* Thanh tiêu đề của trang */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tin Tuyển Dụng</h1>
                <CreateJobDialog refreshJobs={handleRefresh} />
            </div>

            {/* Khung chứa Bảng */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableCaption>Danh sách các vị trí đang mở tuyển.</TableCaption>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Tên Công Việc</TableHead>
                            <TableHead>Phòng Ban</TableHead>
                            <TableHead>Mức Lương</TableHead>
                            <TableHead className="text-right">Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    Đang tải dữ liệu tin tuyển dụng...
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    Chưa có tin tuyển dụng nào...
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium text-gray-600">#{job.id}</TableCell>
                                    <TableCell className="font-semibold text-blue-700">{job.title}</TableCell>
                                    <TableCell>{job.department || "IT"}</TableCell>
                                    <TableCell>{job.salary ? Number(job.salary).toLocaleString('vi-VN') + 'VND' : 'Thỏa thuận'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={() => navigate("/dashboard/jobs/" + job.id)}>
                                            Xem CV
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deleteJobMutation.isPending}
                                            onClick={() => handleDeleteJob(job.id)}
                                        >
                                            {deleteJobMutation.isPending ? "Đang xóa..." : "Xóa"}
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
