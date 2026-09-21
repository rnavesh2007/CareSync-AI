import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import {
  ClipboardList,
  PhoneCall,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Plus,
  SkipForward,
  XCircle,
  AlertTriangle,
  Building2,
  Clock,
  Shield,
} from 'lucide-react';

export const DoctorQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentToken, setCurrentToken] = useState<string>('A121');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // Add form
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDept, setSelectedDept] = useState('General Medicine');
  const [suggestedPriority, setSuggestedPriority] = useState('NORMAL');
  const [priorityOverrideReason, setPriorityOverrideReason] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue?department=General Medicine');
      setQueue(res.data.queueEntries || []);
      setCurrentToken(res.data.currentToken || 'A121');
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/doctor/patients');
      setPatients(res.data.patients || []);
      if (res.data.patients?.length > 0) {
        setSelectedPatientId(res.data.patients[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchPatients();
  }, []);

  // Actions
  const handleCallNext = async () => {
    try {
      const res = await api.post('/queue/call-next', { department: 'General Medicine' });
      showToast(res.data.message || 'Called next patient!');
      fetchQueue();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to call next token.');
    }
  };

  const handleSkip = async (id: string) => {
    try {
      const res = await api.post(`/queue/${id}/skip`);
      showToast(res.data.message);
      fetchQueue();
    } catch (err) {
      showToast('Failed to skip token.');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await api.post(`/queue/${id}/complete`);
      showToast(res.data.message);
      fetchQueue();
    } catch (err) {
      showToast('Failed to complete consultation.');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await api.post(`/queue/${id}/cancel`);
      showToast(res.data.message);
      fetchQueue();
    } catch (err) {
      showToast('Failed to cancel token.');
    }
  };

  const handleChangePriority = async () => {
    if (!selectedEntry) return;
    try {
      const res = await api.patch(`/queue/${selectedEntry.id}/priority`, {
        priority: suggestedPriority,
        overrideReason: priorityOverrideReason,
      });
      showToast(res.data.message);
      setShowPriorityModal(false);
      fetchQueue();
    } catch (err) {
      showToast('Failed to change priority.');
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/queue/token', {
        patientId: selectedPatientId,
        department: selectedDept,
        priority: suggestedPriority,
      });
      showToast(res.data.message);
      setShowAddModal(false);
      fetchQueue();
    } catch (err) {
      showToast('Failed to add patient to queue.');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital • General Medicine OPD
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            Outpatient Queue Controller & Triage Terminal
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch tokens, advance queue, manage priority tiers, and synchronize waiting room announcements.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchQueue} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Patient
          </Button>

          <Button variant="primary" size="sm" onClick={handleCallNext} icon={<PhoneCall className="w-4 h-4" />}>
            Call Next Patient
          </Button>
        </div>
      </div>

      {/* Current Calling Status */}
      <Card className="p-4 bg-teal-50/50 border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-mono font-extrabold text-xl flex items-center justify-center shadow-sm">
            {currentToken}
          </div>
          <div>
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              Currently Inside Room 104
            </span>
            <p className="text-xs text-slate-600">
              Consultation ongoing. Next in sequence will be dispatched upon calling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span>Active in waiting room: <strong>{queue.filter((q) => q.status === 'WAITING').length}</strong> patients</span>
        </div>
      </Card>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queue.map((q) => (
          <Card key={q.id} hoverable className="p-5 flex flex-col justify-between border-slate-200/80">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-800 font-extrabold text-lg flex items-center justify-center font-mono">
                  {q.tokenNumber}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      q.status === 'IN_CONSULTATION'
                        ? 'success'
                        : q.status === 'CALLED'
                        ? 'warning'
                        : q.status === 'COMPLETED'
                        ? 'slate'
                        : 'info'
                    }
                  >
                    {q.status}
                  </Badge>

                  <Badge
                    variant={
                      q.priority === 'EMERGENCY'
                        ? 'danger'
                        : q.priority === 'HIGH_PRIORITY'
                        ? 'warning'
                        : 'slate'
                    }
                  >
                    {q.priority}
                  </Badge>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {q.patient?.user?.firstName} {q.patient?.user?.lastName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dept: <strong>{q.department}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Est. Wait: <strong>{q.estimatedWaitTime} min</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons: Call Next, Skip, Complete, Cancel, Change Priority */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1">
                {q.status === 'WAITING' && (
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleCallNext()}
                    icon={<PhoneCall className="w-3.5 h-3.5" />}
                  >
                    Admit
                  </Button>
                )}

                {q.status === 'IN_CONSULTATION' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleComplete(q.id)}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Complete
                  </Button>
                )}

                {q.status === 'WAITING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkip(q.id)}
                    icon={<SkipForward className="w-3.5 h-3.5 text-amber-600" />}
                  >
                    Skip
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedEntry(q);
                    setSuggestedPriority(q.priority);
                    setShowPriorityModal(true);
                  }}
                  title="Change Priority Tier"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Priority
                </button>

                {q.status !== 'COMPLETED' && q.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(q.id)}
                    title="Cancel Token"
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CHANGE PRIORITY MODAL */}
      {showPriorityModal && selectedEntry && (
        <Modal isOpen={showPriorityModal} onClose={() => setShowPriorityModal(false)} size="sm" title="Change Token Priority Tier">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">Token:</span>
              <strong className="text-slate-900 text-sm">{selectedEntry.tokenNumber} — {selectedEntry.patient?.user?.firstName} {selectedEntry.patient?.user?.lastName}</strong>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Priority Tier</label>
              <select
                value={suggestedPriority}
                onChange={(e) => setSuggestedPriority(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="NORMAL">Normal (Standard sequential queue)</option>
                <option value="HIGH_PRIORITY">High Priority (Urgent consultation / Elderly flag)</option>
                <option value="EMERGENCY">Emergency (Immediate physician admission)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Override Reason</label>
              <input
                type="text"
                value={priorityOverrideReason}
                onChange={(e) => setPriorityOverrideReason(e.target.value)}
                placeholder="e.g. Elevated BP triage alert, acute distress..."
                className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowPriorityModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleChangePriority}>Confirm Priority</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD PATIENT TO QUEUE MODAL */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} size="sm" title="Add Patient to Queue">
          <form onSubmit={handleAddPatient} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.firstName} {p.user?.lastName} ({p.bloodGroup || 'B+'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="General Medicine">General Medicine (OPD Room 104)</option>
                <option value="Cardiology">Cardiology (Suite 302)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Priority</label>
              <select
                value={suggestedPriority}
                onChange={(e) => setSuggestedPriority(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH_PRIORITY">High Priority</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit">Issue Token</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorQueuePage;
