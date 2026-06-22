import { z } from 'zod';

export const scheduleInterviewSchema = z.object({
    application_id: z.number({ message: "Thiếu ID đơn ứng tuyển" }),
    coordinator_id: z.number({ message: "Thiếu ID Điều phối viên" }),
    interview_time: z.string({ message: "Vui lòng chọn thời gian" }),
    meeting_link: z.string().url("Link meeting không hợp lệ")
});
