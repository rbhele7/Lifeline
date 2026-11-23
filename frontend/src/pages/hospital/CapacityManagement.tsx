import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bed, Save, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function CapacityManagement() {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [hospitalName, setHospitalName] = useState<string>('');
  const [totalBeds, setTotalBeds] = useState<number>(100);
  const [availableBeds, setAvailableBeds] = useState<number>(25);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      const hRes = await api.get('/api/hospitals');
      if (hRes.data.length > 0) {
        const id = hRes.data[0].id;
        setHospitalId(id);
        const detail = await api.get(`/api/hospitals/${id}`);
        setHospitalName(detail.data.name);
        if (detail.data.capacity) {
          setTotalBeds(detail.data.capacity.total_beds);
          setAvailableBeds(detail.data.capacity.available_beds);
          setLastUpdated(detail.data.capacity.last_updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableBeds > totalBeds) {
      toast.error('Available beds cannot exceed total beds');
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/api/hospitals/${hospitalId}/capacity`, {
        total_beds: Number(totalBeds),
        available_beds: Number(availableBeds),
      });
      toast.success('Hospital capacity updated successfully');
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      toast.error('Failed to update capacity');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const occupancy = Math.round(((totalBeds - availableBeds) / Math.max(totalBeds, 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy mb-2">Hospital Capacity Management</h1>
        <p className="text-sm text-gray-500">
          Maintain accurate reported bed telemetry so the smart allocation engine routes patients effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Beds</p>
          <p className="text-3xl font-black text-navy mt-2">{totalBeds}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Beds</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{availableBeds}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Occupancy Rate</p>
          <p className="text-3xl font-black text-purple-700 mt-2">{occupancy}%</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bed size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-lg">{hospitalName}</h3>
              <p className="text-xs text-gray-400">
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Recently'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="total">Total Hospital Bed Capacity</Label>
              <Input
                id="total"
                type="number"
                min={1}
                value={totalBeds}
                onChange={(e) => setTotalBeds(parseInt(e.target.value) || 0)}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="avail">Available Emergency/General Beds</Label>
              <Input
                id="avail"
                type="number"
                min={0}
                value={availableBeds}
                onChange={(e) => setAvailableBeds(parseInt(e.target.value) || 0)}
                className="mt-2"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Occupancy Visualizer
            </Label>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  occupancy > 85 ? 'bg-red-500' : occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {totalBeds - availableBeds} beds occupied of {totalBeds} total beds.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-navy hover:bg-navy-light text-white font-bold h-12 px-8 rounded-xl shadow-xs"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Updating...' : 'Save Capacity Telemetry'}
          </Button>
        </form>
      </div>
    </div>
  );
}
