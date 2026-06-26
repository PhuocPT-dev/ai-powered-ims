import React, { useEffect, useState } from "react";
import { internApi } from "@/api/intern.api";
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
    skills: string;
    emergency_contact: string;
}

export default function InternManagement() {
    const [interns, setInterns] = useState<Intern[]>([]);
    const [loading, setLoading] = useState(true);

    // Profile detail dialog states
    const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    
    // Skill Assessment edit states
    const [skillsInput, setSkillsInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchInterns = async () => {
        try {
            const res = await internApi.getAllInterns();
            if (res.status === "success") {
                setInterns(res.data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách Intern. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterns();
    }, []);

    const handleOpenProfile = async (intern: Intern) => {
        setSelectedIntern(intern);
        setIsProfileOpen(true);
        setLoadingProfile(true);
        setProfile(null);
        setSkillsInput("");
        
        try {
            const res = await internApi.getProfile(intern.id);
            if (res.status === "success" && res.data) {
                setProfile(res.data);
                setSkillsInput(res.data.skills || "");
            }
        } catch (error: any) {
            // Lỗi 404 có nghĩa là Intern chưa tự khai báo profile.
            // Ta tạo một profile mẫu trống để Mentor tự điền đánh giá.
            if (error.response?.status === 404) {
                setProfile({
                    user_id: intern.id,
                    university: "",
                    major: "",
                    skills: "",
                    emergency_contact: ""
                });
            } else {
                toast.error("Lỗi khi tải thông tin hồ sơ!");
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSaveAssessment = async () => {
        if (!selectedIntern || !profile) return;
        setIsSaving(true);
        try {
            // Cập nhật hoặc Khởi tạo Profile mới
            const payload = {
                university: profile.university,
                major: profile.major,
                skills: skillsInput,
                emergency_contact: profile.emergency_contact
            };
            
            let res;
            if (profile.id) {
                // Nếu đã có Profile, gọi cập nhật
                res = await internApi.updateProfile(selectedIntern.id, payload);
            } else {
                // Chưa có profile, thì tiến hành tạo mới
                res = await apiClient.post("/interns/profile", {
                    university: profile.university || "Chưa khai báo",
                    major: profile.major || "Chưa khai báo",
                    skills: skillsInput,
                    emergency_contact: profile.emergency_contact || "Chưa khai báo"
                });
            }

            toast.success("Đánh giá kỹ năng (Skill Assessment) thành công!");
            setIsProfileOpen(false);
            fetchInterns();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu đánh giá!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Thực Tập Sinh</h1>
                <p className="text-slate-500 mt-1">Xem chi tiết hồ sơ và đánh giá năng lực thực tập sinh định kỳ</p>
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
                            ) : interns.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có Thực tập sinh nào.</td></tr>
                            ) : (
                                interns.map(intern => (
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
                                disabled={isSaving}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Lưu Đánh Giá Kỹ Năng
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
