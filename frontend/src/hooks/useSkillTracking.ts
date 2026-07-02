import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { internApi } from "@/api/intern.api";
import { feedbackApi } from "@/api/feedback.api";
import { analyticsApi } from "@/api/analytics.api";
import { toast } from "sonner";

interface Profile {
    university: string;
    major: string;
    skills: string | string[];
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

export function useSkillTracking() {
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

    return {
        profile,
        loadingProfile,
        mentors,
        kpi,
        loadingKpi,
        aiSuggestions,
        loadingAI,
        selectedMentorId,
        setSelectedMentorId,
        rating,
        setRating,
        comment,
        setComment,
        isAnonymous,
        setIsAnonymous,
        submittingFeedback,
        handleGetAISuggestions,
        handleSubmitFeedback
    };
}
