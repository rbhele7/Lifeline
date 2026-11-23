import { useState, useEffect } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      let url = '/api/admin/reports';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setReports(res.data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let url = '/api/admin/reports/export';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `lifeline_audit_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">Audit Reports & Export</h1>
          <p className="text-sm text-gray-500">
            Export structured database records for clinical audit and dispatch compliance.
          </p>
        </div>

        <Button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-11 px-5 shadow-xs"
        >
          <Download className="mr-2 h-4 w-4" /> Download Complete CSV
        </Button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 flex flex-wrap gap-4 items-center shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">From:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">To:</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40 text-xs"
          />
        </div>

        <Button
          onClick={fetchReports}
          variant="outline"
          size="sm"
          className="font-bold text-xs rounded-xl border-gray-300"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" /> Apply Filters
        </Button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Emergency Type</th>
                <th className="py-4 px-6">Severity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Logged At</th>
                <th className="py-4 px-6">Latitude</th>
                <th className="py-4 px-6">Longitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-navy">#{r.id}</td>
                  <td className="py-4 px-6 font-bold text-gray-800">{r.type}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={r.severity} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">{r.latitude}</td>
                  <td className="py-4 px-6 text-xs font-mono text-gray-500">{r.longitude}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
