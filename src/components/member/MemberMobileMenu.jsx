import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileCheck2,
  Award,
  PieChart,
  FilePlus2,
  ClipboardList,
  Calendar,
  History,
  Sparkles,
  Bell,
  KeyRound,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

/**
 * MemberMobileMenu Component
 * Drawer navigation for mobile viewports (< 1024px) mirroring the sidebar structure.
 */
export function MemberMobileMenu({
  isOpen,
  onClose,
  onChangePassword,
  onLogout,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const navGroups = [
    {
      title: 'CORE PORTAL',
      items: [
        { label: 'Dashboard', path: '/member-dashboard', icon: LayoutDashboard, end: true },
        { label: 'My Profile', path: '/member-dashboard/profile', icon: User },
        { label: 'My KYC & Documents', path: '/member-dashboard/documents', icon: FileCheck2 },
        { label: 'My Membership', path: '/member-dashboard/membership', icon: Award },
      ],
    },
    {
      title: 'LOAN SERVICES',
      items: [
        { label: 'Loan Overview', path: '/member-dashboard/loans/overview', icon: PieChart },
        { label: 'Apply for Loan', path: '/member-dashboard/loans/apply', icon: FilePlus2 },
        { label: 'Track Application Status', path: '/member-dashboard/loans/track', icon: ClipboardList },
        { label: 'EMI Schedule', path: '/member-dashboard/loans/emi-schedule', icon: Calendar },
        { label: 'Loan Payment History', path: '/member-dashboard/loans/history', icon: History },
        { label: 'Next Loan Eligibility', path: '/member-dashboard/loans/next-eligibility', icon: Sparkles },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        { label: 'Notifications', path: '/member-dashboard/notifications', icon: Bell },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#0A1628] text-white h-full flex flex-col z-10 shadow-2xl animate-fade-in border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div
            onClick={() => {
              navigate('/');
              onClose();
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-xs text-white block tracking-tight">
                NEW UTKAL FINANCE
              </span>
              <span className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest block">
                CUSTOMER PORTAL
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close menu drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md border border-blue-500/40'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Settings */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block">
              SETTINGS
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChangePassword();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors text-left"
              >
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 shrink-0 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Mutual Financial Platform</span>
        </div>
      </div>
    </div>
  );
}

export default MemberMobileMenu;
