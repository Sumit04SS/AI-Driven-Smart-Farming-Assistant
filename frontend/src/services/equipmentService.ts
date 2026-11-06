import api from './api';
import {
  EquipmentCreateRequest,
  EquipmentItem,
  EquipmentSearchRequest,
  RentalDealRequest,
  RentalDealResponse,
  RentalRequestCreate,
  RentalRequestItem,
} from '../types/equipment';

export const equipmentService = {
  async createEquipment(data: EquipmentCreateRequest): Promise<{ status: string; message: string; equipment: EquipmentItem }> {
    const res = await api.post<{ status: string; message: string; equipment: EquipmentItem }>('/equipment/', data);
    return res.data;
  },

  async searchEquipment(data: EquipmentSearchRequest): Promise<{ status: string; equipment_type: string; city: string; results: EquipmentItem[] }> {
    const res = await api.post<{ status: string; equipment_type: string; city: string; results: EquipmentItem[] }>('/equipment/search', data);
    return res.data;
  },

  async checkDeal(data: RentalDealRequest): Promise<RentalDealResponse> {
    const res = await api.post<RentalDealResponse>('/equipment/deal-check', data);
    return res.data;
  },

  async createRentalRequest(data: RentalRequestCreate): Promise<{ status: string; message: string; request: { id: number; equipment_id: number; status: string } }> {
    const res = await api.post<{ status: string; message: string; request: { id: number; equipment_id: number; status: string } }>('/equipment/rental-request', data);
    return res.data;
  },

  async updateRentalRequest(requestId: number, status: 'accepted' | 'rejected'): Promise<{ status: string; message: string; request: { id: number; equipment_id: number; status: string } }> {
    const res = await api.put<{ status: string; message: string; request: { id: number; equipment_id: number; status: string } }>(
      `/equipment/rental-request/${requestId}`,
      null,
      { params: { status } }
    );
    return res.data;
  },

  async getRentalRequests(): Promise<{ status: string; requests: RentalRequestItem[] }> {
    const res = await api.get<{ status: string; requests: RentalRequestItem[] }>('/equipment/rental-requests');
    return res.data;
  },
};
