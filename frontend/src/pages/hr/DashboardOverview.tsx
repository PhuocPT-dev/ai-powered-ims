import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckCircle, Target, Trophy, Loader2, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { analyticsApi } from "@/api/analytics.api";
import { toast } from "sonner";

interface DashboardStats {
    total_interns: number;
    tasks: {
        total: number;
        completed: number;
        completion_rate_percent: number;
    };
    top_interns: {
        id: number;
        full_name: string;
        email: string;
        average_score: string;
    }[];
}

interface MonthlyStat {
    month: string;
    total_applications: number;
}

interface TrainingStat {
    title: string;
    total_interns: number;
    completed_interns: number;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
    const [trainingStats, setTrainingStats] = useState<TrainingStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [dashRes, monthRes, trainRes] = await Promise.all([
                    analyticsApi.getDashboardStats(),
                    analyticsApi.getMonthlyStats(),
                    analyticsApi.getTrainingStats()
                ]);
                
                if (dashRes.status === 'success') setStats(dashRes.data);
                if (monthRes.status === 'success') {
                    // API trả về giảm dần (DESC), ta cần đảo ngược lại để vẽ biểu đồ từ trái sang phải
                    setMonthlyStats(monthRes.data.reverse());
                }
                if (trainRes.status === 'success') setTrainingStats(trainRes.data);
                
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu thống kê từ máy chủ!");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Đang đồng bộ dữ liệu từ máy chủ...</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thống kê Tổng quan</h1>
                <p className="text-gray-500 mt-1">Cái nhìn toàn cảnh về hệ thống Thực tập sinh của bạn.</p>
            </div>

            {/* Tạo 3 cái hộp vuông nhỏ hiển thị số liệu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Tổng Thực Tập Sinh</CardTitle>
                        <Users className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-blue-700">{stats.total_interns}</p>
                        <p className="text-xs text-gray-500 mt-1">Đang hoạt động trong hệ thống</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Tiến Độ Công Việc</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-4xl font-black text-green-600">{stats.tasks.completed}</p>
                            <p className="text-lg font-semibold text-gray-400">/ {stats.tasks.total}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Tasks đã hoàn thành & nghiệm thu</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Tỷ Lệ Hoàn Thành</CardTitle>
                        <Target className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-purple-600">{stats.tasks.completion_rate_percent.toFixed(1)}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.tasks.completion_rate_percent}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bảng Top Interns */}
            <div className="pt-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500 h-6 w-6" /> 
                    Bảng Vàng Thực Tập Sinh
                </h2>
                {stats.top_interns.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-500 italic">Chưa có đủ dữ liệu đánh giá để xếp hạng.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.top_interns.map((intern, index) => (
                            <Card key={intern.id} className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-gray-200">
                                {index === 0 && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">TOP 1</div>}
                                {index === 1 && <div className="absolute top-0 right-0 bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">TOP 2</div>}
                                {index === 2 && <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">TOP 3</div>}
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                        <span className="text-2xl font-bold text-blue-700">{intern.full_name.charAt(0)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">{intern.full_name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{intern.email}</p>
                                    <div className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-inner">
                                        Điểm TB: {Number(intern.average_score).toFixed(1)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Khu vực Biểu đồ (Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Biểu đồ số lượng ứng tuyển theo tháng */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-indigo-500" />
                            Lượng Đơn Ứng Tuyển (6 Tháng Gần Nhất)
                        </CardTitle>
                        <CardDescription>Số lượng đơn nộp vào hệ thống theo từng tháng</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line type="monotone" dataKey="total_applications" name="Số đơn nộp" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Biểu đồ Khóa học & Thực tập sinh */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users className="h-5 w-5 text-teal-500" />
                            Hiệu Suất Khóa Đào Tạo
                        </CardTitle>
                        <CardDescription>Tỷ lệ thực tập sinh hoàn thành so với tổng số học viên</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trainingStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="title" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={{fill: '#F3F4F6'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Bar dataKey="total_interns" name="Tổng Học Viên" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completed_interns" name="Đã Tốt Nghiệp" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
