import apiClient from "./client";

export const analyticsApi = {
    getDashboardStats: async () => {
        const response = await apiClient.get("/analytics/dashboard");
        return response.data;
    },

    getMonthlyStats: async () => {
        const response = await apiClient.get("/analytics/monthly");
        return response.data;
    },

    getTrainingStats: async () => {
        const response = await apiClient.get("/analytics/trainings");
        return response.data;
    },

    getInternKPI: async (internId: string | number) => {
        const response = await apiClient.get(`/analytics/interns/${internId}/kpi`);
        return response.data;
    }
};
