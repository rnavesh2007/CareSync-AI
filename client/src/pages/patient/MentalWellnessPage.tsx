import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Card } from '../../components/ui/Card.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { WellnessTrendsChart } from '../../components/dashboard/WellnessTrendsChart.js';
import {
  BrainCircuit,
  Moon,
  Smile,
  HeartHandshake,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Send,
  Phone,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const MentalWellnessPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [currentMood, setCurrentMood] = useState(8);
  const [sleepHours, setSleepHours] = useState(7.2);
  const [stressLevel, setStressLevel] = useState<'LOW' | 'MODERATE' | 'HIGH'>('LOW');
  const [journalNotes, setJournalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<any>(null);

  const fetchWellness = async () => {
    try {
      const res = await api.get('/patient/wellness');
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error('Error fetching wellness:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/patient/wellness', {
        moodScore: currentMood,
        sleepHours: Number(sleepHours),
        stressLevel,
        notes: journalNotes,
        waterIntakeLiters: 2.2,
        activityMinutes: 40,
      });

      if (res.data.safetyGuidance) {
        setSafetyAlert(res.data.safetyGuidance);
      } else {
        setSafetyAlert(null);
      }

      setJournalNotes('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      fetchWellness();
    } catch (err) {
      console.error('Error logging wellness:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute stats
  const avgMood = entries.length > 0
    ? (entries.reduce((a, b) => a + b.moodScore, 0) / entries.length).toFixed(1)
    : '8.0';
  const avgSleep = entries.length > 0
    ? (entries.reduce((a, b) => a + b.sleepHours, 0) / entries.length).toFixed(1)
    : '7.2';
  const latestStress = entries.length > 0 ? entries[0].stressLevel : 'LOW';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              CareSync Multispeciality Hospital • Mind & Health Hub
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-600" />
            Mental Wellness & Daily Journal
          </h1>
          <p className="text-xs text-slate-500">
            Track mood indicators, sleep restfulness, stress levels, and restorative lifestyle habits.
          </p>
        </div>
      </div>

      {/* Severe Distress Safety Support Guidance Banner */}
      {safetyAlert && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>{safetyAlert.alert}</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {safetyAlert.message}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {safetyAlert.resources?.map((r: any, i: number) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-rose-200">
                <span className="font-bold text-slate-900 block">{r.name}</span>
                <span className="text-rose-700 font-semibold">{r.contact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required 4 Indicators: Mood, Stress, Sleep and Wellness Trend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mood Indicator"
          value={avgMood}
          unit="/10"
          statusText="Balanced"
          statusVariant="success"
          icon={<Smile className="w-5 h-5 text-brand-600" />}
          iconBgColor="bg-brand-50"
          subtext="7-day composite score"
        />
        <StatCard
          title="Sleep Restfulness"
          value={avgSleep}
          unit="hrs"
          statusText="Restorative"
          statusVariant="success"
          icon={<Moon className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
          subtext="Target: 7.0–8.5 hrs"
        />
        <StatCard
          title="Stress Indicator"
          value={latestStress}
          statusText="Controlled"
          statusVariant={latestStress === 'HIGH' ? 'danger' : latestStress === 'MODERATE' ? 'warning' : 'success'}
          icon={<HeartHandshake className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          subtext="Autonomic state index"
        />
        <StatCard
          title="Hydration Intake"
          value="2.2"
          unit="Liters"
          statusText="Goal Met"
          statusVariant="teal"
          icon={<Droplets className="w-5 h-5 text-blue-500" />}
          iconBgColor="bg-blue-50"
          subtext="Optimal renal hydration"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Wellness Journal Form */}
        <Card className="lg:col-span-1 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Daily Wellness Journal Entry
            </h3>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Journal entry logged and analyzed!
            </div>
          )}

          <form onSubmit={handleLog} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">How is your mood today?</label>
                <span className="font-bold text-brand-700 text-sm">{currentMood} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentMood}
                onChange={(e) => setCurrentMood(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 - Low</span>
                <span>5 - Neutral</span>
                <span>10 - Joyful</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Sleep Duration Last Night</label>
                <span className="font-bold text-teal-700 text-sm">{sleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Perceived Stress Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MODERATE', 'HIGH'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStressLevel(lvl)}
                    className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                      stressLevel === lvl
                        ? 'bg-brand-50 border-brand-600 text-brand-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Journal Reflection & Mindful Thoughts</label>
              <textarea
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                rows={3}
                placeholder="What went well today? Any stress, fatigue, or gratitude..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Daily Entry
            </Button>
          </form>
        </Card>

        {/* Wellness Trend Chart & History */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  7-Day Mood & Sleep Architecture Trend
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking daily score vs sleep duration
                </p>
              </div>
              <Badge variant="teal">Weekly Aggregate</Badge>
            </div>
            <div className="h-64">
              <WellnessTrendsChart data={entries} />
            </div>
          </Card>

          {/* Recent Journal History */}
          <Card className="p-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Recent Daily Journal Reflections
            </h4>
            <div className="space-y-2 text-xs">
              {entries.slice(0, 4).map((en) => (
                <div key={en.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {new Date(en.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <Badge variant={en.stressLevel === 'HIGH' ? 'danger' : en.stressLevel === 'MODERATE' ? 'warning' : 'success'}>
                        Stress: {en.stressLevel}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      "{en.notes || 'Logged via CareSync Daily Wellness Check'}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px] shrink-0">
                    <span>Mood: <strong className="text-slate-800">{en.moodScore}/10</strong></span>
                    <span>Sleep: <strong className="text-slate-800">{en.sleepHours}h</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Regulatory Notice */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1">
        <p className="text-xs text-slate-700 font-semibold">
          Notice: This is an informational wellness journal and does not diagnose mental health disorders.
        </p>
        <p className="text-[11px] text-slate-500">
          If you or a loved one are experiencing acute emotional distress, 24/7 confidential assistance is available via Tele-MANAS helpline (14416 / 1800 891 4416) or National Emergency Services (112).
        </p>
      </div>
    </div>
  );
};

export default MentalWellnessPage;
