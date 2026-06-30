import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Star, Send, Award, MessageSquare, AlertCircle } from "lucide-react";
import { internApi } from "@/api/intern.api";
import { feedbackApi } from "@/api/feedback.api";
import { analyticsApi } from "@/api/analytics.api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface Profile {
    university: string;
    major: string;
    skills: string;
    emergency_contact: string;
}

interface Mentor {
    id: number;
    full_name: string;
    email: string;
}

interface InternKpi {
    total_tasks: number;
    completed_tasks: number;
    average_score: number;
    completion_rate_percent: number;
}

export default function SkillTracking() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [kpi, setKpi] = useState<InternKpi | null>(null);
    const [loadingKpi, setLoadingKpi] = useState(true);

    // AI suggestions states
    const [aiSuggestions, setAiSuggestions] = useState<string>("");
    const [loadingAI, setLoadingAI] = useState(false);

    // Feedback states
    const [selectedMentorId, setSelectedMentorId] = useState<number | "">("");
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user?.id) return;
            
            // Tải thông tin KPI thực tập sinh
            try {
                const kpiRes = await analyticsApi.getInternKPI(user.id);
                if (kpiRes.status === "success") {
                    setKpi(kpiRes.data);
                }
            } catch (error) {
                console.error("Lỗi tải KPI thực tập sinh");
            } finally {
                setLoadingKpi(false);
            }

            // Tải thông tin Profile
            try {
                const profileRes = await internApi.getProfile(user.id);
                if (profileRes.status === "success") {
                    setProfile(profileRes.data);
                }
            } catch (error) {
                console.error("Chưa tạo profile hoặc lỗi tải profile");
            } finally {
                setLoadingProfile(false);
            }

            try {
                // Tải danh sách Mentor để gửi Feedback
                const mentorsRes = await feedbackApi.getMentorsForFeedback();
                setMentors(mentorsRes);
            } catch (error) {
                toast.error("Không thể tải danh sách Mentor!");
            }
        };

        loadInitialData();
    }, [user]);

    const handleGetAISuggestions = async () => {
        setLoadingAI(true);
        try {
            const res = await internApi.getAISkillSuggestions();
            if (res.status === "success") {
                setAiSuggestions(res.data.suggestion);
                toast.success("AI đã phân tích và gợi ý lộ trình thành công!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gọi cố vấn AI!");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentorId) {
            return toast.error("Vui lòng chọn Mentor cần đánh giá!");
        }
        if (!comment.trim()) {
            return toast.error("Vui lòng nhập nội dung đánh giá!");
        }

        setSubmittingFeedback(true);
        try {
            await feedbackApi.submitFeedback({
                mentor_id: Number(selectedMentorId),
                rating,
                comment,
                is_anonymous: isAnonymous
            });
            toast.success("Gửi đánh giá thành công! Cảm ơn ý kiến của bạn.");
            setComment("");
            setSelectedMentorId("");
            setRating(5);
            setIsAnonymous(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-gray-500">Đang đồng bộ dữ liệu kỹ năng của bạn...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kỹ Năng & Phản Hồi</h1>
                <p className="text-gray-500 mt-1">Theo dõi tiến trình phát triển và gửi đánh giá đóng góp chương trình.</p>
            </div>

            {/* Thống kê KPI cá nhân */}
            {!loadingKpi && kpi && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top duration-500">
                    <Card className="shadow-sm border-l-4 border-l-teal-500">
                        <CardContent className="pt-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Công Việc Được Giao</p>
                            <p className="text-3xl font-black text-slate-800 mt-2">{kpi.total_tasks}</p>
                            <p className="text-xs text-slate-400 mt-1">Nhiệm vụ từ người hướng dẫn (Mentor)</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-indigo-500">
                        <CardContent className="pt-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến Độ Hoàn Thành</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-3xl font-black text-indigo-600">{kpi.completed_tasks}</p>
                                <p className="text-slate-400 font-semibold">/ {kpi.total_tasks} Tasks</p>
                                <span className="text-xs text-slate-500 font-bold ml-auto">{kpi.completion_rate_percent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${kpi.completion_rate_percent}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Đánh Giá Trung Bình</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-3xl font-black text-yellow-600">
                                    {kpi.average_score ? Number(kpi.average_score).toFixed(1) : "0.0"}
                                </p>
                                <p className="text-slate-400 font-semibold">/ 100</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Tính trên các Task đã được Mentor chấm điểm</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!profile ? (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6 flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-amber-800">Bạn chưa khởi tạo Hồ Sơ Cá Nhân!</h3>
                            <p className="text-amber-700 text-sm mt-1">
                                Vui lòng liên hệ HR hoặc Admin để thiết lập thông tin Hồ sơ thực tập sinh (Trường học, Chuyên ngành, Kỹ năng) trước khi nhận gợi ý định hướng lộ trình học tập từ Trí tuệ nhân tạo AI.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Kỹ năng & AI suggestions (Chiếm 2 phần) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-indigo-500" />
                                    Kỹ Năng Hiện Tại
                                </CardTitle>
                                <CardDescription>Các công nghệ bạn đã khai báo hoặc được Mentor chứng nhận</CardDescription>
                            </div>
                            {profile && (
                                <Button 
                                    onClick={handleGetAISuggestions} 
                                    disabled={loadingAI}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-md"
                                >
                                    {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                                    Nhận Lộ Trình AI
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2">
                                {profile?.skills ? (
                                    profile.skills.split(',').map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors">
                                            ⚡ {skill.trim()}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Chưa khai báo kỹ năng nào.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI suggestions output */}
                    {aiSuggestions && (
                        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white shadow-md animate-in slide-in-from-bottom duration-500">
                            <CardHeader className="border-b border-indigo-100/50">
                                <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-indigo-600" />
                                    Lộ Trình AI Khuyên Học
                                </CardTitle>
                                <CardDescription className="text-indigo-700/70">Phân tích tự động dựa trên chuyên ngành và kết quả các Task công việc</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 prose max-w-none text-gray-700 leading-relaxed font-normal">
                                <ReactMarkdown>{aiSuggestions}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Cột phải: Form gửi Feedback cho Mentor */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-teal-600" />
                                Đánh Giá Mentor
                            </CardTitle>
                            <CardDescription>Gửi phản hồi ẩn danh hoặc công khai để cải thiện hiệu suất hướng dẫn</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Chọn Người Hướng Dẫn (Mentor)</label>
                                    <select
                                        value={selectedMentorId}
                                        onChange={(e) => setSelectedMentorId(e.target.value ? Number(e.target.value) : "")}
                                        className="w-full border rounded-md p-2 bg-white text-sm"
                                        required
                                    >
                                        <option value="">-- Chọn Mentor --</option>
                                        {mentors.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.full_name} ({m.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Mức Độ Hài Lòng</label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`h-6 w-6 ${
                                                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="text-sm font-bold text-gray-600 ml-2">{rating}/5 sao</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Ý Kiến Phản Hồi / Nhận Xét</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e: any) => setComment(e.target.value)}
                                        placeholder="Hãy nhập ý kiến đóng góp của bạn về sự hỗ trợ của Mentor..."
                                        rows={4}
                                        className="text-sm w-full border rounded-md p-2 bg-white"
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded border-gray-300 h-4 w-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <label htmlFor="anonymous" className="text-sm text-gray-600 cursor-pointer font-medium">
                                        Đánh giá ẩn danh (Anonymous)
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submittingFeedback}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow"
                                >
                                    {submittingFeedback ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Gửi Đánh Giá
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
