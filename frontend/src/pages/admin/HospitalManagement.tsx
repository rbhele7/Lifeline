import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, MapPin, Bed, Phone } from 'lucide-react';
import { Hospital } from '../../components/common/Icons';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New hospital form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(51.5000);
  const [longitude, setLongitude] = useState(-0.1300);
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/api/hospitals');
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/hospitals', {
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        contact_number: phone,
      });
      toast.success('Hospital registered successfully');
      setShowModal(false);
      setName('');
      setAddress('');
      setPhone('');
      fetchHospitals();
    } catch (err: any) {
      toast.error('Failed to create hospital');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">Hospital Network</h1>
          <p className="text-sm text-gray-500">
            Registered medical centers equipped for emergency dispatch intake.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-navy hover:bg-navy-light text-white font-bold rounded-xl h-11 px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Partner Hospital
        </Button>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">Hospital</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Coordinates</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6">
                    <p className="font-bold text-navy">{h.name}</p>
                    <p className="text-xs text-gray-400">ID #{h.id}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 max-w-xs truncate">
                    {h.address}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">
                    {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-semibold">
                    {h.contact_number || '—'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-navy">Register Partner Hospital</h3>
            <form onSubmit={handleCreateHospital} className="space-y-4">
              <div>
                <Label htmlFor="hname">Hospital Name</Label>
                <Input
                  id="hname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal London Hospital"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="haddr">Address</Label>
                <Input
                  id="haddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street and Postal Area"
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hlat">Latitude</Label>
                  <Input
                    id="hlat"
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hlon">Longitude</Label>
                  <Input
                    id="hlon"
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hphone">Emergency Phone</Label>
                <Input
                  id="hphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 20 7000 0000"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-navy hover:bg-navy-light text-white font-bold rounded-xl"
                >
                  {creating ? 'Saving...' : 'Register'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
