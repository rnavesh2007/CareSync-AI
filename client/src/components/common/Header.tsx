import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Badge } from '../ui/Badge.js';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Shield,
  Stethoscope,
  Heart,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadgeVariant = (role?: UserRole) => {
    switch (role) {
      case 'DOCTOR':
        return 'teal';
      case 'ADMIN':
        return 'purple';
      case 'PATIENT':
      default:
        return 'brand';
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope className="w-3.5 h-3.5" />;
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5" />;
      case 'PATIENT':
      default:
        return <Heart className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-soft-sm">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-64 lg:w-80 text-xs text-slate-500 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search records, appointments, labs..."
            className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2 hidden sm:inline">
              Demo Mode:
            </span>
            <button
              onClick={() => switchRole('PATIENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'PATIENT'
                  ? 'bg-white text-brand-700 shadow-soft-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => switchRole('DOCTOR')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'DOCTOR'
                  ? 'bg-white text-teal-700 shadow-soft-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-white text-purple-700 shadow-soft-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-lg border border-slate-200 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Clinical Notifications</span>
                <span className="text-[10px] text-brand-600 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">Cardiology Appointment Confirmed</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tomorrow at 10:30 AM with Dr. Vance</p>
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">10m ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">Metabolic Panel Report Ready</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Results synchronized with your medical chart</p>
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">2h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.firstName || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role.toLowerCase()}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                    {getRoleIcon(user?.role)}
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <div className="py-1">
                <a
                  href={`/${user?.role.toLowerCase()}/profile`}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </a>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
