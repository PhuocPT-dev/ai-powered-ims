import apiClient from "./client";

interface LoginDto {
    email: string;
    password: string;
}

interface RegisterDto {
    email: string;
    password: string;
    password_confirm: string;
    full_name: string;
    phone?: string;
}

export const authApi = {
    // Đăng nhập
    login: async (data: LoginDto) => {
        const response = await apiClient.post("/auth/login", data);
        return response.data;
    },

    // Đăng ký 
    register: async (data: RegisterDto) => {
        const response = await apiClient.post("/auth/register", data);
        return response.data;
    }
}