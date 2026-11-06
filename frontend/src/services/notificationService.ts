import api from './api';
import { NotificationItem, NotificationsResponse } from '../types/notification';

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    const res = await api.get<NotificationsResponse>('/notifications');
    return res.data;
  },

  async markAsRead(notificationId: number): Promise<{ status: string; message: string; notification: NotificationItem }> {
    const res = await api.patch<{ status: string; message: string; notification: NotificationItem }>(
      `/notifications/${notificationId}/read`
    );
    return res.data;
  },
};
