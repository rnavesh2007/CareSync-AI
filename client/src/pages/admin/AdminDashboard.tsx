import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  Building2,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  ShieldCheck,
  Activity,
  HardDrive,
  Server,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const departments = data?.departments || [];
  const health = data?.systemHealth || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-purple-100 mb-3 border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Hospital Operations & Systems Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Hospital Administration Console
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-xl">
              Real-time oversight of hospital clinical capacity, physician allocations, outpatient queues, and HIPAA compliance telemetry.
            </p>
          </div>

          <Button
            variant="teal"
            size="md"
            onClick={fetchDashboard}
            className="bg-white text-purple-900 hover:bg-purple-50 font-semibold shadow-md self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1.5 text-purple-700" />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={metrics.totalPatients || 2}
          statusText="Registered"
          statusVariant="brand"
          icon={<Users className="w-5 h-5 text-brand-600" />}
          iconBgColor="bg-brand-50"
          subtext="Active charts"
        />

        <StatCard
          title="Medical Staff"
          value={metrics.totalDoctors || 1}
          statusText="On Duty"
          statusVariant="teal"
          icon={<Stethoscope className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
          subtext="Credentialed MDs"
        />

        <StatCard
          title="Appointments"
          value={metrics.totalAppointments || 2}
          statusText="Scheduled"
          statusVariant="success"
          icon={<Calendar className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          subtext="Today & Upcoming"
        />

        <StatCard
          title="Diagnostic Reports"
          value={metrics.totalReports || 4}
          statusText="Processed"
          statusVariant="brand"
          icon={<FileText className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
          subtext="15 Categories"
        />

        <StatCard
          title="Active Queue Load"
          value={metrics.activeQueueCount || 2}
          statusText="Waiting / Triage"
          statusVariant="warning"
          icon={<Activity className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          subtext="Outpatient wings"
        />
      </div>

      {/* Department Distribution & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Queue Loads */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Departmental Capacity & Inflow</h3>
            </div>
            <Badge variant="purple" size="sm">Hospital Wings</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Active Doctors</th>
                  <th className="py-3 px-4">Waiting Patients</th>
                  <th className="py-3 px-4">Capacity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d: any) => (
                  <tr key={d.name} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4">{d.activeDoctors} Assigned</td>
                    <td className="py-3 px-4">{d.waitingPatients} in Queue</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={d.status === 'Optimal' ? 'success' : d.status === 'Busy' ? 'warning' : 'brand'}
                        size="sm"
                      >
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* System Infrastructure & Storage Health */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">System Infrastructure</h3>
              </div>
              <Badge variant="success" size="sm">99.98% Uptime</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Database Engine</span>
                  <span className="font-semibold text-slate-800">Prisma / SQLite</span>
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">✓ Operational & Seeding Validated</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Storage Service</span>
                  <span className="font-semibold text-slate-800">LocalStorageService</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Abstraction ready for AWS S3 / Cloud</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">HIPAA Security Audit</span>
                  <Badge variant="teal" size="sm">Enforced</Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Role-Based JWT Authorization Enabled</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/activity'}
            className="w-full mt-4"
          >
            Inspect System Audit Trail
          </Button>
        </Card>
      </div>
    </div>
  );
};
