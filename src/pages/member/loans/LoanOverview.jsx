import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileText,
  Wallet,
  Sparkles,
  Calendar,
  IndianRupee,
  Building2,
  AlertTriangle,
  BadgeAlert,
  HelpCircle,
  Award,
  Layers,
  MapPin,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchCustomerLoanOverviewApi } from '../../../services/customerLoanService';

/**
 * LoanOverview Page (/member-dashboard/loans/overview)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Implements Section 1 & 10:
 * 1. Loan Eligibility (Statutory membership & 10 shares status)
 * 2. First Loan Amount: Fixed ₹10,000 (Approved Client Policy)
 * 3. Application Status (Live backend status)
 * 4. Selected Repayment Tenure (3, 6, or 9 Months)
 * 5. Approved Loan Amount (Sanctioned by Super Admin)
 * 6. EMI Information (Monthly installment or awaiting disbursement)
 * 7. Quick navigation cards with modern fintech aesthetics.
 */
export function LoanOverview() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, application, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    loanEligibility: {
      isEligible: false,
      statusText: 'Checking eligibility...',
      memberStatus: 'under_review',
      numberOfShares: 10,
    },
    firstLoanAmount: 10000,
    applicationStatus: 'Not Applied',
    selectedRepaymentTenure: null,
    approvedLoanAmount: null,
    emiInformation: {
      isAvailable: false,
      message: 'Your EMI schedule will be available after loan approval and successful disbursement.',
      nextEmiDueDate: null,
      nextEmiAmount: 0,
      monthlyEmi: 0,
    },
    nextLoanEligibility: {
      isUnlocked: false,
      currentLevel: 'First Member Loan (₹10,000)',
      message: 'First loan of ₹10,000 must be taken and fully repaid to unlock the next credit tier.',
      nextEligibleAmount: null,
    },
    latestApplication: null,
    member: null,
  });

  const initialOverviewState = {
    loanEligibility: {
      isEligible: false,
      statusText: 'Checking eligibility...',
      memberStatus: 'under_review',
      numberOfShares: 10,
    },
    firstLoanAmount: 10000,
    applicationStatus: 'Not Applied',
    selectedRepaymentTenure: null,
    approvedLoanAmount: null,
    emiInformation: {
      isAvailable: false,
      message: 'Your EMI schedule will be available after loan approval and successful disbursement.',
      nextEmiDueDate: null,
      nextEmiAmount: 0,
      monthlyEmi: 0,
    },
    nextLoanEligibility: {
      isUnlocked: false,
      currentLevel: 'First Member Loan (₹10,000)',
      message: 'First loan of ₹10,000 must be taken and fully repaid to unlock the next credit tier.',
      nextEligibleAmount: null,
    },
    latestApplication: null,
    member: null,
  };

  const loadData = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setOverview(initialOverviewState);
    try {
      const data = await fetchCustomerLoanOverviewApi(token);
      setOverview(data);
    } catch (err) {
      console.warn('Customer loan overview fetch error:', err.message);
      setError(err.message || 'Unable to retrieve loan overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, memberUser?._id]);

  const memberName =
    overview?.member?.name ||
    memberUser?.name ||
    memberDetails?.name ||
    application?.applicantName ||
    'Valued Member';

  const memberId =
    overview?.member?.memberId ||
    memberUser?.memberId ||
    memberDetails?.memberId ||
    application?.memberId ||
    '—';

  const memberDistrict =
    overview?.member?.district ||
    memberDetails?.addressDetails?.district ||
    application?.addressDetails?.district ||
    'Khurda';

  const isEligible = overview.loanEligibility?.isEligible;
  const hasApp = overview.applicationStatus && overview.applicationStatus !== 'Not Applied';

  const formatDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending District Verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Verification':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Verified by District Admin – Pending Final Approval':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold';
      case 'Forwarded to Super Admin':
      case 'Pending Final Approval':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Disbursed':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-black';
      case 'On Hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Loan Services Overview"
        description="Official statutory member credit facility under New Utkal Finance Ltd. All eligible members start with the approved First Member Loan of ₹10,000."
        badge="CREDIT FACILITY"
        breadcrumbs={[
          { label: 'Member Portal', path: '/member-dashboard' },
          { label: 'Loan Services' },
        ]}
      >
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          title="Refresh Overview"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </MemberPageHeader>

      {/* MEMBER & JURISDICTION HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#0A1628] via-[#102244] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                DISTRICT JURISDICTION: {memberDistrict.toUpperCase()}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30">
                10 VERIFIED SHARES
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {memberName}
            </h2>

            <p className="text-xs text-blue-200/90 leading-relaxed font-mono">
              Member ID: <strong className="text-white">{memberId}</strong> • Statutory First Loan Ceiling: ₹10,000
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/member-dashboard/loans/apply')}
              disabled={!isEligible}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Apply for First Loan
            </button>
            <button
              onClick={() => navigate('/member-dashboard/loans/track')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              Track Application
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 6 CLIENT REQUIREMENTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Loan Eligibility */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 01
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isEligible ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                {isEligible ? <UserCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Statutory Loan Eligibility
              </h3>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    isEligible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {overview.loanEligibility?.statusText || 'Eligibility Active'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {isEligible
                ? 'Your statutory membership dossier and minimum 10 equity shares are verified. You are qualified to apply for the First Member Loan.'
                : 'Membership requires approved registration and ₹200 share capital allotment before credit access.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Class: Associate Member</span>
            <span className="font-bold text-slate-700">10 Equity Shares</span>
          </div>
        </div>

        {/* 2. First Loan Amount */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 02
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                First Loan Principal
              </h3>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                ₹{Number(overview.firstLoanAmount || 10000).toLocaleString('en-IN')}
              </div>
              <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 mt-1.5">
                Approved Client Policy Fixed Amount
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with client bylaws, newly admitted members must start with this fixed ₹10,000 credit limit. Custom amounts are not permitted.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Interest Tier: 11% / 12% CIBIL</span>
            <span className="font-bold text-blue-700">Option 1 Reducing</span>
          </div>
        </div>

        {/* 3. Application Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 03
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Current Application Status
              </h3>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(
                    overview.applicationStatus
                  )}`}
                >
                  {overview.applicationStatus || 'Not Applied'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {overview.latestApplication ? (
                <>
                  Dossier <strong className="text-blue-700 font-mono">{overview.latestApplication.applicationId}</strong> submitted on{' '}
                  {formatDate(overview.latestApplication.createdAt)} routed to {memberDistrict} District Branch.
                </>
              ) : (
                'No active loan application in pipeline. Click "Apply for Loan" to begin your statutory application.'
              )}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pipeline Stage:</span>
            <button
              onClick={() => navigate('/member-dashboard/loans/track')}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              View Full Timeline &rarr;
            </button>
          </div>
        </div>

        {/* 4. Selected Repayment Tenure */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 04
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Repayment Tenure
              </h3>
              <div className="text-xl font-black text-slate-900 tracking-tight mt-1">
                {overview.selectedRepaymentTenure || '3, 6, or 9 Months'}
              </div>
              <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 mt-1.5">
                Allowed Terms: 3, 6, or 9 Months Only
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {overview.selectedRepaymentTenure
                ? `Repayment schedule is configured for ${overview.selectedRepaymentTenure} based on your application submission.`
                : 'Members choose either 3, 6, or 9 equal monthly installments during application.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Options: 3 Mo / 6 Mo / 9 Mo</span>
            <span className="font-bold text-slate-700">Monthly EMI</span>
          </div>
        </div>

        {/* 5. Approved Loan Amount */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 05
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Sanctioned Loan Amount
              </h3>
              <div className="text-xl font-black text-slate-900 tracking-tight mt-1">
                {overview.approvedLoanAmount
                  ? `₹${Number(overview.approvedLoanAmount).toLocaleString('en-IN')}`
                  : 'Pending Final Sanction'}
              </div>
              <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md mt-1.5">
                Super Admin Final Sanction
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {overview.approvedLoanAmount
                ? 'Your credit facility is officially sanctioned by Super Admin. Disbursement proceeds separately.'
                : 'The sanctioned credit limit appears here once Super Admin completes the two-tier audit.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Disbursement:</span>
            <span className="font-bold text-slate-700">Separate Step</span>
          </div>
        </div>

        {/* 6. EMI Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Requirement 06
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                EMI Repayment Ledger
              </h3>
              {overview.emiInformation?.isAvailable ? (
                <div className="mt-1">
                  <div className="text-xl font-black text-blue-700">
                    ₹{Number(overview.emiInformation.monthlyEmi || 0).toLocaleString('en-IN')}/mo
                  </div>
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md mt-1">
                    Next Due: {formatDate(overview.emiInformation.nextEmiDueDate)}
                  </span>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                  {overview.emiInformation?.message ||
                    'Your EMI schedule will be available after loan approval and successful disbursement.'}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Repayments and monthly installments activate upon recorded funds disbursement.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Timetable:</span>
            <button
              onClick={() => navigate('/member-dashboard/loans/emi-schedule')}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Open EMI Schedule &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW NAVIGATION TILES */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Statutory Loan Portal Navigation & Quick Actions
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            ALL CLIENT SERVICES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/member-dashboard/loans/apply')}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left space-y-2 group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 group-hover:text-blue-700 text-xs tracking-tight">
                Apply for Loan
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Apply for the ₹10,000 First Member Loan with 3, 6, or 9 months tenure.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/member-dashboard/loans/track')}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left space-y-2 group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 group-hover:text-blue-700 text-xs tracking-tight">
                Track Application Status
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Monitor District verification and Super Admin final sanction progress.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/member-dashboard/loans/emi-schedule')}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left space-y-2 group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 group-hover:text-blue-700 text-xs tracking-tight">
                EMI Schedule
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Review installment breakdown, interest tier, and repayment timetable.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/member-dashboard/loans/next-eligibility')}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left space-y-2 group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 group-hover:text-blue-700 text-xs tracking-tight">
                Next Loan Eligibility
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Unlock higher credit tiers after 100% verified settlement of your first loan.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanOverview;