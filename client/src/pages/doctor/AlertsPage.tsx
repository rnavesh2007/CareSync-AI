import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { AlertTriangle, CheckCircle2, ShieldAlert, HeartPulse, Activity } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/alerts').then((res) => {
      setAlerts(res.data.alerts || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Clinical Vital Alerts & Triage Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            High and Critical physiological threshold exceptions requiring physician triage.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((al) => {
          const latestVital = al.patient?.vitals?.[0];
          return (
            <Card
              key={al.id}
              className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                al.severity === 'CRITICAL' || al.severity === 'HIGH'
                  ? 'border-rose-200 bg-rose-50/20'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    al.severity === 'CRITICAL' || al.severity === 'HIGH'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {al.patient?.user?.firstName} {al.patient?.user?.lastName} — {al.title}
                    </h3>
                    <Badge variant={al.severity === 'CRITICAL' || al.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {al.severity}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">{al.message}</p>

                  {latestVital && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>BP: <strong className="text-slate-800">{latestVital.systolicBp}/{latestVital.diastolicBp} mmHg</strong></span>
                      <span>HR: <strong className="text-slate-800">{latestVital.heartRate} bpm</strong></span>
                      <span>SpO2: <strong className="text-slate-800">{latestVital.spO2}%</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {al.status === 'ACTIVE' ? (
                  <Button variant="teal" size="sm" onClick={() => handleAcknowledge(al.id)}>
                    Acknowledge Alert
                  </Button>
                ) : (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3" /> Acknowledged
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/doctor/patient-reports'}>
                  Open Chart
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
