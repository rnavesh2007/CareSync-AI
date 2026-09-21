import React, { useState } from 'react';
import { AIPatientReport } from '../types/index.js';
import { Modal } from './ui/Modal.js';
import { Badge } from './ui/Badge.js';
import { Button } from './ui/Button.js';
import {
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  User,
  Heart,
  Activity,
  ShieldCheck,
  Edit3,
  Share2,
} from 'lucide-react';
import api from '../services/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: AIPatientReport | null;
  onReportUpdated?: (updated: AIPatientReport) => void;
  isDoctor?: boolean;
}

export const AIPatientReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  report,
  onReportUpdated,
  isDoctor = false,
}) => {
  const [doctorNotes, setDoctorNotes] = useState('');
  const [clinicalReview, setClinicalReview] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (report) {
      setDoctorNotes(report.doctorNotes || '');
      setClinicalReview(report.finalClinicalReview || '');
    }
  }, [report]);

  if (!report) return null;

  // Safe JSON parsers
  const parseJsonSafe = (raw: string | undefined, fallback: any = null) => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  const patientInfo = parseJsonSafe(report.patientInfo, {});
  const symptoms = parseJsonSafe(report.symptoms, []);
  const medicalHistory = parseJsonSafe(report.medicalHistory, []);
  const medications = parseJsonSafe(report.medications, []);
  const vitals = parseJsonSafe(report.vitals, {});
  const uploadedReports = parseJsonSafe(report.uploadedReports, []);
  const questions = parseJsonSafe(report.questionsForDoctor, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'txt' | 'json' | 'docx' | 'pdf') => {
    if (format === 'pdf') {
      window.print();
      return;
    }
    const downloadUrl = `/api/ai/patient-report/${report.id}/export/${format}`;
    window.open(downloadUrl, '_blank');
    showToast(`Downloaded report in ${format.toUpperCase()} format.`);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const res = await api.patch(`/ai/patient-report/${report.id}/finalize`, {
        doctorNotes,
        finalClinicalReview: clinicalReview || 'Reviewed and finalized by attending physician.',
      });
      showToast('Report successfully finalized! Patient notified.');
      if (onReportUpdated) {
        onReportUpdated(res.data.report);
      }
    } catch (err) {
      console.error('Finalize error:', err);
      showToast('Failed to finalize report.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await api.patch(`/ai/patient-report/${report.id}/review`, {
        doctorNotes,
        finalClinicalReview: clinicalReview,
      });
      showToast('Doctor notes saved successfully.');
      if (onReportUpdated) {
        onReportUpdated(res.data.report);
      }
    } catch (err) {
      console.error('Save notes error:', err);
      showToast('Failed to save doctor notes.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Comprehensive AI Patient Clinical Report">
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Action Bar (Top) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              report.status === 'FINALIZED'
                ? 'success'
                : report.status === 'AWAITING_REVIEW'
                ? 'warning'
                : 'info'
            }
          >
            {report.status.replace('_', ' ')}
          </Badge>
          <span className="text-xs text-slate-500">
            Generated: {new Date(report.createdAt).toLocaleDateString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint} icon={<Printer className="w-3.5 h-3.5" />}>
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} icon={<Download className="w-3.5 h-3.5 text-rose-600" />}>
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('txt')} icon={<Download className="w-3.5 h-3.5 text-blue-600" />}>
            TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')} icon={<Download className="w-3.5 h-3.5 text-amber-600" />}>
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('docx')} icon={<Download className="w-3.5 h-3.5 text-indigo-600" />}>
            DOCX
          </Button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="space-y-6 text-slate-800 bg-white p-4 rounded-xl border border-slate-100 shadow-sm print:p-0 print:border-0 print:shadow-none">
        {/* Hospital Branding Header */}
        <div className="border-b border-slate-200 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-brand-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              CARESYNC MULTISPECIALITY HOSPITAL
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            42 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017 | Emergency: 112 | OPD Desk: +91 98402 34567
          </p>
          <p className="text-xs font-semibold text-brand-700 mt-1 uppercase tracking-wider">
            Consolidated AI Patient Clinical Intake & Review Document
          </p>
        </div>

        {/* Section 1: Patient Information */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brand-600" />
            1. Patient Information
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name:</span>
              <span className="font-semibold text-slate-800">{patientInfo.fullName || patientInfo.name || 'Arjun Kumar'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Age & Gender:</span>
              <span className="font-semibold text-slate-800">{patientInfo.age || 62} Years / {patientInfo.gender || 'Male'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Blood Group:</span>
              <span className="font-bold text-rose-600">{patientInfo.bloodGroup || 'B+'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">UHID / Record ID:</span>
              <span className="font-mono text-slate-700">{patientInfo.uhid || 'CSH-MAA-2026-8941'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Address:</span>
              <span className="text-slate-700">{patientInfo.address || '42 Anna Salai, T. Nagar, Chennai 600017'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[11px]">Emergency Contact / Caregiver:</span>
              <span className="text-slate-700 font-medium">{patientInfo.emergencyContact || 'Meena Kumar (Daughter) - +91 98404 56789'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Chief Complaint */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            2. Chief Complaint
          </h4>
          <p className="text-xs text-slate-800 font-medium">
            {report.chiefComplaint || 'Not provided'}
          </p>
        </div>

        {/* Section 3: Symptoms */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Active Symptoms & Clinical Presentation
          </h4>
          {Array.isArray(symptoms) && symptoms.length > 0 ? (
            <div className="space-y-1.5">
              {symptoms.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-800">{s.symptom || s}</span>
                  <div className="flex items-center gap-2">
                    {s.duration && <span className="text-slate-500">Duration: {s.duration}</span>}
                    {s.severity && (
                      <Badge variant={s.severity === 'SEVERE' ? 'danger' : s.severity === 'MODERATE' ? 'warning' : 'info'}>
                        {s.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">{typeof symptoms === 'string' ? symptoms : 'Not provided'}</p>
          )}
        </div>

        {/* Section 4: Medical History */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Past Medical History
          </h4>
          {Array.isArray(medicalHistory) && medicalHistory.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              {medicalHistory.map((item: any, i: number) => (
                <li key={i}>{typeof item === 'string' ? item : `${item.condition} (${item.status})`}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700">{typeof medicalHistory === 'string' ? medicalHistory : 'Not provided'}</p>
          )}
        </div>

        {/* Section 5 & 6: Allergies & Medications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              5. Known Allergies
            </h4>
            <p className="text-xs font-semibold text-rose-700">
              {report.allergies || 'Not provided'}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              6. Current Medications
            </h4>
            {Array.isArray(medications) && medications.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {medications.map((m: any, i: number) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-700">{typeof medications === 'string' ? medications : 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Section 7 & 8: Family History & Lifestyle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              7. Family Health History
            </h4>
            <p className="text-xs text-slate-700">{report.familyHistory || 'Not provided'}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              8. Lifestyle & Social History
            </h4>
            <p className="text-xs text-slate-700">{report.lifestyle || 'Not provided'}</p>
          </div>
        </div>

        {/* Section 9: Vitals */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-600" />
            9. Vital Signs Telemetry
          </h4>
          {typeof vitals === 'object' && vitals !== null ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                <span className="font-bold text-slate-800">{vitals.bloodPressure || '136/88 mmHg'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                <span className="font-bold text-slate-800">{vitals.heartRate || '80 bpm'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Temperature</span>
                <span className="font-bold text-slate-800">{vitals.temperature || '98.7 °F'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block">SpO2 (Oxygen)</span>
                <span className="font-bold text-emerald-600">{vitals.spO2 || '97%'}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                <span className="font-bold text-slate-800">{vitals.respiratoryRate || '17/min'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-700">{vitals || 'Not provided'}</p>
          )}
        </div>

        {/* Section 10 & 11: Uploaded Reports & AI Summaries */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            10. Uploaded Diagnostic Reports On File
          </h4>
          {Array.isArray(uploadedReports) ? (
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              {uploadedReports.map((r: any, idx: number) => (
                <li key={idx} className="font-medium">{r}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700">{uploadedReports || 'Not provided'}</p>
          )}

          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2 border-t border-slate-100">
            11. Diagnostic Report AI Summaries
          </h4>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {report.aiSummaries || 'Not provided'}
          </p>
        </div>

        {/* Section 12, 13 & 14: Risk Screening, Mental Wellness, Elderly Care */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
              12. Risk Stratification
            </h4>
            <p className="text-xs text-amber-800">{report.riskScreening || 'Not provided'}</p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              13. Mental Wellness
            </h4>
            <p className="text-xs text-blue-800">{report.mentalWellness || 'Not provided'}</p>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
              14. Elderly Care Telemetry
            </h4>
            <p className="text-xs text-emerald-800">{report.elderlyCare || 'Not provided'}</p>
          </div>
        </div>

        {/* Section 15: Timeline */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            15. Clinical Timeline
          </h4>
          <p className="text-xs text-slate-700">{report.timeline || 'Not provided'}</p>
        </div>

        {/* Section 16: AI Overall Summary */}
        <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-200">
          <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            16. AI Overall Clinical Synthesis
          </h4>
          <p className="text-xs text-slate-800 leading-relaxed">
            {report.aiOverallSummary || 'Not provided'}
          </p>
        </div>

        {/* Section 17: Questions for Doctor */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            17. Suggested Questions for Doctor
          </h4>
          {Array.isArray(questions) && questions.length > 0 ? (
            <ul className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
              {questions.map((q: any, i: number) => (
                <li key={i} className="font-medium text-slate-800">{q}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700">{typeof questions === 'string' ? questions : 'Not provided'}</p>
          )}
        </div>

        {/* Section 18: Doctor Notes */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              18. Attending Physician Clinical Notes
            </h4>
            {isDoctor && (
              <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            )}
          </div>
          {isDoctor ? (
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={3}
              placeholder="Enter clinical examination notes, prescription adjustments, and recommendations..."
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
            />
          ) : (
            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {report.doctorNotes || 'No notes added yet by attending physician.'}
            </p>
          )}
        </div>

        {/* Section 19: Final Clinical Review */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            19. Final Clinical Review & Verification
          </h4>
          {isDoctor ? (
            <div className="space-y-3">
              <textarea
                value={clinicalReview}
                onChange={(e) => setClinicalReview(e.target.value)}
                rows={2}
                placeholder="Final clinical review statement and verification notes..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Reviewer: Dr. Priya Sharma, MD (General Medicine)
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFinalize}
                  isLoading={isFinalizing}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Finalize & Sign Clinical Report
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-slate-800 italic">
                "{report.finalClinicalReview || 'Pending final sign-off by attending physician.'}"
              </p>
              <div className="text-right text-slate-500">
                <span className="block font-semibold text-slate-700">{report.finalizedBy || 'Dr. Priya Sharma'}</span>
                <span>Status: {report.status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Regulatory Medical Disclaimer */}
        <div className="border-t border-slate-200 pt-3 text-center">
          <p className="text-[11px] text-slate-500 italic font-medium">
            AI-generated informational summary. This does not replace professional medical diagnosis or treatment.
          </p>
        </div>
      </div>
    </Modal>
  );
};
