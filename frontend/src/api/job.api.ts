import apiClient from "./client";

export const jobApi = {
    // 📢 Lấy danh sách việc làm đang mở (API này KHÔNG CẦN Token bảo vệ vì ứng viên (người lạ) vẫn được xem)
    getAllJobs: async () => {
        const response = await apiClient.get("/jobs");
        return response.data; // Trả về cái lõi dữ liệu luôn
    },

    applyJob: async (jobId: number, cvUrl: string) => {
        const response = await apiClient.post(`/jobs/${jobId}/apply`, { cv_url: cvUrl })
        return response.data
    },

    createJob: async (jobData: { title: string, description: string, salary: string, location: string }) => {
        const response = await apiClient.post("/jobs", jobData);
        return response.data
    }

}
