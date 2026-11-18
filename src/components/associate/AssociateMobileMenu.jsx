import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

export function AssociateMobileMenu({ isOpen, onClose, associateUser, onLogout }) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', path: '/associate-dashboard', icon: LayoutDashboard, end: true },
    { label: 'Investor Management', path: '/associate-dashboard/investors', icon: TrendingUp },
    { label: 'My Profile', path: '/associate-dashboard/profile', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B1528] text-white flex flex-col shadow-2xl z-10 animate-fade-in border-r border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 p-0.5 flex items-center justify-center">
              <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-white block">New Utkal Finance</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">Associate Member</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssociateMobileMenu;
