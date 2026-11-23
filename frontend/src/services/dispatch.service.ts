import api from '../lib/api';

export const dispatchService = {
  async getMyAssignment(): Promise<any> {
    try {
      const resp = await api.get('/api/drivers/active-assignment');
      return resp.data;
    } catch {
      return null;
    }
  },

  async acceptAssignment(assignmentId: number): Promise<any> {
    const resp = await api.post(`/api/assignments/${assignmentId}/accept`);
    return resp.data;
  },

  async rejectAssignment(assignmentId: number): Promise<any> {
    const resp = await api.post(`/api/assignments/${assignmentId}/reject`);
    return resp.data;
  },

  async triggerDispatch(emergencyId: number): Promise<any> {
    const resp = await api.post(`/api/dispatch/${emergencyId}`);
    return resp.data;
  },
};
