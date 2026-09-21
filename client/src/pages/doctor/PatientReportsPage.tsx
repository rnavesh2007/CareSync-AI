import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { REPORT_TYPES, Report } from '../../types/index.js';
import { FileText, Search, Eye, Download, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export const PatientReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter((r) => {
    const matchesType = selectedType === 'ALL' || r.reportType === selectedType;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      r.patient?.user?.lastName?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Patient Clinical Reports Archive
          </h1>
          <p className="text-xs text-slate-500">
            Review and sign laboratory reports, radiology scans, pathology, and ECG tracings.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, report title, or findings..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedType === 'ALL'
                ? 'bg-teal-600 text-white shadow-soft-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          {REPORT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedType === t
                  ? 'bg-teal-600 text-white shadow-soft-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <Card key={r.id} hoverable className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <Badge variant="teal" size="sm">{r.reportType}</Badge>
                <span className="text-[11px] text-slate-400">
                  {new Date(r.uploadDate).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">{r.title}</h3>
              <p className="text-xs text-brand-600 font-medium mt-0.5">
                Patient: {r.patient?.user?.firstName} {r.patient?.user?.lastName}
              </p>

              {r.aiSummary && (
                <div className="mt-3 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r.aiSummary}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Status: {r.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(r)}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          subtitle={`Patient: ${selectedReport.patient?.user?.firstName} ${selectedReport.patient?.user?.lastName} • Category: ${selectedReport.reportType}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {selectedReport.aiSummary && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <h4 className="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Clinical AI Summary
                </h4>
                <p className="text-teal-950 leading-relaxed">{selectedReport.aiSummary}</p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Transcription & Clinical Findings</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedReport.extractedText || 'No diagnostic transcription recorded.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
