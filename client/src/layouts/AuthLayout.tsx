import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg overflow-hidden">
        {/* Left Side: Visual Brand Panel (Light Medical Theme) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-600 via-brand-700 to-teal-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle medical backdrop patterns */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">CARESYNC AI</span>
                <p className="text-[11px] text-brand-100 font-medium">Healthcare OS</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-tight tracking-tight">
              Connected Healthcare.<br />Smarter Care.
            </h2>
            <p className="mt-3 text-xs text-brand-100/90 leading-relaxed">
              Unified electronic medical intelligence connecting patients, physicians, and hospital administrators in real-time.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/15 space-y-3 relative z-10">
            <div className="flex items-center gap-3 text-xs text-brand-100">
              <HeartPulse className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Continuous Vital Telemetry & Trends</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-brand-100">
              <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
              <span>15+ Categorized Clinical Report Types</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-brand-100">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Role-Based Triage & HIPAA-Compliant Architecture</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};
