import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Receipt,
  BarChart3,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

export function DistrictSidebar({ adminUser, onLogout }) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/district-dashboard', icon: LayoutDashboard, end: true },
    { label: 'Associate Management', path: '/district-dashboard/associates', icon: Users },
    { label: 'Referral Management', path: '/district-dashboard/referrals', icon: UserPlus },
    { label: 'Financial Records', path: '/district-dashboard/financial-records', icon: Receipt },
    { label: 'Reports', path: '/district-dashboard/reports', icon: BarChart3 },
    { label: 'My Profile', path: '/district-dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-full bg-[#0B1528] text-white flex flex-col h-full border-r border-slate-800/80 select-none overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/90 flex items-center gap-3 shrink-0 bg-[#0B1528] z-10">
        <div
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:border-blue-500 transition-colors"
          title="Go to Website Home"
        >
          <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h1
            onClick={() => navigate('/')}
            className="text-xs font-black tracking-wider text-white uppercase cursor-pointer hover:text-blue-400 transition-colors truncate"
          >
            Utkal Finance
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 font-mono tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">District Partner Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
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
                    ? 'bg-[#004085] text-white shadow-md border border-blue-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                      isActive ? 'opacity-100 text-blue-300' : 'opacity-0 group-hover:opacity-60 text-slate-400'
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}

        {/* Explicit Logout Nav Item */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <LogOut className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">Logout</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60" />
        </button>
      </nav>

      {/* User Footer & Quick Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {adminUser?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'District Partner'}</p>
              <p className="text-[10px] text-blue-300 font-mono truncate">District Partner</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default DistrictSidebar;
