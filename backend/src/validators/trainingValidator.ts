import { z } from 'zod';

export const createProgramSchema = z.object({
    title: z.string().min(5, "Tiêu đề khóa học phải từ 5 ký tự"),
    description: z.string().optional(),
    start_date: z.string({ message: "Thiếu ngày bắt đầu" }),
    end_date: z.string({ message: "Thiếu ngày kết thúc" })
});

export const enrollInternSchema = z.object({
    intern_id: z.number({ message: "Thiếu ID Thực tập sinh" })
});
