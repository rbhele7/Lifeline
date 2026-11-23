import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, History, PhoneCall, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Ambulance, Hospital } from '../../components/common/Icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/api/patients/emergencies');
      setEmergencies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeEmergency = emergencies.find(
    (e) => !['COMPLETED', 'CANCELLED'].includes(e.status)
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            You are in the Patient Emergency Coordination Portal. In case of a life-threatening
            situation, immediately report an emergency below.
          </p>
        </div>
        <Link to="/patient/report">
          <Button size="lg" className="bg-emergency hover:bg-emergency-dark text-white font-extrabold px-8 py-6 rounded-2xl shadow-lg shadow-red-900/20 text-base">
            <PhoneCall className="mr-2 h-5 w-5" />
            Report Emergency Now
          </Button>
        </Link>
      </div>

      {/* Active Emergency Alert Card (if any) */}
      {activeEmergency && (
        <div className="bg-red-50 border-2 border-emergency/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emergency animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emergency">
                  Active Emergency #{activeEmergency.id}
                </span>
                <StatusBadge status={activeEmergency.status} />
              </div>
              <h2 className="text-2xl font-black text-navy">
                {activeEmergency.type} Emergency ({activeEmergency.severity})
              </h2>
              <p className="text-sm text-gray-600 max-w-lg">
                {activeEmergency.description || 'Emergency assistance requested. Units mobilized.'}
              </p>
              {activeEmergency.assignment && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 bg-white/80 p-3 rounded-xl border border-red-100">
                  <span className="flex items-center gap-1">
                    <Ambulance size={14} className="text-emergency" />
                    Unit: {activeEmergency.assignment.ambulance?.vehicle_number || 'Dispatched'}
                  </span>
                  <span>•</span>
                  <span>ETA: {activeEmergency.assignment.estimated_arrival_minutes || 'calculating...'} min</span>
                  <span>•</span>
                  <span>Distance: {activeEmergency.assignment.distance_km || '—'} km</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/patient/track/${activeEmergency.id}`}>
                <Button className="bg-emergency hover:bg-emergency-dark text-white font-bold rounded-xl w-full sm:w-auto">
                  <Ambulance className="mr-2 h-4 w-4" />
                  Live Track Ambulance
                </Button>
              </Link>
              <Link to={`/patient/hospitals?emergency_id=${activeEmergency.id}`}>
                <Button variant="outline" className="border-gray-300 font-semibold rounded-xl w-full sm:w-auto">
                  <Hospital className="mr-2 h-4 w-4" />
                  Recommended Hospitals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Requests</p>
          <p className="text-3xl font-black text-navy mt-2">{emergencies.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Operations</p>
          <p className="text-3xl font-black text-emergency mt-2">{activeEmergency ? 1 : 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Trips</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {emergencies.filter((e) => e.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Recent Emergencies List */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-navy">Recent Emergency Requests</h3>
          <Link to="/patient/history" className="text-xs font-bold text-navy hover:underline flex items-center gap-1">
            View All History <ArrowRight size={14} />
          </Link>
        </div>

        {emergencies.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No previous emergency requests on record.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {emergencies.slice(0, 5).map((e) => (
              <div key={e.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy text-sm">Emergency #{e.id}</span>
                    <StatusBadge status={e.status} />
                    <span className="text-xs font-semibold text-gray-400 uppercase">{e.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Reported on {new Date(e.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/patient/track/${e.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold rounded-lg">
                      View Details
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
