import api from '../lib/api';
import { Hospital, HospitalRecommendation } from '../types';

export const hospitalService = {
  async list(): Promise<Hospital[]> {
    const resp = await api.get('/api/hospitals');
    return resp.data;
  },

  async get(id: number): Promise<Hospital> {
    const resp = await api.get(`/api/hospitals/${id}`);
    return resp.data;
  },

  async create(data: Partial<Hospital>): Promise<Hospital> {
    const resp = await api.post('/api/hospitals', data);
    return resp.data;
  },

  async updateCapacity(hospitalId: number, data: { total_beds: number; available_beds: number }): Promise<any> {
    const resp = await api.put(`/api/hospitals/${hospitalId}/capacity`, data);
    return resp.data;
  },

  async updateFacilities(hospitalId: number, facilities: Array<{ facility_name: string; is_available: boolean }>): Promise<any> {
    const resp = await api.put(`/api/hospitals/${hospitalId}/facilities`, { facilities });
    return resp.data;
  },

  async getRecommendations(emergencyId: number): Promise<HospitalRecommendation[]> {
    const resp = await api.get(`/api/hospitals/recommend?emergency_id=${emergencyId}`);
    return resp.data;
  },

  async acceptEmergency(hospitalId: number, emergencyId: number): Promise<any> {
    const resp = await api.post(`/api/hospitals/${hospitalId}/emergencies/${emergencyId}/accept`);
    return resp.data;
  },

  async rejectEmergency(hospitalId: number, emergencyId: number): Promise<any> {
    const resp = await api.post(`/api/hospitals/${hospitalId}/emergencies/${emergencyId}/reject`);
    return resp.data;
  },
};
