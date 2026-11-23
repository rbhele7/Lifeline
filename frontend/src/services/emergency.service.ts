import api from '../lib/api';
import { EmergencyRequest } from '../types';

export const emergencyService = {
  async create(data: {
    emergency_type: string;
    severity: string;
    description?: string;
    latitude: number;
    longitude: number;
    contact_name?: string;
    contact_phone?: string;
  }): Promise<EmergencyRequest> {
    const resp = await api.post('/api/emergencies', data);
    return resp.data;
  },

  async list(status?: string): Promise<EmergencyRequest[]> {
    const resp = await api.get('/api/emergencies', { params: { status } });
    return resp.data;
  },

  async get(id: number): Promise<EmergencyRequest> {
    const resp = await api.get(`/api/emergencies/${id}`);
    return resp.data;
  },

  async updateStatus(id: number, status: string, details?: string): Promise<EmergencyRequest> {
    const resp = await api.put(`/api/emergencies/${id}/status`, { status, details });
    return resp.data;
  },

  async cancel(id: number): Promise<EmergencyRequest> {
    const resp = await api.post(`/api/emergencies/${id}/cancel`);
    return resp.data;
  },
};
