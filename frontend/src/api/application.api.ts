import apiClient from "./client"

export const applicationApi = {
    // kéo toàn bộ CV của 1 công việc cụ thể về
    getApplicationsByJob: async (jobId: string) => {
        const response = await apiClient.get(`/jobs/${jobId}/applications`);
        return response.data;
    },
    // Đóng dấu DUYỆT (ACCEPTED) hoặc TỪ CHỐI (REJECTED)
    updateStatus: async (applicationId: number, status: string) => {
        const response = await apiClient.put(`/applications/${applicationId}/status`, { status });
        return response.data;
    }
}