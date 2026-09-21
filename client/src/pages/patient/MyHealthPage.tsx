import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Plus,
  Scale,
  Ruler,
  Droplet,
  CheckCircle2,
} from 'lucide-react';

export const MyHealthPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding vitals
  const [newHeartRate, setNewHeartRate] = useState('72');
  const [newSystolic, setNewSystolic] = useState('120');
  const [newDiastolic, setNewDiastolic] = useState('78');
  const [newTemp, setNewTemp] = useState('98.4');
  const [newSpO2, setNewSpO2] = useState('99');

  const fetchHealth = async () => {
    try {
      const res = await api.get('/patient/my-health');
      setData(res.data.patient);
    } catch (err) {
      console.error('Error fetching health details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRecordVital = (e: React.FormEvent) => {
    e.preventDefault();
    // In Phase 1 we append to local view and close modal
    if (data?.vitals) {
      const added = {
        id: Date.now().toString(),
        patientId: data.id,
        recordedAt: new Date().toISOString(),
        heartRate: parseInt(newHeartRate),
        systolicBp: parseInt(newSystolic),
        diastolicBp: parseInt(newDiastolic),
        temperature: parseFloat(newTemp),
        spO2: parseInt(newSpO2),
        recordedBy: 'Patient Self-Log (CareSync Portal)',
      };
      setData({ ...data, vitals: [added, ...data.vitals] });
    }
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const heightM = (data?.heightCm || 168) / 100;
  const weightKg = data?.weightKg || 62.5;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            My Health & Physiological Profile
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive telemetry, biometric indices, and clinical symptom records.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record New Vitals
        </Button>
      </div>

      {/* Biometric Snapshot Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Height</p>
            <p className="text-lg font-bold text-slate-900">{data?.heightCm || 168} cm</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Weight</p>
            <p className="text-lg font-bold text-slate-900">{data?.weightKg || 62.5} kg</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Body Mass Index</p>
            <p className="text-lg font-bold text-slate-900">{bmi} <span className="text-xs font-normal text-emerald-600">Normal</span></p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Blood Group</p>
            <p className="text-lg font-bold text-slate-900">{data?.bloodGroup || 'A+'}</p>
          </div>
        </Card>
      </div>

      {/* Vitals History Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Clinical Vitals Telemetry Logs
          </h3>
          <span className="text-xs text-slate-400">
            {data?.vitals?.length || 0} readings recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">Blood Pressure</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">SpO2</th>
                <th className="py-3 px-4">Recorded Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.vitals?.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {new Date(v.recordedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{v.heartRate}</span> bpm
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{v.systolicBp}/{v.diastolicBp}</span> mmHg
                  </td>
                  <td className="py-3 px-4">{v.temperature} °F</td>
                  <td className="py-3 px-4">
                    <Badge variant="success" size="sm">{v.spO2}%</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{v.recordedBy || 'CareSync Hub'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Symptoms Tracking */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Recorded Clinical Symptoms & Notes
        </h3>
        <div className="space-y-3">
          {data?.symptoms?.map((s: any) => (
            <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{s.symptomName}</span>
                  <Badge variant={s.severity === 'MILD' ? 'brand' : 'warning'} size="sm">
                    {s.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{s.notes}</p>
              </div>
              <span className="text-[11px] text-slate-400">Duration: {s.duration}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal to log vitals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Clinical Vitals"
        subtitle="Submit manual reading or verified device entry."
      >
        <form onSubmit={handleRecordVital} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={newHeartRate}
                onChange={(e) => setNewHeartRate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SpO2 (%)</label>
              <input
                type="number"
                value={newSpO2}
                onChange={(e) => setNewSpO2(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={newSystolic}
                onChange={(e) => setNewSystolic(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={newDiastolic}
                onChange={(e) => setNewDiastolic(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Body Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={newTemp}
              onChange={(e) => setNewTemp(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Vitals
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
