import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Heart,
  Car,
  AlertTriangle,
  Wind,
  Baby,
  Activity,
  MapPin,
  Crosshair,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const emergencyTypes = [
  { id: 'CARDIAC', label: 'Cardiac Emergency', desc: 'Heart attack, chest pain, cardiac arrest', icon: Heart, color: 'text-red-500 bg-red-50 border-red-200' },
  { id: 'ACCIDENT', label: 'Road Accident', desc: 'Vehicular collision, pedestrian impact', icon: Car, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { id: 'TRAUMA', label: 'Physical Trauma', desc: 'Severe fall, laceration, blunt injury', icon: AlertTriangle, color: 'text-orange-500 bg-orange-50 border-orange-200' },
  { id: 'RESPIRATORY', label: 'Respiratory Distress', desc: 'Asthma, choking, asphyxiation', icon: Wind, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'PREGNANCY', label: 'Pregnancy Related', desc: 'Active labor, obstetric complication', icon: Baby, color: 'text-pink-500 bg-pink-50 border-pink-200' },
  { id: 'GENERAL', label: 'General Medical', desc: 'Unconscious, severe allergy, stroke', icon: Activity, color: 'text-purple-500 bg-purple-50 border-purple-200' },
];

const severities = [
  { id: 'CRITICAL', label: 'Critical / Red', desc: 'Immediate threat to life', color: 'border-red-500 bg-red-50 text-red-800' },
  { id: 'HIGH', label: 'High / Orange', desc: 'Severe condition, urgent response', color: 'border-orange-500 bg-orange-50 text-orange-800' },
  { id: 'MEDIUM', label: 'Medium / Yellow', desc: 'Stable but deteriorating', color: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
  { id: 'LOW', label: 'Low / Green', desc: 'Non-life threatening situation', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
];

export default function ReportEmergency() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] = useState('CARDIAC');
  const [severity, setSeverity] = useState('CRITICAL');
  const [latitude, setLatitude] = useState(51.5074);
  const [longitude, setLongitude] = useState(-0.1278);
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          toast.success('Current location detected successfully!');
          setLocating(false);
        },
        (err) => {
          toast.error('Could not acquire GPS: using default London coordinates.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/emergencies', {
        emergency_type: emergencyType,
        severity: severity,
        description: description || 'Immediate assistance required.',
        latitude: Number(latitude),
        longitude: Number(longitude),
        contact_name: contactName,
        contact_phone: contactPhone,
      });
      toast.success('Emergency dispatched successfully!');
      navigate(`/patient/track/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to dispatch emergency');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy mb-2">Request Emergency Assistance</h1>
        <p className="text-sm text-gray-500">
          Provide critical triage information so the system can mobilize the nearest ambulance and notify suitable hospitals.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-8">
        {/* Step 1: Emergency Category */}
        <div>
          <Label className="text-sm font-bold text-navy uppercase tracking-wider block mb-3">
            1. Select Emergency Type
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {emergencyTypes.map((t) => {
              const Icon = t.icon;
              const selected = emergencyType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEmergencyType(t.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selected
                      ? 'border-emergency bg-red-50/50 ring-2 ring-emergency/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-6 h-6 ${selected ? 'text-emergency' : 'text-gray-500'}`} />
                    {selected && <CheckCircle2 className="w-5 h-5 text-emergency" />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${selected ? 'text-navy' : 'text-gray-800'}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Severity */}
        <div>
          <Label className="text-sm font-bold text-navy uppercase tracking-wider block mb-3">
            2. Severity Level
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {severities.map((s) => {
              const selected = severity === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selected
                      ? `${s.color} ring-2 ring-current font-bold`
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs opacity-80 mt-1">{s.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Location */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-bold text-navy uppercase tracking-wider">
              3. Incident Coordinates
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectLocation}
              disabled={locating}
              className="text-xs font-semibold rounded-xl border-gray-300"
            >
              <Crosshair className="mr-1.5 h-3.5 w-3.5 text-navy" />
              {locating ? 'Detecting...' : 'Detect Browser Location'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat" className="text-xs text-gray-500">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lon" className="text-xs text-gray-500">Longitude</Label>
              <Input
                id="lon"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Notes and Contact */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="desc" className="text-sm font-bold text-navy uppercase tracking-wider block mb-1">
              4. Description / Patient Condition
            </Label>
            <Textarea
              id="desc"
              rows={3}
              placeholder="e.g. 55-year-old male experiencing acute chest pain radiating to the left arm."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cname" className="text-xs font-semibold text-gray-600">Contact Person Name</Label>
              <Input
                id="cname"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cphone" className="text-xs font-semibold text-gray-600">Contact Phone Number</Label>
              <Input
                id="cphone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Clicking submit will immediately execute smart allocation and alert drivers.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={() => setShowConfirm(true)}
            className="bg-emergency hover:bg-emergency-dark text-white font-extrabold px-8 rounded-xl shadow-lg shadow-red-900/20"
          >
            <PhoneCall className="mr-2 h-5 w-5" />
            Dispatch Emergency Unit
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-emergency mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-navy mb-2">Confirm Emergency Request</h3>
              <p className="text-xs text-gray-500">
                You are about to report a <strong>{severity} {emergencyType}</strong> emergency. Units will be allocated instantly.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emergency hover:bg-emergency-dark text-white font-bold rounded-xl"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Dispatching...' : 'Yes, Dispatch'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
