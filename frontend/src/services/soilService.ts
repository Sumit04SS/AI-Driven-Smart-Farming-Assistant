import api from './api';
import { SoilAdvisoryRequest, SoilAdvisoryResponse } from '../types/soil';

export const soilService = {
  async getAdvisory(data: SoilAdvisoryRequest): Promise<SoilAdvisoryResponse> {
    const res = await api.post<SoilAdvisoryResponse>('/soil-advisory', data);
    return res.data;
  },
};
