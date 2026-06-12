import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/api/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Khuôn đúc kiểm tra dữ liệu đầu vào bằng Zod
const registerSchema = z.object({
    full_name: z.string().min(2, { message: "Tên phải có ít nhất 2 kí tự" }),
    email: z.string().email({ message: "Vui lòng nhập đúng định dạng Email!" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 kí tự" }),
    phone: z.string().optional()
})

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { full_name: "", email: "", password: "", phone: "" },
    })

    const onSubmitRegister = async (data: RegisterFormValues) => {
        try {
            const responseData = await authApi.register(data);

            if (responseData.status === "success") {
                toast.success("Đăng ký thành công! Đang chuyển hướng đến đăng nhập...")
            }
            setTimeout(() => navigate("/login"), 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Lỗi kết nối đến Server!";
            toast.error(errorMessage);
        }
    };
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-100">
            <Card className="w-[450px] shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-blue-600">Đăng Ký Ứng Viên</CardTitle>
                    <CardDescription>Tham gia ứng tuyển tại hệ thống IMS ngay hôm nay</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmitRegister)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="font-semibold text-zinc-700">Họ và Tên (*)</Label>
                            <Input id="full_name" placeholder="Ví dụ: Nguyễn Văn A" {...form.register("full_name")} />
                            {form.formState.errors.full_name && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.full_name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold text-zinc-700">Địa chỉ Email (*)</Label>
                            <Input id="email" type="text" placeholder="Ví dụ: ungvien@gmail.com" {...form.register("email")} />
                            {form.formState.errors.email && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-semibold text-zinc-700">Mật khẩu (*)</Label>
                            <Input id="password" type="password" placeholder="******" {...form.register("password")} />
                            {form.formState.errors.password && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="font-semibold text-zinc-700">Số điện thoại</Label>
                            <Input id="phone" type="text" placeholder="0987654321" {...form.register("phone")} />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 mt-4">
                            Đăng Ký Tài Khoản
                        </Button>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập ngay</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
