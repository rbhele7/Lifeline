import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Activity, Bell, AlertTriangle, ArrowRight, Settings, MapPin } from 'lucide-react';
import { Hospital } from '../../components/common/Icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function HospitalDashboard() {
  const { user } = useContext(AuthContext);

  const [hospital, setHospital] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      // Find hospital belonging to user or fallback to first
      const hospList = await api.get('/api/hospitals');
      if (hospList.data.length > 0) {
        const myHosp = hospList.data[0];
        const detailRes = await api.get(`/api/hospitals/${myHosp.id}`);
        setHospital(detailRes.data);

        const notifRes = await api.get(`/api/hospitals/${myHosp.id}/emergencies`);
        setNotifications(notifRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const pending = notifications.filter((n) => n.status === 'PENDING');
  const availableBeds = hospital?.capacity?.available_beds ?? 0;
  const totalBeds = hospital?.capacity?.total_beds ?? 1;
  const occupancyPercent = Math.round(((totalBeds - availableBeds) / Math.max(totalBeds, 1)) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Hospital Coordination Center
            </span>
            <span className="text-xs text-gray-500 font-medium">ID #{hospital?.id}</span>
          </div>
          <h1 className="text-3xl font-black text-navy">{hospital?.name || 'City General Hospital'}</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            {hospital?.address} • Phone: {hospital?.contact_number}
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/hospital/capacity">
            <Button variant="outline" className="font-bold text-xs rounded-xl border-gray-300">
              <Bed className="mr-1.5 h-4 w-4 text-emerald-600" /> Manage Capacity
            </Button>
          </Link>
          <Link to="/hospital/facilities">
            <Button variant="outline" className="font-bold text-xs rounded-xl border-gray-300">
              <Settings className="mr-1.5 h-4 w-4 text-navy" /> Facilities
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Incoming Requests Alert */}
      {pending.length > 0 && (
        <div className="bg-purple-50/70 border-2 border-purple-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-purple-800">
                Action Required: {pending.length} Incoming Request{pending.length > 1 ? 's' : ''}
              </span>
            </div>
            <Link to="/hospital/requests">
              <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl">
                Review Requests <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-purple-900">
            Emergency crews have requested bed admission. Review patient severity and accept to confirm receiving readiness.
          </p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Beds</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-black text-emerald-600">{availableBeds}</p>
            <p className="text-xs text-gray-400">Total: {totalBeds}</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${100 - occupancyPercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bed Occupancy</p>
          <p className="text-3xl font-black text-navy mt-2">{occupancyPercent}%</p>
          <p className="text-xs text-gray-400 mt-2">Reported Ward Load</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emergency Units</p>
          <p className="text-3xl font-black text-purple-700 mt-2">
            {hospital?.facilities?.filter((f: any) => f.available).length || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2">Active Specialized Facilities</p>
        </div>
      </div>

      {/* Recent Incoming Notifications */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-navy">Incoming Transports Log</h3>
          <Link to="/hospital/requests" className="text-xs font-bold text-navy hover:underline">
            View All
          </Link>
        </div>

        {notifications.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400">No patient requests received yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.notification_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy text-sm">
                      Emergency #{n.emergency?.id} ({n.emergency?.type})
                    </span>
                    <StatusBadge status={n.status} />
                    <StatusBadge status={n.emergency?.severity || 'HIGH'} />
                  </div>
                  <p className="text-xs text-gray-500">
                    Received on {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Link to="/hospital/requests">
                    <Button variant="outline" size="sm" className="font-bold text-xs rounded-xl">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
