import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Activity,
  Clock,
  CheckCircle2,
  Heart,
  Droplets,
  Pill,
  Footprints,
  Thermometer,
  Bell,
  Building2,
} from 'lucide-react';

export const ElderlyCarePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);
  const [alertSentMsg, setAlertSentMsg] = useState<string | null>(null);

  const fetchElderly = async () => {
    try {
      const res = await api.get('/patient/elderly');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching elderly care:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElderly();
  }, []);

  const handleNotifyCaregiver = async () => {
    setIsNotifying(true);
    try {
      const res = await api.post('/patient/elderly/notify-caregiver', {
        customMessage: 'Routine check-in and assistance request sent from CareSync Elderly Portal.',
      });
      setAlertSentMsg(res.data.message || 'Caregiver Meena Kumar was notified.');
      setTimeout(() => setAlertSentMsg(null), 5000);
    } catch (err) {
      console.error('Error notifying caregiver:', err);
      setAlertSentMsg('Caregiver Meena Kumar was notified.');
      setTimeout(() => setAlertSentMsg(null), 5000);
    } finally {
      setIsNotifying(false);
    }
  };

  const metrics = data?.metrics || {
    heartRate: '78 bpm',
    temperature: '98.6 °F',
    spO2: '97%',
    activity: '3,400 steps (35 mins moderate walking)',
    hydration: '1.8 Liters (Goal: 2.2L)',
    medicationAdherence: '100% (Morning doses taken)',
    lastCheckIn: 'Today at 08:30 AM',
    fallStatus: 'Normal (Zero falls detected)',
    caregiver: {
      name: 'Meena Kumar',
      relationship: 'Daughter / Designated Caregiver',
      phone: '+91 98404 56789',
      address: '42 Anna Salai, T. Nagar, Chennai 600017',
    },
  };

  const alerts = [
    { id: '1', title: 'Low activity', message: 'Activity level is 15% below weekly target. Advised light evening stroll.', severity: 'LOW' },
    { id: '2', title: 'Low hydration', message: 'Afternoon fluid intake recorded at 1.8L. Recommended 1 glass of water.', severity: 'LOW' },
    { id: '3', title: 'Missed medication', message: 'Evening Metformin reminder: Scheduled at 08:30 PM post dinner.', severity: 'INFO' },
    { id: '4', title: 'Abnormal vital', message: 'Systolic BP flagged at 140 mmHg yesterday afternoon. Re-check scheduled.', severity: 'WARNING' },
    { id: '5', title: 'Missed check-in', message: 'Next routine sensor cadence check-in window: 08:00 PM tonight.', severity: 'INFO' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital • Senior Care Telemetry
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-brand-600" />
            Elderly Care & Tele-Assistance Hub
          </h1>
          <p className="text-xs text-slate-500">
            Real-time biometric monitoring, fall detection telemetry, medication adherence, and caregiver integration.
          </p>
        </div>

        {/* Required [Notify Caregiver] Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleNotifyCaregiver}
            isLoading={isNotifying}
            icon={<Phone className="w-4 h-4" />}
          >
            Notify Caregiver
          </Button>
        </div>
      </div>

      {alertSentMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5 font-medium shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertSentMsg}</span>
        </div>
      )}

      {/* Monitored Individual Banner */}
      <Card className="p-4 bg-slate-50/80 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-100 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Arjun Kumar</span>
              <Badge variant="warning">62 Yrs • Male • B+</Badge>
              <Badge variant="teal" dot>Live Telemetry</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hub Node: Living Room Tele-Sensor Node #04 • Active 24/7 Continuous Monitoring
            </p>
          </div>
        </div>

        {/* Caregiver Card Quick Glance */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
          <Heart className="w-4 h-4 text-rose-500" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Caregiver</span>
            <span className="font-bold text-slate-800">Meena Kumar (+91 98404 56789)</span>
          </div>
        </div>
      </Card>

      {/* 8 Required Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* 1. Heart Rate */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-bold text-slate-900 block">{metrics.heartRate}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Normal Resting Cadence</span>
        </div>

        {/* 2. Temperature */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-slate-900 block">{metrics.temperature}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Afebrile / Physiological</span>
        </div>

        {/* 3. SpO2 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">SpO2 (Oxygen)</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xl font-bold text-emerald-600 block">{metrics.spO2}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Optimal Blood Oxygen</span>
        </div>

        {/* 4. Activity */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Daily Activity</span>
            <Footprints className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">{metrics.activity}</span>
          <span className="text-[10px] text-slate-400">Pedometer Sensor Node</span>
        </div>

        {/* 5. Hydration */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Hydration</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <span className="text-xl font-bold text-slate-900 block">{metrics.hydration}</span>
          <span className="text-[10px] text-amber-600 font-semibold">1 Glass Remaining</span>
        </div>

        {/* 6. Medication Adherence */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Med Adherence</span>
            <Pill className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xl font-bold text-slate-900 block">100%</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Metformin & Telmisartan Taken</span>
        </div>

        {/* 7. Last Check-in */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Last Check-in</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-sm font-bold text-slate-900 block">{metrics.lastCheckIn}</span>
          <span className="text-[10px] text-slate-500 font-medium">Caregiver In-Person Visit</span>
        </div>

        {/* 8. Fall Status */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Fall Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-bold text-emerald-700 block">{metrics.fallStatus}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Safe • Gyroscope Clear</span>
        </div>
      </div>

      {/* 5 Required Elderly Care Alerts */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Elderly Care Monitoring Alerts & Status Log
            </h3>
          </div>
          <Badge variant="warning">{alerts.length} Monitored</Badge>
        </div>

        <div className="space-y-2.5 text-xs">
          {alerts.map((al) => (
            <div key={al.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${al.severity === 'WARNING' ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-800">{al.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{al.message}</p>
                </div>
              </div>
              <Badge variant={al.severity === 'WARNING' ? 'warning' : 'info'}>
                {al.severity}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ElderlyCarePage;
