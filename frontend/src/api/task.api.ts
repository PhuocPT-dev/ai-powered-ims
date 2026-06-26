import apiClient from "./client";

export interface Task {
    id: number;
    title: string;
    description: string;
    deadline: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'EVALUATED';
    score: number | null;
    mentor_id: number;
    intern_id: number;
}

export const taskApi = {
    // MENTOR: Ra lệnh giao việc
    createTask: async (data: {
        intern_id: number; title: string;
        description: string; deadline: string
    }) => {
        const response = await apiClient.post("/tasks", data);
        return response.data;
    },

    getMyTasks: async () => {
        const response = await apiClient.get<{ status: string; data: Task[] }>("/tasks/my-tasks");
        return response.data;
    },

    updateStatus: async (taskId: number, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        const response = await apiClient.patch(`/tasks/${taskId}/status`, { status });
        return response.data;
    },

    evaluateTask: async (taskId: number, score: number) => {
        const response = await apiClient.patch(`/tasks/${taskId}/evaluate`, { score });
        return response.data;
    },

    // MENTOR: Xem danh sách task đã giao
    getMentorTasks: async () => {
        const response = await apiClient.get<{ status: string; data: (Task & { intern_name: string })[] }>("/tasks/mentor-tasks");
        return response.data;
    }
}