import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { VitalTrendsChart } from '../../components/dashboard/VitalTrendsChart.js';
import { WellnessTrendsChart } from '../../components/dashboard/WellnessTrendsChart.js';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldCheck,
  Clock,
  Calendar,
  FileText,
  Bot,
  Pill,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/patient/dashboard');
        setData(res.data);
        setMedications(res.data.medicationReminders || []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const vitals = data?.latestVitals || {
    heartRate: 72,
    systolicBp: 118,
    diastolicBp: 76,
    temperature: 98.4,
    spO2: 99,
  };

  const queue = data?.queueStatus;
  const appointment = data?.upcomingAppointment;

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Risk Screening Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-brand-50 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>CareSync Connected Health AI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {data?.welcomeMessage || 'Welcome back to your CareSync Portal'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-brand-100/90 leading-relaxed">
              Real-time telemetry reports all physiological baselines are optimal. Your next scheduled clinical review is with Dr. Marcus Vance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center sm:text-left min-w-40">
              <span className="text-[11px] font-medium text-brand-200 uppercase tracking-wider block">
                Risk Screening
              </span>
              <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-base font-bold text-white">Low Risk</span>
              </div>
              <span className="text-[10px] text-brand-200 block mt-0.5">Assessed 5d ago</span>
            </div>

            <Button
              variant="teal"
              size="md"
              onClick={() => navigate('/patient/assistant')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold shadow-md"
            >
              <Bot className="w-4 h-4 mr-1.5 text-slate-900" />
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Six Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Heart Rate */}
        <StatCard
          title="Heart Rate"
          value={vitals.heartRate}
          unit="bpm"
          statusText="Optimal"
          statusVariant="success"
          icon={<Heart className="w-5 h-5 text-rose-500" />}
          iconBgColor="bg-rose-50"
          subtext="Normal: 60-100"
        />

        {/* Blood Pressure */}
        <StatCard
          title="Blood Pressure"
          value={`${vitals.systolicBp}/${vitals.diastolicBp}`}
          unit="mmHg"
          statusText="Normal"
          statusVariant="success"
          icon={<Activity className="w-5 h-5 text-brand-600" />}
          iconBgColor="bg-brand-50"
          subtext="Target: <120/80"
        />

        {/* Temperature */}
        <StatCard
          title="Temperature"
          value={vitals.temperature}
          unit="°F"
          statusText="Normal"
          statusVariant="success"
          icon={<Thermometer className="w-5 h-5 text-amber-500" />}
          iconBgColor="bg-amber-50"
          subtext="Normal: 97.8-99.1"
        />

        {/* SpO2 */}
        <StatCard
          title="Oxygen (SpO2)"
          value={vitals.spO2}
          unit="%"
          statusText="Optimal"
          statusVariant="success"
          icon={<Wind className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
          subtext="Normal: >95%"
        />

        {/* Risk Level */}
        <StatCard
          title="Risk Level"
          value={data?.riskScreening?.level || 'LOW'}
          statusText="Safe Baseline"
          statusVariant="success"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          subtext="AI Bio-markers"
        />

        {/* Queue Status */}
        <StatCard
          title="Queue Token"
          value={queue ? queue.tokenNumber : 'None'}
          statusText={queue ? `${queue.estimatedWaitTime}m wait` : 'No Token'}
          statusVariant={queue ? 'brand' : 'slate'}
          icon={<Clock className="w-5 h-5 text-brand-600" />}
          iconBgColor="bg-brand-50"
          subtext={queue ? queue.department : 'Walk-in Ready'}
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalTrendsChart data={data?.vitalTrends || []} />
        <WellnessTrendsChart data={data?.wellnessTrends || []} />
      </div>

      {/* 4. Action Widgets Grid: Upcoming Appointment, Queue Status, Medication, Recent Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Appointment */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold text-slate-800">Upcoming Visit</span>
              </div>
              <Badge variant="brand" size="sm">Confirmed</Badge>
            </div>

            {appointment ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-slate-900">
                  Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                </p>
                <p className="text-xs text-brand-600 font-medium">
                  {appointment.doctor?.specialization || 'Cardiology Specialist'}
                </p>
                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <p>📅 {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {appointment.timeSlot}</p>
                  <p>📍 {appointment.doctor?.roomNumber || 'Consultation Room 302'}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No appointments scheduled.
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/appointments')}
            className="w-full mt-4"
          >
            Manage Visits
          </Button>
        </Card>

        {/* Hospital Queue Token Status */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-slate-800">Live Hospital Queue</span>
              </div>
              <Badge variant="teal" size="sm" dot>Live Sync</Badge>
            </div>

            {queue ? (
              <div className="mt-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-700 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-soft-sm">
                  {queue.tokenNumber}
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-2">
                  {queue.department} Department
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Est. Consultation in <strong className="text-teal-700">{queue.estimatedWaitTime} mins</strong>
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                You do not have an active queue token.
              </div>
            )}
          </div>

          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/patient/queue')}
            className="w-full mt-4"
          >
            View Live Queue
          </Button>
        </Card>

        {/* Medication Reminders */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold text-slate-800">Medication Reminders</span>
              </div>
              <span className="text-[11px] font-semibold text-brand-600">Today</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => toggleMedication(med.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    med.taken
                      ? 'bg-slate-50/80 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-brand-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{med.medicationName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{med.timing}</p>
                  </div>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      med.taken ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/my-health')}
            className="w-full mt-4"
          >
            Full Prescription List
          </Button>
        </Card>

        {/* Recent Reports */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-semibold text-slate-800">Recent Reports</span>
              </div>
              <Badge variant="brand" size="sm">{data?.recentReports?.length || 0} Files</Badge>
            </div>

            <div className="mt-3 space-y-2">
              {data?.recentReports?.slice(0, 3).map((rep: any) => (
                <div
                  key={rep.id}
                  onClick={() => navigate('/patient/reports')}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                      {rep.reportType}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rep.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate mt-1">
                    {rep.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/reports')}
            className="w-full mt-4"
          >
            Browse All Reports <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Card>
      </div>
    </div>
  );
};
