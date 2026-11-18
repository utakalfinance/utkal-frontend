import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Building2,
  CreditCard,
  Download,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileText,
  IndianRupee,
} from 'lucide-react';
import { apiConfig } from '../../services/api';

export function AssociateEarnings() {
  const { associateUser } = useOutletContext();
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const associateId = associateUser?.memberId || 'NUF-AS-PENDING';
  const associateName = associateUser?.name || 'Associate Partner';

  useEffect(() => {
    let isMounted = true;
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('utkal_member_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch commissions from backend if available
        const res = await fetch(`${apiConfig.baseURL}/district-admin/commissions/ledger`, { headers }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.commissions)) {
            const myCommissions = data.commissions.filter(
              (c) => c.associateMemberId?.toLowerCase() === associateId.toLowerCase()
            );
            setLedgerEntries(myCommissions);
          }
        }
      } catch (err) {
        console.warn('Notice on earnings fetch:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (associateId && associateId !== 'NUF-AS-PENDING') {
      fetchEarnings();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [associateId]);

  const totalEarned = ledgerEntries.reduce((acc, curr) => acc + (Number(curr.commissionAmount || curr.amount) || 0), 0);
  const settledAmount = ledgerEntries
    .filter((e) => (e.status || '').toLowerCase() === 'settled' || (e.status || '').toLowerCase() === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.commissionAmount || curr.amount) || 0), 0);
  const pendingAmount = totalEarned - settledAmount;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Earnings &amp; Payout Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review your statutory member sourcing incentives, loan appraisal overrides, and bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            Settlement Frequency: <strong>Bi-Weekly</strong>
          </span>
        </div>
      </div>

      {/* 2. EARNINGS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Accrued Earnings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans block">
            ₹ {totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            Cumulative commission across all sourced services
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Settled to Bank Account
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-sans block">
            ₹ {settledAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium block">
            Transferred directly via NEFT / IMPS
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Next Payout Cycle
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-sans block">
            ₹ {pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-amber-600 font-medium block">
            Eligible for release in upcoming settlement run
          </span>
        </div>
      </div>

      {/* 3. COMMISSION STRUCTURE BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-400/30">
              Statutory Incentive Plan
            </span>
            <span className="text-xs text-slate-300 font-mono">NUF-INCENTIVE-2026</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
            Transparent Statutory Brokerage &amp; Sourcing Matrix
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Commissions are calculated automatically upon statutory loan disbursement and admission receipt verification. Direct payouts are credited to your registered bank account.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Term Loan Rate</span>
            <span className="text-xl font-black text-emerald-400 font-sans">1.00%</span>
            <span className="text-[9px] text-slate-400 block">Sanctioned Value</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Member Sourcing</span>
            <span className="text-xl font-black text-blue-400 font-sans">₹ 50.00</span>
            <span className="text-[9px] text-slate-400 block">Per Admission</span>
          </div>
        </div>
      </div>

      {/* 4. SETTLEMENT LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Transaction Settlement Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Audit record of member sourcing payouts and credit facility brokerages.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Loading Settlement Ledger...
            </p>
          </div>
        ) : ledgerEntries.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">No Earnings Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once your referred customers complete statutory member admission or receive loan disbursements, incentive ledger entries will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer Reference</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Volume Base</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {ledgerEntries.map((e) => (
                  <tr key={e._id || e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{e.txId || e._id?.slice(-8)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{e.customerName || e.memberId || 'Valued Member'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{e.description || 'Sourcing Override'}</td>
                    <td className="py-3.5 px-4 font-sans font-bold">₹ {Number(e.baseAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700">{e.rate || '1.0%'}</td>
                    <td className="py-3.5 px-4 font-sans font-black text-slate-900">₹ {Number(e.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        (e.status || '').toLowerCase() === 'settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {e.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssociateEarnings;
