import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Coins,
  Calendar,
  CreditCard,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  PieChart,
  RefreshCw,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchCustomerActiveLoansApi } from '../../../services/customerLoanService';

/**
 * MyActiveLoans Page (/member-dashboard/loans/active)
 * Displays strictly approved and successfully disbursed member credit facilities.
 * A loan is NEVER marked active just because it was approved; it is active ONLY after
 * successful disbursement is recorded by cooperative administration.
 */
export function MyActiveLoans() {
  const navigate = useNavigate();
  const { token, memberUser } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);

  const loadActiveLoans = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setActiveLoans([]);
    try {
      const data = await fetchCustomerActiveLoansApi(token);
      setActiveLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch active loans:', err.message);
      setError(err.message || 'Unable to retrieve active loans.');
      setActiveLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveLoans();
  }, [token, memberUser?._id]);

  const totalDisbursed = activeLoans.reduce((sum, l) => sum + Number(l.disbursedAmount || 0), 0);
  const totalOutstanding = activeLoans.reduce(
    (sum, l) => sum + Number(l.outstandingBalance || 0),
    0
  );
  const totalPaid = activeLoans.reduce((sum, l) => sum + Number(l.amountPaid || 0), 0);

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

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="My Active Loans"
        description="Exclusive ledger of approved and disbursed statutory member credit facilities. Active loans undergo regular EMI schedule management until full ledger settlement."
        badge="DISBURSED LOANS"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'My Active Loans' },
        ]}
      >
        <button
          onClick={loadActiveLoans}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh Active Loans"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </MemberPageHeader>

      {/* ACTIVE SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Active Accounts
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{activeLoans.length}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Disbursed & In Repayment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Disbursed
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">
              ₹{totalDisbursed.toLocaleString('en-IN')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Capital Released to Member</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Outstanding Balance
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-indigo-700">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Remaining to Settle</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Amount Paid
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-blue-700">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">EMI Installments Cleared</span>
        </div>
      </div>

      {/* DISBURSED LOANS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Retrieving active loan facilities...</p>
        </div>
      ) : activeLoans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 border border-blue-100">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              No Active Disbursed Loans
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Loans appear in this section only after both <strong>District Verification</strong> and{' '}
              <strong>Super Admin Sanction</strong> have been completed and funds have been
              successfully disbursed to your bank account.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/member-dashboard/loans/applications')}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              View Loan Applications
            </button>
            <button
              onClick={() => navigate('/member-dashboard/loans/apply')}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              Apply for Member Loan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoans.map((loan) => {
            const totalPayable = Number(loan.totalPayableAmount || 0);
            const paid = Number(loan.amountPaid || 0);
            const outstanding = Number(loan.outstandingBalance || 0);
            const progress = totalPayable > 0 ? Math.min(100, Math.round((paid / totalPayable) * 100)) : 0;

            return (
              <div
                key={loan.loanId || loan.applicationId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all p-5 sm:p-6 space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {loan.loanId}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {loan.status}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {loan.loanType}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => navigate('/member-dashboard/loans/repayment')}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Wallet className="w-3.5 h-3.5" /> Pay Next EMI
                    </button>
                  </div>
                </div>

                {/* 10 Required Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
                  {/* Approved Amount */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Approved Amount
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      ₹{Number(loan.approvedAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Disbursed Amount */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                      Disbursed Amount
                    </span>
                    <span className="text-sm font-black text-emerald-800">
                      ₹{Number(loan.disbursedAmount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5">
                      On {formatDate(loan.disbursedAt)}
                    </span>
                  </div>

                  {/* Interest Details */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Interest Details
                    </span>
                    <span className="text-sm font-black text-blue-700">
                      {loan.interestDetails || `${loan.interestRate}% p.a. Fixed`}
                    </span>
                  </div>

                  {/* Loan Tenure */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Loan Tenure
                    </span>
                    <span className="text-sm font-black text-slate-800">{loan.loanTenure}</span>
                  </div>

                  {/* Total Payable Amount */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Total Payable
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Amount Paid */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-600 block uppercase">
                      Amount Paid
                    </span>
                    <span className="text-sm font-black text-blue-800">
                      ₹{paid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Outstanding Balance */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 col-span-2">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase">
                      Outstanding Balance
                    </span>
                    <span className="text-sm font-black text-amber-900">
                      ₹{outstanding.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Loan Status */}
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Statutory Status
                    </span>
                    <span className="text-xs font-black text-slate-700 block mt-0.5">
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar of Settlement */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Settlement Progress ({progress}%)</span>
                    <span>
                      ₹{paid.toLocaleString('en-IN')} paid of ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyActiveLoans;
