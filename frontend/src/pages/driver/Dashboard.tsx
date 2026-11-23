import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Power, Navigation, ClipboardList, CheckCircle2, Clock, MapPin, Radio } from 'lucide-react';
import { Ambulance } from '../../components/common/Icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function DriverDashboard() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState<any>(null);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const [profRes, activeRes, allRes] = await Promise.all([
        api.get('/api/drivers/profile'),
        api.get('/api/drivers/active-assignment'),
        api.get('/api/drivers/assignments'),
      ]);
      setProfile(profRes.data);
      setActiveAssignment(activeRes.data);
      setAssignments(allRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile?.ambulance) return;
    setToggling(true);
    const newStatus = profile.ambulance.status === 'AVAILABLE' ? false : true;
    try {
      await api.put(`/api/drivers/status?available=${newStatus}`);
      toast.success(`Unit availability set to ${newStatus ? 'AVAILABLE' : 'OUT_OF_SERVICE'}`);
      fetchDriverData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not change status');
    } finally {
      setToggling(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const isAvailable = profile?.ambulance?.status === 'AVAILABLE';
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner & Availability Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase text-gray-400">
              License: {profile?.license_number || 'DL-2024-001'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="text-xs font-bold text-navy">
              Vehicle: {profile?.ambulance?.vehicle_number || 'None'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-navy">Driver: {user?.full_name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ambulance Telematics & Emergency Navigation Interface.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unit Status</p>
            <StatusBadge status={profile?.ambulance?.status || 'OUT_OF_SERVICE'} className="mt-1" />
          </div>

          <Button
            onClick={handleToggleAvailability}
            disabled={toggling || (profile?.ambulance?.status !== 'AVAILABLE' && profile?.ambulance?.status !== 'OUT_OF_SERVICE')}
            className={`font-bold rounded-2xl h-12 px-6 shadow-sm transition-all ${
              isAvailable
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="mr-2 h-4 w-4" />
            {isAvailable ? 'Go Off Duty' : 'Go On Duty'}
          </Button>
        </div>
      </div>

      {/* Active Assignment Alert (if any) */}
      {activeAssignment ? (
        <div className="bg-red-50 border-2 border-emergency/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emergency animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-emergency">
                Active Emergency Assignment
              </span>
              <StatusBadge status={activeAssignment.status} />
            </div>
            <Link to="/driver/navigate">
              <Button size="lg" className="bg-emergency hover:bg-emergency-dark text-white font-black rounded-xl">
                <Navigation className="mr-2 h-4 w-4" />
                Open GPS Navigation
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/80 p-4 rounded-2xl border border-red-100">
              <p className="text-xs font-semibold text-gray-400 uppercase">Emergency Type</p>
              <p className="text-lg font-black text-navy mt-1">
                {activeAssignment.emergency?.type} ({activeAssignment.emergency?.severity})
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-red-100">
              <p className="text-xs font-semibold text-gray-400 uppercase">Estimated Arrival</p>
              <p className="text-lg font-black text-emergency mt-1">
                {activeAssignment.estimated_arrival_minutes
                  ? `${Math.round(activeAssignment.estimated_arrival_minutes)} minutes`
                  : '—'}
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-red-100">
              <p className="text-xs font-semibold text-gray-400 uppercase">Contact</p>
              <p className="text-sm font-bold text-navy mt-1">
                {activeAssignment.emergency?.contact_name} ({activeAssignment.emergency?.contact_phone})
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-3">
          <Ambulance className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-navy">No Active Dispatches</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Your vehicle is standby. When an emergency is dispatched by the smart allocation engine, you will be alerted here immediately.
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Dispatches</p>
          <p className="text-3xl font-black text-navy mt-2">{assignments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Trips</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{completedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Vehicle</p>
          <p className="text-xl font-black text-navy mt-2">
            {profile?.ambulance?.vehicle_number || 'Unassigned'}
          </p>
        </div>
      </div>
    </div>
  );
}
