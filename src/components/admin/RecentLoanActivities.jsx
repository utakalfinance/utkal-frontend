import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';

/**
 * RecentLoanActivities Component
 * Displays real credit facility activities, member requests, and loan inquiry audit trails.
 * Directly uses real backend data from MongoDB.
 */
export function RecentLoanActivities({ loanActivities = [] }) {
  const navigate = useNavigate();

  const hasActivities = Array.isArray(loanActivities) && loanActivities.length > 0;

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'converted' || s === 'approved') {
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', label: 'Approved / Converted', icon: CheckCircle2 };
    }
    if (s === 'closed') {
      return { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Closed', icon: CheckCircle2 };
    }
    if (s === 'contacted' || s === 'membership registration informed') {
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70', label: 'In Review', icon: Clock };
    }
    return { bg: 'bg-amber-50 text-amber-700 border-amber-200/70', label: 'New / Pending Review', icon: Clock };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden text-left space-y-0 h-full flex flex-col justify-between">
      {/* HEADER */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-700" />
              <span>Recent Loan Activities</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              {loanActivities.length} {loanActivities.length === 1 ? 'Record' : 'Records'} Live
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Live audit feed of member loan requests, category verifications, and credit approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/loans')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5 text-blue-600" />
          <span>Full Loan Desk</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="p-3 sm:p-4 flex-1">
        {hasActivities ? (
          <div className="divide-y divide-slate-100 space-y-2">
            {loanActivities.slice(0, 6).map((act, idx) => {
              const badge = getStatusBadge(act.status);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={act.id || idx}
                  className="py-2.5 px-2 hover:bg-slate-50/70 rounded-xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => navigate('/admin-dashboard/loans')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 text-xs truncate">
                          {act.fullName || act.title || 'Applicant'}
                        </p>
                        <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50/60 px-1.5 py-0.2 rounded">
                          {act.enquiryId || act.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {act.loanCategory || 'General Loan'}
                        {act.expectedAmount > 0 && ` • ₹${Number(act.expectedAmount).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${badge.bg}`}>
                      <BadgeIcon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="py-6 px-4 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
              <Coins className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">
                No Loan Activities Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The statutory credit facility pipeline is operational. When approved members submit credit applications, verification milestones and loan disbursals will log here automatically in real time.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/loan-enquiries')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
              >
                <span>Check Visitor Loan Enquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER AUDIT STAMP */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium">Audit Protocol: Realtime Sync</span>
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/loan-enquiries')}
          className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <span>View All in Loan Console</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default RecentLoanActivities;
