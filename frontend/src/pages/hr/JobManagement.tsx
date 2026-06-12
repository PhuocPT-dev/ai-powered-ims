import { useEffect, useState } from "react";
import { CreateJobDialog } from "./CreateJobDialog";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jobApi } from "@/api/job.api";

export default function JobManagement() {
    const [jobs, setJobs] = useState<any[]>([]);
    const navigate = useNavigate();

    // Tách hàm fetchJobs ra ngoài để tái sử dụng
    const fetchJobs = async () => {
        try {
            const responseData = await jobApi.getAllJobs();
            setJobs(responseData.data.jobs);
        } catch (error) {
            toast.error("Không thể tải danh sách việc làm!");
        }
    };

    // Vẫn gọi hàm fetchJobs 1 lần duy nhất khi mở trang
    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <div className="space-y-6">
            {/* Thanh tiêu đề của trang */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tin Tuyển Dụng</h1>
                <CreateJobDialog refreshJobs={fetchJobs} />
            </div>

            {/* Khung chứa Bảng (Có viền mỏng bo góc rất thanh lịch) */}
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
                        {jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    Chưa có tin tuyển dụng nào...
                                </TableCell>
                            </TableRow>
                        )}

                        {jobs.map((job) => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium text-gray-600">#{job.id}</TableCell>
                                <TableCell className="font-semibold text-blue-700">{job.title}</TableCell>
                                <TableCell>{job.department || "IT"}</TableCell>
                                {/*format tiền tệ*/}
                                <TableCell>{job.salary ? Number(job.salary).toLocaleString('vi-VN') + 'VND' : 'Thỏa thuận'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                        onClick={() => navigate("/dashboard/jobs/" + job.id)}>
                                        Xem CV
                                    </Button>
                                    <Button variant="destructive" size="sm">Xóa</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
