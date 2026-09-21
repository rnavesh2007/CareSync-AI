import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { ClipboardList, Plus, RefreshCw, Filter } from 'lucide-react';

export const AdminQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('ALL');

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue');
      setQueue(res.data.queueEntries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filtered = queue.filter(
    (q) => department === 'ALL' || q.department === department
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            Hospital-Wide Outpatient Queue Control
          </h1>
          <p className="text-xs text-slate-500">
            Real-time multi-department outpatient token monitoring, throughput analysis, and override control.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQueue} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh Queue
        </Button>
      </div>

      <Card className="p-4 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-500 mr-2 shrink-0">Filter Department:</span>
        {['ALL', 'Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'].map((d) => (
          <button
            key={d}
            onClick={() => setDepartment(d)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              department === d ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Token #</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Wait Time</th>
                <th className="py-3.5 px-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                    {q.tokenNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {q.patient?.user?.firstName} {q.patient?.user?.lastName}
                  </td>
                  <td className="py-3.5 px-4">{q.department}</td>
                  <td className="py-3.5 px-4">
                    {q.doctor?.user ? `Dr. ${q.doctor.user.lastName}` : 'Triage Pool'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={q.status === 'IN_CONSULTATION' ? 'success' : q.status === 'CALLED' ? 'warning' : 'slate'}
                      size="sm"
                    >
                      {q.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">{q.estimatedWaitTime} mins</td>
                  <td className="py-3.5 px-4 font-semibold">
                    <span className={q.priority === 'URGENT' ? 'text-rose-600' : 'text-slate-600'}>
                      {q.priority}
                    </span>
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
