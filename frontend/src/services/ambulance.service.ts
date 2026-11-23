import api from '../lib/api';
import { Ambulance, AmbulanceStatus } from '../types';

export const ambulanceService = {
  async list(): Promise<Ambulance[]> {
    const resp = await api.get('/api/ambulances');
    return resp.data;
  },

  async get(id: number): Promise<Ambulance> {
    const resp = await api.get(`/api/ambulances/${id}`);
    return resp.data;
  },

  async updateLocation(id: number, latitude: number, longitude: number, is_simulated = false): Promise<Ambulance> {
    const resp = await api.put(`/api/ambulances/${id}/location`, {
      latitude,
      longitude,
      is_simulated,
    });
    return resp.data;
  },

  async toggleAvailability(id: number): Promise<{ status: AmbulanceStatus }> {
    const resp = await api.put(`/api/ambulances/${id}/availability`);
    return resp.data;
  },
};
