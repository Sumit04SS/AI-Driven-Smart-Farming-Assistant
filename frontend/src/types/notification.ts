export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  status: string;
  notifications: NotificationItem[];
}
