import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal.js';
import { Button } from './ui/Button.js';
import { Badge } from './ui/Badge.js';
import { Transfer } from '../types/index.js';
import {
  Share2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  User,
  Building2,
  Heart,
} from 'lucide-react';
import api from '../services/api.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  defaultReceiverRole?: string;
  onTransferCompleted?: () => void;
}

const AVAILABLE_ITEMS = [
  'Medical reports (CBC, Lipid Profile, ECG)',
  'Patient clinical history & active diagnoses',
  '7-Day vital telemetry (BP, HR, SpO2)',
  'AI clinical intake summaries',
  'Attending physician notes',
  'Consultation summaries',
  'Active prescriptions (Metformin, Telmisartan)',
  'Finalized 19-section AI Clinical Report',
];

export const TransferModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  defaultReceiverRole = 'DOCTOR',
  onTransferCompleted,
}) => {
  const [receiverRole, setReceiverRole] = useState(defaultReceiverRole);
  const [receiverName, setReceiverName] = useState('Dr. Priya Sharma');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'Medical reports (CBC, Lipid Profile, ECG)',
    '7-Day vital telemetry (BP, HR, SpO2)',
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (receiverRole === 'DOCTOR') setReceiverName('Dr. Priya Sharma (General Medicine)');
    else if (receiverRole === 'SPECIALIST') setReceiverName('Dr. Karthik Raj (Cardiology)');
    else if (receiverRole === 'HOSPITAL') setReceiverName('CareSync Multispeciality Hospital, Chennai');
    else if (receiverRole === 'PATIENT') setReceiverName('Arjun Kumar');
  }, [receiverRole]);

  const fetchTransfers = async () => {
    try {
      const res = await api.get('/transfers');
      setTransfers(res.data.transfers || []);
    } catch (err) {
      console.error('Error fetching transfers:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransfers();
    }
  }, [isOpen]);

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/transfers', {
        patientId,
        receiverRole,
        receiverName,
        reason,
        sharedItems: selectedItems,
        notes,
      });

      setToastMessage(`Records shared successfully with ${receiverName}.`);
      setReason('');
      setNotes('');
      fetchTransfers();
      setActiveTab('HISTORY');
      if (onTransferCompleted) onTransferCompleted();
    } catch (err) {
      console.error('Transfer error:', err);
      setToastMessage('Failed to create transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Clinical Case Transfer & Medical Records Sharing">
      {toastMessage && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'NEW'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Initiate New Transfer / Share
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Transfer History & Audit Trail ({transfers.length})
        </button>
      </div>

      {activeTab === 'NEW' ? (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Transfer Target</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { role: 'DOCTOR', label: 'Primary Doctor', desc: 'Dr. Priya Sharma' },
                { role: 'SPECIALIST', label: 'Specialist Referral', desc: 'Dr. Karthik Raj (Cardio)' },
                { role: 'HOSPITAL', label: 'Central Hospital', desc: 'CareSync Chennai' },
                { role: 'PATIENT', label: 'Patient Portal', desc: 'Arjun Kumar' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.role}
                  onClick={() => setReceiverRole(t.role)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    receiverRole === t.role
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-[11px] text-slate-400">{t.label}</span>
                  <span className="text-xs font-medium text-slate-900">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transfer Reason & Clinical Context <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Routine pre-consultation lab review, cardiology referral for hypertension..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Clinical Records & Items to Share
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {AVAILABLE_ITEMS.map((item) => (
                <label key={item} className="flex items-start gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => toggleItem(item)}
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-slate-700 text-[11px] leading-tight">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Confidential Clinical Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any specific symptoms, instructions, or flags for the receiving clinician..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full compliance audit logging enabled for transfer transactions.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} icon={<Share2 className="w-4 h-4" />}>
                Execute Transfer
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {transfers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No previous transfers recorded.</p>
          ) : (
            transfers.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span>{t.senderName} ({t.senderRole})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-brand-700">{t.receiverName} ({t.receiverRole})</span>
                  </div>
                  <Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {t.status}
                  </Badge>
                </div>
                <p className="text-slate-600">
                  <strong className="text-slate-700">Reason:</strong> {t.reason}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span>Logged: {new Date(t.createdAt).toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 font-mono">ID: {t.id.substring(0, 8)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};
