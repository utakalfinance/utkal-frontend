import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderCheck,
  CreditCard,
  PiggyBank,
  Bell,
  Image as ImageIcon,
  UserCheck,
  User,
  LogOut,
  BookOpen,
  X,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  HelpCircle,
  Coins,
  CheckCircle2,
  Wallet,
  Receipt,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import brandLogo from '../../assets/image copy 7.png';

export function AdminMobileMenu({ isOpen, onClose }) {
  const { logoutAdmin, unreadPendingAppsCount = 0, unreadNoticesCount = 0 } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    logoutAdmin();
    navigate('/login', { replace: true });
  };

  const isApplicationsActive = location.pathname.startsWith('/admin-dashboard/applications');
  const applicationsBadgeCount = isApplicationsActive ? null : (unreadPendingAppsCount > 0 ? unreadPendingAppsCount : null);

  const links = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    {
      label: 'Applications Desk',
      path: '/admin-dashboard/applications',
      icon: FileText,
      badge: applicationsBadgeCount,
      badgeColor: 'bg-amber-500 text-white font-black'
    },
    { label: 'Member Management', path: '/admin-dashboard/members', icon: Users },
    { label: 'Profile Update Requests', path: '/admin-dashboard/profile-updates', icon: UserCheck },
    { label: 'Documents & Audit', path: '/admin-dashboard/documents', icon: FolderCheck },
    { label: 'Payments', path: '/admin-dashboard/payments', icon: CreditCard },
    { label: 'Investor Management', path: '/admin-dashboard/investors', icon: TrendingUp },
    { label: 'Loan Dashboard', path: '/admin-dashboard/loan-dashboard', icon: Coins },
    { label: 'Loan Approvals', path: '/admin-dashboard/loans', icon: CheckCircle2 },
    { label: 'Disbursements', path: '/admin-dashboard/loan-disbursements', icon: Wallet },
    { label: 'User EMI Collections', path: '/admin-dashboard/emi-collections', icon: Receipt },
    { label: 'Loan Enquiries', path: '/admin-dashboard/loan-enquiries', icon: HelpCircle },
    {
      label: 'Notices & Circulars',
      path: '/admin-dashboard/notices',
      icon: Bell,
      badge: unreadNoticesCount > 0 ? unreadNoticesCount : null,
      badgeColor: 'bg-blue-500 text-white font-black'
    },
    { label: 'Admin Profile & Settings', path: '/admin-dashboard/profile', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Dark transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in drawer container */}
      <div className="relative w-80 max-w-[85vw] bg-[#0B1528] text-white h-full flex flex-col z-10 shadow-2xl animate-fade-in border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div
            onClick={() => { navigate('/'); onClose(); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="New Utkal Finance Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-xs text-white block tracking-tight">NEW UTKAL FINANCE LTD.</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">TRUST • GROWTH • PROSPERITY</span>
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

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <span className="px-3 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase block mb-1">
            NAVIGATION MENU
          </span>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin-dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${isActive
                    ? 'bg-[#004085] text-white shadow-md border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.hasPulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.badgeColor} shadow-xs`}>
                      {item.badge}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminMobileMenu;
