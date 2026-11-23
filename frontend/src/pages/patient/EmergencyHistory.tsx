import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Eye, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function EmergencyHistory() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/patients/emergencies');
      setEmergencies(res.data);
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
        <h1 className="text-3xl font-black text-navy mb-2">Emergency Request History</h1>
        <p className="text-sm text-gray-500">
          Complete log of all medical dispatch requests and their resolution records.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {emergencies.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No emergency requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Type & Severity</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Reported At</th>
                  <th className="py-4 px-6">Assigned Ambulance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emergencies.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-navy">#{e.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800">{e.type}</p>
                      <StatusBadge status={e.severity} className="mt-1" />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600 font-semibold">
                      {e.assignment?.ambulance?.vehicle_number || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/patient/track/${e.id}`}>
                        <Button variant="outline" size="sm" className="font-bold text-xs rounded-xl">
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Track / View
                        </Button>
                      </Link>
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
