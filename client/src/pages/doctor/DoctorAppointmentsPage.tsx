import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Calendar, Clock, Video, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Physician Consultation Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Manage outpatient appointment queues, telehealth links, and consultation outcomes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((a) => (
          <Card key={a.id} hoverable className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <Badge variant={a.status === 'SCHEDULED' ? 'brand' : a.status === 'COMPLETED' ? 'success' : 'slate'} size="sm">
                  {a.status}
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                  {a.type === 'VIDEO_CONSULT' ? <Video className="w-3.5 h-3.5 text-teal-600" /> : <MapPin className="w-3.5 h-3.5 text-brand-600" />}
                  {a.type.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <img
                  src={a.patient?.user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                  </h3>
                  <p className="text-xs text-brand-600 font-medium">{a.timeSlot}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <p><strong>Clinical Reason:</strong> {a.reason || 'General Follow-up'}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {a.status === 'SCHEDULED' && (
                <>
                  <Button variant="teal" size="sm" onClick={() => handleStatus(a.id, 'IN_PROGRESS')}>
                    Begin Visit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleStatus(a.id, 'COMPLETED')}>
                    Mark Done
                  </Button>
                </>
              )}
              {a.status === 'IN_PROGRESS' && (
                <Button variant="teal" size="sm" onClick={() => handleStatus(a.id, 'COMPLETED')}>
                  Conclude & Sign
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
