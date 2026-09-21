import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Bot,
  Activity,
  FileText,
  Clock,
  Calendar,
  Users,
  BrainCircuit,
  HeartHandshake,
  Bell,
  User as UserIcon,
  Stethoscope,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation configurations
  const patientNav = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'AI Health Assistant', path: '/patient/assistant', icon: Bot, badge: 'AI' },
    { name: 'My Health', path: '/patient/my-health', icon: Activity },
    { name: 'My Reports', path: '/patient/reports', icon: FileText },
    { name: 'Medical History', path: '/patient/history', icon: Clock },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Hospital Queue', path: '/patient/queue', icon: Users, badge: 'Live' },
    { name: 'Mental Wellness', path: '/patient/wellness', icon: BrainCircuit },
    { name: 'Elderly Care', path: '/patient/elderly', icon: HeartHandshake },
    { name: 'Notifications', path: '/patient/notifications', icon: Bell },
    { name: 'Profile', path: '/patient/profile', icon: UserIcon },
  ];

  const doctorNav = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Patient Reports', path: '/doctor/patient-reports', icon: FileText },
    { name: 'AI Summaries', path: '/doctor/ai-summaries', icon: Sparkles, badge: 'Smart' },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Queue', path: '/doctor/queue', icon: ClipboardList, badge: 'Live' },
    { name: 'Alerts', path: '/doctor/alerts', icon: AlertTriangle, badge: '2' },
    { name: 'Reports', path: '/doctor/reports', icon: FileText },
    { name: 'Profile', path: '/doctor/profile', icon: Stethoscope },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Patients', path: '/admin/patients', icon: Users },
    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Hospital Queue', path: '/admin/queue', icon: ClipboardList },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'System Activity', path: '/admin/activity', icon: ShieldCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  let currentNav = patientNav;
  if (user?.role === 'DOCTOR') currentNav = doctorNav;
  if (user?.role === 'ADMIN') currentNav = adminNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-soft">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1">
                CARESYNC <span className="text-brand-600 font-extrabold text-xs px-1 py-0.5 bg-brand-50 rounded">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Connected Healthcare
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role identifier badge */}
        <div className="px-5 py-3 border-b border-slate-100/80 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Active Workspace</span>
            <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full text-[11px] border border-brand-200/50">
              {user?.role} PORTAL
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-soft-sm'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      item.badge === 'Live'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.badge === 'AI' || item.badge === 'Smart'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer & quick logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
