import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { AuthLayout } from '../../layouts/AuthLayout.js';
import { Button } from '../../components/ui/Button.js';
import { User, Lock, ArrowRight, Stethoscope, Shield, Heart } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Determine destination based on email or let App routing handle
      if (email.includes('doctor')) navigate('/doctor/dashboard');
      else if (email.includes('admin')) navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to CareSync
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your clinical portal credentials to access your health workspace.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@caresync.ai"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <a href="#forgot" className="text-[11px] font-medium text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="md">
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* 1-Click Quick Demo Accounts Selector */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Demo Accounts (Indian Healthcare Data)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('patient@caresync.ai', 'patient123')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-brand-200/80 bg-brand-50/50 hover:bg-brand-50 hover:border-brand-300 transition-all text-center group"
            >
              <Heart className="w-4 h-4 text-brand-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Patient</span>
              <span className="text-[10px] text-slate-500">Arjun Kumar</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('doctor@caresync.ai', 'doctor123')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-300 transition-all text-center group"
            >
              <Stethoscope className="w-4 h-4 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Physician</span>
              <span className="text-[10px] text-slate-500">Dr. Priya Sharma</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('specialist@caresync.ai', 'specialist123')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-center group"
            >
              <Stethoscope className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Cardiologist</span>
              <span className="text-[10px] text-slate-500">Dr. Karthik Raj</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@caresync.ai', 'admin123')}
              className="flex flex-col items-center p-2.5 rounded-xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all text-center group"
            >
              <Shield className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-500">Suresh Iyer</span>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
