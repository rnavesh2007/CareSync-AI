import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Clock, ShieldAlert, CheckCircle2, FileText, Pill, Activity, Stethoscope } from 'lucide-react';

export const MedicalHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/patient/history');
        setHistory(res.data.history || []);
        setTimeline(res.data.timeline || []);
      } catch (err) {
        console.error('Error fetching medical history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" />
          Medical History & Clinical Timeline
        </h1>
        <p className="text-xs text-slate-500">
          Chronic conditions, surgical history, known contraindications, and longitudinal event records.
        </p>
      </div>

      {/* Allergies & Alerts banner */}
      <Card className="bg-rose-50/50 border-rose-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-rose-900">Known Clinical Allergies & Contraindications</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="danger" size="sm">Penicillin (Severe Hives)</Badge>
              <Badge variant="danger" size="sm">Tree Nuts (Anaphylaxis Risk)</Badge>
              <Badge variant="slate" size="sm">No Known Contrast Dye Allergy</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conditions & Past Procedures */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              Diagnoses & Conditions
            </h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{h.condition}</span>
                    <Badge variant={h.status === 'ACTIVE' ? 'warning' : h.status === 'MANAGED' ? 'teal' : 'success'} size="sm">
                      {h.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{h.notes}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Diagnosed: {new Date(h.diagnosisDate).toLocaleDateString()}</span>
                    <span>Treated by: {h.treatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Patient Timeline */}
        <div>
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Longitudinal Clinical Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
              {timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white border-2 border-white"></div>
                  <div>
                    <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                      {new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
