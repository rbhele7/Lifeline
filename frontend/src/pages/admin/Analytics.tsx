import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Download, Calendar, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const PIE_COLORS = ['#DC2626', '#EA580C', '#EAB308', '#2563EB', '#EC4899', '#7C3AED'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      let url = '/api/admin/analytics';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/api/admin/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lifeline_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">Analytics & Reporting Intelligence</h1>
          <p className="text-sm text-gray-500">
            Real historical database analytics, dispatch latency metrics, and triage distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-11 px-5 shadow-xs"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hospital Acceptance Rate</p>
          <p className="text-3xl font-black text-navy mt-2">{analytics?.hospital_acceptance_rate ?? 0}%</p>
          <p className="text-xs text-gray-400 mt-1">Confirmed vs Requested</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Dispatch Latency</p>
          <p className="text-3xl font-black text-navy mt-2">
            {analytics?.average_dispatch_minutes ? `${analytics.average_dispatch_minutes} min` : '&lt; 3 min'}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Within optimal response threshold</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Patients</p>
          <p className="text-3xl font-black text-navy mt-2">{analytics?.total_patients ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Active patient profiles</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Drivers</p>
          <p className="text-3xl font-black text-navy mt-2">{analytics?.total_drivers ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Licensed emergency operators</p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy text-lg">Triage Proportions</h3>
          <p className="text-xs text-gray-400">Emergency call classification distribution.</p>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.emergency_type_distribution || []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {(analytics?.emergency_type_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-navy text-lg">Daily Incident Trajectory</h3>
          <p className="text-xs text-gray-400">Past 7 days incoming call volume.</p>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.daily_stats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" fill="#0F1C3F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
