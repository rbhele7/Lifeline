import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Power, MapPin, Radio } from 'lucide-react';
import { Ambulance } from '../../components/common/Icons';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function AmbulanceManagement() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [latitude, setLatitude] = useState(51.5074);
  const [longitude, setLongitude] = useState(-0.1278);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await api.get('/api/admin/ambulances');
      setAmbulances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.put(`/api/ambulances/${id}/availability`);
      toast.success('Ambulance status toggled');
      fetchAmbulances();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to toggle availability');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/ambulances', {
        vehicle_number: vehicleNumber,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      toast.success('Ambulance registered');
      setShowModal(false);
      setVehicleNumber('');
      fetchAmbulances();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add ambulance');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">Fleet Management</h1>
          <p className="text-sm text-gray-500">
            Monitor and configure emergency transport units, telematics sensors, and driver assignments.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-navy hover:bg-navy-light text-white font-bold rounded-xl h-11 px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {/* Ambulances Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">Vehicle Number</th>
                <th className="py-4 px-6">Assigned Driver</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Coordinates</th>
                <th className="py-4 px-6">Last Telemetry</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ambulances.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-navy flex items-center gap-2">
                    <Ambulance size={16} className="text-emergency" />
                    {a.vehicle_number}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-700 font-semibold">
                    {a.driver?.full_name || 'No driver assigned'}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">
                    {a.latitude ? `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-400">
                    {a.last_location_update ? new Date(a.last_location_update).toLocaleTimeString() : '—'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(a.id)}
                      className="font-bold text-xs rounded-xl"
                    >
                      <Power className="mr-1 h-3.5 w-3.5" /> Toggle Availability
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-navy">Register Ambulance Vehicle</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="vnum">Vehicle Registration Number</Label>
                <Input
                  id="vnum"
                  placeholder="e.g. AMB-LDN-009"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alat">Latitude</Label>
                  <Input
                    id="alat"
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="alon">Longitude</Label>
                  <Input
                    id="alon"
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    required
                    className="mt-1"
                  />
                </div>
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
                  {creating ? 'Adding...' : 'Add Unit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
