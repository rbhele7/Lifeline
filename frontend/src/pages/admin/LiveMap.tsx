import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Radio } from 'lucide-react';
import { Ambulance, Hospital } from '../../components/common/Icons';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceAvailIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceBusyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LiveMap() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLiveEntities();
    const interval = setInterval(fetchLiveEntities, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveEntities = async () => {
    try {
      const [ambRes, hospRes, emergRes] = await Promise.all([
        api.get('/api/admin/ambulances'),
        api.get('/api/hospitals'),
        api.get('/api/admin/emergencies?limit=50'),
      ]);
      setAmbulances(ambRes.data);
      setHospitals(hospRes.data);
      setEmergencies(
        (emergRes.data.emergencies || []).filter(
          (e: any) => !['COMPLETED', 'CANCELLED'].includes(e.status)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const center: [number, number] = [51.5074, -0.1278];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">System-Wide Live Map</h1>
          <p className="text-sm text-gray-500">
            Real-time multi-layer visualization of ambulances, hospitals, and active emergency calls.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <Radio size={14} className="animate-pulse" /> Telematics Stream Active
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="h-[620px] w-full rounded-2xl overflow-hidden relative z-10">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Hospitals (Green) */}
            {hospitals.map((h) => (
              <Marker key={`h-${h.id}`} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong>{h.name}</strong>
                    <p>{h.address}</p>
                    <p className="text-emerald-700 font-semibold mt-1">Available beds: {h.capacity?.available_beds ?? '—'}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Ambulances (Blue / Orange) */}
            {ambulances.map((a) => {
              if (!a.latitude || !a.longitude) return null;
              const isAvailable = a.status === 'AVAILABLE';
              return (
                <Marker
                  key={`a-${a.id}`}
                  position={[a.latitude, a.longitude]}
                  icon={isAvailable ? ambulanceAvailIcon : ambulanceBusyIcon}
                >
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>Unit: {a.vehicle_number}</strong>
                      <p>Driver: {a.driver?.full_name || 'None'}</p>
                      <p className="font-semibold text-navy mt-1">Status: {a.status}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Active Emergencies (Red) */}
            {emergencies.map((e) => (
              <Marker key={`e-${e.id}`} position={[e.latitude, e.longitude]} icon={emergencyIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="text-red-600">Incident #{e.id}</strong>
                    <p>{e.type} ({e.severity})</p>
                    <p className="font-semibold text-gray-700 mt-1">Status: {e.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 px-3 pt-1">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Available Ambulance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Dispatched / Busy Unit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Partner Hospital
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Active Emergency
            </span>
          </div>
          <span className="text-gray-400">OpenStreetMap Coordinates</span>
        </div>
      </div>
    </div>
  );
}
