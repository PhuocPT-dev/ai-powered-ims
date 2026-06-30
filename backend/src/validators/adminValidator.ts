import { z } from 'zod';

export const createUserSchema = z.object({
    full_name: z.string({ message: "Họ và tên là bắt buộc" })
        .min(2, "Họ và tên quá ngắn, ít nhất 2 ký tự")
        .max(100, "Họ và tên quá dài"),
    email: z.string({ message: "Email là bắt buộc" })
        .email("Email không hợp lệ"),
    role: z.enum(['ADMIN', 'HR', 'COORDINATOR', 'MENTOR', 'CANDIDATE', 'INTERN'], { error: "Vai trò không hợp lệ" })
});

export const updateRoleSchema = z.object({
    role: z.enum(['ADMIN', 'HR', 'COORDINATOR', 'MENTOR', 'CANDIDATE', 'INTERN'], { error: "Vai trò không hợp lệ" })
});

export const toggleStatusSchema = z.object({
    is_active: z.union([z.boolean(), z.number()]).transform((val) => {
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val === 1 ? 1 : 0;
    })
});
