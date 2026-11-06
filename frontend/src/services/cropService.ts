import api from './api';
import { CropRecommendationRequest, CropRecommendationResponse } from '../types/crop';

export const cropService = {
  async getRecommendation(data: CropRecommendationRequest): Promise<CropRecommendationResponse> {
    const res = await api.post<CropRecommendationResponse>('/crop-recommendation', data);
    return res.data;
  },
};
