import { z } from 'zod';

// dịnh nghĩa khuôn đúc chuẩn cho1 tờ đơn tuyển dụng
export const createJobSchema = z.object({
    title: z.string({ message: " Bắt buộc phải có Tên công việc" })
        .min(5, "Tên công việc quá ngắn, ít nhất 5 ký tự nhé!"),

    description: z.string({ message: "Bắt buộc phải có Mô tả" })
        .min(10, "Mô tả công việc quá ngắn, hãy viết có tâm hơn (ít nhất 10 ký tự)"),

    salary: z.string().optional(),

    location: z.string().optional()
})