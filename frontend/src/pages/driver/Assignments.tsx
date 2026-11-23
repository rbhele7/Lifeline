import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ClipboardList, CheckCircle, XCircle, Navigation, Clock, MapPin, Eye } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function DriverAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/api/drivers/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    try {
      await api.post(`/api/assignments/${id}/accept`);
      toast.success('Assignment accepted! Proceed with navigation.');
      fetchAssignments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not accept assignment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Are you sure you want to reject this assignment? It will be immediately reassigned.')) return;
    setActionLoading(id);
    try {
      await api.post(`/api/assignments/${id}/reject`);
      toast.info('Assignment rejected. Reallocation triggered.');
      fetchAssignments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not reject assignment');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const pending = assignments.filter((a) => a.status === 'PENDING');
  const other = assignments.filter((a) => a.status !== 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy mb-2">Emergency Assignments</h1>
        <p className="text-sm text-gray-500">
          Review dispatches sent by the intelligent allocation engine. Accept to commence navigation.
        </p>
      </div>

      {/* Pending Action Required Section */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-emergency uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emergency animate-ping" />
            Action Required: Pending Dispatches ({pending.length})
          </h2>

          <div className="grid gap-4">
            {pending.map((a) => (
              <div
                key={a.assignment_id}
                className="bg-red-50/60 border-2 border-emergency/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-navy">Assignment #{a.assignment_id}</span>
                    <StatusBadge status={a.status} />
                    <StatusBadge status={a.emergency?.severity || 'HIGH'} />
                  </div>
                  <h3 className="text-xl font-black text-navy">
                    {a.emergency?.type} Emergency
                  </h3>
                  <p className="text-xs text-gray-600 max-w-lg">
                    {a.emergency?.description || 'Immediate emergency pickup required.'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600 bg-white/80 p-3 rounded-xl border border-red-100">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emergency" />
                      ETA: {a.estimated_arrival_minutes ? `${Math.round(a.estimated_arrival_minutes)} min` : '—'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-navy" />
                      Distance: {a.distance_km ? `${a.distance_km} km` : '—'}
                    </span>
                    <span>•</span>
                    <span>Contact: {a.emergency?.contact_name} ({a.emergency?.contact_phone})</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 shrink-0">
                  <Button
                    onClick={() => handleAccept(a.assignment_id)}
                    disabled={actionLoading === a.assignment_id}
                    className="bg-emergency hover:bg-emergency-dark text-white font-black px-6 py-3 rounded-xl shadow-md"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Dispatch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(a.assignment_id)}
                    disabled={actionLoading === a.assignment_id}
                    className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-xl"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other / History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-black text-navy">Assignment Log</h3>
        </div>

        {other.length === 0 && pending.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            No assignments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Emergency Type</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Assigned At</th>
                  <th className="py-4 px-6">Accepted At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {other.map((a) => (
                  <tr key={a.assignment_id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-navy">#{a.assignment_id}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800">{a.emergency?.type}</p>
                      <span className="text-xs text-gray-400">{a.emergency?.severity}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(a.assigned_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {a.accepted_at ? new Date(a.accepted_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {a.status === 'ACCEPTED' && (
                        <Link to="/driver/navigate">
                          <Button size="sm" className="bg-navy text-white font-bold text-xs rounded-xl">
                            <Navigation className="mr-1.5 h-3.5 w-3.5" /> Navigate
                          </Button>
                        </Link>
                      )}
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
