import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Mật khẩu phải từ 8 ký tự trở lên!"),
    full_name: z.string().min(2, "Họ tên quá ngắn!"),
    password_confirm: z.string().min(8, "Mật khẩu phải từ 8 ký tự trở lên!"),
    phone: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
    message: "Mật khẩu xác nhận không khớp!",
    path: ["password_confirm"]
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Vui lòng nhập mật khẩu")
});
