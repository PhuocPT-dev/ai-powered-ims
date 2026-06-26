import apiClient from "./client";

export interface CreateUserDto {
    full_name: string;
    email: string;
    role: string;
}

export const adminApi = {
    getAllUsers: async () => {
        const response = await apiClient.get("/admin/users");
        return response.data;
    },

    createUser: async (data: CreateUserDto) => {
        const response = await apiClient.post("/admin/users", data);
        return response.data;
    },

    toggleUserStatus: async (userId: number, is_active: number) => {
        const response = await apiClient.put(`/admin/users/${userId}/status`, { is_active });
        return response.data;
    },

    resetPassword: async (userId: number) => {
        const response = await apiClient.put(`/admin/users/${userId}/reset-password`);
        return response.data;
    },

    updateRole: async (userId: number, role: string) => {
        const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    }
};
