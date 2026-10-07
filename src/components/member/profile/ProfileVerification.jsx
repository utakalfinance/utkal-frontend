import React from 'react';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';

/**
 * ProfileVerification Component
 * Displays KYC Verification summary and dynamically calculated profile completion bar.
 */
export function ProfileVerification({
  kycStatus = 'Verified',
  completionPercentage = null,
  completedCount = 0,
  totalCount = 0,
}) {
  const hasPercentage = typeof completionPercentage === 'number' && !isNaN(completionPercentage);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* LEFT: STATUS HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#004085] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Profile Verification &amp; KYC
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {kycStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory verification records and official identification compliance.
            </p>
          </div>
        </div>

        {/* RIGHT: DYNAMIC PROGRESS BAR */}
        {hasPercentage && (
          <div className="w-full md:w-64 space-y-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Profile Completion</span>
              <span className="font-mono font-black text-[#004085]">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#004085] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              />
            </div>
            {totalCount > 0 && (
              <p className="text-[10px] text-slate-400 text-right">
                {completedCount} of {totalCount} verified records complete
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
