import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { REPORT_TYPES, ReportType, Report, ReportExtractedData, AIPatientReport } from '../../types/index.js';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Share2,
  Trash2,
  Edit2,
  AlertTriangle,
  Building2,
  FileCheck2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { AIPatientReportModal } from '../../components/AIPatientReportModal.js';
import { TransferModal } from '../../components/TransferModal.js';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reportToActOn, setReportToActOn] = useState<Report | null>(null);

  // Consolidated AI Patient Report
  const [consolidatedReport, setConsolidatedReport] = useState<AIPatientReport | null>(null);
  const [showConsolidatedModal, setShowConsolidatedModal] = useState(false);
  const [isGeneratingConsolidated, setIsGeneratingConsolidated] = useState(false);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ReportType>('CBC');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Rename Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Share Form
  const [shareTargetRole, setShareTargetRole] = useState('DOCTOR');
  const [shareTargetName, setShareTargetName] = useState('Dr. Priya Sharma');
  const [shareReason, setShareReason] = useState('Consultation review');

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsolidatedReport = async () => {
    try {
      const res = await api.get('/ai/patient-report');
      if (res.data.reports && res.data.reports.length > 0) {
        setConsolidatedReport(res.data.reports[0]);
      }
    } catch (err) {
      console.error('Error fetching AI patient report:', err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchConsolidatedReport();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('reportType', uploadType);
      formData.append('description', uploadDesc);
      formData.append('patientId', user?.patientId || '');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast(`Uploaded ${uploadType} successfully! OCR & AI analysis synthesized.`);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      fetchReports();
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload report.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRename = async () => {
    if (!reportToActOn || !newTitle.trim()) return;
    try {
      await api.patch(`/reports/${reportToActOn.id}`, {
        title: newTitle,
        description: newDesc,
      });
      showToast('Report renamed successfully.');
      setShowRenameModal(false);
      fetchReports();
    } catch (err) {
      showToast('Failed to rename report.');
    }
  };

  const handleDelete = async () => {
    if (!reportToActOn) return;
    try {
      await api.delete(`/reports/${reportToActOn.id}`);
      showToast('Report deleted successfully.');
      setShowDeleteModal(false);
      fetchReports();
    } catch (err) {
      showToast('Failed to delete report.');
    }
  };

  const handleShare = async () => {
    if (!reportToActOn) return;
    try {
      await api.post(`/reports/${reportToActOn.id}/share`, {
        targetRole: shareTargetRole,
        targetName: shareTargetName,
        reason: shareReason,
      });
      showToast(`Report shared with ${shareTargetName}.`);
      setShowShareModal(false);
      fetchReports();
    } catch (err) {
      showToast('Failed to share report.');
    }
  };

  const handleDownload = (report: Report) => {
    // Generate text download of clinical analysis
    const content = `CARESYNC MULTISPECIALITY HOSPITAL, CHENNAI\n` +
      `MEDICAL REPORT: ${report.title.toUpperCase()}\n` +
      `Type: ${report.reportType} | Date: ${new Date(report.uploadDate).toLocaleDateString('en-IN')}\n\n` +
      `AI SUMMARY:\n${report.aiSummary || 'Processed'}\n\n` +
      `EXTRACTED CLINICAL TEXT:\n${report.extractedText || 'No raw text available'}\n\n` +
      `DISCLAIMER: AI-generated informational summary. This does not replace professional medical diagnosis or treatment.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}_Analysis.txt`;
    link.click();
    showToast(`Downloaded ${report.title} summary.`);
  };

  const handleGenerateConsolidated = async () => {
    setIsGeneratingConsolidated(true);
    try {
      const res = await api.post('/ai/patient-report/generate', {});
      setConsolidatedReport(res.data.report);
      setShowConsolidatedModal(true);
      showToast('Consolidated 19-section AI Patient Report generated!');
    } catch (err) {
      showToast('Failed to generate report.');
    } finally {
      setIsGeneratingConsolidated(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesType = selectedType === 'ALL' || r.reportType === selectedType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.aiSummary && r.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Parse structured AI analysis data safely
  const getAnalysisData = (report: Report | null): ReportExtractedData | null => {
    if (!report || !report.extractedData) return null;
    try {
      return JSON.parse(report.extractedData);
    } catch {
      return null;
    }
  };

  const analysis = getAnalysisData(selectedReport);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital, Chennai
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            My Reports & AI Clinical Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete automated OCR extraction, reference range flagging, physician sharing, and consolidated summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (consolidatedReport) setShowConsolidatedModal(true);
              else handleGenerateConsolidated();
            }}
            isLoading={isGeneratingConsolidated}
            icon={<Sparkles className="w-4 h-4 text-brand-600" />}
          >
            Generate AI Patient Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Report
          </Button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title, test name, or AI summary findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-between">
            <span className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Showing <strong>{filteredReports.length}</strong> reports
            </span>
          </div>
        </div>

        {/* Scrollable category chips (19 types) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
              selectedType === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reports ({reports.length})
          </button>
          {REPORT_TYPES.map((type) => {
            const count = reports.filter((r) => r.reportType === type).length;
            if (count === 0 && selectedType !== type) return null;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedType === type
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{type}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedType === type ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Reports List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading medical reports repository...</div>
      ) : filteredReports.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No diagnostic records match your selected filter or query. You can upload a new test result or reset filters.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedType('ALL'); setSearchQuery(''); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="p-4 hover:shadow-md transition-shadow border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant={report.reportType === 'CBC' ? 'danger' : 'info'} className="mb-1">
                      {report.reportType}
                    </Badge>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {report.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(report.uploadDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* AI Summary Highlight */}
                {report.aiSummary && (
                  <div className="p-2.5 bg-brand-50/60 border border-brand-100 rounded-lg text-xs text-slate-700">
                    <div className="flex items-center gap-1 font-semibold text-brand-800 mb-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      AI Clinical Insights
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-[11px] text-slate-600">
                      {report.aiSummary}
                    </p>
                  </div>
                )}

                {/* Shared status pill */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Shared with Dr. Priya Sharma
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] uppercase">
                    {report.fileType || 'PDF'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: View AI Analysis, Download, Rename, Share, Delete */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowViewModal(true);
                  }}
                  icon={<Eye className="w-3.5 h-3.5 text-brand-600" />}
                >
                  View & AI Analysis
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(report)}
                    title="Download Report"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => {
                      setReportToActOn(report);
                      setShareTargetName('Dr. Priya Sharma');
                      setShowShareModal(true);
                    }}
                    title="Share Report"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" />
                  </button>

                  <button
                    onClick={() => {
                      setReportToActOn(report);
                      setNewTitle(report.title);
                      setNewDesc(report.description || '');
                      setShowRenameModal(true);
                    }}
                    title="Rename Report"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    onClick={() => {
                      setReportToActOn(report);
                      setShowDeleteModal(true);
                    }}
                    title="Delete Report"
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW REPORT & AI ANALYSIS MODAL */}
      {showViewModal && selectedReport && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          size="lg"
          title={`${selectedReport.reportType} — Diagnostic Analysis & Clinical Summary`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Document Title</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedReport.title}</h3>
                <span className="text-slate-500 text-[11px]">
                  Uploaded on {new Date(selectedReport.uploadDate).toLocaleDateString('en-IN')} • Hospital: CareSync Multispeciality Hospital
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedReport)} icon={<Download className="w-3.5 h-3.5" />}>
                  Download
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowViewModal(false);
                    setReportToActOn(selectedReport);
                    setShowShareModal(true);
                  }}
                  icon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* AI Summary Highlight Card */}
            <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-xl text-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-brand-900 text-xs">
                <Sparkles className="w-4 h-4 text-brand-600" />
                AI-Synthesized Clinical Summary
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {selectedReport.aiSummary}
              </p>
            </div>

            {/* Important Values with Reference Ranges */}
            {analysis && analysis.importantValues && analysis.importantValues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Key Analyzed Parameters & Reference Ranges
                </h4>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Result</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.importantValues.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-medium text-slate-800">{v.parameter}</td>
                          <td className="p-2.5 font-bold text-slate-900">{v.value} <span className="text-slate-500 font-normal">{v.unit}</span></td>
                          <td className="p-2.5 text-slate-500">{v.referenceRange}</td>
                          <td className="p-2.5">
                            <Badge
                              variant={
                                v.status.includes('HIGH')
                                  ? 'warning'
                                  : v.status.includes('LOW')
                                  ? 'danger'
                                  : 'success'
                              }
                            >
                              {v.status.replace('_', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Abnormal Values vs Normal-Looking Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis && analysis.abnormalValues && analysis.abnormalValues.length > 0 && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1.5">
                  <h5 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Potentially Abnormal Values
                  </h5>
                  <ul className="space-y-1 text-xs text-amber-800">
                    {analysis.abnormalValues.map((ab, i) => (
                      <li key={i} className="text-[11px]">
                        <strong>{ab.parameter}:</strong> {ab.value} — {ab.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis && analysis.normalValues && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1.5">
                  <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Normal Physiological Values
                  </h5>
                  <ul className="space-y-1 text-xs text-emerald-800">
                    {analysis.normalValues.map((nv, i) => (
                      <li key={i} className="text-[11px]">
                        • {nv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Plain-Language Explanation */}
            {analysis && analysis.explanation && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <h5 className="font-bold text-slate-800 text-xs">Plain-Language Clinical Explanation</h5>
                <p className="text-slate-600 leading-relaxed text-xs">{analysis.explanation}</p>
              </div>
            )}

            {/* Questions for Doctor */}
            {analysis && analysis.questionsForDoctor && analysis.questionsForDoctor.length > 0 && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                <h5 className="font-bold text-slate-800 text-xs">Suggested Questions for Dr. Priya Sharma</h5>
                <ul className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                  {analysis.questionsForDoctor.map((q, i) => (
                    <li key={i} className="font-medium text-[11px]">{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Extracted Raw OCR Text Section */}
            {selectedReport.extractedText && (
              <details className="p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <summary className="font-bold text-slate-700 text-xs">View Extracted OCR Text</summary>
                <pre className="mt-2 text-[10px] text-slate-600 font-mono whitespace-pre-wrap bg-white p-2 rounded border border-slate-200 max-h-40 overflow-y-auto">
                  {selectedReport.extractedText}
                </pre>
              </details>
            )}

            {/* Mandatory Safety Disclaimer */}
            <div className="pt-2 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 italic font-medium">
                AI-generated informational summary. This does not replace professional medical diagnosis or treatment.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* UPLOAD REPORT MODAL */}
      {showUploadModal && (
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="md" title="Upload Diagnostic Report / Lab Test">
          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Complete Blood Count (CBC) Panel, Lipid Profile..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Report Category</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as ReportType)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attach File (PDF, JPG, JPEG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Remarks / Symptoms</label>
              <textarea
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                rows={2}
                placeholder="Notes for attending physician (e.g. fatigue, fever, routine annual test)..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 mt-0.5" />
              <p className="text-[11px] text-slate-600">
                Automatic OCR extraction and clinical AI summary will be generated immediately upon upload.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isUploading} icon={<UploadCloud className="w-4 h-4" />}>
                Process & Upload
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* RENAME MODAL */}
      {showRenameModal && reportToActOn && (
        <Modal isOpen={showRenameModal} onClose={() => setShowRenameModal(false)} size="sm" title="Rename Report">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Report Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRenameModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleRename}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && reportToActOn && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm" title="Delete Medical Report">
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Are you sure you want to permanently delete <strong>{reportToActOn.title}</strong>? This action will remove the file from your electronic health record.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 className="w-3.5 h-3.5" />}>Delete Permanently</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* SHARE MODAL */}
      {showShareModal && reportToActOn && (
        <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} size="md" title="Share Report with Clinician">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Selected Report:</span>
              <strong className="text-slate-900 text-sm">{reportToActOn.title}</strong> ({reportToActOn.reportType})
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Healthcare Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { role: 'DOCTOR', name: 'Dr. Priya Sharma', label: 'Primary Care' },
                  { role: 'SPECIALIST', name: 'Dr. Karthik Raj (Cardio)', label: 'Specialist' },
                  { role: 'HOSPITAL', name: 'CareSync Hospital Desk', label: 'Hospital Records' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setShareTargetRole(item.role);
                      setShareTargetName(item.name);
                    }}
                    className={`p-2 rounded border text-left text-xs ${
                      shareTargetRole === item.role
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">{item.label}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Sharing</label>
              <input
                type="text"
                value={shareReason}
                onChange={(e) => setShareReason(e.target.value)}
                placeholder="e.g., Pre-consultation evaluation, second opinion..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowShareModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleShare} icon={<Share2 className="w-3.5 h-3.5" />}>
                Confirm Share
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 19-Section Consolidated AI Patient Report Modal */}
      {showConsolidatedModal && consolidatedReport && (
        <AIPatientReportModal
          isOpen={showConsolidatedModal}
          onClose={() => setShowConsolidatedModal(false)}
          report={consolidatedReport}
          isDoctor={user?.role === 'DOCTOR'}
          onReportUpdated={(updated) => setConsolidatedReport(updated)}
        />
      )}
    </div>
  );
};

export default MyReportsPage;
