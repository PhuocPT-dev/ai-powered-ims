import { z } from 'zod';

const strongPassword = z.string()
    .min(8, "Mật khẩu phải từ 8 ký tự trở lên!")
    .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa!")
    .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số!")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt!");

export const registerSchema = z.object({
    email: z.string().email(),
    password: strongPassword,
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

export const changePasswordSchema = z.object({
    old_password: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
    new_password: strongPassword,
    confirm_new_password: z.string().min(8, "Mật khẩu xác nhận phải từ 8 ký tự trở lên!")
}).refine((data) => data.new_password === data.confirm_new_password, {
    message: "Mật khẩu mới và mật khẩu xác nhận không khớp!",
    path: ["confirm_new_password"]
});
