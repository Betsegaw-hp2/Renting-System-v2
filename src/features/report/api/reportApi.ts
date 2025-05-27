import apiClient from '@/api/client';
import apiConfig from '@/config/api.config';
import type { CreateReportPayload, Report } from '../types/report.types';

export const reportApi = {
  create: (payload: CreateReportPayload): Promise<Report> =>
    apiClient
      .post<Report>(`${apiConfig.apiBaseUrl}/reports`, payload)
      .then(r => r.data),

  fetchOne: (id: string): Promise<Report> =>
    apiClient
      .get<Report>(`${apiConfig.apiBaseUrl}/reports/${id}`)
      .then(r => r.data),
};
