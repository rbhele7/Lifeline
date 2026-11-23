import { useState, useEffect } from 'react';
import { History, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function DriverHistory() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/drivers/assignments');
      setAssignments(res.data.filter((a: any) => a.status === 'COMPLETED'));
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
        <h1 className="text-3xl font-black text-navy mb-2">Completed Missions</h1>
        <p className="text-sm text-gray-500">
          Historical record of successfully executed ambulance dispatches.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {assignments.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No completed assignments on record yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Emergency Type</th>
                  <th className="py-4 px-6">Distance</th>
                  <th className="py-4 px-6">Assigned At</th>
                  <th className="py-4 px-6">Completed At</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr key={a.assignment_id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-navy">#{a.assignment_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800">{a.emergency?.type}</p>
                      <span className="text-xs text-gray-400">{a.emergency?.severity}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-700 font-semibold">
                      {a.distance_km ? `${a.distance_km} km` : '—'}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(a.assigned_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {a.completed_at ? new Date(a.completed_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={a.status} />
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
