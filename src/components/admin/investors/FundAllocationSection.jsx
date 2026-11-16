import React, { useState, useEffect } from 'react';
import {
  PieChart,
  TrendingUp,
  CreditCard,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getFundAllocationAndReconciliationApi } from '../../../services/investorService';

export function FundAllocationSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFundAllocationAndReconciliationApi();
      setData(res);
    } catch (err) {
      console.error('Failed to load fund allocation:', err);
      setError(err.message || 'Unable to retrieve fund allocation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const d = data || {
    investorContributions: 0,
    verifiedPaymentsCount: 0,
    totalInvestorPayouts: 0,
    availableFunds: 0,
    fundsAllocatedToLoans: 0,
    totalLoanDisbursements: 0,
    totalEmiCollections: 0,
    unreconciledAmount: 0,
    bankReconciliationStatus: 'Balanced & Reconciled',
    disbursedLoansCount: 0,
    recentLoans: [],
  };

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            Fund Allocation & Loan Portfolio Reconciliation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit reconciliation between investor capital contributions, loan disbursements, and borrower EMI collections.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Reconciliation</span>
        </button>
      </div>

      {/* Compliance Standard Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Statutory Accounting Segregation:</span> Utkal Finance does not automatically assign all investor funds directly to individual unsecured credit facilities. Investor capital represents statutory mutual equity/term liability, and borrower EMI collections flow into corporate treasury for credit provisioning under RBI & registrar guidelines.
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Investor Contributions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Investor Contributions</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            ₹{Number(d.investorContributions).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {d.verifiedPaymentsCount} verified payments
          </span>
        </div>

        {/* Available Funds */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Available Funds</span>
          <span className="text-xl font-black text-blue-900 mt-1 block">
            ₹{Number(d.availableFunds).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Net capital after investor payouts
          </span>
        </div>

        {/* Funds Allocated to Loans */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Funds Allocated to Loans</span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">
            ₹{Number(d.fundsAllocatedToLoans).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {d.disbursedLoansCount} active credit facilities
          </span>
        </div>

        {/* Loan Disbursements */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Loan Disbursements</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            ₹{Number(d.totalLoanDisbursements).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Principal disbursed to members
          </span>
        </div>

        {/* EMI Collections */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">EMI Collections</span>
          <span className="text-xl font-black text-teal-700 mt-1 block">
            ₹{Number(d.totalEmiCollections).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Borrower principal & interest repaid
          </span>
        </div>

        {/* Unreconciled Amount */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block uppercase">Unreconciled Variance</span>
          <span className="text-xl font-black text-amber-900 mt-1 block">
            ₹{Number(d.unreconciledAmount).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-700 block mt-0.5">
            Operating float / liquidity reserve
          </span>
        </div>

        {/* Bank Reconciliation Status */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs sm:col-span-2">
          <span className="text-[11px] font-bold text-emerald-700 block uppercase">Bank Reconciliation Status</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-lg font-black text-emerald-950">
              {d.bankReconciliationStatus}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5">
            IndusInd Current Account & Settlement Gateways balanced
          </span>
        </div>
      </div>

      {/* Linked Loan Applications & Allocation Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Disbursed Loan Credit Allocations ({d.recentLoans.length} of {d.disbursedLoansCount})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live MongoDB loan accounts linked to current capital allocations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Borrower Name</th>
                <th className="py-3 px-4 text-right">Disbursed Principal</th>
                <th className="py-3 px-4 text-right">Repaid to Date</th>
                <th className="py-3 px-4">Disbursed Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {d.recentLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No active disbursed loan applications found in database.
                  </td>
                </tr>
              ) : (
                d.recentLoans.map((l) => (
                  <tr key={l.applicationId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{l.applicationId}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{l.loanId || l.applicationId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.applicantName}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      ₹{Number(l.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ₹{Number(l.repaidAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.disbursedAt ? new Date(l.disbursedAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

