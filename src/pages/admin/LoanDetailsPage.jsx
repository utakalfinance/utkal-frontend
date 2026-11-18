import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  User,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Printer,
  RefreshCw,
  FileCheck2,
  SendHorizontal,
  Wallet,
  AlertCircle,
  Sparkles,
  Receipt,
  CreditCard,
} from 'lucide-react';
import {
  getSuperAdminLoanByIdApi,
  superAdminProcessLoanDecisionApi,
} from '../../services/superAdminLoanService';
import { EmiScheduleModal } from '../../components/admin/loans/EmiScheduleModal';
import { getBackendAssetUrl } from '../../config/env';

export function LoanDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Decision actions state
  const [decisionAction, setDecisionAction] = useState('approve'); // 'approve' | 'reject' | 'hold'
  const [approvedAmount, setApprovedAmount] = useState(10000);
  const [approvedTenure, setApprovedTenure] = useState(3);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState(null);
  const [decisionError, setDecisionError] = useState(null);
  const [showEmiModal, setShowEmiModal] = useState(false);

  // Fetch loan details
  const fetchLoanDetails = useCallback(async (isSilent = false) => {
    if (!id) return;
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    setError(null);

    try {
      const data = await getSuperAdminLoanByIdApi(id);
      if (data) {
        setLoan(data);
        setApprovedAmount(data.requestedAmount || data.requestedLoanAmount || 10000);
        setApprovedTenure(data.preferredTenureMonths || 3);
      } else {
        setError('Loan application record could not be found.');
      }
    } catch (err) {
      console.error('Error fetching loan details:', err);
      setError(err.message || 'Unable to load loan application dossier.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLoanDetails();
  }, [fetchLoanDetails]);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Disbursed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active (Disbursed)
          </span>
        );
      case 'Approved':
      case 'Approved – Not Disbursed':
      case 'Approved - Not Disbursed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved – Not Disbursed
          </span>
        );
      case 'Verified / Forwarded to Super Admin':
      case 'Forwarded to Super Admin':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
            <SendHorizontal className="w-4 h-4 text-blue-600" /> Verified / Forwarded
          </span>
        );
      case 'Pending Final Approval':
      case 'Pending Super Admin':
      case 'Submitted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-4 h-4 text-indigo-600" /> Pending Final Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
            <XCircle className="w-4 h-4 text-rose-600" /> Rejected
          </span>
        );
      case 'On Hold':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-purple-600" /> On Hold
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600" /> Pending Review
          </span>
        );
    }
  };

  // Submit Super Admin final decision
  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!loan) return;

    setSubmittingDecision(true);
    setDecisionError(null);
    setDecisionSuccess(null);

    try {
      const payload = {
        action: decisionAction,
        approvedAmount: Number(approvedAmount),
        approvedTenureMonths: Number(approvedTenure),
        remarks: decisionRemarks,
        rejectionReason: decisionAction === 'reject' ? rejectionReason : undefined,
      };

      const res = await superAdminProcessLoanDecisionApi(loan._id || loan.applicationId || id, payload);
      setDecisionSuccess(res.message || `Application successfully marked as ${decisionAction.toUpperCase()}`);
      await fetchLoanDetails(true);
      setTimeout(() => setDecisionSuccess(null), 5000);
    } catch (err) {
      console.error('Error recording loan decision:', err);
      setDecisionError(err.message || 'Failed to submit loan decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 my-8">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold">Loading member loan dossier...</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 my-8">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-black text-rose-900">Application Not Found</h2>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          {error || 'The requested loan application could not be retrieved from the database.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/loan-dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Loan Dashboard</span>
        </button>
      </div>
    );
  }

  const customerName = loan.customerName || loan.applicantName || 'Valued Member';
  const applicationId = loan.applicationId || '—';
  const customerId = loan.customerId || loan.memberId || '—';
  const district = loan.district || 'Khurda';
  const requestedAmount = Number(loan.requestedAmount || loan.requestedLoanAmount || 10000);
  const sanctionedAmount = Number(
    loan.sanctionedAmount || loan.finalApproval?.approvedAmount || requestedAmount
  );
  const tenure = loan.tenure || `${loan.preferredTenureMonths || 3} Months`;
  const interestRate = loan.interestRate || loan.baseInterestRate || 11;
  const districtVerification = loan.districtVerification || {};
  const finalApproval = loan.finalApproval || {};
  const disbursement = loan.disbursement || {};
  const employment = loan.employmentDetails || {};
  const documents = Array.isArray(loan.documents) ? loan.documents : [];
  const activities = Array.isArray(loan.verificationActivities) ? loan.verificationActivities : [];

  const repayment = loan.repayment || {};
  const schedule = Array.isArray(repayment.schedule) ? repayment.schedule : [];
  const monthlyEmi = Number(repayment.monthlyEmiAmount || 0);
  const totalPayable = Number(repayment.totalPayableAmount || 0);
  const totalPaid = Number(repayment.totalPaidAmount || 0);
  const outstandingBalance = Number(
    repayment.outstandingBalance !== undefined
      ? repayment.outstandingBalance
      : Math.max(0, totalPayable - totalPaid)
  );
  const nextDueDate = repayment.nextEmiDueDate;
  const nextEmiAmount = repayment.nextEmiAmount || monthlyEmi;

  const tenureNum = parseInt(tenure, 10) || Number(loan.preferredTenureMonths) || 3;
  const estimatedMonthlyRate = (interestRate || 5) / (12 * 100);
  let computedEmi = Math.round(sanctionedAmount / tenureNum);
  if (estimatedMonthlyRate > 0) {
    const factor = Math.pow(1 + estimatedMonthlyRate, tenureNum);
    computedEmi = Math.round((sanctionedAmount * estimatedMonthlyRate * factor) / (factor - 1));
  }
  const displayMonthlyEmi = monthlyEmi > 0 ? monthlyEmi : computedEmi;
  const displayTotalPayable = totalPayable > 0 ? totalPayable : displayMonthlyEmi * tenureNum;
  const displayOutstanding = outstandingBalance > 0 ? outstandingBalance : displayTotalPayable;
  const isLoanActiveOrDisbursed = Boolean(
    loan.status === 'Active' || loan.status === 'Disbursed' || disbursement?.isDisbursed
  );

  const isPendingDecision =
    !loan.status ||
    loan.status === 'Submitted' ||
    loan.status === 'Pending District Verification' ||
    loan.status === 'Pending Final Approval' ||
    loan.status === 'Verified / Forwarded to Super Admin' ||
    loan.status === 'Forwarded to Super Admin' ||
    loan.status === 'On Hold';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* 1. TOP BREADCRUMBS & NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span
              onClick={() => navigate('/admin-dashboard')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Admin Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span
              onClick={() => navigate('/admin-dashboard/loan-dashboard')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Loan Management
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-bold">Application Dossier</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {customerName}
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Application ID: <strong className="font-mono text-slate-700">{applicationId}</strong></span>
                <span>•</span>
                <span>Member ID: <strong className="font-mono text-blue-700">{customerId}</strong></span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/loan-dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Loan Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/loans')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <span>Loan Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => fetchLoanDetails(false)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Refresh record"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Print application dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. HERO STATUS BANNER */}
      <div className="bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              {applicationId}
            </span>
            {getStatusBadge(loan.status)}
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <strong>{district} District</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs pt-1">
            <div>
              <span className="text-slate-400 text-[11px]">Requested: </span>
              <strong className="text-white font-black text-sm">
                ₹{requestedAmount.toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Sanctioned: </span>
              <strong className="text-emerald-400 font-black text-sm">
                ₹{sanctionedAmount.toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Tenure: </span>
              <strong className="text-cyan-300 font-bold">{tenure}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Interest: </span>
              <strong className="text-amber-300 font-bold">{interestRate}% p.a. Fixed</strong>
            </div>
          </div>
        </div>

        {disbursement?.isDisbursed && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3 text-xs text-emerald-200 shrink-0 self-start md:self-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
              Disbursed UTR
            </span>
            <span className="font-mono font-bold text-white text-sm block">
              {disbursement.transactionId || 'DISBURSED'}
            </span>
            <span className="text-[10px] text-emerald-300 block">
              ₹{Number(disbursement.disbursedAmount).toLocaleString('en-IN')} on {formatDate(disbursement.disbursedAt)}
            </span>
          </div>
        )}
      </div>

      {/* FEEDBACK NOTICES */}
      {decisionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{decisionSuccess}</span>
        </div>
      )}

      {decisionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{decisionError}</span>
        </div>
      )}

      {/* 3. MAIN DOSSIER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: IDENTITY, CREDIT TERMS, AUDIT */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. BORROWER & MEMBERSHIP IDENTITY */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Borrower &amp; Membership Identity
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                Member ID: {customerId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                <span className="text-sm font-black text-slate-900 block truncate">{customerName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned District</span>
                <span className="text-sm font-bold text-slate-900 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {district}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Mobile Number</span>
                <span className="text-xs font-semibold text-slate-800 font-mono block">
                  {loan.mobile || loan.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                <span className="text-xs font-semibold text-slate-800 block truncate">
                  {loan.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Occupation / Business</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {employment.occupationType || employment.employerOrBusinessName || 'Self-Employed / Business'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Income</span>
                <span className="text-xs font-bold text-slate-900 block">
                  ₹{Number(employment.monthlyIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Application Submission Date</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {formatDate(loan.submissionDate || loan.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* B. CREDIT FACILITY TERMS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" /> Credit Facility Terms
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {loan.loanType || 'Statutory Member Term Loan'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block uppercase">Requested Amount</span>
                <span className="text-lg font-black text-blue-900 block">
                  ₹{requestedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Sanctioned Amount</span>
                <span className="text-lg font-black text-emerald-900 block">
                  ₹{sanctionedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Tenure</span>
                <span className="text-sm font-black text-slate-900 block">{tenure}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Interest Rate</span>
                <span className="text-sm font-black text-indigo-700 block">{interestRate}% p.a. Fixed</span>
              </div>

              <div className="col-span-2 sm:col-span-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Declared Loan Purpose</span>
                <span className="text-xs font-semibold text-slate-800 block mt-1">
                  {loan.loanPurpose || 'General household/commercial micro-credit'}
                </span>
              </div>
            </div>
          </div>

          {/* C. USER EMI & REPAYMENT SCHEDULE */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    User EMI &amp; Repayment Schedule
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Monthly installment ledger, reducing balance calculations &amp; collection tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoanActiveOrDisbursed ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active EMI Schedule
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                    Pre-Disbursement Estimate
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block uppercase">Monthly EMI</span>
                <span className="text-lg font-black text-blue-900 block">
                  ₹{displayMonthlyEmi.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5">per month</span>
              </div>

              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 block uppercase">Total Payable</span>
                <span className="text-lg font-black text-indigo-900 block">
                  ₹{displayTotalPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-indigo-600 block mt-0.5">principal + interest</span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Paid Amount</span>
                <span className="text-lg font-black text-emerald-900 block">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {schedule.filter((s) => s.paymentStatus === 'Paid').length} installments cleared
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block uppercase">Remaining Due</span>
                <span className="text-lg font-black text-amber-900 block">
                  ₹{displayOutstanding.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">
                  {nextDueDate ? `Next due: ${formatDate(nextDueDate)}` : 'On 5th of each month'}
                </span>
              </div>
            </div>

            {/* Installment breakdown preview */}
            {schedule.length > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Installment Ledger Breakdown ({schedule.length} Months)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmiModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                  >
                    View All {schedule.length} Installments &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">EMI (₹)</th>
                        <th className="py-2.5 px-3">Principal (₹)</th>
                        <th className="py-2.5 px-3">Interest (₹)</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedule.slice(0, 6).map((inst, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 font-black text-slate-700">EMI #{inst.instalmentNumber || idx + 1}</td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                            {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            ₹{Number(inst.emiAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            ₹{Number(inst.principalComponent || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            ₹{Number(inst.interestComponent || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${inst.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : inst.paymentStatus === 'Overdue'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                            >
                              {inst.paymentStatus || 'Upcoming'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">
                    Statutory Reducing Balance EMI: ₹{displayMonthlyEmi.toLocaleString('en-IN')} / month
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Tenure: {tenureNum} Months • Base Interest: {interestRate}% p.a. • Total: ₹{displayTotalPayable.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmiModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Preview Full Schedule</span>
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEmiModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Open Full EMI Schedule Modal</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/emi-collections')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>Go to User EMI Collections Desk</span>
              </button>
            </div>
          </div>

          {/* D. TWO-TIER VERIFICATION & AUDIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District Tier 1 */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Tier 1: District Verification
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${districtVerification.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : districtVerification.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                >
                  {districtVerification.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified By</span>
                  <span className="font-semibold text-slate-800">
                    {districtVerification.verifiedBy || `${district} District Admin`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Verification Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(districtVerification.verifiedAt || districtVerification.decisionDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">District Admin Remarks</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                    "{districtVerification.districtRemarks || 'Awaiting on-ground and document KYC verification.'}"
                  </p>
                </div>
                {districtVerification.isForwardedToSuperAdmin && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Forwarded to Super Admin on {formatDate(districtVerification.forwardedToSuperAdminAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Super Admin Tier 2 */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tier 2: Super Admin Sanction
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${finalApproval.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : finalApproval.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : finalApproval.status === 'On Hold'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                >
                  {finalApproval.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sanctioned By</span>
                  <span className="font-semibold text-slate-800">
                    {finalApproval.approvedBy || 'Super Admin Executive Credit Committee'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Sanction Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(finalApproval.approvedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Super Admin Remarks</span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                    "{finalApproval.finalRemarks || finalApproval.rejectionReason || 'Pending Super Admin review.'}"
                  </p>
                </div>
                {disbursement.isDisbursed && (
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 mt-2 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      Disbursement Executed
                    </span>
                    <span className="text-xs font-mono font-bold block">
                      UTR: {disbursement.transactionId || '—'}
                    </span>
                    <span className="text-[11px] text-emerald-700 block">
                      ₹{Number(disbursement.disbursedAmount).toLocaleString('en-IN')} via {disbursement.paymentMethod} on {formatDate(disbursement.disbursedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* D. AUDIT LOG ACTIVITIES */}
          {activities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> Verification Activities Timeline ({activities.length})
              </span>
              <div className="space-y-2">
                {activities.map((act, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(act.timestamp)}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Performed by {act.performedBy} ({act.role})
                      </span>
                      {act.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">{act.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: KYC DOCUMENTS & DECISION ACTION PANEL */}
        <div className="space-y-6">
          {/* 1. SUPER ADMIN DECISION ACTION PANEL */}
          <div className="bg-linear-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                  Super Admin Decision Panel
                </h3>
                <p className="text-[10px] text-blue-200">
                  Execute sanction, rejection, or hold on this application
                </p>
              </div>
            </div>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionAction('approve')}
                  className={`py-2 px-1 rounded-xl font-black text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${decisionAction === 'approve'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionAction('hold')}
                  className={`py-2 px-1 rounded-xl font-black text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${decisionAction === 'hold'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hold</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionAction('reject')}
                  className={`py-2 px-1 rounded-xl font-black text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${decisionAction === 'reject'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>

              {/* Sanctioned Amount if Approve */}
              {decisionAction === 'approve' && (
                <div className="space-y-3 p-3 bg-white/10 rounded-2xl border border-white/10">
                  <div>
                    <label className="text-[10px] font-bold text-blue-200 uppercase block mb-1">
                      Sanctioned Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      min="1000"
                      step="500"
                      className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-black text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-200 uppercase block mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={approvedTenure}
                      onChange={(e) => setApprovedTenure(e.target.value)}
                      min="1"
                      max="36"
                      className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-black text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Rejection reason if Reject */}
              {decisionAction === 'reject' && (
                <div>
                  <label className="text-[10px] font-bold text-rose-300 uppercase block mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    placeholder="Provide specific reason for statutory audit trail..."
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-medium text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Decision Remarks */}
              <div>
                <label className="text-[10px] font-bold text-blue-200 uppercase block mb-1">
                  Executive Committee Remarks
                </label>
                <textarea
                  rows={2}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder="Optional internal remarks..."
                  className="w-full px-3 py-2 rounded-xl bg-white text-slate-900 font-medium text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingDecision}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingDecision ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Decision...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="capitalize">Confirm &amp; Record {decisionAction}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. UPLOADED KYC DOCUMENTS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-600" /> Uploaded KYC Documents ({documents.length})
              </span>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No external document attachments uploaded.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {doc.documentType || 'KYC Document'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        {doc.documentName || 'Attachment.pdf'}
                      </span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase">
                        Status: {doc.verificationStatus || 'Pending'}
                      </span>
                    </div>

                    {(doc.documentUrl || doc.fileUrl) && (
                      <a
                        href={getBackendAssetUrl(doc.documentUrl || doc.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full EMI Schedule Modal */}
      <EmiScheduleModal
        isOpen={showEmiModal}
        onClose={() => setShowEmiModal(false)}
        loanData={loan}
      />
    </div>
  );
}

export default LoanDetailsPage;
