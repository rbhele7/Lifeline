import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle, Clock, Heart, Bed } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function IncomingRequests() {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const hRes = await api.get('/api/hospitals');
      if (hRes.data.length > 0) {
        const id = hRes.data[0].id;
        setHospitalId(id);
        const res = await api.get(`/api/hospitals/${id}/emergencies`);
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (emergencyId: number) => {
    setActionLoading(emergencyId);
    try {
      await api.post(`/api/hospitals/${hospitalId}/emergencies/${emergencyId}/accept`);
      toast.success('Emergency confirmed and accepted! Crew notified.');
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (emergencyId: number) => {
    if (!window.confirm('Reject this incoming patient? The crew will be notified to reroute.')) return;
    setActionLoading(emergencyId);
    try {
      await api.post(`/api/hospitals/${hospitalId}/emergencies/${emergencyId}/reject`);
      toast.info('Emergency rejected.');
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.status === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy mb-2">Incoming Emergency Requests</h1>
        <p className="text-sm text-gray-500">
          Review incoming ambulance dispatches. Explicit acceptance ensures coordinated patient arrival.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        {(['PENDING', 'ACCEPTED', 'REJECTED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-navy text-white shadow-xs'
                : 'text-gray-500 hover:text-navy hover:bg-slate-100'
            }`}
          >
            {tab} ({notifications.filter((n) => (tab === 'ALL' ? true : n.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 text-gray-400 text-sm">
            No emergency requests found in this category.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.notification_id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-xs transition-all ${
                n.status === 'PENDING'
                  ? 'border-purple-300 ring-2 ring-purple-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-navy text-base">
                      Emergency #{n.emergency?.id}
                    </span>
                    <StatusBadge status={n.status} />
                    <StatusBadge status={n.emergency?.severity || 'HIGH'} />
                  </div>

                  <h3 className="text-xl font-bold text-navy">
                    {n.emergency?.type} Emergency
                  </h3>

                  <p className="text-xs text-gray-600 max-w-xl">
                    {n.emergency?.description || 'Acute medical emergency in transit.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-purple-600" />
                      ETA: {n.estimated_arrival_minutes ? `${Math.round(n.estimated_arrival_minutes)} min` : 'Calculating'}
                    </span>
                    <span>•</span>
                    <span>Received: {new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {n.status === 'PENDING' && (
                  <div className="flex flex-row md:flex-col gap-3 shrink-0">
                    <Button
                      onClick={() => handleAccept(n.emergency?.id)}
                      disabled={actionLoading === n.emergency?.id}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Patient
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(n.emergency?.id)}
                      disabled={actionLoading === n.emergency?.id}
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-6 py-2.5 rounded-xl"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
