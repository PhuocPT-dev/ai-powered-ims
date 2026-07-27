import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { feedbackApi } from "@/api/feedback.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Star, Users, TrendingUp } from "lucide-react";

interface Feedback {
    id: number;
    rating: number;
    comment: string;
    is_anonymous: boolean | number;
    created_at: string;
    intern_name: string;
}

interface Mentor {
    id: number;
    full_name: string;
    email: string;
}

export default function FeedbackOverview() {
    const { user } = useAuthStore();
    const [selectedMentorId, setSelectedMentorId] = useState<string>("");
    const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");

    const isManagement = user?.role === "ADMIN" || user?.role === "HR" || user?.role === "COORDINATOR";

    // 1. useQuery lấy danh sách Mentors (chỉ dành cho Quản trị viên/HR/Coordinator)
    const { data: mentors = [] } = useQuery<Mentor[]>({
        queryKey: ['mentors-list'],
        queryFn: async () => {
            return await feedbackApi.getMentorsForFeedback();
        },
        enabled: isManagement
    });

    // Tự động set mặc định mentor đầu tiên nếu là Management hoặc là chính mình nếu là Mentor
    useEffect(() => {
        if (!selectedMentorId) {
            if (isManagement && mentors.length > 0) {
                setSelectedMentorId(String(mentors[0].id));
            } else if (user?.role === "MENTOR" && user?.id) {
                setSelectedMentorId(String(user.id));
            }
        }
    }, [mentors, isManagement, user, selectedMentorId]);

    // 2. useQuery lấy danh sách Phản hồi của Mentor được chọn
    const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
        queryKey: ['mentor-feedbacks', selectedMentorId],
        queryFn: async () => {
            if (!selectedMentorId) return [];
            const res = await feedbackApi.getMentorFeedbacks(selectedMentorId);
            return res.status === "success" ? res.data : [];
        },
        enabled: !!selectedMentorId
    });

    const handleMentorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMentorId(e.target.value);
    };

    // Lọc theo rating
    const filteredFeedbacks = feedbacks.filter((fb) => {
        if (ratingFilter === "ALL") return true;
        return fb.rating === ratingFilter;
    });

    // Thống kê Metrics
    const totalCount = feedbacks.length;
    const averageRating = totalCount > 0 
        ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalCount 
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = feedbacks.filter((fb) => fb.rating === stars).length;
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return { stars, count, percentage };
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-teal-600" />
                        Ý Kiến & Nhận Xét Từ Intern
                    </h1>
                    <p className="text-slate-500 mt-1">Đánh giá mức độ hài lòng và đóng góp phát triển chương trình thực tập.</p>
                </div>

                {/* Dropdown chọn Mentor (chỉ hiển thị cho HR/Admin/Coordinator) */}
                {isManagement && (
                    <div className="w-full md:w-64 space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Người hướng dẫn (Mentor)</label>
                        <select
                            value={selectedMentorId}
                            onChange={handleMentorChange}
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">-- Chọn Mentor --</option>
                            {mentors.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.full_name} ({m.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
                    <p className="text-slate-500">Đang tải nhận xét thực tập sinh...</p>
                </div>
            ) : feedbacks.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="font-bold text-slate-700 text-lg">Chưa có lượt nhận xét nào</h3>
                        <p className="text-slate-500 text-sm max-w-sm mt-1">
                            Người hướng dẫn này chưa nhận được phản hồi đóng góp nào từ các thực tập sinh của mình.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái: Phân tích chỉ số (Rating Stats) */}
                    <div className="space-y-6">
                        {/* Hộp điểm trung bình */}
                        <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-teal-50/40 via-white to-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4 text-teal-500" />
                                    Điểm Đánh Giá Trung Bình
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-800">{averageRating.toFixed(1)}</span>
                                    <span className="text-slate-400 font-bold text-lg">/ 5</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= Math.round(averageRating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-slate-200"
                                            }`}
                                        />
                                    ))}
                                    <span className="text-xs text-slate-500 ml-2">({totalCount} đánh giá)</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hộp phân phối điểm số */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-slate-500" />
                                    Phân Phối Điểm Số
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {ratingDistribution.map((dist) => (
                                    <div key={dist.stars} className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 w-12 shrink-0">
                                            <span className="font-semibold text-slate-700">{dist.stars}</span>
                                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-yellow-400 h-2.5 rounded-full"
                                                style={{ width: `${dist.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="w-8 text-right font-medium text-slate-600">{dist.count}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cột phải: Danh sách Feedbacks */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thanh bộ lọc điểm số */}
                        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150">
                            <span className="text-xs font-bold text-slate-500 uppercase px-2">Lọc:</span>
                            <Badge
                                variant={ratingFilter === "ALL" ? "default" : "secondary"}
                                className={`cursor-pointer px-3 py-1 font-semibold ${
                                    ratingFilter === "ALL" ? "bg-teal-600 hover:bg-teal-700" : ""
                                }`}
                                onClick={() => setRatingFilter("ALL")}
                            >
                                Tất cả ({totalCount})
                            </Badge>
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = feedbacks.filter((fb) => fb.rating === stars).length;
                                return (
                                    <Badge
                                        key={stars}
                                        variant={ratingFilter === stars ? "default" : "secondary"}
                                        className={`cursor-pointer px-3 py-1 font-semibold flex items-center gap-1 ${
                                            ratingFilter === stars ? "bg-teal-600 hover:bg-teal-700" : ""
                                        }`}
                                        onClick={() => setRatingFilter(stars)}
                                    >
                                        {stars} ⭐ ({count})
                                    </Badge>
                                );
                            })}
                        </div>

                        {/* List Feedbacks */}
                        <div className="space-y-4">
                            {filteredFeedbacks.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed text-slate-400 italic">
                                    Không có nhận xét nào khớp với bộ lọc này.
                                </div>
                            ) : (
                                filteredFeedbacks.map((fb) => {
                                    const isAnon = Boolean(fb.is_anonymous);

                                    return (
                                        <Card key={fb.id} className="shadow-xs border-slate-200 hover:shadow-sm transition-shadow">
                                            <CardContent className="pt-5 space-y-3">
                                                {/* Header Feedback Card */}
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            isAnon 
                                                                ? "bg-slate-100 text-slate-600" 
                                                                : "bg-teal-50 text-teal-700"
                                                        }`}>
                                                            {isAnon ? "🕵️" : (fb.intern_name ? fb.intern_name.charAt(0).toUpperCase() : "?")}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                {isAnon ? "Thực tập sinh giấu tên Ẩn danh" : fb.intern_name}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {new Date(fb.created_at).toLocaleDateString("vi-VN", {
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Điểm sao */}
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-4 w-4 ${
                                                                    star <= fb.rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-slate-200"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Nhận xét chi tiết */}
                                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pl-10 border-l-2 border-slate-100 italic">
                                                    {`"${fb.comment}"`}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
