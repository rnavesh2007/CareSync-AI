import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  Clock,
  Users,
  CheckCircle2,
  RefreshCw,
  Building2,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const HospitalQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue?department=General Medicine');
      setQueueData(res.data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Live polling ticker every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const queueEntries = queueData?.queueEntries || [];
  const currentToken = queueData?.currentToken || 'A121';
  const patientEntry = queueData?.patientEntry;
  const patientToken = patientEntry ? patientEntry.tokenNumber : 'A127';
  const patientPosition = queueData?.patientPosition || 6;
  const estimatedWait = queueData?.estimatedWaitTime || 18;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital, Chennai
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Smart Hospital Queue — General Medicine OPD
          </h1>
          <p className="text-xs text-slate-500">
            Real-time outpatient token dispatch, estimated wait intervals, and waiting room tracker.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQueue} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh Ticker
        </Button>
      </div>

      {/* Main Required Example Banner */}
      {/*
        Hospital: CareSync Multispeciality Hospital
        Department: General Medicine
        Current Token: A121
        Patient Token: A127
        Position: 6
        Estimated Wait: 18 minutes
      */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 bg-gradient-to-br from-teal-700 via-teal-800 to-brand-800 text-white p-6 sm:p-8 rounded-3xl shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 block">
                CareSync Multispeciality Hospital • General Medicine OPD
              </span>
              <div className="mt-3 flex items-baseline gap-4 flex-wrap">
                <div>
                  <span className="text-xs text-teal-200 block">Your Token</span>
                  <span className="text-5xl font-extrabold tracking-tight">{patientToken}</span>
                </div>
                <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
                <div>
                  <span className="text-xs text-teal-200 block">Now Calling</span>
                  <span className="text-4xl font-extrabold text-amber-300">{currentToken}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  Position in Queue: #{patientPosition}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  Category: Normal
                </span>
              </div>

              <p className="mt-3 text-xs text-teal-100 max-w-md leading-relaxed">
                Please proceed to <strong>OPD Block 2, Room 104</strong> (Dr. Priya Sharma) when token #{patientToken} is called on the audio-visual broadcast.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-44 flex flex-col justify-center">
              <span className="text-[11px] text-teal-200 uppercase tracking-wider block font-semibold">
                Estimated Wait
              </span>
              <span className="text-4xl font-extrabold text-white block mt-1">
                {estimatedWait} <span className="text-base font-normal">mins</span>
              </span>
              <span className="text-[11px] text-teal-200 block mt-1">
                ~3 mins per consultation
              </span>
            </div>
          </div>
        </Card>

        {/* Priority Legend Card */}
        <Card className="p-5 flex flex-col justify-between border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Triage Priority Categories
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span>Emergency</span>
                  <Badge variant="danger">Immediate</Badge>
                </div>
                <p className="text-[10px] text-rose-700 mt-0.5">Direct triage admission</p>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>High Priority</span>
                  <Badge variant="warning">Priority</Badge>
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">High risk score / Elderly flag</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Normal</span>
                  <Badge variant="info">Sequential</Badge>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5">Standard arrival order</p>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-400 text-center">
            Staff/physician can override priority based on clinical evaluation.
          </div>
        </Card>
      </div>

      {/* Live General Medicine Token Ticker */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              General Medicine OPD Live Token Board
            </h3>
          </div>
          <Badge variant="teal" dot>Live Telemetry</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-3">Token #</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Priority Category</th>
                <th className="p-3">Est. Wait</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueEntries.map((q: any) => {
                const isMyToken = q.tokenNumber === patientToken;
                return (
                  <tr key={q.id} className={`transition-colors ${isMyToken ? 'bg-brand-50/70 font-semibold' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      #{q.tokenNumber} {isMyToken && <span className="text-brand-700 text-[10px]">(You)</span>}
                    </td>
                    <td className="p-3 text-slate-800">
                      {q.patient?.user?.firstName} {q.patient?.user?.lastName}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          q.priority === 'EMERGENCY'
                            ? 'danger'
                            : q.priority === 'HIGH_PRIORITY'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {q.priority.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-600">
                      {q.status === 'IN_CONSULTATION' ? 'Inside Room' : `${q.estimatedWaitTime} mins`}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          q.status === 'IN_CONSULTATION'
                            ? 'success'
                            : q.status === 'CALLED'
                            ? 'warning'
                            : 'slate'
                        }
                      >
                        {q.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default HospitalQueuePage;
