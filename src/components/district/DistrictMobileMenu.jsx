import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  Receipt,
  BarChart3,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export function DistrictMobileMenu({ isOpen, onClose, adminUser, onLogout }) {
  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', path: '/district-dashboard', icon: LayoutDashboard, end: true },
    { label: 'Associate Management', path: '/district-dashboard/associates', icon: Users },
    { label: 'Referral Management', path: '/district-dashboard/referrals', icon: UserPlus },
    { label: 'Financial Records', path: '/district-dashboard/financial-records', icon: Receipt },
    { label: 'Reports', path: '/district-dashboard/reports', icon: BarChart3 },
    { label: 'My Profile', path: '/district-dashboard/profile', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-[#0B1528] text-white flex flex-col h-full shadow-2xl z-10">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm tracking-wide">District Partner Panel</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-red-950/40 text-red-400 border border-red-800/60 hover:bg-red-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DistrictMobileMenu;
