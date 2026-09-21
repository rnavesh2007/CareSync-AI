import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { FileText, Plus, Download, Eye, Sparkles } from 'lucide-react';

export const DoctorReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports').then((res) => {
      setReports(res.data.reports || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Authored & Signed Clinical Documentation
          </h1>
          <p className="text-xs text-slate-500">
            Consultation notes, prescriptions, and radiology sign-offs authored under Dr. Marcus Vance.
          </p>
        </div>
        <Button variant="teal" size="sm" icon={<Plus className="w-4 h-4" />}>
          Draft New Note / Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.id} hoverable className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <Badge variant="teal" size="sm">{r.reportType}</Badge>
                <span className="text-[11px] text-slate-400">
                  {new Date(r.uploadDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">{r.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong>{r.patient?.user?.firstName} {r.patient?.user?.lastName}</strong>
              </p>
              {r.aiSummary && (
                <div className="mt-3 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
                  {r.aiSummary}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                ✓ Signed & Archived
              </span>
              <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
