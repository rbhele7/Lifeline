import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Plus, Check, Save } from 'lucide-react';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';

export default function FacilityManagement() {
  const [hospitalId, setHospitalId] = useState<number>(1);
  const [facilities, setFacilities] = useState<Array<{ facility_name: string; is_available: boolean }>>([]);
  const [newFacilityName, setNewFacilityName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const hRes = await api.get('/api/hospitals');
      if (hRes.data.length > 0) {
        const id = hRes.data[0].id;
        setHospitalId(id);
        const detail = await api.get(`/api/hospitals/${id}`);
        setFacilities(
          (detail.data.facilities || []).map((f: any) => ({
            facility_name: f.name,
            is_available: f.available,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (index: number) => {
    setFacilities((prev) =>
      prev.map((f, i) => (i === index ? { ...f, is_available: !f.is_available } : f))
    );
  };

  const handleAdd = () => {
    if (!newFacilityName.trim()) return;
    setFacilities((prev) => [
      ...prev,
      { facility_name: newFacilityName.trim(), is_available: true },
    ]);
    setNewFacilityName('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/api/hospitals/${hospitalId}/facilities`, {
        facilities: facilities,
      });
      toast.success('Hospital facilities updated successfully');
    } catch (err) {
      toast.error('Failed to update facilities');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-2">Hospital Specialty Facilities</h1>
          <p className="text-sm text-gray-500">
            Emergency triage matches incoming patients to facilities with active specialties.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-navy hover:bg-navy-light text-white font-bold h-11 px-6 rounded-xl shadow-xs"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save All Facilities'}
        </Button>
      </div>

      {/* Add New Unit Input */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex gap-3">
        <Input
          placeholder="Add specialized facility (e.g. Cath Lab, Burn Unit, Hyperbaric)..."
          value={newFacilityName}
          onChange={(e) => setNewFacilityName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" /> Add Specialty
        </Button>
      </div>

      {/* Facilities List with Toggles */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
        {facilities.map((f, idx) => (
          <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="font-bold text-navy text-base">{f.facility_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {f.is_available ? 'Available for emergency intake' : 'Temporarily suspended / full'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  f.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {f.is_available ? 'Online' : 'Offline'}
              </span>
              <Switch checked={f.is_available} onCheckedChange={() => handleToggle(idx)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
