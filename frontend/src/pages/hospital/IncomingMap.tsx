import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio } from 'lucide-react';
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

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function IncomingMap() {
  const [hospital, setHospital] = useState<any>(null);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const [hRes, aRes] = await Promise.all([
        api.get('/api/hospitals'),
        api.get('/api/ambulances'),
      ]);
      if (hRes.data.length > 0) {
        setHospital(hRes.data[0]);
      }
      setAmbulances(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const center: [number, number] = hospital
    ? [hospital.latitude, hospital.longitude]
    : [51.5074, -0.1278];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">Incoming Ambulances Radar</h1>
          <p className="text-sm text-gray-500">Live geographic overview of fleet units in the medical sector.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Radio size={14} className="animate-pulse" /> Live Telematics Radar
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs">
        <div className="h-[560px] w-full rounded-2xl overflow-hidden relative z-10">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hospital && (
              <Marker position={[hospital.latitude, hospital.longitude]} icon={hospitalIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong>{hospital.name}</strong>
                    <p>{hospital.address}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {ambulances.map((amb) => {
              if (!amb.latitude || !amb.longitude) return null;
              return (
                <Marker key={amb.id} position={[amb.latitude, amb.longitude]} icon={ambulanceIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong>Unit: {amb.vehicle_number}</strong>
                      <p>Status: {amb.status}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
