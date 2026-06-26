import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CalendarClock, Briefcase, Video } from "lucide-react";
import { interviewApi } from "@/api/interview.api";
import { toast } from "sonner";

interface Interview {
    id: number;
    interview_time: string;
    meeting_link: string;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    created_at: string;
}

export default function InterviewManagement() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const payload = {
            application_id: Number(formData.get('application_id')),
            interview_time: String(formData.get('interview_time') || ''),
            meeting_link: String(formData.get('meeting_link') || ''),
            coordinator_id: Number(formData.get('coordinator_id'))
        };

        try {
            const res = await interviewApi.scheduleInterview(payload);
            if (res.status === 'success') {
                toast.success('Lên lịch phỏng vấn thành công!');
                setShowScheduleForm(false);
                // Fetch lại để cập nhật danh sách
                const refresh = await interviewApi.getAllInterviews();
                setInterviews(refresh.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await interviewApi.getAllInterviews();
                if (res.status === 'success') {
                    setInterviews(res.data);
                }
            } catch (error) {
                toast.error("Không thể tải danh sách Lịch phỏng vấn!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    if (isLoading) {
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
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Application ID (Mã đơn)</label>
                                    <input required name="application_id" type="number" className="mt-1 w-full border rounded-md p-2" placeholder="VD: 10" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Thời Gian Phỏng Vấn</label>
                                    <input required type="datetime-local" name="interview_time" className="mt-1 w-full border rounded-md p-2" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Link Google Meet / Zoom</label>
                                    <input required name="meeting_link" type="url" className="mt-1 w-full border rounded-md p-2" placeholder="https://meet.google.com/..." />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium">Coordinator ID (Người phỏng vấn)</label>
                                    <input required type="number" name="coordinator_id" className="mt-1 w-full border rounded-md p-2" placeholder="VD: 2" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="bg-teal-600 text-white px-6 py-2 rounded-md font-medium">
                                {isSubmitting ? 'Đang lên lịch...' : 'Lưu Lịch Phỏng Vấn'}
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
                                <TableHead className="text-right">Link Tham Gia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-gray-500 italic">
                                        Chưa có lịch phỏng vấn nào được lên.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interviews.map((iv) => (
                                    <TableRow key={iv.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="font-semibold text-gray-900">
                                                {new Date(iv.interview_time).toLocaleString('vi-VN')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-gray-900">{iv.candidate_name}</p>
                                            <p className="text-xs text-gray-500">{iv.candidate_email}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Briefcase className="h-4 w-4 text-gray-400" />
                                                {iv.job_title}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <a
                                                href={iv.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 font-medium text-sm hover:bg-teal-100 transition-colors"
                                            >
                                                <Video className="h-4 w-4" />
                                                Vào Phòng
                                            </a>
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
