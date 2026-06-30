import { z } from 'zod';

export const internProfileSchema = z.object({
    university: z.string({ message: "Trường đại học là bắt buộc" })
        .min(2, "Tên trường quá ngắn (ít nhất 2 ký tự)")
        .max(255, "Tên trường quá dài"),
    major: z.string({ message: "Chuyên ngành học là bắt buộc" })
        .min(2, "Tên chuyên ngành quá ngắn (ít nhất 2 ký tự)")
        .max(255, "Tên chuyên ngành quá dài"),
    skills: z.union([
        z.string().min(2, "Vui lòng nhập ít nhất một kỹ năng"),
        z.array(z.string()).min(1, "Vui lòng nhập ít nhất một kỹ năng")
    ], { message: "Kỹ năng là bắt buộc và phải là chuỗi hoặc mảng chuỗi" }),
    emergency_contact: z.string({ message: "Thông tin liên hệ khẩn cấp là bắt buộc" })
        .min(5, "Thông tin liên hệ quá ngắn (ít nhất 5 ký tự)")
        .max(255, "Thông tin liên hệ quá dài")
});
