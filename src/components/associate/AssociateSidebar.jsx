import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

export function AssociateSidebar({ associateUser, onLogout }) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/associate-dashboard', icon: LayoutDashboard, end: true },
    { label: 'Investor Management', path: '/associate-dashboard/investors', icon: TrendingUp },
    { label: 'My Profile', path: '/associate-dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-full bg-[#0B1528] text-white flex flex-col h-full border-r border-slate-800/80 select-none overflow-hidden font-sans">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/90 flex items-center gap-3 shrink-0 bg-[#0B1528] z-10">
        <div
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:border-emerald-500 transition-colors"
          title="Go to Website Home"
        >
          <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h1
            onClick={() => navigate('/')}
            className="text-xs font-black tracking-wider text-white uppercase cursor-pointer hover:text-emerald-400 transition-colors truncate"
          >
            New Utkal Finance
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 font-mono tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Associate Member Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                      isActive ? 'opacity-100 text-emerald-200' : 'opacity-0 group-hover:opacity-60 text-slate-400'
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}

        {/* Logout Item */}
        <div className="pt-4 border-t border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <LogOut className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">Sign Out</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Statutory Footer Badge */}
      <div className="p-3 border-t border-slate-800/90 text-center shrink-0 bg-[#091122]">
        <span className="text-[10px] text-slate-400 font-mono block">
          Reg. No.: U64199OD2026PLC054968
        </span>
        <span className="text-[9px] text-emerald-500 font-semibold inline-flex items-center gap-1 mt-0.5">
          <Award className="w-3 h-3" />
          <span>Statutory Associate Member Class</span>
        </span>
      </div>
    </aside>
  );
}

export default AssociateSidebar;
