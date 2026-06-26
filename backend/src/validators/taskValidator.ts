import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(5, "Tiêu đề công việc quá ngắn (ít nhất 5 ký tự)"),
    description: z.string().min(10, "Mô tả công việc phải chi tiết hơn (ít nhất 10 ký tự)"),
    intern_id: z.number({ message: "Vui lòng chọn Thực tập sinh để giao việc" }),
    deadline: z.string().min(1, "Vui lòng chọn hạn chót để hoàn thành")
});

export const evaluateTaskSchema = z.object({
    score: z.number({ message: "Vui lòng nhập điểm số" }).min(0, "Điểm không được âm").max(100, "Điểm tối đa là 100")
});

export const updateTaskStatusSchema = z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], { message: "Trạng thái không hợp lệ" })
});
