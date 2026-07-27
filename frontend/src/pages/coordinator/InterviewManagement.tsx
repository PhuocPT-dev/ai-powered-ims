import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CalendarClock, Briefcase, Video, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { interviewApi } from "@/api/interview.api";
import { applicationApi } from "@/api/application.api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const scheduleSchema = z.object({
    application_id: z.string().min(1, "Vui lòng chọn đơn ứng tuyển"),
    interview_time: z.string().refine((val) => {
        const selectedDate = new Date(val);
        const now = new Date();
        return selectedDate > now;
    }, {
        message: "Thời gian phỏng vấn phải ở tương lai"
    }),
    meeting_link: z.string().url("Đường dẫn phòng họp không hợp lệ").min(1, "Vui lòng nhập link cuộc họp")
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface PendingApplication {
    id: number;
    candidate_name: string;
    job_title: string;
}

interface Interview {
    id: number;
    interview_time: string;
    meeting_link: string;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
    created_at: string;
}

export default function InterviewManagement() {
    const queryClient = useQueryClient();
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            application_id: "",
            interview_time: "",
            meeting_link: ""
        }
    });

    // 1. useQuery lấy danh sách lịch phỏng vấn
    const { data: interviews = [], isLoading: isInterviewsLoading } = useQuery<Interview[]>({
        queryKey: ['interviews'],
        queryFn: async () => {
            const res = await interviewApi.getAllInterviews();
            return res.status === 'success' ? res.data : [];
        }
    });

    // 2. useQuery lấy danh sách đơn ứng tuyển chờ lên lịch
    const { data: pendingApps = [] } = useQuery<PendingApplication[]>({
        queryKey: ['pending-applications'],
        queryFn: async () => {
            const res = await applicationApi.getPendingApplications();
            return res.status === 'success' ? res.data : [];
        }
    });

    // 3. Mutation lên lịch phỏng vấn mới
    const scheduleMutation = useMutation({
        mutationFn: (payload: { application_id: number; interview_time: string; meeting_link: string }) =>
            interviewApi.scheduleInterview(payload),
        onSuccess: () => {
            toast.success('Lên lịch phỏng vấn thành công!');
            reset();
            setShowScheduleForm(false);
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
            queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lên lịch');
        }
    });

    // 4. Mutation cập nhật trạng thái phỏng vấn
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' }) =>
            interviewApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái phỏng vấn thành công!');
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
        },
        onError: () => {
            toast.error('Lỗi khi cập nhật trạng thái phỏng vấn!');
        }
    });

    const onSubmit = (data: ScheduleFormValues) => {
        scheduleMutation.mutate({
            application_id: Number(data.application_id),
            interview_time: data.interview_time,
            meeting_link: data.meeting_link
        });
    };

    const handleUpdateStatus = (id: number, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED') => {
        updateStatusMutation.mutate({ id, status });
    };

    if (isInterviewsLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                <p className="text-gray-500">Đang tải lịch phỏng vấn...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarClock className="h-6 w-6 text-teal-600" />
                        Lịch Phỏng Vấn
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi danh sách Ứng viên chuẩn bị phỏng vấn</p>
                </div>
                <button
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
                >
                    {showScheduleForm ? 'Hủy Bỏ' : '+ Lên Lịch Phỏng Vấn'}
                </button>
            </div>

            {showScheduleForm && (
                <Card className="bg-teal-50 border-teal-100 shadow-inner">
                    <CardHeader>
                        <CardTitle className="text-teal-800">Lên Lịch Phỏng Vấn Mới</CardTitle>
                        <CardDescription>Nhập thông tin ứng viên và thời gian phỏng vấn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Chọn Đơn Ứng Tuyển</label>
                                    <select 
                                        {...register("application_id")} 
                                        className="mt-1 w-full border rounded-md p-2 bg-white"
                                    >
                                        <option value="">-- Chọn Ứng viên (Chưa phỏng vấn) --</option>
                                        {pendingApps.map(app => (
                                            <option key={app.id} value={app.id}>
                                                ID: {app.id} - {app.candidate_name} ({app.job_title})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.application_id && (
                                        <p className="text-xs text-red-500 mt-1 font-semibold">{errors.application_id.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Thời Gian Phỏng Vấn</label>
                                    <input 
                                        type="datetime-local" 
                                        {...register("interview_time")} 
                                        className="mt-1 w-full border rounded-md p-2" 
                                    />
                                    {errors.interview_time && (
                                        <p className="text-xs text-red-500 mt-1 font-semibold">{errors.interview_time.message}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Link Google Meet / Zoom</label>
                                    <input 
                                        {...register("meeting_link")} 
                                        type="text" 
                                        className="mt-1 w-full border rounded-md p-2" 
                                        placeholder="https://meet.google.com/..." 
                                    />
                                    {errors.meeting_link && (
                                        <p className="text-xs text-red-500 mt-1 font-semibold">{errors.meeting_link.message}</p>
                                    )}
                                </div>
                            </div>
                            <button type="submit" disabled={scheduleMutation.isPending} className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium hover:bg-teal-700 transition-colors shadow flex items-center gap-2">
                                {scheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {scheduleMutation.isPending ? 'Đang lên lịch...' : 'Lưu Lịch Phỏng Vấn'}
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
                                <TableHead>Thời Gian</TableHead>
                                <TableHead>Ứng Viên</TableHead>
                                <TableHead>Vị Trí Phỏng Vấn</TableHead>
                                <TableHead>Trạng Thái</TableHead>
                                <TableHead className="text-right">Hành Động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-gray-500 italic">
                                        Chưa có lịch phỏng vấn nào được lên.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interviews.map((iv) => (
                                    <TableRow key={iv.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="font-semibold text-gray-900 text-sm">
                                                {new Date(iv.interview_time).toLocaleString('vi-VN')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-gray-900 text-sm">{iv.candidate_name}</p>
                                            <p className="text-xs text-gray-500">{iv.candidate_email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Briefcase className="h-4 w-4 text-gray-400" />
                                                {iv.job_title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-semibold ${
                                                iv.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                iv.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                                {iv.status === 'SCHEDULED' ? 'Đã hẹn lịch' :
                                                 iv.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <a
                                                href={iv.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 font-medium text-sm hover:bg-teal-100 transition-colors mr-2 align-middle"
                                            >
                                                <Video className="h-4 w-4" />
                                                Vào Phòng
                                            </a>
                                            {iv.status === 'SCHEDULED' && (
                                                <span className="inline-flex gap-1.5 align-middle">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={updateStatusMutation.isPending}
                                                        onClick={() => handleUpdateStatus(iv.id, 'COMPLETED')}
                                                        className="text-green-600 border-green-200 hover:bg-green-50 px-2 h-8"
                                                        title="Đánh dấu Hoàn thành"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={updateStatusMutation.isPending}
                                                        onClick={() => handleUpdateStatus(iv.id, 'CANCELED')}
                                                        className="text-red-600 border-red-200 hover:bg-red-50 px-2 h-8"
                                                        title="Hủy phỏng vấn"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </span>
                                            )}
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
