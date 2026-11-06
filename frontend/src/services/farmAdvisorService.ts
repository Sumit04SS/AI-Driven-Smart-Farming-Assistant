import api from './api';
import { FarmAdvisorRequest, FarmAdvisorResponse } from '../types/advisor';

export const farmAdvisorService = {
  async getFarmActions(data: FarmAdvisorRequest): Promise<FarmAdvisorResponse> {
    const res = await api.post<FarmAdvisorResponse>('/farm-advisor', data);
    return res.data;
  },
};
