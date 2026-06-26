import apiClient from "./client";

export interface ScheduleInterviewDto {
    application_id: number;
    interview_time: string;
    meeting_link: string;
    coordinator_id: number;
}

export const interviewApi = {
    getAllInterviews: async () => {
        const response = await apiClient.get("/interviews");
        return response.data;
    },

    scheduleInterview: async (data: ScheduleInterviewDto) => {
        const response = await apiClient.post("/interviews/schedule", data);
        return response.data;
    }
};
