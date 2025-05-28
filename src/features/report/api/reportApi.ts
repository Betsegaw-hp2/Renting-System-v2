import apiClient from '@/api/client';
import type { CreateReportPayload, Report } from '../types/report.types';

export const reportApi = {
  create: async (payload: CreateReportPayload): Promise<Report> => {
    try {
      const response = await apiClient.post<Report>(`/reports`, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },

  fetchOne: async (id: string): Promise<Report> => {
    try {
      const response = await apiClient.get<Report>(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report with id ${id}:`, error); 
      throw error;
    }
  },
};
