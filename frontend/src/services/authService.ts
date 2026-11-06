import api from './api';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '../types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<{ status: string; message: string }> {
    const res = await api.post<{ status: string; message: string }>('/auth/logout');
    return res.data;
  },

  async getProfile(): Promise<{ status: string; user: User }> {
    const res = await api.get<{ status: string; user: User }>('/users/me');
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ status: string; message: string; user: User }> {
    const res = await api.put<{ status: string; message: string; user: User }>('/users/me', data);
    return res.data;
  },

  async healthCheck(): Promise<{ status: string; message: string }> {
    const res = await api.get<{ status: string; message: string }>('/health');
    return res.data;
  },
};
