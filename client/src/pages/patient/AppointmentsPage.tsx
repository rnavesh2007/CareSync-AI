import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Calendar, Clock, Plus, Video, MapPin, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [type, setType] = useState('IN_PERSON');
  const [reason, setReason] = useState('');
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Fetch doctors for booking
    api.get('/admin/doctors').then((res) => {
      setDoctorsList(res.data.doctors || []);
      if (res.data.doctors?.length > 0) {
        setDoctorId(res.data.doctors[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', {
        doctorId,
        appointmentDate: date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeSlot,
        type,
        reason,
      });
      setShowModal(false);
      setReason('');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to book appointment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Clinical Consultations & Appointments
          </h1>
          <p className="text-xs text-slate-500">
            Manage in-person clinic visits, telemetry follow-ups, and specialized doctor sessions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Book Consultation
        </Button>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="py-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No scheduled appointments</p>
            <p className="text-xs mt-1">Book your next consultation with our clinical specialists.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((a) => (
              <Card key={a.id} hoverable className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant={a.status === 'SCHEDULED' ? 'brand' : 'teal'} size="sm">
                      {a.status}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                      {a.type === 'VIDEO_CONSULT' ? <Video className="w-3.5 h-3.5 text-teal-600" /> : <MapPin className="w-3.5 h-3.5 text-brand-600" />}
                      {a.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <img
                      src={a.doctor?.user?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}
                      </h3>
                      <p className="text-xs text-brand-600 font-medium">
                        {a.doctor?.specialization || 'Clinical Specialist'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {a.doctor?.department} • Room {a.doctor?.roomNumber || '302'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">
                        {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {a.timeSlot}
                      </span>
                    </div>
                    {a.reason && (
                      <p className="text-[11px] text-slate-500 pl-5.5">
                        Note: {a.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Schedule Clinical Consultation"
        subtitle="Select a physician specialist and preferred slot."
      >
        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Physician</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            >
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization} ({d.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:45 AM">11:45 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Consultation Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('IN_PERSON')}
                className={`p-2 rounded-xl border text-center font-medium ${
                  type === 'IN_PERSON' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-50 text-slate-600'
                }`}
              >
                In-Person Visit
              </button>
              <button
                type="button"
                onClick={() => setType('VIDEO_CONSULT')}
                className={`p-2 rounded-xl border text-center font-medium ${
                  type === 'VIDEO_CONSULT' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-50 text-slate-600'
                }`}
              >
                Telehealth Video
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reason for Visit</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up regarding blood pressure or routine lab review..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
