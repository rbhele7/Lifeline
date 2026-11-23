import api from '../lib/api';
import { User, EmergencyRequest, Analytics } from '../types';

export const adminService = {
  async getUsers(params?: { role?: string }): Promise<User[]> {
    const resp = await api.get('/api/admin/users', { params });
    return resp.data;
  },

  async updateUser(userId: number, data: Partial<User>): Promise<any> {
    const resp = await api.put(`/api/admin/users/${userId}`, data);
    return resp.data;
  },

  async toggleUserActive(userId: number): Promise<any> {
    const resp = await api.delete(`/api/admin/users/${userId}`);
    return resp.data;
  },

  async getEmergencies(params?: { status?: string; limit?: number; offset?: number }): Promise<{ total: number; emergencies: EmergencyRequest[] }> {
    const resp = await api.get('/api/admin/emergencies', { params });
    return resp.data;
  },

  async getAnalytics(startDate?: string, endDate?: string): Promise<Analytics> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const resp = await api.get('/api/admin/analytics', { params });
    return resp.data;
  },

  async getReports(startDate?: string, endDate?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const resp = await api.get('/api/admin/reports', { params });
    return resp.data;
  },
};
