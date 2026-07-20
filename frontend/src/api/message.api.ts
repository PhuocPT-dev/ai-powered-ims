import apiClient from "./client";

export interface Contact {
    id: number;
    full_name: string;
    email: string;
    role: string;
}

export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
}

export const messageApi = {
    // Lấy danh bạ chat
    getContacts: async () => {
        const response = await apiClient.get<{ status: string; data: Contact[] }>("/messages/contacts");
        return response.data;
    },

    // Lấy lịch sử chat với 1 người
    getChatHistory: async (partnerId: number) => {
        const response = await apiClient.get<{ status: string; data: Message[] }>(`/messages/history/${partnerId}`);
        return response.data;
    }
};
