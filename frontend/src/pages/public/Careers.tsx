import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ApplyJobDialog } from "./ApplyJobDialog";
import { jobApi } from "@/api/job.api";
import { interviewApi } from "@/api/interview.api";
import { useAuthStore } from "@/store/authStore";
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

interface CandidateInterview {
    id: number;
    job_title: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
    interview_time: string;
    coordinator_name?: string;
    meeting_link?: string;
}

export default function CareersPage() {
    const { user, logout } = useAuthStore();
    const [isInterviewOpen, setIsInterviewOpen] = useState(false);

    // 1. useQuery lấy danh sách việc làm đang tuyển
    const { data: jobs = [], isLoading: isLoadingJobs } = useQuery<Job[]>({
        queryKey: ['public-jobs'],
        queryFn: async () => {
            const responseData = await jobApi.getAllJobs();
            return responseData.status === "success" ? responseData.data.jobs : [];
        }
    });

    // 2. useQuery lấy danh sách lịch phỏng vấn của Ứng viên (khi mở Dialog)
    const { data: myInterviews = [], isLoading: isLoadingInterviews } = useQuery<CandidateInterview[]>({
        queryKey: ['candidate-interviews', user?.id],
        queryFn: async () => {
            const res = await interviewApi.getMyInterviews();
            return res.status === 'success' ? res.data : [];
        },
        enabled: isInterviewOpen && !!user && user.role === 'CANDIDATE'
    });

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            
            {/* Thanh điều hướng Navbar */}
            <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <div className="font-extrabold text-blue-700 text-xl tracking-wider">
                    🤖 AI-IMS Careers
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm font-semibold text-gray-700">Xin chào, {user.full_name}!</span>
                            {user.role === 'CANDIDATE' && (
                                <Button 
                                    onClick={() => setIsInterviewOpen(true)}
                                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold"
                                    size="sm"
                                >
                                    🗓️ Lịch Phỏng Vấn Của Tôi
                                </Button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors text-sm">
                            Đăng Nhập
                        </a>
                    )}
                </div>
            </nav>

            {/* Header của trang Tuyển dụng */}
            <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-6 text-center shadow-md">
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Cổng Thông Tin Thực Tập Sinh</h1>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                    Bắt đầu hành trình sự nghiệp rực rỡ của bạn tại AI-IMS ngay hôm nay! Khám phá tiềm năng và làm việc cùng các chuyên gia hàng đầu.
                </p>
            </header>

            {/* Khung chứa danh sách các công việc đang tuyển */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">🚀 Các Vị Trí Đang Mở</h2>

                {isLoadingJobs ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="text-sm text-gray-500">Đang tải danh sách việc làm...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.length === 0 && <p className="text-gray-500 italic">Hiện tại chưa có công việc nào đang mở...</p>}
                        {jobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-xl transition-shadow border-t-4 border-t-blue-500 flex flex-col bg-white">
                                <CardHeader>
                                    <CardTitle className="text-xl text-blue-700 font-bold">{job.title}</CardTitle>
                                    <CardDescription className="font-semibold text-gray-500 mt-1">
                                        📍 Hà Nội &nbsp;•&nbsp; 🎓 Phòng: {job.department || "IT"} &nbsp;•&nbsp; ⏱️ Full-time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-gray-600 mb-6 line-clamp-3 flex-1 text-sm leading-relaxed">
                                        {job.description}
                                    </p>
                                    <ApplyJobDialog job={job} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Dialog xem lịch phỏng vấn của ứng viên */}
            <Dialog open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800">🗓️ Lịch Phỏng Vấn Của Bạn</DialogTitle>
                        <DialogDescription className="text-xs">
                            Dưới đây là các cuộc hẹn phỏng vấn đã được lên lịch bởi điều phối viên.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingInterviews ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            <p className="text-xs text-slate-500">Đang tải lịch hẹn...</p>
                        </div>
                    ) : myInterviews.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic text-sm">
                            Bạn chưa có lịch hẹn phỏng vấn nào được lên lịch.
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {myInterviews.map((iv) => (
                                <div key={iv.id} className="p-4 bg-slate-50 border border-slate-150 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{iv.job_title}</h4>
                                        <Badge variant="outline" className={`font-semibold shrink-0 ${
                                            iv.status === 'SCHEDULED' ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" :
                                            iv.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" :
                                            "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                                        }`}>
                                            {iv.status === 'SCHEDULED' ? 'Sắp diễn ra' :
                                             iv.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                                        <p>
                                            <span className="font-semibold text-slate-700">⏱️ Thời gian:</span>{" "}
                                            {new Date(iv.interview_time).toLocaleString('vi-VN')}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-700">👤 Điều phối viên:</span>{" "}
                                            {iv.coordinator_name || "IMS Coordinator"}
                                        </p>
                                    </div>
                                    {iv.status === 'SCHEDULED' && iv.meeting_link && (
                                        <a 
                                            href={iv.meeting_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="w-full text-center block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md text-xs transition-colors"
                                        >
                                            Tham Gia Phỏng Vấn (Google Meet/Zoom)
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
