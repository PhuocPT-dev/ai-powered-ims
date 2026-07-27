import { useQuery } from "@tanstack/react-query";
import { trainingApi } from "@/api/training.api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Loader2, User, Mail, Clock } from "lucide-react";

interface MyTraining {
    intern_training_id: number;
    status: 'ENROLLED' | 'COMPLETED' | 'FAILED';
    enrolled_at: string;
    program_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    coordinator_name: string;
    coordinator_email: string;
}

export default function MyTrainings() {
    // 1. useQuery lấy danh sách khóa học của Intern hiện tại
    const { data: myTrainings = [], isLoading } = useQuery<MyTraining[]>({
        queryKey: ['my-trainings'],
        queryFn: async () => {
            const res = await trainingApi.getMyTrainings();
            return res.status === 'success' ? res.data : [];
        }
    });

    // Hàm tính toán phần trăm tiến độ thời gian thực của khóa học
    const calculateProgress = (startDateStr: string, endDateStr: string) => {
        const start = new Date(startDateStr).getTime();
        const end = new Date(endDateStr).getTime();
        const now = new Date().getTime();

        if (now < start) return { percent: 0, text: "Chưa bắt đầu ⏳" };
        if (now > end) return { percent: 100, text: "Đã hoàn thành khóa học 🎉" };

        const totalDuration = end - start;
        const elapsed = now - start;
        const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        return { 
            percent, 
            text: `Đang diễn ra (${Math.round(percent)}% thời gian đã qua)` 
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="border-b pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-indigo-600" />
                    Lộ Trình Đào Tạo Của Tôi
                </h1>
                <p className="text-slate-500 mt-1">
                    Xem danh sách các lớp học nghiệp vụ và khóa đào tạo chuyên môn bạn đang tham gia.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-slate-500">Đang tải lịch học của bạn...</p>
                </div>
            ) : myTrainings.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Calendar className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="font-bold text-slate-700 text-lg">Chưa đăng ký khóa học nào</h3>
                        <p className="text-slate-500 text-sm max-w-sm mt-1">
                            Bạn hiện chưa được chỉ định vào lớp học chuyên môn nào. Vui lòng liên hệ Điều phối viên (Coordinator) để được bổ sung.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myTrainings.map((program) => {
                        const progress = calculateProgress(program.start_date, program.end_date);
                        
                        return (
                            <Card key={program.program_id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow bg-white flex flex-col justify-between overflow-hidden">
                                <div>
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className={`font-semibold ${
                                                program.status === 'ENROLLED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                program.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {program.status === 'ENROLLED' ? 'Đang tham gia' :
                                                 program.status === 'COMPLETED' ? 'Đã tốt nghiệp' : 'Chưa đạt'}
                                            </Badge>
                                            <h3 className="font-bold text-slate-800 text-lg leading-snug mt-2">
                                                {program.title}
                                            </h3>
                                        </div>
                                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 space-y-4">
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {program.description || "Chưa có mô tả chi tiết cho khóa học này."}
                                        </p>

                                        {/* Tiến độ thời gian */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Thời gian khóa học
                                                </span>
                                                <span>{progress.text}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${progress.percent}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Chi tiết lịch & Coordinator */}
                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs">
                                            <div>
                                                <span className="text-slate-400 font-medium block">Ngày bắt đầu</span>
                                                <span className="font-bold text-slate-700 mt-1 block">
                                                    {new Date(program.start_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-medium block">Ngày kết thúc</span>
                                                <span className="font-bold text-slate-700 mt-1 block">
                                                    {new Date(program.end_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer: Coordinator Info */}
                                <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                        <span>GV: <strong className="text-slate-700">{program.coordinator_name}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                        <a href={`mailto:${program.coordinator_email}`} className="text-indigo-600 hover:underline">
                                            {program.coordinator_email}
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
