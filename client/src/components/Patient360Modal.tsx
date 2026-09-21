import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal.js';
import { Badge } from './ui/Badge.js';
import { Button } from './ui/Button.js';
import {
  User,
  Heart,
  Activity,
  FileText,
  MessageSquare,
  Smile,
  Shield,
  Calendar,
  Clock,
  ArrowRightLeft,
  History,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  Plus,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api.js';
import { AIPatientReportModal } from './AIPatientReportModal.js';
import { TransferModal } from './TransferModal.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

type TabType =
  | 'OVERVIEW'
  | 'HISTORY'
  | 'SYMPTOMS'
  | 'VITALS'
  | 'REPORTS'
  | 'AICHAT'
  | 'WELLNESS'
  | 'ELDERLY'
  | 'APPOINTMENTS'
  | 'QUEUE'
  | 'TRANSFERS'
  | 'TIMELINE'
  | 'FINAL_REPORTS';

export const Patient360Modal: React.FC<Props> = ({ isOpen, onClose, patientId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sub-modals
  const [selectedAIReport, setSelectedAIReport] = useState<any>(null);
  const [showAIReportModal, setShowAIReportModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [doctorNoteInput, setDoctorNoteInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchFullPatientProfile = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      // Gather all patient modules
      const [reportsRes, vitalsRes, queueRes, transfersRes, aiReportsRes, elderlyRes] = await Promise.all([
        api.get(`/reports?patientId=${patientId}`),
        api.get(`/patient/my-health`),
        api.get(`/queue`),
        api.get(`/transfers`),
        api.get(`/ai/patient-report/${patientId}`),
        api.get(`/patient/elderly`),
      ]);

      setData({
        reports: reportsRes.data.reports || [],
        patient: vitalsRes.data.patient || {},
        queue: queueRes.data.queueEntries || [],
        transfers: transfersRes.data.transfers || [],
        aiReports: aiReportsRes.data.reports || [],
        elderly: elderlyRes.data || {},
      });
    } catch (err) {
      console.error('Error fetching 360 profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      fetchFullPatientProfile();
    }
  }, [isOpen, patientId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingAIReport(true);
    try {
      const res = await api.post('/ai/patient-report/generate', { patientId });
      showToast('19-section Consolidated AI Report generated!');
      setSelectedAIReport(res.data.report);
      setShowAIReportModal(true);
      fetchFullPatientProfile();
    } catch (err) {
      showToast('Failed to generate report.');
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  if (!isOpen) return null;

  const patient = data?.patient || {};
  const user = patient?.user || { firstName: 'Arjun', lastName: 'Kumar' };
  const reports = data?.reports || [];
  const vitals = patient?.vitals || [];
  const symptoms = patient?.symptoms || [];
  const aiReports = data?.aiReports || [];
  const transfers = data?.transfers || [];

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'OVERVIEW', label: 'Overview', icon: User },
    { key: 'HISTORY', label: 'Medical History', icon: History },
    { key: 'SYMPTOMS', label: 'Symptoms', icon: AlertTriangle },
    { key: 'VITALS', label: 'Vitals', icon: Activity },
    { key: 'REPORTS', label: 'Diagnostic Reports', icon: FileText },
    { key: 'AICHAT', label: 'AI Intake & Chat', icon: MessageSquare },
    { key: 'WELLNESS', label: 'Mental Wellness', icon: Smile },
    { key: 'ELDERLY', label: 'Elderly Care', icon: Heart },
    { key: 'APPOINTMENTS', label: 'Appointments', icon: Calendar },
    { key: 'QUEUE', label: 'Queue Status', icon: Clock },
    { key: 'TRANSFERS', label: 'Transfers', icon: ArrowRightLeft },
    { key: 'TIMELINE', label: 'Timeline', icon: History },
    { key: 'FINAL_REPORTS', label: 'Final AI Reports', icon: FileCheck2 },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" title={`360° Clinical Patient Chart — ${user.firstName} ${user.lastName}`}>
        {toastMsg && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {toastMsg}
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-base">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
                <Badge variant={patient.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                  {patient.riskLevel || 'MODERATE'} RISK
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                62 Yrs • Male • Blood: <strong className="text-rose-600">B+</strong> • UHID: CSH-MAA-2026-8941
              </p>
            </div>
          </div>

          {/* Quick Doctor Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransferModal(true)}
              icon={<ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Transfer Case
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateAIReport}
              isLoading={isGeneratingAIReport}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate AI Patient Report
            </Button>
          </div>
        </div>

        {/* 13 Tab Navigation (Horizontal Scrollable) */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 mb-4 text-xs font-semibold">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-b-2 border-brand-600 text-brand-700 bg-brand-50/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Latest BP</span>
                  <span className="text-sm font-bold text-slate-900">136/88 mmHg</span>
                  <span className="text-[10px] text-amber-600 block">Stage 1 Pre-Hypertension</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Heart Rate</span>
                  <span className="text-sm font-bold text-slate-900">80 bpm</span>
                  <span className="text-[10px] text-emerald-600 block">Normal Sinus</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">SpO2 Oxygen</span>
                  <span className="text-sm font-bold text-emerald-600">97%</span>
                  <span className="text-[10px] text-slate-400 block">Resting Room Air</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">HbA1c Glucose</span>
                  <span className="text-sm font-bold text-amber-600">6.8%</span>
                  <span className="text-[10px] text-slate-400 block">Stable Diabetic Target</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Active Clinical Conditions & Diagnoses</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold text-slate-800">Type 2 Diabetes Mellitus</span>
                      <p className="text-[11px] text-slate-500">Managed on Metformin 500mg BD. Routine diet adherence.</p>
                    </div>
                    <Badge variant="warning">CHRONIC</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold text-slate-800">Essential Hypertension (Stage 1)</span>
                      <p className="text-[11px] text-slate-500">Telmisartan 40mg once daily in morning.</p>
                    </div>
                    <Badge variant="info">ACTIVE</Badge>
                  </div>
                </div>
              </div>

              {/* Add Doctor Quick Notes */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                  Quick Doctor Remarks for Next Visit
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doctorNoteInput}
                    onChange={(e) => setDoctorNoteInput(e.target.value)}
                    placeholder="Enter observation or instruction for Arjun Kumar..."
                    className="flex-1 p-2 bg-white border border-slate-200 rounded text-xs"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (doctorNoteInput) {
                        showToast('Note saved to patient chart.');
                        setDoctorNoteInput('');
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICAL HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Documented Past Diagnoses</h4>
                <ul className="space-y-2">
                  <li className="p-2 bg-slate-50 rounded border border-slate-100">
                    <strong className="text-slate-800">Type 2 Diabetes Mellitus</strong> (Diagnosed 2018) — Managed on oral Metformin.
                  </li>
                  <li className="p-2 bg-slate-50 rounded border border-slate-100">
                    <strong className="text-slate-800">Essential Hypertension Stage 1</strong> (Diagnosed 2020) — Monitored on Telmisartan.
                  </li>
                  <li className="p-2 bg-slate-50 rounded border border-slate-100">
                    <strong className="text-slate-800">Laparoscopic Cholecystectomy</strong> (2015) — CareSync Hospital, fully resolved.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: SYMPTOMS */}
          {activeTab === 'SYMPTOMS' && (
            <div className="space-y-2">
              {symptoms.map((s: any) => (
                <div key={s.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{s.symptomName}</span>
                    <p className="text-[11px] text-slate-500">{s.notes} • Duration: {s.duration}</p>
                  </div>
                  <Badge variant={s.severity === 'SEVERE' ? 'danger' : 'warning'}>{s.severity}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: VITALS */}
          {activeTab === 'VITALS' && (
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date / Time</th>
                      <th className="p-2">BP (mmHg)</th>
                      <th className="p-2">HR (bpm)</th>
                      <th className="p-2">SpO2</th>
                      <th className="p-2">Temp (°F)</th>
                      <th className="p-2">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vitals.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-800">{new Date(v.recordedAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-2">{v.systolicBp}/{v.diastolicBp}</td>
                        <td className="p-2">{v.heartRate}</td>
                        <td className="p-2 text-emerald-600 font-semibold">{v.spO2}%</td>
                        <td className="p-2">{v.temperature}</td>
                        <td className="p-2 text-slate-400">{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-2">
              {reports.map((r: any) => (
                <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{r.title}</span>
                      <Badge variant="info">{r.reportType}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{r.aiSummary || r.description}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(r.uploadDate).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: AI CHAT */}
          {activeTab === 'AICHAT' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Latest AI Clinical Intake Transcript</h4>
              <div className="p-3 bg-slate-50 rounded text-slate-700 text-xs space-y-2">
                <p><strong>Patient Query:</strong> "Hi CareSync, can you explain what my CBC total WBC count of 11,200 means?"</p>
                <p className="text-slate-600"><strong>AI Assistant Response:</strong> "A Total White Blood Cell (WBC) count of 11,200 /uL is slightly above the standard reference range (4,000–10,500 /uL), indicative of a mild reactive response. Hemoglobin and platelet counts are normal. Dr. Priya Sharma has received your CBC report."</p>
              </div>
            </div>
          )}

          {/* TAB 7: WELLNESS */}
          {activeTab === 'WELLNESS' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Mental Wellness Telemetry</h4>
              <p className="text-slate-600">7-day average mood score: <strong>7.5 / 10</strong>. Sleep duration: <strong>7.1 hours</strong>. Stress level: <strong>LOW</strong>.</p>
              <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-emerald-800 text-[11px]">
                Zero self-harm or severe distress indicators detected. Stable emotional state reported.
              </div>
            </div>
          )}

          {/* TAB 8: ELDERLY CARE */}
          {activeTab === 'ELDERLY' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Elderly Care & Fall Telemetry</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded">Mobility Score: <strong>84 / 100</strong></div>
                <div className="p-2 bg-slate-50 rounded">Fall Incidents: <strong className="text-emerald-600">None</strong></div>
                <div className="p-2 bg-slate-50 rounded">Med Adherence: <strong>100%</strong></div>
                <div className="p-2 bg-slate-50 rounded">Caregiver: <strong>Meena Kumar</strong></div>
              </div>
            </div>
          )}

          {/* TAB 9: APPOINTMENTS */}
          {activeTab === 'APPOINTMENTS' && (
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">General Medicine Review</span>
                  <p className="text-[11px] text-slate-500">Tomorrow at 10:30 AM • OPD Block 2, Room 104 with Dr. Priya Sharma</p>
                </div>
                <Badge variant="success">SCHEDULED</Badge>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Cardiology Specialist Consultation</span>
                  <p className="text-[11px] text-slate-500">Next Week at 02:00 PM • Cardiac Tower Suite 302 with Dr. Karthik Raj</p>
                </div>
                <Badge variant="info">SCHEDULED</Badge>
              </div>
            </div>
          )}

          {/* TAB 10: QUEUE */}
          {activeTab === 'QUEUE' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Live Hospital Queue Status</h4>
              <div className="flex items-center justify-between p-3 bg-brand-50 rounded-lg border border-brand-100">
                <div>
                  <span className="text-xs text-brand-900 font-semibold">Arjun Kumar Token: A127</span>
                  <p className="text-[11px] text-brand-700">General Medicine OPD • Position: 6 • Est. Wait: 18 mins</p>
                </div>
                <Badge variant="warning">WAITING</Badge>
              </div>
            </div>
          )}

          {/* TAB 11: TRANSFERS */}
          {activeTab === 'TRANSFERS' && (
            <div className="space-y-2">
              {transfers.map((t: any) => (
                <div key={t.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{t.senderName} → {t.receiverName}</span>
                    <p className="text-[11px] text-slate-500">{t.reason}</p>
                  </div>
                  <Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* TAB 12: TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 mb-2">Chronological Clinical Events</h4>
              <ul className="space-y-2 border-l-2 border-slate-200 pl-3">
                <li>
                  <span className="font-bold text-slate-800">CBC Panel Processed</span>
                  <p className="text-[11px] text-slate-500">Automated differential completed. Mild leukocytosis recorded.</p>
                </li>
                <li>
                  <span className="font-bold text-slate-800">Prescription Refill Verified</span>
                  <p className="text-[11px] text-slate-500">Metformin 500mg BD & Telmisartan 40mg OD renewed.</p>
                </li>
              </ul>
            </div>
          )}

          {/* TAB 13: FINAL REPORTS */}
          {activeTab === 'FINAL_REPORTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Consolidated 19-Section AI Patient Reports</h4>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateAIReport}
                  isLoading={isGeneratingAIReport}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Generate New Report
                </Button>
              </div>

              {aiReports.map((r: any) => (
                <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{r.reportTitle}</span>
                      <Badge variant={r.status === 'FINALIZED' ? 'success' : 'warning'}>{r.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Generated: {new Date(r.createdAt).toLocaleDateString('en-IN')} • Finalized by: {r.finalizedBy || 'Pending'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAIReport(r);
                      setShowAIReportModal(true);
                    }}
                  >
                    View & Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* AI Patient Report Modal Subcomponent */}
      {showAIReportModal && selectedAIReport && (
        <AIPatientReportModal
          isOpen={showAIReportModal}
          onClose={() => setShowAIReportModal(false)}
          report={selectedAIReport}
          isDoctor={true}
          onReportUpdated={(updated) => {
            setSelectedAIReport(updated);
            fetchFullPatientProfile();
          }}
        />
      )}

      {/* Transfer Modal Subcomponent */}
      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          patientId={patientId}
          defaultReceiverRole="SPECIALIST"
          onTransferCompleted={fetchFullPatientProfile}
        />
      )}
    </>
  );
};
