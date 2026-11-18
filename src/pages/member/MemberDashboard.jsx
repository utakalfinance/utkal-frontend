import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  User,
  Mail,
  Phone,
  Coins,
  FilePlus2,
  ClipboardList,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  ArrowLeftRight,
  Wallet,
  AlertCircle,
  FileCheck2,
  Sparkles,
  TrendingUp,
  Landmark,
  BadgeCheck,
} from 'lucide-react';
import { MemberStatCard } from '../../components/member/MemberStatCard';
import { EmptyState } from '../../components/member/EmptyState';
import { StatusBadge } from '../../components/member/StatusBadge';
import { useMemberAuth } from '../../hooks/useMemberAuth';
import { fetchCustomerLoanOverviewApi } from '../../services/customerLoanService';

/**
 * MemberDashboard Page (/member-dashboard)
 * Completely redesigned modern fintech / banking customer portal.
 * Features:
 * - Visually attractive welcome hero section with customer name, Member ID, membership status
 * - KYC verification progress bar (100% verified for approved members)
 * - Loan application status pill
 * - Active loan summary
 * - Next EMI due date & remaining loan balance
 * - Quick action buttons: Apply for Loan, Track Application, View EMI Schedule
 * - Responsive cards, subtle shadows, clean white and light-blue aesthetics
 */
export function MemberDashboard() {
  const navigate = useNavigate();
  const { openChangePassword } = useOutletContext() || {};
  const { memberUser, memberDetails, application, payments = [], token } = useMemberAuth();

  const [loanOverview, setLoanOverview] = useState(null);
  const [loanLoading, setLoanLoading] = useState(true);

  // Fetch real loan overview for the authenticated customer
  useEffect(() => {
    let isMounted = true;
    const loadOverview = async () => {
      if (!token) {
        setLoanLoading(false);
        return;
      }
      try {
        setLoanLoading(true);
        const data = await fetchCustomerLoanOverviewApi(token);
        if (isMounted) {
          setLoanOverview(data);
        }
      } catch (err) {
        console.warn('Could not load loan overview stats in dashboard:', err.message);
      } finally {
        if (isMounted) setLoanLoading(false);
      }
    };

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, [token, memberUser?._id]);

  const memberId = memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';
  const name = memberUser?.name || memberDetails?.name || application?.applicantName || 'Valued Member';
  const email = memberDetails?.email || memberUser?.email || application?.contactDetails?.email || '—';
  const mobile = memberDetails?.mobile || memberUser?.mobile || application?.contactDetails?.mobile || '—';
  const membershipStatus =
    memberUser?.status === 'active' || memberDetails?.status === 'active' || application?.status === 'approved'
      ? 'Active'
      : (memberUser?.status || 'Active');
  const membershipType =
    memberDetails?.membershipType ||
    application?.membershipDetails?.membershipType ||
    application?.membershipType ||
    'Associate Member';

  const isCorrectionRequired =
    application?.status === 'correction_required' ||
    memberDetails?.status === 'correction_required' ||
    application?.correctionRequested === true;

  // KYC Verification Progress Calculation
  const hasIdProof = Boolean(
    application?.documentDetails?.idProofUrl ||
    application?.documentDetails?.idProof ||
    application?.documentDetails?.doc2_govId ||
    memberDetails?.documentDetails?.idProofUrl
  );
  const hasAddressProof = Boolean(
    application?.documentDetails?.addressProofUrl ||
    application?.documentDetails?.addressProof ||
    memberDetails?.documentDetails?.addressProofUrl
  );
  const isKycFullyApproved = membershipStatus === 'Active';
  const kycPercent = isKycFullyApproved ? 100 : hasIdProof && hasAddressProof ? 75 : hasIdProof ? 50 : 25;

  // Loan metrics from real backend loan overview
  const rawLoanStatus = loanOverview?.applicationStatus || 'Not Applied';
  const hasLoanApplied =
    rawLoanStatus !== 'Not Applied' &&
    loanOverview?.latestApplication !== null &&
    loanOverview?.totalLoanApplications > 0;

  const activeLoanAmount = Number(loanOverview?.totalDisbursedAmount || 0);
  const remainingLoanBalance = Number(loanOverview?.outstandingLoanBalance || 0);
  const nextEmiDueDate = loanOverview?.nextEmiDueDate;
  const nextEmiAmount = Number(loanOverview?.nextEmiAmount || 0);
  const hasActiveLoan = loanOverview?.activeLoans > 0 || (activeLoanAmount > 0 && remainingLoanBalance > 0);

  // Financial summary from real payments
  const verifiedPaymentsSum = payments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingPaymentsSum = payments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalTransactionsCount = payments.length;

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getLoanStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Disbursed':
        return { text: 'Active & Disbursed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20' };
      case 'Approved':
      case 'Approved - Not Disbursed':
      case 'Approved – Not Disbursed':
        return { text: 'Approved (Pending Disbursement)', color: 'bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-500/20' };
      case 'Pending Final Approval':
      case 'Forwarded to Super Admin':
      case 'Verified by District Admin – Pending Final Approval':
        return { text: 'Pending Super Admin Approval', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'Pending District Verification':
      case 'Under Verification':
      case 'Submitted':
        return { text: 'Pending Super Admin Approval', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'On Hold':
        return { text: 'On Hold', color: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'Rejected':
        return { text: 'Application Rejected', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { text: 'Not Applied', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const loanBadge = getLoanStatusBadge(rawLoanStatus);

  return (
    <div className="space-y-6 sm:space-y-7 pb-10">
      {/* 0B. CORRECTION REQUIRED BANNER */}
      {isCorrectionRequired && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-950">
                Action Required: Document Correction Requested by Administration
              </p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                {application?.rejectionReason || 'Please review your uploaded documents and resubmit the requested corrections.'}
              </p>
            </div>
          </div>
          <Link
            to="/member-dashboard/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Update Documents</span>
          </Link>
        </div>
      )}

      {/* 1. HERO WELCOME SECTION */}
      <div className="bg-gradient-to-r from-[#0A1628] via-[#0E2242] to-[#004085] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        {/* Subtle decorative radial blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {membershipStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, {name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Track your statutory share capital, member credit facilities, EMI schedule, and official compliance records all in one unified fintech dashboard.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/member-dashboard/loans/apply"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Apply for Loan</span>
            </Link>

            <Link
              to="/member-dashboard/loans/track"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/15 active:scale-95 transition-all border border-white/20 backdrop-blur-xs cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-cyan-300" />
              <span>Track Application</span>
            </Link>

            <Link
              to="/member-dashboard/loans/emi-schedule"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/15 active:scale-95 transition-all border border-white/20 backdrop-blur-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>View EMI Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. CORE STATUS SUMMARY (SECTION 3 METRICS GRID) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Account & Credit Status Overview
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Live Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Membership Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Membership
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {membershipStatus}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                {membershipType}
              </span>
            </div>
          </div>

          {/* Card 2: KYC Verification Progress */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                KYC Verification
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-900 mb-1">
                <span>{isKycFullyApproved ? 'Verified' : 'In Progress'}</span>
                <span className="text-emerald-700">{kycPercent}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${kycPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">MCA Compliant</span>
            </div>
          </div>

          {/* Card 3: Loan Application Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Loan Application
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-tight border truncate max-w-full ${loanBadge.color}`}
                title={loanBadge.text}
              >
                {loanBadge.text}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 truncate">
                {loanOverview?.latestApplication?.applicationId || 'Introductory: ₹10,000'}
              </span>
            </div>
          </div>

          {/* Card 4: Active Loan Amount */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Active Loan
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
                {hasActiveLoan ? formatCurrency(activeLoanAmount) : '₹0'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                {hasActiveLoan ? 'Disbursed Principal' : 'No Active Loan'}
              </span>
            </div>
          </div>

          {/* Card 5: Next EMI Due Date */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Next EMI Due
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-800 tracking-tight truncate">
                {hasActiveLoan && nextEmiDueDate
                  ? formatDate(nextEmiDueDate)
                  : hasActiveLoan
                  ? 'Awaiting Confirmation'
                  : 'None Scheduled'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                {hasActiveLoan && nextEmiAmount > 0
                  ? `Amount: ${formatCurrency(nextEmiAmount)}`
                  : 'Subject to disbursement'}
              </span>
            </div>
          </div>

          {/* Card 6: Remaining Loan Balance */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Loan Balance
              </span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
                {hasActiveLoan ? formatCurrency(remainingLoanBalance) : '₹0'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                {hasActiveLoan ? 'Remaining Principal' : '₹0 Dues (Clean)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC LOAN JOURNEY CARD WITH EMPTY STATE */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Member Credit Facility Pipeline
              </h2>
              <p className="text-[11px] text-slate-500">
                Statutory loan application tracking, disbursement lifecycle, and repayment status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/member-dashboard/loans/overview"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              <span>Full Loan Services Hub</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dynamic render */}
        {!hasLoanApplied ? (
          /* EMPTY STATE CARD: Modern fintech CTA */
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-white border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                First Member Loan Opportunity
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                You Are Eligible to Apply for ₹10,000
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As an admitted member with 10 verified statutory shares, you can apply for the introductory First Member Loan facility. Choose from 3, 6, or 9 months tenure with reducing balance interest.
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fixed ₹10,000</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3, 6, or 9 Months Tenure</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Super Admin Sanction</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                to="/member-dashboard/loans/apply"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-600/25 transition-all"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Apply for First Loan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : hasActiveLoan ? (
          /* ACTIVE DISBURSED LOAN CARD */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                Active Loan Facility
              </span>
              <div className="text-2xl font-black font-mono text-emerald-950">
                {formatCurrency(activeLoanAmount)}
              </div>
              <p className="text-[11px] text-emerald-800">
                Disbursed to registered bank account. Option 1 Reducing Balance EMI applies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">
                Next Scheduled Instalment
              </span>
              <div className="text-2xl font-black font-mono text-blue-950">
                {nextEmiAmount > 0 ? formatCurrency(nextEmiAmount) : 'Pending Confirmation'}
              </div>
              <p className="text-[11px] text-blue-800">
                Due: <strong className="font-bold">{formatDate(nextEmiDueDate)}</strong> (Official interest rules awaiting confirmation)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Repayment Actions
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Inspect the official installment timetable and transaction receipts.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/member-dashboard/loans/emi-schedule"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>EMI Schedule</span>
                </Link>
                <Link
                  to="/member-dashboard/loans/history"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                >
                  <span>History</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* PIPELINE STATUS: APPLICATION UNDER REVIEW */
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  {loanOverview?.latestApplication?.applicationId || 'LOAN-2026'}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${loanBadge.color}`}
                >
                  {loanBadge.text}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900">
                First Member Term Loan (₹10,000) Application in Progress
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Your loan application is progressing through our two-tier verification workflow: District Admin on-ground review followed by Super Admin sanction.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/member-dashboard/loans/track"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Track Application</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. FINANCIAL SUMMARY CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Statutory Capital & Ledger Summary
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Nidhi Rules 2014
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MemberStatCard
            title="Statutory Share Capital"
            value="₹200"
            icon={Coins}
            iconColor="text-blue-700 bg-blue-50 border-blue-200/60"
            subtitle="Equity Class (10 Shares)"
          />

          <MemberStatCard
            title="Pending Payments"
            value={formatCurrency(pendingPaymentsSum)}
            icon={CreditCard}
            iconColor="text-amber-700 bg-amber-50 border-amber-200/60"
            subtitle="Under administrative review"
          />

          <MemberStatCard
            title="Verified Payments"
            value={formatCurrency(verifiedPaymentsSum)}
            icon={CheckCircle2}
            iconColor="text-emerald-700 bg-emerald-50 border-emerald-200/60"
            subtitle="Officially credited"
          />

          <MemberStatCard
            title="Transactions"
            value={String(totalTransactionsCount)}
            icon={ArrowLeftRight}
            iconColor="text-indigo-700 bg-indigo-50 border-indigo-200/60"
            subtitle="Ledger movements on file"
          />
        </div>
      </div>

      {/* 5. RECENT TRANSACTIONS & RECENT NOTIFICATIONS SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <span>Recent Ledger Transactions</span>
            </h3>
            <Link
              to="/member-dashboard/loans/history"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {payments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {payments.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {p.purpose || 'Statutory Share Capital'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {p.paymentId || p.transactionId} • {p.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-700 block">
                        +{formatCurrency(p.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ArrowLeftRight}
                title="No transactions recorded yet."
                description="When deposits, share capital allotments, or loan repayments take place, your verified ledger entries will appear here."
              />
            )}
          </div>
        </div>

        {/* Recent Notifications (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Priority Alerts</span>
            </h3>
            <Link
              to="/member-dashboard/notifications"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            {/* Membership notification */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <BadgeCheck className="w-4 h-4 text-blue-700" />
                <span>Membership Active</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Your statutory membership ({memberId}) is officially approved. 10 shares are credited to your account.
              </p>
            </div>

            {/* Loan status alert */}
            {hasLoanApplied ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span>Loan: {loanBadge.text}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Application {loanOverview?.latestApplication?.applicationId} is registered under the approved credit pipeline.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>First Loan Pre-Approved</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  You are eligible to apply for ₹10,000 introductory loan facility anytime.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
