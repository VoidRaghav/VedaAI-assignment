import axios from 'axios';
import { Assignment, AssignmentFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assignmentApi = {
  create: async (data: AssignmentFormData): Promise<Assignment> => {
    const response = await api.post('/assignments', data);
    return response.data.data;
  },

  getAll: async (): Promise<Assignment[]> => {
    const response = await api.get('/assignments');
    return response.data.data;
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data.data;
  },

  generate: async (id: string): Promise<{ jobId: string }> => {
    const response = await api.post(`/assignments/${id}/generate`);
    return response.data;
  },

  regenerate: async (id: string): Promise<{ jobId: string }> => {
    const response = await api.post(`/assignments/${id}/regenerate`);
    return response.data;
  },

  getStatus: async (id: string): Promise<{ status: string; hasResult: boolean }> => {
    const response = await api.get(`/assignments/${id}/status`);
    return response.data;
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/assignments/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
};

export default api;
