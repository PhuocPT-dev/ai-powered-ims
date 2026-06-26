import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApplyJobDialog } from "./ApplyJobDialog";
import { jobApi } from "@/api/job.api";
import { toast } from "sonner";


export interface Job {
    id: number;
    title: string;
    description: string;
    salary?: string;
    location?: string;
    department?: string;
    status: 'OPEN' | 'CLOSED';
}

export default function CareersPage() {
    const [jobs, setJobs] = useState<Job[]>([]);

    // 2. Dùng useEffect để ra lệnh: "Ngay khi trang web vừa tải xong, phải tự động chạy đi lấy việc làm!"
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const responseData = await jobApi.getAllJobs()
                if (responseData.status === "success") {
                    setJobs(responseData.data.jobs)
                }
            } catch (error) {
                toast.error("Lỗi khi lấy danh sách việc làm")
            }
        }
        fetchJobs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Header hoành tráng của trang Tuyển dụng */}
            <header className="bg-blue-700 text-white py-16 px-6 text-center shadow-md">
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Cổng Thông Tin Thực Tập Sinh</h1>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                    Bắt đầu hành trình sự nghiệp rực rỡ của bạn tại AI-IMS ngay hôm nay! Khám phá tiềm năng và làm việc cùng các chuyên gia hàng đầu.
                </p>
            </header>

            {/* Khung chứa danh sách các công việc đang tuyển */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🚀 Các Vị Trí Đang Mở</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Báo lỗi nếu Backend chưa có bài đăng nào */}
                    {jobs.length === 0 && <p className="text-gray-500 italic">Hiện tại chưa có công việc nào đang mở...</p>}
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-xl transition-shadow border-t-4 border-t-blue-500 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl text-blue-700">{job.title}</CardTitle>
                                <CardDescription className="font-medium text-gray-500 mt-1">
                                    📍 Hà Nội &nbsp;•&nbsp; 🎓 Phòng: {job.department} &nbsp;•&nbsp; ⏱️ Full-time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                                    {job.description}
                                </p>
                                <ApplyJobDialog job={job} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>

        </div>
    );
}
