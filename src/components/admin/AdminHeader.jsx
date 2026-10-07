import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, ChevronDown, ShieldCheck, CheckCircle2, X, Users, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

import brandLogo from '../../assets/image copy 7.png';

export function AdminHeader({ onToggleMobileMenu }) {
  const { 
    adminUser, 
    logoutAdmin, 
    applications = [], 
    members = [], 
    payments = [], 
    unreadPendingAppsCount = 0, 
    markAllApplicationsAsSeen, 
    markApplicationAsSeen 
  } = useAdmin();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const pendingCount = unreadPendingAppsCount;

  // Realtime multi-entity search filtering
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingApps = trimmedQuery
    ? applications
        .filter((a) => {
          return (
            (a.applicantName || '').toLowerCase().includes(trimmedQuery) ||
            (a.id || '').toLowerCase().includes(trimmedQuery) ||
            (a.applicationId || '').toLowerCase().includes(trimmedQuery) ||
            (a.mobile || '').includes(trimmedQuery) ||
            (a.email || '').toLowerCase().includes(trimmedQuery)
          );
        })
        .slice(0, 4)
    : [];

  const matchingMembers = trimmedQuery
    ? members
        .filter((m) => {
          return (
            (m.fullName || m.applicantName || m.name || '').toLowerCase().includes(trimmedQuery) ||
            (m.memberId || m.id || '').toLowerCase().includes(trimmedQuery) ||
            (m.mobile || '').includes(trimmedQuery) ||
            (m.email || '').toLowerCase().includes(trimmedQuery)
          );
        })
        .slice(0, 3)
    : [];

  const matchingPayments = trimmedQuery
    ? payments
        .filter((p) => {
          return (
            (p.utrNumber || p.utr || '').toLowerCase().includes(trimmedQuery) ||
            (p.applicantName || p.memberName || '').toLowerCase().includes(trimmedQuery) ||
            (p.id || '').toLowerCase().includes(trimmedQuery)
          );
        })
        .slice(0, 3)
    : [];

  const hasSearchResults = matchingApps.length > 0 || matchingMembers.length > 0 || matchingPayments.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin-login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    setSearchFocused(false);
    if (matchingApps.length > 0) {
      navigate(`/admin-dashboard/applications/${matchingApps[0]._id || matchingApps[0].id}`);
    } else if (matchingMembers.length > 0) {
      navigate(`/admin-dashboard/members`);
    } else if (matchingPayments.length > 0) {
      navigate(`/admin-dashboard/payments`);
    } else {
      navigate(`/admin-dashboard/applications`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 w-full shadow-2xs select-none">
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* LEFT: MOBILE TOGGLE & BRAND TITLE / SEARCH */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer shrink-0"
            aria-label="Open navigation menu drawer"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* MOBILE BRAND LOGO (Shown only on small screens) */}
          <div 
            onClick={() => navigate('/')} 
            className="lg:hidden flex items-center gap-2 cursor-pointer min-w-0"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 p-0.5 border border-slate-700 shrink-0">
              <img src={brandLogo} alt="New Utkal Finance Emblem" className="w-full h-full object-contain" />
            </div>
            <div className="hidden xs:block sm:block">
              <span className="text-xs font-black text-slate-900 tracking-tight block leading-tight">
                NEW UTKAL <span className="text-blue-700">FINANCE LTD.</span>
              </span>
              <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase block leading-none">
                TRUST • GROWTH • PROSPERITY
              </span>
            </div>
          </div>

          {/* DESKTOP SEARCH BAR WITH LIVE RESULTS POPUP */}
          <div className="relative w-full max-w-sm hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search applications, members, UTR..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-900 rounded-xl pl-9 pr-8 py-2 border border-slate-200 focus:border-blue-600 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* LIVE SEARCH RESULTS DROPDOWN */}
            {searchFocused && trimmedQuery && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2.5 z-50 text-left animate-fade-in max-h-96 overflow-y-auto divide-y divide-slate-100">
                {/* APPLICATIONS SECTION */}
                {matchingApps.length > 0 && (
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Applications ({matchingApps.length})</span>
                    </div>
                    {matchingApps.map((app) => (
                      <div
                        key={app._id || app.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate(`/admin-dashboard/applications/${app._id || app.id}`);
                        }}
                        className="px-3.5 py-2 hover:bg-blue-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                              {app.applicantName}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                              {app.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {app.mobile} {app.email ? `• ${app.email}` : ''}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-blue-600 flex items-center gap-0.5 shrink-0 ml-2">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* MEMBERS SECTION */}
                {matchingMembers.length > 0 && (
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>Members ({matchingMembers.length})</span>
                    </div>
                    {matchingMembers.map((member) => (
                      <div
                        key={member._id || member.id || member.memberId}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate(`/admin-dashboard/members`);
                        }}
                        className="px-3.5 py-2 hover:bg-emerald-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                              {member.fullName || member.applicantName || member.name}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold">
                              {member.memberId || member.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{member.mobile}</div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-emerald-600 flex items-center gap-0.5 shrink-0 ml-2">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* PAYMENTS / UTR SECTION */}
                {matchingPayments.length > 0 && (
                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-amber-600" />
                      <span>Payments / UTR ({matchingPayments.length})</span>
                    </div>
                    {matchingPayments.map((p) => (
                      <div
                        key={p.id || p.utrNumber}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate(`/admin-dashboard/payments`);
                        }}
                        className="px-3.5 py-2 hover:bg-amber-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-amber-700">
                              UTR: {p.utrNumber || p.utr || p.id}
                            </span>
                            <span className="text-xs font-black text-emerald-700">
                              ₹{p.amount || 200}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {p.applicantName || p.memberName || 'Membership Payment'}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-amber-600 flex items-center gap-0.5 shrink-0 ml-2">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* NO RESULTS */}
                {!hasSearchResults && (
                  <div className="p-4 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">No matching records found</p>
                    <p className="text-[11px] text-slate-400">
                      No applications, members, or UTRs match &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: NOTIFICATION & ADMIN USER PROFILE DROPDOWN */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATION BUTTON - NAVIGATE TO NOTICES PAGE */}
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/notices')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            title="Notices & Circulars"
          >
            <Bell className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
          </button>

          {/* ADMIN USER PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0B1528] text-white flex items-center justify-center font-black text-xs shadow-xs border border-slate-700">
                A
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-black text-slate-900 leading-tight">Admin</div>
                <div className="text-[10px] font-bold text-slate-500 leading-tight">Administrator</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-left animate-fade-in space-y-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900">{adminUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{adminUser.email}</p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Logout</span>
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

export default AdminHeader;
