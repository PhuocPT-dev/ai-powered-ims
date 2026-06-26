import apiClient from "./client";

export interface UpdateProfileDto {
    university: string;
    major: string;
    skills: string;
    emergency_contact: string;
}

export const internApi = {
    getProfile: async (userId: number | string) => {
        const response = await apiClient.get(`/interns/profile/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: number | string, data: UpdateProfileDto) => {
        const response = await apiClient.put(`/interns/profile/${userId}`, data);
        return response.data;
    },

    getAllInterns: async () => {
        const response = await apiClient.get("/interns");
        return response.data;
    },

    getAISkillSuggestions: async () => {
        const response = await apiClient.post("/interns/ai-suggest-skills");
        return response.data;
    }
};
