import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  KeyRound,
  Award,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';

/**
 * MemberHeader component
 * Clean fintech/banking top header with live status pill, notifications, and profile dropdown.
 */
export function MemberHeader({
  memberUser,
  onToggleMobileMenu,
  onChangePassword,
  onLogout,
  pageTitle,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getComputedTitle = () => {
    if (pageTitle) return pageTitle;
    const path = location.pathname;
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/documents') || path.includes('/kyc-documents')) return 'My KYC & Documents';
    if (path.includes('/membership')) return 'My Membership';
    if (path.includes('/loans/overview')) return 'Loan Overview';
    if (path.includes('/loans/apply')) return 'Apply for Loan';
    if (path.includes('/loans/track')) return 'Track Application Status';
    if (path.includes('/loans/emi-schedule')) return 'EMI Schedule';
    if (path.includes('/loans/history')) return 'Loan Payment History';
    if (path.includes('/loans/next-eligibility')) return 'Next Loan Eligibility';
    if (path.includes('/notifications')) return 'Notifications Desk';
    return 'Dashboard';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const memberId = memberUser?.memberId || '—';
  const memberName = memberUser?.name || 'Valued Member';
  const memberInitial = memberName.charAt(0).toUpperCase() || 'M';
  const memberStatus =
    memberUser?.status === 'active'
      ? 'Active Member'
      : (memberUser?.status ? memberUser.status.charAt(0).toUpperCase() + memberUser.status.slice(1) : 'Active Member');

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 w-full select-none shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: MOBILE TOGGLE & BREADCRUMB / TITLE */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* MOBILE LOGO (Only on smaller screens) */}
          <div
            onClick={() => navigate('/')}
            className="lg:hidden flex items-center gap-2 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 p-0.5 border border-slate-700 shrink-0">
              <img
                src={brandLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden xs:block truncate">
              <span className="text-xs font-black text-slate-900 tracking-tight block leading-tight">
                NEW UTKAL <span className="text-blue-700">FINANCE</span>
              </span>
            </div>
          </div>

          {/* DESKTOP BREADCRUMB / PAGE TITLE */}
          <div className="hidden lg:flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-400">Portal</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-sm font-black text-slate-900 tracking-tight">
              {getComputedTitle()}
            </h1>
          </div>
        </div>

        {/* RIGHT: STATUS PILL, NOTIFICATIONS & USER DROPDOWN */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* STATUTORY MEMBERSHIP STATUS PILL */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-black">{memberId}</span>
            <span className="text-emerald-300">•</span>
            <span className="text-[11px] font-bold">{memberStatus}</span>
          </div>

          {/* NOTIFICATION BUTTON */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {notifPopoverOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl py-3 z-50 text-left animate-fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    Notifications Desk
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                    Live
                  </span>
                </div>
                <div className="p-4 text-center text-slate-500 text-xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-800">Account Synchronized</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    View official statutory circulars, KYC decisions, and loan updates.
                  </p>
                  <Link
                    to="/member-dashboard/notifications"
                    onClick={() => setNotifPopoverOpen(false)}
                    className="inline-block pt-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Open Notification Desk →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* MEMBER PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-[#004085] text-white flex items-center justify-center font-black text-xs shadow-xs">
                {memberInitial}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <div className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                  {memberName}
                </div>
                <div className="text-[10px] font-mono text-slate-500 leading-tight">
                  {memberId}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 text-left animate-fade-in space-y-1">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">{memberName}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {memberId}</p>
                </div>

                <Link
                  to="/member-dashboard/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/member-dashboard/documents"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-slate-500" />
                  <span>My KYC & Documents</span>
                </Link>

                <Link
                  to="/member-dashboard/membership"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4 text-slate-500" />
                  <span>My Membership</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onChangePassword?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span>Change Password</span>
                </button>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default MemberHeader;
