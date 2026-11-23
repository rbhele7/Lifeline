import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  AlertTriangle,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Ambulance, Hospital } from '../../components/common/Icons';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentEmergencies, setRecentEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, emergenciesRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/admin/emergencies?limit=6'),
      ]);
      setAnalytics(analyticsRes.data);
      setRecentEmergencies(emergenciesRes.data.emergencies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 w-fit mb-2">
            <ShieldCheck size={14} /> Master Operational Command
          </div>
          <h1 className="text-3xl font-black text-navy">System Oversight & Fleet Control</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time multi-agency monitoring of all emergencies, telemetry units, and hospital wards.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/admin/map">
            <Button className="bg-navy hover:bg-navy-light text-white font-bold rounded-xl text-xs h-11 px-5">
              Open Real-Time Map
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="border-gray-300 font-bold rounded-xl text-xs h-11 px-5">
              Analytics Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Emergencies</p>
          <p className="text-2xl font-black text-navy mt-1">{analytics?.total_emergencies ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Operations</p>
          <p className="text-2xl font-black text-emergency mt-1">{analytics?.active_emergencies ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{analytics?.completed_emergencies ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Available Units</p>
          <p className="text-2xl font-black text-navy mt-1">{analytics?.available_ambulances ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Partner Hospitals</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{analytics?.registered_hospitals ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Dispatch</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {analytics?.average_dispatch_minutes ? `${analytics.average_dispatch_minutes}m` : '&lt; 3m'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Emergency Trend */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy text-lg">7-Day Incident Volume</h3>
          <p className="text-xs text-gray-400">Emergency reports logged across the platform over time.</p>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.daily_stats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Line type="monotone" dataKey="count" stroke="#DC2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Triage Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy text-lg">Incident Categorization</h3>
          <p className="text-xs text-gray-400">Volume breakdown by medical triage classification.</p>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.emergency_type_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" fill="#0F1C3F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Emergencies Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-navy">Live Operations Feed</h3>
          <Link to="/admin/emergencies" className="text-xs font-bold text-navy hover:underline flex items-center gap-1">
            View All Monitoring <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Type & Severity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created At</th>
                <th className="py-4 px-6">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEmergencies.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-navy">#{e.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-800">{e.type}</p>
                    <StatusBadge status={e.severity} className="mt-1" />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">
                    {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
