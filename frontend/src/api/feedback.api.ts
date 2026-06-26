import apiClient from "./client";

export interface SubmitFeedbackDto {
    mentor_id: number;
    rating: number;
    comment: string;
    is_anonymous: boolean;
}

export const feedbackApi = {
    submitFeedback: async (data: SubmitFeedbackDto) => {
        const response = await apiClient.post("/feedbacks", data);
        return response.data;
    },

    getMentorsForFeedback: async () => {
        const response = await apiClient.get("/feedbacks/mentors");
        return response.data;
    },

    getMentorFeedbacks: async (mentorId: number | string) => {
        const response = await apiClient.get(`/feedbacks/mentor/${mentorId}`);
        return response.data;
    }
};
