import api from '../lib/api';
import { Notification } from '../types';

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const resp = await api.get('/api/notifications');
    return resp.data;
  },

  async markRead(notificationId: number): Promise<void> {
    await api.put(`/api/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.put('/api/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    try {
      const resp = await api.get('/api/notifications/unread-count');
      return resp.data.count;
    } catch {
      return 0;
    }
  },
};
