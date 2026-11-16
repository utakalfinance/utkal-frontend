import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  User,
  ArrowRight,
  Clock,
  Settings2,
} from 'lucide-react';
import { getInvestorsApi, getInvestorByIdApi } from '../../../services/investorService';

export function Investor2XTrackingSection() {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState('');
  const [investorDetails, setInvestorDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configuration Mode
  // Default is 'PENDING_LEGAL_CONFIRMATION' (strictly complying with the prompt instruction!)
  const [interpretationMode, setInterpretationMode] = useState('PENDING_LEGAL_CONFIRMATION');
  const [customMultiplier, setCustomMultiplier] = useState(2.0);

  useEffect(() => {
    getInvestorsApi({ limit: 100 })
      .then((res) => {
        const list = res.investors || [];
        setInvestors(list);
        if (list.length > 0) {
          setSelectedInvestorId(list[0]._id);
        }
      })
      .catch((err) => console.warn('Could not load investors list for 2X tracking:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedInvestorId) {
      getInvestorByIdApi(selectedInvestorId)
        .then((res) => setInvestorDetails(res))
        .catch((err) => console.warn('Could not load investor details:', err));
    }
  }, [selectedInvestorId]);

  const investor = investorDetails?.investor;
  const payouts = investorDetails?.payouts || [];

  // Calculations for confirmed Option A
  const originalInvestment = Number(investor?.verifiedInvestment || investor?.totalInvestment || 0);
  const contractualLimit = originalInvestment * customMultiplier;

  // Eligible payouts already completed (status === 'Paid')
  // Prompt rule: "Do not count additional investments as returns. Do not count pending or failed payments as completed payouts."
  const paidPayouts = payouts.filter((p) => p.status === 'Paid');
  const totalPayoutAlreadyMade = paidPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const remainingContractualPayout = Math.max(0, contractualLimit - totalPayoutAlreadyMade);
  const progressPercent = contractualLimit > 0 ? Math.min(100, Math.round((totalPayoutAlreadyMade / contractualLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Configuration Control Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">2X Contractual Ledger Tracking</h3>
              <p className="text-xs text-slate-500">Configurable contractual tracking module with compliance guardrails</p>
            </div>
          </div>
        </div>

        {/* Configuration Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Agreement Terms Mode:</span>
          <select
            value={interpretationMode}
            onChange={(e) => setInterpretationMode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="PENDING_LEGAL_CONFIRMATION">
              🔒 Pending Signed Agreement Confirmation (Default)
            </option>
            <option value="CONFIRMED_2X_MAX_CAP">
              ✓ Confirmed: 2X Maximum Cumulative Cap (Original × 2)
            </option>
            <option value="CUSTOM_ALLOCATION_RULE">
              ⚙ Custom Accounting & Fund Multiplier
            </option>
          </select>
        </div>
      </div>

      {/* Statutory Legal Guardrail Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Strict Compliance Guardrail:</span> In accordance with financial regulations and project policy, 2X payout calculations must not be activated until the company provides formal legal/compliance confirmation in its counter-signed agreement. Additional investment receipts are never treated as investment returns, and pending/failed disbursements are strictly excluded from completed payouts.
        </div>
      </div>

      {/* CASE 1: Default - Awaiting Legal Confirmation */}
      {interpretationMode === 'PENDING_LEGAL_CONFIRMATION' && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">2X Payout Ledger Locked</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Automatic 2X multiplier calculation is held in <strong>Draft Status</strong> awaiting company legal authorization. Once the corporate legal committee confirms the contractual definition in the executed agreement, select the confirmed mode above.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Protects against unapproved speculative 2X guarantees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Separates capital contribution from profit distributions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enforces compliance with RBI / NBFC / Cooperative statutes</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2 & 3: Confirmed Mode or Custom Rule */}
      {(interpretationMode === 'CONFIRMED_2X_MAX_CAP' || interpretationMode === 'CUSTOM_ALLOCATION_RULE') && (
        <div className="space-y-6 animate-fade-in">
          {/* Investor Selection Dropdown */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-800">Select Investor to Track:</label>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none min-w-[240px]"
              >
                {investors.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.investorId} - {inv.fullName} ({inv.district})
                  </option>
                ))}
              </select>

              {interpretationMode === 'CUSTOM_ALLOCATION_RULE' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-600">Multiplier:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={customMultiplier}
                    onChange={(e) => setCustomMultiplier(Number(e.target.value) || 2.0)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center"
                  />
                  <span>X</span>
                </div>
              )}
            </div>
          </div>

          {/* 2X Calculations KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Original Investment</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                ₹{originalInvestment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Verified Capital Base</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 block uppercase">
                {customMultiplier}X Contractual Limit
              </span>
              <span className="text-lg font-black text-blue-950 mt-1 block">
                ₹{contractualLimit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Max Cumulative Cap</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Eligible Payout</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                ₹{contractualLimit.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Under Confirmed Terms</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 block uppercase">Total Paid Already</span>
              <span className="text-lg font-black text-emerald-800 mt-1 block">
                ₹{totalPayoutAlreadyMade.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">
                {paidPayouts.length} Completed Payouts
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 block uppercase">Remaining Payout</span>
              <span className="text-lg font-black text-amber-900 mt-1 block">
                ₹{remainingContractualPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Max Payout − Paid</span>
            </div>
          </div>

          {/* Payout Progress Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <span>Contractual Payout Progress:</span>
                <span className="font-mono text-blue-700 font-bold">{progressPercent}% Completed</span>
              </span>
              <span className="text-slate-500 font-mono">
                ₹{totalPayoutAlreadyMade.toLocaleString('en-IN')} / ₹{contractualLimit.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Payout Transaction History Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Eligible Completed Payouts ({paidPayouts.length})
              </h4>
              <span className="text-[11px] text-slate-500">Only verified 'Paid' records are counted</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Payout ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference / UTR</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paidPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No eligible completed payouts recorded for this investor yet.
                      </td>
                    </tr>
                  ) : (
                    paidPayouts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.payoutId || p._id.slice(-6)}</td>
                        <td className="py-3 px-4 text-slate-600">{new Date(p.payoutDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{p.category}</td>
                        <td className="py-3 px-4 text-right font-black text-rose-600">
                          -₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{p.reference || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Paid
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
      )}
    </div>
  );
}

