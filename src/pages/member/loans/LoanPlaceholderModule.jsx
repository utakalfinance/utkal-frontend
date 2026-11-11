import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';

/**
 * LoanPlaceholderModule Component
 * Provides informative and cohesive UI for submenu routes in preparation for subsequent phase.
 */
export function LoanPlaceholderModule({ title = 'Loan Service', description }) {
  const navigate = useNavigate();
  const { memberUser, memberDetails, application } = useMemberAuth();

  const memberId =
    memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title={title}
        description={
          description ||
          `Statutory credit service module for verified members of New Utkal Finance Ltd.`
        }
        badge="STATUTORY LOAN SERVICES"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: title },
        ]}
      >
        <button
          type="button"
          onClick={() => navigate('/member-dashboard/loans/available')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-700/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Available Loans</span>
        </button>
      </MemberPageHeader>

      {/* INFORMATIVE CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6 max-w-3xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {title} • Statutory Member Desk
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              New Utkal Finance Ltd. operates under statutory cooperative lending guidelines. First-time approved members are eligible for an introductory loan of <strong className="text-slate-800 font-bold">₹10,000</strong> at <strong className="text-emerald-700 font-bold">5% interest rate</strong> with repayment within <strong className="text-slate-800 font-bold">2 months</strong>.
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Applicant Account</span>
            <span className="font-mono font-bold text-blue-700">{memberId}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Introductory Loan Principal</span>
            <span className="font-bold text-slate-900">₹10,000</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Statutory Interest Rate</span>
            <span className="font-bold text-emerald-700">5% Flat</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Repayment Tenure</span>
            <span className="font-bold text-slate-900">Within 2 Months</span>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong>Procedural Rule:</strong> Loan approval and funds disbursement operate as independent stages. Submitting an application initiates document verification, while funds release follows statutory administrative sanction.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/member-dashboard/loans/overview')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span>Back to Loan Overview</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/member-dashboard/loans/available')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
          >
            <span>View Available Loans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Statutory Cooperative Member Lending • Nidhi Rules 2014 Compliant</span>
        </div>
        <span className="text-[11px] font-mono hidden sm:inline">Member ID: {memberId}</span>
      </div>
    </div>
  );
}

export default LoanPlaceholderModule;
