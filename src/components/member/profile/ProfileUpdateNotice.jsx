import React from 'react';
import { ShieldAlert, Info, Building2, PhoneCall, Mail } from 'lucide-react';

/**
 * ProfileUpdateNotice Component
 * Displays statutory compliance notice regarding profile modifications.
 */
export function ProfileUpdateNotice({
  branchName = 'Bhubaneswar HQ (Nayapalli, Khurda)',
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-200/80 p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              Need to update your information?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with statutory compliance guidelines, modifications to verified identity or contact information require verification from your assigned branch administrator.
            </p>
          </div>
        </div>

        {/* ASSIGNED BRANCH BADGE */}
        <div className="flex items-center gap-2 self-stretch md:self-auto bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs shrink-0 shadow-2xs">
          <Building2 className="w-4 h-4 text-[#004085] shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
              Assigned Branch
            </span>
            <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
              {branchName || 'New Utkal Finance Head Office'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
