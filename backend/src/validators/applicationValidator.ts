import { z } from 'zod';

export const updateApplicationStatusSchema = z.object({
    status: z.enum(['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'], { error: "Trạng thái ứng tuyển không hợp lệ" })
});
