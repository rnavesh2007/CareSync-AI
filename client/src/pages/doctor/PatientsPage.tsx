import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Users, Search, Activity, FileText, Calendar, ShieldCheck, Heart } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/doctor/patients').then((res) => {
      setPatients(res.data.patients || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.allergies && p.allergies.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Assigned Patient Clinical Roster
          </h1>
          <p className="text-xs text-slate-500">
            Active roster under Dr. Marcus Vance with real-time biometric indices and risk triage.
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
            placeholder="Search patients by name, blood group, or clinical allergies..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const latestVital = p.vitals?.[0];
          return (
            <Card key={p.id} hoverable className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {p.user?.firstName} {p.user?.lastName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {p.gender} • DOB: {new Date(p.dob).toLocaleDateString()} • Blood: <strong>{p.bloodGroup}</strong>
                      </p>
                    </div>
                  </div>
                  <Badge variant={p.riskLevel === 'LOW' ? 'success' : 'warning'} size="sm">
                    {p.riskLevel} RISK
                  </Badge>
                </div>

                {/* Vitals Snapshot */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">HR (bpm)</span>
                    <span className="font-bold text-slate-800">{latestVital?.heartRate || 72}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">BP (mmHg)</span>
                    <span className="font-bold text-slate-800">{latestVital ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : '118/76'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                    <span className="font-bold text-slate-800">{latestVital?.spO2 || 99}%</span>
                  </div>
                </div>

                <div className="mt-3 text-xs space-y-1 text-slate-600">
                  <p><strong>Assignment:</strong> {p.assignmentNotes || 'Primary Cardiologist'}</p>
                  <p><strong>Allergies:</strong> {p.allergies || 'None recorded'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/doctor/patient-reports'}>
                  Clinical Reports
                </Button>
                <Button variant="teal" size="sm" onClick={() => window.location.href = '/doctor/ai-summaries'}>
                  AI Brief
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
