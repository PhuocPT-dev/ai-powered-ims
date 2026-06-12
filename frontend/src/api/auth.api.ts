import apiClient from "./client";

export const authApi = {
    // Đăng nhập
    login: async (data: any) => {
        const response = await apiClient.post("/auth/login", data);
        return response.data;
    },

    // Đăng ký 
    register: async (data: any) => {
        const response = await apiClient.post("/auth/register", data);
        return response.data;
    }
}