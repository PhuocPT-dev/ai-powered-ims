import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardOverview() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Thống kê nhanh</h1>

            {/* Tạo 3 cái hộp vuông nhỏ hiển thị số liệu */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Tổng Thực Tập Sinh</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-blue-600">120</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Đang Phỏng Vấn</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-yellow-600">15</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Đã Hủy</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-red-500">3</p></CardContent>
                </Card>
            </div>
        </div>
    );
}
