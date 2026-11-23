import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Clock, Bed, Check, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Hospital } from '../../components/common/Icons';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function HospitalRecommendations() {
  const [searchParams] = useSearchParams();
  const emergencyId = searchParams.get('emergency_id');

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [emergencyId]);

  const fetchRecommendations = async () => {
    try {
      let targetId = emergencyId;
      if (!targetId) {
        const listRes = await api.get('/api/patients/emergencies');
        if (listRes.data.length > 0) {
          targetId = listRes.data[0].id;
        }
      }

      if (targetId) {
        const res = await api.get(`/api/hospitals/recommend?emergency_id=${targetId}`);
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/patient" className="text-xs font-semibold text-gray-500 hover:text-navy flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-navy">Recommended Receiving Hospitals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hospitals ranked by road travel time (40%), capacity availability (30%), and required trauma facilities (30%).
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Important Healthcare Coordination Notice</p>
          <p>
            A recommendation does not constitute confirmed hospital acceptance. Receiving facilities must explicitly review emergency status and confirm bed readiness before arrival.
          </p>
        </div>
      </div>

      {/* Hospital Cards List */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
            <Hospital className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-navy">No Hospital Recommendations Available</p>
            <p className="text-xs text-gray-400 mt-1">No active emergency was selected or found.</p>
          </div>
        ) : (
          recommendations.map((h, idx) => (
            <div
              key={h.hospital_id}
              className={`p-6 sm:p-8 rounded-3xl border transition-all bg-white shadow-xs ${
                idx === 0
                  ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-navy text-white text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <h3 className="text-xl font-black text-navy">{h.name}</h3>
                    {idx === 0 && (
                      <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Best Recommended Match
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0" />
                    {h.address}
                  </p>

                  {/* Badges / Metrics */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Clock size={14} className="text-navy" />
                      ETA: {h.duration_minutes} min {h.is_estimated && '(est)'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <MapPin size={14} className="text-navy" />
                      Distance: {h.distance_km} km
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Bed size={14} className="text-emerald-600" />
                      Available Beds: {h.available_beds}
                    </div>
                  </div>

                  {/* Matched Facilities */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Matching Emergency Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {h.matched_facilities?.map((f: string) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-navy px-2.5 py-1 rounded-lg border border-blue-100"
                        >
                          <Check size={12} className="text-emerald-500" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-left md:text-right shrink-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Suitability Score
                  </p>
                  <p className="text-3xl font-black text-navy mt-1">
                    {(h.recommendation_score * 100).toFixed(0)}
                    <span className="text-sm font-medium text-gray-400">/100</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Algorithm Rank</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
