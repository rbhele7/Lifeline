import { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Eye } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function EmergencyMonitoring() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 15000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchEmergencies = async () => {
    try {
      const url =
        statusFilter === 'ALL'
          ? '/api/admin/emergencies?limit=100'
          : `/api/admin/emergencies?status=${statusFilter}&limit=100`;
      const res = await api.get(url);
      setEmergencies(res.data.emergencies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchEmergencies();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">Live Incident Monitoring</h1>
          <p className="text-sm text-gray-500">
            Real-time emergency stream updated across the dispatch center.
          </p>
        </div>
        <Button
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-gray-300 font-bold text-xs rounded-xl"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stream
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          'ALL',
          'REPORTED',
          'SEARCHING_AMBULANCE',
          'AMBULANCE_ASSIGNED',
          'DRIVER_ACCEPTED',
          'EN_ROUTE_TO_PATIENT',
          'AT_PICKUP',
          'EN_ROUTE_TO_HOSPITAL',
          'AT_HOSPITAL',
          'COMPLETED',
          'CANCELLED',
        ].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-navy text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-100'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Emergency Type</th>
                <th className="py-4 px-6">Severity</th>
                <th className="py-4 px-6">Current Lifecycle Status</th>
                <th className="py-4 px-6">Reported At</th>
                <th className="py-4 px-6">Coordinates</th>
                <th className="py-4 px-6">Dispatches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emergencies.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-navy">#{e.id}</td>
                  <td className="py-4 px-6 font-bold text-gray-800">{e.type}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={e.severity} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">
                    {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-semibold">
                    {e.assignments_count} assignment(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
