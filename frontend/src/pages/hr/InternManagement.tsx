import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { internApi } from "@/api/intern.api";
import { analyticsApi } from "@/api/analytics.api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Loader2, Eye, Award, Phone, GraduationCap, BookOpen, Save } from "lucide-react";

interface Intern {
    id: number;
    full_name: string;
    email: string;
}

interface Profile {
    id?: number;
    user_id: number;
    university: string;
    major: string;
    skills: string | string[];
    emergency_contact: string;
}

interface InternKpi {
    total_tasks: number;
    completed_tasks: number;
    average_score: number;
    completion_rate_percent: number;
}

export default function InternManagement() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");

    // Profile detail dialog states
    const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [skillsInput, setSkillsInput] = useState("");

    // 1. useQuery lấy danh sách toàn bộ Intern
    const { data: interns = [], isLoading: loading } = useQuery<Intern[]>({
        queryKey: ['all-interns'],
        queryFn: async () => {
            const res = await internApi.getAllInterns();
            return res.status === 'success' ? res.data : [];
        }
    });

    // 2. useQuery lấy Chi tiết Profile & KPI của Intern đang chọn
    const { data: internDetail, isLoading: loadingProfile } = useQuery<{ profile: Profile | null; kpi: InternKpi | null }>({
        queryKey: ['intern-detail', selectedIntern?.id],
        queryFn: async () => {
            if (!selectedIntern) return { profile: null, kpi: null };
            const [profileRes, kpiRes] = await Promise.all([
                internApi.getProfile(selectedIntern.id).catch(() => null),
                analyticsApi.getInternKPI(selectedIntern.id).catch(() => null)
            ]);

            let profileData: Profile | null = null;
            if (profileRes && profileRes.status === "success" && profileRes.data) {
                profileData = profileRes.data;
                const skillsData = profileRes.data.skills;
                setSkillsInput(
                    Array.isArray(skillsData) 
                        ? skillsData.join(', ') 
                        : (typeof skillsData === 'string' ? skillsData : "")
                );
            } else {
                profileData = {
                    user_id: selectedIntern.id,
                    university: "",
                    major: "",
                    skills: "",
                    emergency_contact: ""
                };
                setSkillsInput("");
            }

            const kpiData = (kpiRes && kpiRes.status === "success") ? kpiRes.data : null;
            return { profile: profileData, kpi: kpiData };
        },
        enabled: !!selectedIntern && isProfileOpen
    });

    // 3. Mutation lưu / cập nhật Đánh giá kỹ năng (Skill Assessment)
    const saveAssessmentMutation = useMutation({
        mutationFn: async ({ internId, profile, skills }: { internId: number; profile: Profile | null; skills: string }) => {
            const payload = {
                university: profile?.university || "Chưa khai báo",
                major: profile?.major || "Chưa khai báo",
                skills: skills,
                emergency_contact: profile?.emergency_contact || "Chưa khai báo"
            };

            if (profile?.id) {
                return await internApi.updateProfile(internId, payload);
            } else {
                return await internApi.createProfile(internId, payload);
            }
        },
        onSuccess: () => {
            toast.success("Đánh giá kỹ năng (Skill Assessment) thành công!");
            setIsProfileOpen(false);
            queryClient.invalidateQueries({ queryKey: ['all-interns'] });
            queryClient.invalidateQueries({ queryKey: ['intern-detail', selectedIntern?.id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu đánh giá!");
        }
    });

    const filteredInterns = interns.filter((i) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            i.full_name.toLowerCase().includes(query) ||
            i.email.toLowerCase().includes(query)
        );
    });

    const handleOpenProfile = (intern: Intern) => {
        setSelectedIntern(intern);
        setIsProfileOpen(true);
    };

    const handleSaveAssessment = () => {
        if (!selectedIntern) return;
        saveAssessmentMutation.mutate({
            internId: selectedIntern.id,
            profile: internDetail?.profile || null,
            skills: skillsInput
        });
    };

    const profile = internDetail?.profile;
    const kpi = internDetail?.kpi;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Thực Tập Sinh</h1>
                <p className="text-slate-500 mt-1">Xem chi tiết hồ sơ và đánh giá năng lực thực tập sinh định kỳ</p>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="flex items-center gap-4">
                <Input
                    type="text"
                    placeholder="🔍 Tìm kiếm thực tập sinh theo tên hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md bg-white shadow-sm"
                />
                {searchQuery && (
                    <span className="text-xs text-slate-500 font-medium">
                        Tìm thấy {filteredInterns.length} thực tập sinh
                    </span>
                )}
            </div>

            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg flex items-center text-slate-700">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Danh sách Thực tập sinh
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Họ và Tên</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
                            ) : filteredInterns.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-400 italic">Không tìm thấy thực tập sinh nào khớp với từ khóa tìm kiếm.</td></tr>
                            ) : (
                                filteredInterns.map(intern => (
                                    <tr key={intern.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-medium">#{intern.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{intern.full_name}</td>
                                        <td className="px-6 py-4 text-blue-600 font-medium">{intern.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shadow-inner">Đang thực tập</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleOpenProfile(intern)}
                                                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold gap-1.5 shadow-sm"
                                            >
                                                <Eye className="h-4 w-4" /> Đánh Giá & Profile
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Dialog Profile & Skill Assessment */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-800">Hồ Sơ & Đánh Giá Năng Lực</DialogTitle>
                    </DialogHeader>

                    {loadingProfile ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                            <p className="text-sm text-slate-500">Đang đồng bộ hồ sơ...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-4">
                            {/* Intern summary info */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                                <h3 className="font-bold text-slate-900 text-base border-b pb-1.5">{selectedIntern?.full_name}</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-800">Trường ĐH:</span> {profile?.university || <span className="text-slate-400 italic">Chưa khai báo</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-800">Chuyên ngành:</span> {profile?.major || <span className="text-slate-400 italic">Chưa khai báo</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="font-medium text-slate-800">Khẩn cấp:</span> {profile?.emergency_contact || <span className="text-slate-400 italic">Chưa khai báo</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Chỉ số KPI thực tập sinh */}
                            {kpi && (
                                <div className="grid grid-cols-3 gap-2 bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/50 text-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng Task</p>
                                        <p className="text-base font-extrabold text-slate-800 mt-0.5">{kpi.total_tasks}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hoàn Thành</p>
                                        <p className="text-base font-extrabold text-indigo-600 mt-0.5">
                                            {kpi.completed_tasks}/{kpi.total_tasks}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điểm TB</p>
                                        <p className="text-base font-extrabold text-yellow-600 mt-0.5">
                                            {kpi.average_score ? Number(kpi.average_score).toFixed(1) : "0.0"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Skill Assessment field */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Award className="h-4 w-4 text-indigo-500" />
                                    Đánh giá kỹ năng định kỳ (Skill Assessment)
                                </label>
                                <p className="text-xs text-slate-500">Nhập danh sách kỹ năng, phân tách bằng dấu phẩy (VD: React, Node.js, Git,...)</p>
                                <Input 
                                    value={skillsInput} 
                                    onChange={(e) => setSkillsInput(e.target.value)} 
                                    placeholder="VD: HTML5, CSS3, Javascript, Python" 
                                    className="font-medium"
                                />
                            </div>

                            <Button 
                                onClick={handleSaveAssessment} 
                                disabled={saveAssessmentMutation.isPending}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow"
                            >
                                {saveAssessmentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Lưu Đánh Giá Kỹ Năng
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
