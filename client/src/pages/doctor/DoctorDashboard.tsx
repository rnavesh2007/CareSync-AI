import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import {
  Stethoscope,
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Building2,
  ArrowRightLeft,
  FileCheck,
  Shield,
  Eye,
  Plus,
} from 'lucide-react';
import { Patient360Modal } from '../../components/Patient360Modal.js';
import { AIPatientReportModal } from '../../components/AIPatientReportModal.js';
import { TransferModal } from '../../components/TransferModal.js';
import { AIPatientReport } from '../../types/index.js';

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [aiReports, setAiReports] = useState<AIPatientReport[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);

  // 360 Modal State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [show360Modal, setShow360Modal] = useState(false);

  // AI Patient Report Modal State
  const [selectedAIReport, setSelectedAIReport] = useState<AIPatientReport | null>(null);
  const [showAIReportModal, setShowAIReportModal] = useState(false);

  // Transfer Modal State
  const [transferPatientId, setTransferPatientId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [dashRes, repRes, aiRepRes, transRes] = await Promise.all([
        api.get('/doctor/dashboard'),
        api.get('/reports'),
        api.get('/ai/patient-report'),
        api.get('/transfers'),
      ]);

      setData(dashRes.data);
      setReports(repRes.data.reports || []);
      setAiReports(aiRepRes.data.reports || []);
      setTransfers(transRes.data.transfers || []);
    } catch (err) {
      console.error('Error fetching doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCallNext = async (queueId: string) => {
    try {
      await api.patch(`/queue/${queueId}`, { status: 'IN_CONSULTATION' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating queue:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const doctor = data?.doctor;
  const metrics = data?.metrics || {};
  const appointments = data?.appointments || [];
  const queueEntries = data?.queueEntries || [];
  const alerts = data?.alerts || [];

  // Metrics required by prompt:
  // Today's Patients, Waiting Patients, High Priority Patients, Emergency Alerts, New Reports, AI Reports Awaiting Review, Pending Transfers
  const waitingPatientsCount = queueEntries.filter((q: any) => q.status === 'WAITING').length;
  const highPriorityCount = queueEntries.filter((q: any) => q.priority === 'HIGH_PRIORITY' || q.priority === 'EMERGENCY').length;
  const emergencyAlertsCount = alerts.filter((a: any) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;
  const newReportsCount = reports.length;
  const aiAwaitingReviewCount = aiReports.filter((r) => r.status === 'AWAITING_REVIEW').length;
  const pendingTransfersCount = transfers.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-teal-100 mb-3 border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-teal-300" />
              <span>CareSync Multispeciality Hospital, Chennai • OPD Block 2</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Good morning, {doctor?.name || 'Dr. Priya Sharma'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-xl">
              Specialization: <strong>General Medicine</strong>. You have {metrics.todayAppointmentsCount || 2} scheduled consultations, {waitingPatientsCount} waiting patients, and {aiAwaitingReviewCount} AI reports awaiting review.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="teal"
              size="md"
              onClick={() => navigate('/doctor/queue')}
              className="bg-white text-teal-800 hover:bg-teal-50 font-semibold shadow-md"
            >
              <Clock className="w-4 h-4 mr-1.5 text-teal-700" />
              Launch Queue Terminal
            </Button>
          </div>
        </div>
      </div>

      {/* 7 Required Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">Today's Patients</span>
          <span className="text-lg font-bold text-slate-900">{metrics.todayAppointmentsCount || 2}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">Waiting Patients</span>
          <span className="text-lg font-bold text-brand-600">{waitingPatientsCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">High Priority</span>
          <span className="text-lg font-bold text-amber-600">{highPriorityCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">Emergency Alerts</span>
          <span className="text-lg font-bold text-rose-600">{emergencyAlertsCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">New Reports</span>
          <span className="text-lg font-bold text-indigo-600">{newReportsCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">Awaiting Review</span>
          <span className="text-lg font-bold text-purple-600">{aiAwaitingReviewCount}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">Pending Transfers</span>
          <span className="text-lg font-bold text-teal-600">{pendingTransfersCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's OPD Patients with 360 Action Buttons */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Active OPD Consultations & Today's Schedule
                </h3>
              </div>
              <Badge variant="info">OPD Room 104</Badge>
            </div>

            <div className="space-y-3">
              {appointments.map((apt: any) => {
                const patient = apt.patient;
                const user = patient?.user;
                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs">
                        {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'K'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {user?.firstName} {user?.lastName}
                          </h4>
                          <Badge variant="warning">{patient?.bloodGroup || 'B+'}</Badge>
                          <Badge variant={patient?.riskLevel === 'HIGH' ? 'danger' : 'info'}>
                            {patient?.riskLevel || 'MODERATE'} RISK
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {apt.timeSlot} • {apt.reason || 'Routine follow-up'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Doctor Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setShow360Modal(true);
                        }}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        360° View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTransferPatientId(patient.id);
                          setShowTransferModal(true);
                        }}
                        icon={<ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        Transfer
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const existing = aiReports.find((r) => r.patientId === patient.id);
                          if (existing) {
                            setSelectedAIReport(existing);
                            setShowAIReportModal(true);
                          } else {
                            setSelectedPatientId(patient.id);
                            setShow360Modal(true);
                          }
                        }}
                        icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                      >
                        AI Report
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Reports Awaiting Review Section */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Consolidated AI Patient Reports Awaiting Review ({aiReports.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {aiReports.map((rep) => (
                <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-xs">{rep.reportTitle}</h4>
                      <Badge variant={rep.status === 'FINALIZED' ? 'success' : 'warning'}>
                        {rep.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chief Complaint: {rep.chiefComplaint || 'Metabolic checkup'} • Reviewer: {rep.finalizedBy || 'Dr. Priya Sharma'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAIReport(rep);
                      setShowAIReportModal(true);
                    }}
                  >
                    Review & Finalize
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Live Queue & Clinical Alerts */}
        <div className="space-y-4">
          {/* Live Queue Station */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Live Queue Station
                </h4>
              </div>
              <Badge variant="teal">Current: A121</Badge>
            </div>

            <div className="space-y-2">
              {queueEntries.slice(0, 4).map((q: any) => (
                <div key={q.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-xs">Token #{q.tokenNumber}</span>
                    <p className="text-[10px] text-slate-500">{q.patient?.user?.firstName} {q.patient?.user?.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={q.status === 'IN_CONSULTATION' ? 'success' : 'warning'}>
                      {q.status}
                    </Badge>
                    {q.status === 'WAITING' && (
                      <Button variant="outline" size="sm" onClick={() => handleCallNext(q.id)}>
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/doctor/queue')} className="w-full">
                View Full Queue ({queueEntries.length} patients)
              </Button>
            </div>
          </Card>

          {/* Emergency Clinical Alerts */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Emergency & Clinical Alerts
                </h4>
              </div>
              <Badge variant="danger">{alerts.length} Active</Badge>
            </div>

            <div className="space-y-2">
              {alerts.map((a: any) => (
                <div key={a.id} className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{a.title}</span>
                    <Badge variant="danger">{a.severity}</Badge>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1">{a.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 360 Degree Patient Modal */}
      {show360Modal && selectedPatientId && (
        <Patient360Modal
          isOpen={show360Modal}
          onClose={() => setShow360Modal(false)}
          patientId={selectedPatientId}
        />
      )}

      {/* 19-Section Consolidated AI Patient Report Modal */}
      {showAIReportModal && selectedAIReport && (
        <AIPatientReportModal
          isOpen={showAIReportModal}
          onClose={() => setShowAIReportModal(false)}
          report={selectedAIReport}
          isDoctor={true}
          onReportUpdated={(updated) => {
            setSelectedAIReport(updated);
            fetchDashboardData();
          }}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          patientId={transferPatientId || undefined}
          defaultReceiverRole="SPECIALIST"
          onTransferCompleted={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
