import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { ShieldCheck, Clock, Terminal, AlertTriangle, CheckCircle2, User } from 'lucide-react';

export const SystemActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activity').then((res) => {
      setActivities(res.data.activities || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'WARNING':
        return 'warning';
      case 'SUCCESS':
        return 'success';
      case 'DANGER':
        return 'danger';
      case 'INFO':
      default:
        return 'brand';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          System Activity & HIPAA Audit Log Trail
        </h1>
        <p className="text-xs text-slate-500">
          Immutable event log tracing physician authentications, report creations, queue dispatches, and security checks.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Event Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Audit Description</th>
                <th className="py-3.5 px-4">Origin / IP</th>
                <th className="py-3.5 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-sans">
                    {new Date(a.timestamp).toLocaleTimeString()} ({new Date(a.timestamp).toLocaleDateString()})
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {a.eventType}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-xs text-slate-700">
                    {a.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{a.ipAddress}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={getSeverityBadge(a.severity)} size="sm">
                      {a.severity}
                    </Badge>
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
