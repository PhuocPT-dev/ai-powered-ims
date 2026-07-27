import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();

    // AI suggestions states
    const [aiSuggestions, setAiSuggestions] = useState<string>("");

    // Feedback states
    const [selectedMentorId, setSelectedMentorId] = useState<number | "">("");
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Edit Profile states
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editUniversity, setEditUniversity] = useState("");
    const [editMajor, setEditMajor] = useState("");
    const [editSkills, setEditSkills] = useState("");
    const [editEmergencyContact, setEditEmergencyContact] = useState("");

    // 1. useQuery lấy KPI cá nhân
    const { data: kpi = null, isLoading: loadingKpi } = useQuery<InternKpi | null>({
        queryKey: ['my-kpi', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await analyticsApi.getInternKPI(user.id);
            return res.status === "success" ? res.data : null;
        },
        enabled: !!user?.id
    });

    // 2. useQuery lấy Hồ sơ Profile cá nhân
    const { data: profile = null, isLoading: loadingProfile } = useQuery<Profile | null>({
        queryKey: ['my-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await internApi.getProfile(user.id);
            return res.status === "success" ? res.data : null;
        },
        enabled: !!user?.id
    });

    // 3. useQuery lấy danh sách Mentor để gửi Feedback
    const { data: mentors = [] } = useQuery<Mentor[]>({
        queryKey: ['mentors-for-feedback'],
        queryFn: async () => {
            return await feedbackApi.getMentorsForFeedback();
        }
    });

    // 4. Mutation gọi cố vấn AI
    const aiSuggestionsMutation = useMutation({
        mutationFn: () => internApi.getAISkillSuggestions(),
        onSuccess: (res) => {
            if (res.status === "success") {
                setAiSuggestions(res.data.suggestion);
                toast.success("AI đã phân tích và gợi ý lộ trình thành công!");
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi gọi cố vấn AI!");
        }
    });

    // 5. Mutation gửi đánh giá Mentor
    const submitFeedbackMutation = useMutation({
        mutationFn: (payload: { mentor_id: number; rating: number; comment: string; is_anonymous: boolean }) =>
            feedbackApi.submitFeedback(payload),
        onSuccess: () => {
            toast.success("Gửi đánh giá thành công! Cảm ơn ý kiến của bạn.");
            setComment("");
            setSelectedMentorId("");
            setRating(5);
            setIsAnonymous(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
        }
    });

    // 6. Mutation lưu/cập nhật Profile cá nhân
    const saveProfileMutation = useMutation({
        mutationFn: async (data: { university: string; major: string; skills: string; emergency_contact: string }) => {
            if (!user?.id) return;
            if (profile) {
                return await internApi.updateProfile(user.id, data);
            } else {
                return await internApi.createProfile(user.id, data);
            }
        },
        onSuccess: () => {
            toast.success("Cập nhật hồ sơ cá nhân thành công!");
            setIsEditProfileOpen(false);
            queryClient.invalidateQueries({ queryKey: ['my-profile', user?.id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi lưu thông tin hồ sơ!");
        }
    });

    const handleGetAISuggestions = () => {
        aiSuggestionsMutation.mutate();
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentorId) return toast.error("Vui lòng chọn Mentor cần đánh giá!");
        if (!comment.trim()) return toast.error("Vui lòng nhập nội dung đánh giá!");

        submitFeedbackMutation.mutate({
            mentor_id: Number(selectedMentorId),
            rating,
            comment,
            is_anonymous: isAnonymous
        });
    };

    const handleOpenEditProfile = () => {
        if (profile) {
            setEditUniversity(profile.university || "");
            setEditMajor(profile.major || "");
            setEditSkills(
                Array.isArray(profile.skills) 
                    ? profile.skills.join(', ') 
                    : (profile.skills || "")
            );
            setEditEmergencyContact(profile.emergency_contact || "");
        } else {
            setEditUniversity("");
            setEditMajor("");
            setEditSkills("");
            setEditEmergencyContact("");
        }
        setIsEditProfileOpen(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        saveProfileMutation.mutate({
            university: editUniversity,
            major: editMajor,
            skills: editSkills,
            emergency_contact: editEmergencyContact
        });
    };

    return {
        profile,
        loadingProfile,
        mentors,
        kpi,
        loadingKpi,
        aiSuggestions,
        loadingAI: aiSuggestionsMutation.isPending,
        selectedMentorId,
        setSelectedMentorId,
        rating,
        setRating,
        comment,
        setComment,
        isAnonymous,
        setIsAnonymous,
        submittingFeedback: submitFeedbackMutation.isPending,
        handleGetAISuggestions,
        handleSubmitFeedback,
        isEditProfileOpen,
        setIsEditProfileOpen,
        editUniversity,
        setEditUniversity,
        editMajor,
        setEditMajor,
        editSkills,
        setEditSkills,
        editEmergencyContact,
        setEditEmergencyContact,
        isSavingProfile: saveProfileMutation.isPending,
        handleOpenEditProfile,
        handleSaveProfile
    };
}
