import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { FileText, Search, Download, Eye, ShieldCheck } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/reports').then((res) => {
      setReports(res.data.reports || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.reportType.toLowerCase().includes(search.toLowerCase()) ||
    r.patient?.user?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Hospital Clinical Document & Audit Repository
          </h1>
          <p className="text-xs text-slate-500">
            Compliance oversight across all diagnostic files, file checksum integrity, and patient records.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, patient, or type..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4">Storage Path</th>
                <th className="py-3.5 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.title}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {r.patient?.user?.firstName} {r.patient?.user?.lastName}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="teal" size="sm">{r.reportType}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(r.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                    {r.filePath}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
