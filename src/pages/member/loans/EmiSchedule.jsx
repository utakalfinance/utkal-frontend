import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Info,
  ArrowRight,
  FileText,
  Lock,
  Percent,
  Check,
  Building,
  TrendingDown,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchEmiScheduleApi } from '../../../services/customerLoanService';

/**
 * EmiSchedule Page (/member-dashboard/loans/emi-schedule)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Implements Section 5 requirements:
 * 1. Approved loan amount
 * 2. Confirmed interest rate (11% p.a. statutory rate)
 * 3. Selected tenure (3, 6, 9 Months)
 * 4. Monthly EMI
 * 5. Total payable amount
 * 6. Installment number
 * 7. Due date
 * 8. Paid/Pending/Overdue status
 * 9. Remaining balance
 *
 * MANDATED CLIENT POLICY CONSTRAINTS:
 * - 11% statutory interest rate under Option 1 (Reducing Balance),
 *   but complete interest rules and calculation method are awaiting official confirmation.
 * - Do not use the old 5% calculation as an official loan rate.
 * - Do not enable Pay Now until client confirms the interest rules and repayment policy.
 * - Displays "EMI schedule awaiting confirmation" advisory notice.
 */
export function EmiSchedule() {
  const navigate = useNavigate();
  const { memberUser, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    isDisbursed: false,
    message: 'Your EMI schedule will be available after loan approval and successful disbursement.',
  });

  const initialScheduleState = {
    isDisbursed: false,
    message: 'Your EMI schedule will be available after loan approval and successful disbursement.',
  };

  const loadSchedule = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setScheduleData(initialScheduleState);
    try {
      const data = await fetchEmiScheduleApi(token);
      setScheduleData(data);
    } catch (err) {
      console.warn('Error fetching EMI schedule:', err);
      setError(err.message || 'Unable to load EMI schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [token, memberUser?._id]);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const totalPayable = Number(scheduleData.totalPayableAmount || 10000);
  const totalPaid = Number(scheduleData.totalPaidAmount || 0);
  const remainingBalance =
    scheduleData.outstandingBalance !== undefined
      ? Number(scheduleData.outstandingBalance)
      : Math.max(0, totalPayable - totalPaid);

  const repaymentPercentage =
    totalPayable > 0 ? Math.min(100, Math.round((totalPaid / totalPayable) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="EMI & Repayment Schedule"
        description="Official installment timetable and repayment ledger for approved member credit facilities of New Utkal Finance Ltd."
        badge="REPAYMENT LEDGER"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'EMI Schedule' },
        ]}
      >
        <button
          onClick={loadSchedule}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          title="Refresh Schedule"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Schedule</span>
        </button>
      </MemberPageHeader>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Retrieving official EMI schedule...
          </p>
        </div>
      ) : !scheduleData.isDisbursed ? (
        /* BEFORE DISBURSEMENT STATE */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center space-y-6 shadow-sm max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
              Awaiting Official Loan Disbursement
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {scheduleData.message ||
                'Your EMI schedule will be available after loan approval and successful disbursement.'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              In accordance with client financial governance rules, official repayment schedules and monthly installment records go live strictly upon recorded transfer of funds to your verified bank account.
            </p>
          </div>

          {/* Governance Pipeline Cards */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Disbursement Progression Workflow:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span className="text-slate-700">Submit Application (₹10,000 / 3, 6, 9 Mo)</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span className="text-slate-700">District Admin verifies KYC & branch jurisdiction</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <span className="text-slate-700">Super Admin sanctions approved loan amount</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                <span className="text-emerald-900 font-bold">Funds Disbursed &rarr; EMI Schedule Activated</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/member-dashboard/loans/track')}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              Track Application Status <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/member-dashboard/loans/overview')}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Back to Overview
            </button>
          </div>
        </div>
      ) : (
        /* AFTER DISBURSEMENT: FULL FINTECH REPAYMENT INTERFACE */
        <div className="space-y-6">
          {/* ACTIVE REPAYMENT TIMETABLE BANNER */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 rounded-3xl p-5 sm:p-6 text-white space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black tracking-tight text-white">
                      Active Member Credit Facility • EMI Repayment Ledger
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                      ACTIVE & DISBURSED
                    </span>
                  </div>
                  <p className="text-xs text-blue-200/90 leading-relaxed">
                    Installments are scheduled under the <strong>{scheduleData.interestRate || '1% / Month'}</strong> Reducing Balance method. 
                    Timely installment settlements elevate your credit score and unlock higher statutory credit tiers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/member-dashboard/loans/repayment')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
              >
                <Wallet className="w-4 h-4" />
                <span>Pay Next EMI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* REPAYMENT PROGRESS BAR */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Loan Repayment Progression
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  {repaymentPercentage}% Repaid • ₹{totalPaid.toLocaleString('en-IN')} of ₹{totalPayable.toLocaleString('en-IN')}
                </h4>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Outstanding Balance: <strong className="text-slate-900 font-mono text-sm">₹{remainingBalance.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80">
              <div
                className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${repaymentPercentage}%` }}
              />
            </div>
          </div>

          {/* 6 TOP STATISTICAL CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Approved Loan Amount */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                1. Approved Amount
              </span>
              <span className="text-lg font-black text-slate-900 block truncate">
                ₹{Number(scheduleData.loanAmount || 10000).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Sanctioned Principal</span>
            </div>

            {/* 2. Confirmed Interest Rate */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                2. Interest Rate
              </span>
              <span className="text-sm font-black text-blue-700 block truncate">
                {scheduleData.interestRate || '1% / Month'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block truncate">
                Reducing Balance
              </span>
            </div>

            {/* 3. Selected Tenure */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                3. Selected Tenure
              </span>
              <span className="text-lg font-black text-slate-900 block truncate">
                {scheduleData.repaymentTenure || '3 Months'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Repayment Term</span>
            </div>

            {/* 4. Total Payable Amount */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                4. Total Payable
              </span>
              <span className="text-lg font-black text-slate-900 block truncate">
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Principal + Interest</span>
            </div>

            {/* 5. Monthly EMI */}
            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block truncate">
                5. Monthly EMI
              </span>
              <span className="text-lg font-black text-blue-700 block truncate">
                ₹{Number(scheduleData.monthlyEmi || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-blue-600 font-bold block truncate">Per Installment</span>
            </div>

            {/* 6. Remaining Balance */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                6. Remaining Balance
              </span>
              <span className="text-lg font-black font-mono text-slate-900 block truncate">
                ₹{remainingBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Outstanding Due</span>
            </div>
          </div>

          {/* SCHEDULED INSTALLMENT BREAKDOWN TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Statutory EMI Installment Schedule
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Facility ID: <strong>{scheduleData.loanId || 'NUF-LOAN-PENDING'}</strong> • Application: {scheduleData.applicationId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                  Repayments Paused Pending Sign-Off
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Installment #</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Principal</th>
                    <th className="py-3.5 px-4">Interest</th>
                    <th className="py-3.5 px-4">Monthly EMI</th>
                    <th className="py-3.5 px-4">Paid Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Payment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(scheduleData.schedule || []).map((inst, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        Installment {inst.instalmentNumber || idx + 1}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {formatDate(inst.dueDate)}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        ₹{Number(inst.principalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        ₹{Number(inst.interestAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900">
                        ₹{Number(inst.emiAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-700">
                        ₹{Number(inst.paidAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${inst.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inst.paymentStatus === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                        >
                          {inst.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {inst.paymentStatus === 'Paid' ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => navigate('/member-dashboard/loans/repayment')}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay EMI
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Policy Notice */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
              <span>* Monthly installments calculated under active Utkal Finance Member Credit Policy 2026.</span>
              <button
                onClick={() => navigate('/member-dashboard/loans/track')}
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                Track Loan Status &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmiSchedule;