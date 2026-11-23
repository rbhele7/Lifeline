import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  Play,
  RotateCw,
  Phone,
} from 'lucide-react';
import { Ambulance } from '../../components/common/Icons';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

// Leaflet icons
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

export default function DriverNavigation() {
  const [profile, setProfile] = useState<any>(null);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [ambulancePos, setAmbulancePos] = useState<[number, number]>([51.5074, -0.1278]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchActiveData();
  }, []);

  const fetchActiveData = async () => {
    try {
      const [profRes, activeRes] = await Promise.all([
        api.get('/api/drivers/profile'),
        api.get('/api/drivers/active-assignment'),
      ]);
      setProfile(profRes.data);
      setActiveAssignment(activeRes.data);

      if (profRes.data?.ambulance?.latitude && profRes.data?.ambulance?.longitude) {
        setAmbulancePos([profRes.data.ambulance.latitude, profRes.data.ambulance.longitude]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeAssignment?.emergency?.id) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/api/emergencies/${activeAssignment.emergency.id}/status`, {
        status: status,
      });
      toast.success(`Trip status updated: ${status}`);
      fetchActiveData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Simulate GPS Step (moves closer to patient)
  const handleSimulateGps = async () => {
    if (!profile?.ambulance?.id || !activeAssignment?.emergency) {
      toast.error('No active assignment or ambulance to update');
      return;
    }

    const patientLat = activeAssignment.emergency.latitude;
    const patientLon = activeAssignment.emergency.longitude;

    // Advance 30% of the remaining distance toward patient
    const newLat = ambulancePos[0] + (patientLat - ambulancePos[0]) * 0.35;
    const newLon = ambulancePos[1] + (patientLon - ambulancePos[1]) * 0.35;

    const roundedLat = Number(newLat.toFixed(6));
    const roundedLon = Number(newLon.toFixed(6));

    try {
      await api.put(`/api/ambulances/${profile.ambulance.id}/location`, {
        latitude: roundedLat,
        longitude: roundedLon,
        is_simulated: true,
      });
      setAmbulancePos([roundedLat, roundedLon]);
      setIsSimulated(true);
      toast.info('Simulated GPS coordinate broadcast to patients & hospitals!');
    } catch (err: any) {
      toast.error('Failed to update GPS telematics');
    }
  };

  // Real GPS from Browser
  const handleRealGps = () => {
    if (!profile?.ambulance?.id) return;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lon = Number(pos.coords.longitude.toFixed(6));
          try {
            await api.put(`/api/ambulances/${profile.ambulance.id}/location`, {
              latitude: lat,
              longitude: lon,
              is_simulated: false,
            });
            setAmbulancePos([lat, lon]);
            setIsSimulated(false);
            toast.success('Live GPS coordinates acquired and broadcast.');
          } catch (e) {
            toast.error('Failed to send GPS');
          }
        },
        () => toast.error('Browser GPS unvailable')
      );
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!activeAssignment) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 max-w-xl mx-auto space-y-4">
        <Navigation className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-navy">No Active Navigation Mission</h2>
        <p className="text-sm text-gray-500">
          Accept a pending emergency from your assignments page to begin turn-by-turn navigation.
        </p>
        <Link to="/driver/assignments">
          <Button className="bg-navy text-white font-bold rounded-xl mt-4">
            View Assignments
          </Button>
        </Link>
      </div>
    );
  }

  const patientCoords: [number, number] = [
    activeAssignment.emergency.latitude,
    activeAssignment.emergency.longitude,
  ];

  const currentStatus = activeAssignment.emergency?.status;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Mission Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-black uppercase text-emergency bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
              Active Mission #{activeAssignment.assignment_id}
            </span>
            <StatusBadge status={currentStatus} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy">
            {activeAssignment.emergency?.type} Emergency
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Patient: {activeAssignment.emergency?.contact_name} ({activeAssignment.emergency?.contact_phone})
          </p>
        </div>

        {/* Telematics action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleSimulateGps}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Simulate GPS Step (Demo)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRealGps}
            className="border-gray-300 font-bold text-xs rounded-xl"
          >
            <Radio className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            Use Live GPS
          </Button>
        </div>
      </div>

      {/* Map & Step Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs relative">
            {isSimulated && (
              <div className="bg-amber-500 text-white text-xs font-bold py-1 px-4 text-center rounded-lg mb-3">
                ⚠️ SIMULATED GPS DEMO MODE — Demonstrating Telematics Movement
              </div>
            )}

            <div className="h-[460px] w-full rounded-2xl overflow-hidden relative z-10">
              <MapContainer center={ambulancePos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={patientCoords} icon={patientIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>Patient Pickup</strong>
                      <p>{activeAssignment.emergency?.contact_name}</p>
                    </div>
                  </Popup>
                </Marker>

                <Marker position={ambulancePos} icon={ambulanceIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>Your Ambulance ({profile?.ambulance?.vehicle_number})</strong>
                    </div>
                  </Popup>
                </Marker>

                <Polyline positions={[ambulancePos, patientCoords]} color="#1E3A8A" weight={4} dashArray="5, 8" />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Transition Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-navy">Trip Status Controls</h3>
            <p className="text-xs text-gray-500">
              Advance the emergency lifecycle as you complete each phase of transport.
            </p>

            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => handleUpdateStatus('EN_ROUTE_TO_PATIENT')}
                disabled={updatingStatus || currentStatus === 'EN_ROUTE_TO_PATIENT'}
                className="w-full justify-start font-bold text-xs h-12 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200"
              >
                <Navigation className="mr-2 h-4 w-4 text-blue-600" />
                1. En Route to Patient
              </Button>

              <Button
                onClick={() => handleUpdateStatus('AT_PICKUP')}
                disabled={updatingStatus || currentStatus === 'AT_PICKUP'}
                className="w-full justify-start font-bold text-xs h-12 rounded-xl bg-cyan-50 text-cyan-900 hover:bg-cyan-100 border border-cyan-200"
              >
                <MapPin className="mr-2 h-4 w-4 text-cyan-600" />
                2. Mark Arrival at Pickup
              </Button>

              <Button
                onClick={() => handleUpdateStatus('EN_ROUTE_TO_HOSPITAL')}
                disabled={updatingStatus || currentStatus === 'EN_ROUTE_TO_HOSPITAL'}
                className="w-full justify-start font-bold text-xs h-12 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200"
              >
                <Ambulance className="mr-2 h-4 w-4 text-indigo-600" />
                3. En Route to Hospital
              </Button>

              <Button
                onClick={() => handleUpdateStatus('AT_HOSPITAL')}
                disabled={updatingStatus || currentStatus === 'AT_HOSPITAL'}
                className="w-full justify-start font-bold text-xs h-12 rounded-xl bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-teal-600" />
                4. Mark Arrival at Hospital
              </Button>

              <Button
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={updatingStatus || currentStatus === 'COMPLETED'}
                className="w-full justify-start font-bold text-xs h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                5. Mark Trip Completed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
