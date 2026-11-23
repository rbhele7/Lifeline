import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import {
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
} from 'lucide-react';
import { Ambulance, Hospital } from '../../components/common/Icons';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

// Leaflet icon fix for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const patientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const timelineSteps = [
  'REPORTED',
  'SEARCHING_AMBULANCE',
  'AMBULANCE_ASSIGNED',
  'DRIVER_ACCEPTED',
  'EN_ROUTE_TO_PATIENT',
  'AT_PICKUP',
  'EN_ROUTE_TO_HOSPITAL',
  'AT_HOSPITAL',
  'COMPLETED',
];

export default function TrackAmbulance() {
  const { emergencyId } = useParams();
  const navigate = useNavigate();

  const [emergency, setEmergency] = useState<any>(null);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [ambulancePos, setAmbulancePos] = useState<[number, number] | null>(null);
  const [isSimulatedGps, setIsSimulatedGps] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchEmergencyDetails();
  }, [emergencyId]);

  // Set up WebSocket for real-time tracking
  useEffect(() => {
    if (!emergencyId) return;
    const wsUrl = `ws://${window.location.hostname}:8000/ws/emergencies/${emergencyId}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'status_update') {
            setEmergency((prev: any) => (prev ? { ...prev, status: data.status } : prev));
            toast.info(`Status Updated: ${data.status}`);
          } else if (data.event === 'location_update') {
            setAmbulancePos([data.latitude, data.longitude]);
            if (data.is_simulated) setIsSimulatedGps(true);
          } else if (data.event === 'driver_accepted') {
            fetchEmergencyDetails();
            toast.success('Ambulance driver has accepted your request!');
          }
        } catch (e) {}
      };
    } catch (e) {
      console.log('WS not available, polling fallback will handle updates.');
    }

    const interval = setInterval(fetchEmergencyDetails, 10000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [emergencyId]);

  const fetchEmergencyDetails = async () => {
    try {
      let targetId = emergencyId;
      if (!targetId) {
        const listRes = await api.get('/api/patients/emergencies');
        if (listRes.data.length > 0) {
          targetId = listRes.data[0].id;
        } else {
          setIsLoading(false);
          return;
        }
      }

      const res = await api.get(`/api/emergencies/${targetId}`);
      setEmergency(res.data);

      if (res.data.assignments && res.data.assignments.length > 0) {
        const last = res.data.assignments[res.data.assignments.length - 1];
        setActiveAssignment(last);

        // Fetch ambulance location
        if (last.ambulance_id) {
          const ambRes = await api.get(`/api/ambulances/${last.ambulance_id}`);
          if (ambRes.data.latitude && ambRes.data.longitude) {
            setAmbulancePos([ambRes.data.latitude, ambRes.data.longitude]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEmergency = async () => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    setCancelling(true);
    try {
      await api.post(`/api/emergencies/${emergency.id}/cancel`);
      toast.success('Emergency request has been cancelled.');
      fetchEmergencyDetails();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Could not cancel emergency');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!emergency) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 max-w-xl mx-auto space-y-4">
        <Ambulance className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy">No Active Emergency Found</h2>
        <p className="text-sm text-gray-500">You do not currently have an active emergency trip.</p>
        <Link to="/patient/report">
          <Button className="bg-emergency text-white font-bold rounded-xl mt-4">
            Report New Emergency
          </Button>
        </Link>
      </div>
    );
  }

  const patientCoords: [number, number] = [emergency.latitude, emergency.longitude];
  const centerPos = ambulancePos || patientCoords;
  const currentStepIdx = timelineSteps.indexOf(emergency.status);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase text-gray-400">
              Trip Reference #{emergency.id}
            </span>
            <StatusBadge status={emergency.status} />
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <Radio size={12} className="animate-pulse" /> Live Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            {emergency.emergency_type} Emergency ({emergency.severity})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reported on {new Date(emergency.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to={`/patient/hospitals?emergency_id=${emergency.id}`}>
            <Button variant="outline" className="font-bold text-xs rounded-xl border-gray-300">
              <Hospital className="mr-2 h-4 w-4" />
              Hospital Options
            </Button>
          </Link>
          {!['COMPLETED', 'CANCELLED'].includes(emergency.status) && (
            <Button
              variant="outline"
              onClick={handleCancelEmergency}
              disabled={cancelling}
              className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel Trip
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Map + Timeline & Driver Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs relative overflow-hidden">
            {/* Simulation banner */}
            {isSimulatedGps && (
              <div className="bg-amber-500 text-white text-xs font-bold py-1 px-4 text-center rounded-lg mb-3">
                ⚠️ SIMULATED GPS DEMO MODE — Demonstrating Real-time Telematics
              </div>
            )}

            <div className="h-[460px] w-full rounded-2xl overflow-hidden z-10 relative">
              <MapContainer center={centerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Patient marker */}
                <Marker position={patientCoords} icon={patientIcon}>
                  <Popup>
                    <div className="font-sans text-xs">
                      <strong>Patient Pickup Location</strong>
                      <p>{emergency.contact_name}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Ambulance marker */}
                {ambulancePos && (
                  <Marker position={ambulancePos} icon={ambulanceIcon}>
                    <Popup>
                      <div className="font-sans text-xs">
                        <strong>Assigned Ambulance</strong>
                        <p>{activeAssignment?.ambulance?.vehicle_number || 'En route'}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Connect straight line/polyline between patient and ambulance */}
                {ambulancePos && (
                  <Polyline
                    positions={[ambulancePos, patientCoords]}
                    color="#DC2626"
                    weight={4}
                    dashArray="6, 8"
                  />
                )}
              </MapContainer>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Patient Location
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Ambulance
                </span>
              </div>
              <span className="text-gray-400">OpenStreetMap / OSRM</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Assignment & Timeline (1 col) */}
        <div className="space-y-6">
          {/* Driver & Unit Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-navy">Dispatch Details</h3>

            {activeAssignment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center">
                      <Ambulance size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-navy">
                        {activeAssignment.ambulance?.vehicle_number || 'Unit Dispatched'}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        Assignment: {activeAssignment.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Estimated Arrival</p>
                    <p className="text-2xl font-black text-emergency mt-0.5">
                      {activeAssignment.estimated_arrival_minutes
                        ? `${Math.round(activeAssignment.estimated_arrival_minutes)} min`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Road Distance</p>
                    <p className="text-2xl font-black text-navy mt-0.5">
                      {activeAssignment.distance_km ? `${activeAssignment.distance_km} km` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs font-semibold text-center border border-amber-200">
                Searching for available ambulance unit in the vicinity...
              </div>
            )}
          </div>

          {/* Lifecycle Status Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-navy">Trip Lifecycle</h3>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={step} className="flex items-center gap-3 relative text-xs">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-colors ${
                        isCurrent
                          ? 'bg-emergency text-white ring-4 ring-red-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`capitalize ${
                        isCurrent
                          ? 'font-black text-navy'
                          : isPassed
                          ? 'font-semibold text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
