import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function HospitalEmergencyHistory() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const hRes = await api.get('/api/hospitals');
      if (hRes.data.length > 0) {
        const id = hRes.data[0].id;
        const res = await api.get(`/api/hospitals/${id}/emergencies`);
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-navy mb-2">Hospital Admissions History</h1>
        <p className="text-sm text-gray-500">
          Historical record of emergency intake requests and their acceptance status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No incoming requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Emergency Type</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Hospital Status</th>
                  <th className="py-4 px-6">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n.notification_id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-navy">#{n.notification_id}</td>
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {n.emergency?.type}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={n.emergency?.severity || 'HIGH'} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={n.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
