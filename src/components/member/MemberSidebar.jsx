import React, { useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronRight,
  ShieldCheck,
  Coins,
  Wallet,
  CreditCard,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

/**
 * MemberSidebar Component
 * Grouped navigation per requirements:
 * - CORE PORTAL: Dashboard, My Profile, My KYC & Documents, My Membership
 * - LOAN SERVICES: Loan Overview, Apply for Loan, Track Application Status, EMI Schedule, Loan Payment History, Next Loan Eligibility
 * - NOTIFICATIONS: Notifications
 * - SETTINGS: Change Password, Logout
 */
export function MemberSidebar({ onChangePassword, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = activeRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;

      if (itemTop < containerTop) {
        container.scrollTo({ top: Math.max(0, itemTop - 12), behavior: 'smooth' });
      } else if (itemBottom > containerBottom) {
        container.scrollTo({ top: itemBottom - container.clientHeight + 12, behavior: 'smooth' });
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
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
        { label: 'Available Loans', path: '/member-dashboard/loans/available', icon: Coins },
        { label: 'Apply for Loan', path: '/member-dashboard/loans/apply', icon: FilePlus2 },
        { label: 'Track Application', path: '/member-dashboard/loans/track', icon: ClipboardList },
        { label: 'My Active Loans', path: '/member-dashboard/loans/active', icon: Wallet },
        { label: 'EMI Schedule', path: '/member-dashboard/loans/emi-schedule', icon: Calendar },
        { label: 'Loan Repayment', path: '/member-dashboard/loans/repayment', icon: CreditCard },
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
    <aside className="w-full bg-[#0A1628] text-white flex flex-col h-full border-r border-slate-800/80 select-none overflow-hidden">
      {/* BRANDING HEADER */}
      <div className="p-4 border-b border-slate-800/90 flex items-center gap-3 shrink-0 bg-[#0A1628] z-10">
        <div
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:border-blue-500 transition-colors"
          title="Utkal Finance Home"
        >
          <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h1
            onClick={() => navigate('/')}
            className="text-xs font-black tracking-tight text-white cursor-pointer leading-tight truncate hover:text-blue-300 transition-colors"
          >
            NEW UTKAL <span className="text-blue-400">FINANCE</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-extrabold tracking-wider uppercase text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800/50">
              CUSTOMER PORTAL
            </span>
          </div>
        </div>
      </div>

      {/* SCROLLABLE NAVIGATION LINKS */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h2 className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              {group.title}
            </h2>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/40 border border-blue-500/40'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div
                        ref={isActive ? activeRef : null}
                        className="flex items-center justify-between w-full min-w-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0 opacity-90" />
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* SETTINGS GROUP */}
        <div className="space-y-1.5 pt-1">
          <h2 className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase">
            SETTINGS
          </h2>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={onChangePassword}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Change Password</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER BADGE */}
      <div className="p-3 border-t border-slate-800/90 shrink-0 bg-[#0A1628] flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Verified Mutual Financial Platform</span>
      </div>
    </aside>
  );
}

export default MemberSidebar;
