import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

interface NotFoundProps {
    isInDashboard?: boolean;
}

export default function NotFound({ isInDashboard = false }: NotFoundProps) {
    const navigate = useNavigate();

    return (
        <div className={`flex flex-col items-center justify-center ${
            isInDashboard ? "h-[65vh] p-6 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200" : "min-h-screen bg-slate-50 p-4"
        } text-center animate-in fade-in duration-500`}>
            
            {/* Icon cảnh báo */}
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce">
                <AlertTriangle className="h-8 w-8" />
            </div>

            {/* Tiêu đề lỗi */}
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404 - Not Found</h1>
            <h2 className="text-lg font-bold text-slate-600 mt-2">Không Tìm Thấy Trang Yêu Cầu</h2>
            
            <p className="text-sm text-slate-400 mt-2 max-w-md">
                Đường dẫn URL bạn vừa truy cập không tồn tại hoặc bạn không có đủ quyền hạn để xem trang này. Vui lòng kiểm tra lại địa chỉ hoặc quay lại trang trước.
            </p>

            {/* Các nút hành động */}
            <div className="flex items-center gap-3 mt-6">
                <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="gap-1.5 font-semibold text-slate-600 border-slate-200"
                >
                    <ArrowLeft className="h-4 w-4" /> Quay Lại
                </Button>
                
                <Button 
                    onClick={() => navigate(isInDashboard ? "/dashboard" : "/")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 font-semibold shadow"
                >
                    <Home className="h-4 w-4" /> Quay Về Trang Chủ
                </Button>
            </div>
        </div>
    );
}
