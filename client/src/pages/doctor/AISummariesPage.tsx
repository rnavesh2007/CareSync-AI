import React from 'react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Sparkles, Bot, User, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const AISummariesPage: React.FC = () => {
  const summaries = [
    {
      id: 'sum-1',
      patientName: 'Arjun Kumar',
      age: 62,
      diagnosis: 'Type 2 Diabetes Mellitus & Stage 1 Hypertension Review',
      aiSummary:
        'Patient presents with borderline elevated fasting glucose (138 mg/dL) and HbA1c of 7.4%. Vital telemetry shows blood pressure at 138/88 mmHg, resting heart rate 74 bpm, SpO2 98%. CBC panel indicates mild normocytic anemia (Hemoglobin 11.8 g/dL) with elevated ESR (28 mm/hr). Medication adherence to Metformin 500mg and Telmisartan 40mg is 96%. Caregiver Meena Kumar notified.',
      recommendation:
        'Review glycemic control regimen. Maintain Telmisartan 40mg once daily. Order repeat HbA1c in 90 days. Counsel on low-glycemic South Indian diet.',
      confidence: '98.4%',
      status: 'VERIFIED',
    },
    {
      id: 'sum-2',
      patientName: 'Lakshmi Narayanan',
      age: 58,
      diagnosis: 'Dyslipidemia & Preventive Cardiology Assessment',
      aiSummary:
        'Morning vitals stable with BP 124/80 mmHg and resting pulse 70 bpm. Recent lipid profile reveals Total Cholesterol 210 mg/dL, LDL 135 mg/dL, HDL 42 mg/dL. 100% adherence to Atorvastatin 10mg logged via smart health log.',
      recommendation:
        'Continue Atorvastatin 10mg post-dinner. Recommend 30-minute brisk walk daily. Schedule routine lipid re-evaluation in 6 months.',
      confidence: '95.1%',
      status: 'REQUIRES_PHYSICIAN_REVIEW',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            AI Clinical Summaries & Consultation Briefs
          </h1>
          <p className="text-xs text-slate-500">
            Automated multi-source chart synthesis condensing lab history, vital telemetry, and medication adherence.
          </p>
        </div>
        <Badge variant="teal" size="sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          Clinical Guardrails Active
        </Badge>
      </div>

      <div className="space-y-4">
        {summaries.map((s) => (
          <Card key={s.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {s.patientName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{s.patientName}</h3>
                  <p className="text-xs text-slate-500">
                    Age {s.age} • Condition: <strong className="text-slate-700">{s.diagnosis}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">AI Confidence: {s.confidence}</span>
                <Badge variant={s.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                  {s.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-4 h-4 text-teal-600" />
                  Synthesized Patient Chart Summary
                </h4>
                <p className="text-slate-700">{s.aiSummary}</p>
              </div>

              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/70">
                <h4 className="font-bold text-teal-900 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Suggested Physician Action Plan
                </h4>
                <p className="text-teal-950">{s.recommendation}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm">
                Edit Notes
              </Button>
              <Button variant="teal" size="sm">
                Approve & Sign Note
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
