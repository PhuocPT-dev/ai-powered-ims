import apiClient from "./client";

export interface CreateProgramDto {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    coordinator_id?: number;
}

export const trainingApi = {
    getAllPrograms: async () => {
        const response = await apiClient.get("/trainings");
        return response.data;
    },

    createProgram: async (data: CreateProgramDto) => {
        const response = await apiClient.post("/trainings", data);
        return response.data;
    },

    enrollIntern: async (programId: number, internId: number) => {
        const response = await apiClient.post(`/trainings/${programId}/enroll`, { intern_id: internId });
        return response.data;
    }
};
