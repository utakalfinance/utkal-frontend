import React from 'react';
import { Menu, LogOut, ShieldCheck } from 'lucide-react';

export function AssociateHeader({ associateUser, onToggleMobileMenu, onLogout }) {
  const associateId = associateUser?.memberId || 'NUF-AS-PENDING';
  const associateName = associateUser?.name || 'Associate Member';

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 z-10 shadow-2xs font-sans">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Associate Member Portal
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Business Associate</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Member Sourcing, Credit Appraisal Referrals &amp; Commission Tracking
          </p>
        </div>
      </div>

      {/* Right: User Dossier & Sign Out */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* User Mini Profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-black flex items-center justify-center text-xs shadow-xs">
            {associateName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[130px]">
              {associateName}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block leading-tight">
              {associateId}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AssociateHeader;
