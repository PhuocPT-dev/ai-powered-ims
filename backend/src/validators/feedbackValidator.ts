import { z } from 'zod';

export const feedbackSchema = z.object({
    mentor_id: z.number({ message: "Bắt buộc phải chọn Mentor để đánh giá" }),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    is_anonymous: z.boolean().optional()
});
