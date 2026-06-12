import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// [BƯỚC 1]: Tạo cái "Khuôn đúc" Zod để ép người dùng nhập đúng chuẩn
const loginSchema = z.object({
    email: z.string().email({ message: "Ê! Nhập sai định dạng Email rồi (phải có @)!" }),
    password: z.string().min(6, { message: "Mật khẩu bảo mật kém quá, phải dài ít nhất 6 ký tự!" }),
});

// Dịch cái khuôn đúc sang ngôn ngữ của TypeScript (Để chặn bug)
type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
    const navigate = useNavigate();

    // [BƯỚC 2]: Khởi động bộ máy React Hook Form và nhét cái Khuôn đúc Zod vào trong
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }, // Mới vào cho 2 ô trống rỗng
    });

    // [BƯỚC 3]: Hàm này CHỈ CHẠY khi dữ liệu đã lọt qua khuôn đúc (Không bị lỗi Zod)
    const onSubmitLogin = async (data: LoginFormValues) => {
        try {
            // Nhờ Axios mang Email và Pass chạy sang Backend
            const responseData = await authApi.login(data);

            if (responseData.status === "success") {
                toast.success("Đăng nhập thành công! Đang vào hệ thống...");

                // Nhận lấy chìa khóa (Token) từ Backend và cất giấu cẩn thận vào két sắt (LocalStorage) của trình duyệt
                localStorage.setItem("token", responseData.data.token);
                localStorage.setItem("userRole", responseData.data.user.role);

                const role = responseData.data.user.role;

                setTimeout(() => {
                    if (role === "CANDIDATE") {
                        navigate("/careers");
                    } else {
                        navigate("/dashboard");
                    }
                }, 1000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Lỗi kết nối đến Server!";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-100">
            <Card className="w-[400px] shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-blue-600">Đăng Nhập</CardTitle>
                    <CardDescription>Hệ thống Quản lý Thực tập sinh (IMS)</CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Báo cho React Hook Form biết là tao giao Form này cho mày xử lý */}
                    {/* handleSubmit sẽ tự gọi Zod ra kiểm tra, nếu OK thì mới kích nổ hàm onSubmitLogin */}
                    <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold text-zinc-700">Địa chỉ Email</Label>

                            {/* {...form.register("email")} : Móc cái ô này vào hệ thống theo dõi của Hook Form */}
                            <Input id="email" type="text" placeholder="Ví dụ: hr@congty.com" {...form.register("email")} />

                            {/* Chỗ để hiện thông báo chửi rủa màu đỏ nếu nhập sai */}
                            {form.formState.errors.email && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-semibold text-zinc-700">Mật khẩu</Label>
                            <Input id="password" type="password" placeholder="******" {...form.register("password")} />

                            {/* Chỗ để hiện thông báo màu đỏ cho mật khẩu */}
                            {form.formState.errors.password && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 mt-2">
                            Truy cập hệ thống
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
