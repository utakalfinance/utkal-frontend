import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Percent,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Plus,
  RefreshCw,
  ArrowLeft,
  Sliders,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  getLoanSettingsApi,
  updateLoanSettingsApi,
} from '../../services/superAdminLoanService';

export function LoanPolicySettingsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Core 3 settings
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(1);
  const [availableTenures, setAvailableTenures] = useState([3, 6, 9]);

  // Custom tenure input
  const [customTenure, setCustomTenure] = useState('');

  // Fetch current active settings from database
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getLoanSettingsApi();
      if (res && res.settings) {
        const s = res.settings;
        setLoanAmount(Number(s.defaultAmount) || 10000);
        if (s.monthlyInterestRate !== undefined && s.monthlyInterestRate !== null) {
          setInterestRate(Number(s.monthlyInterestRate));
        } else if (s.baseInterestRate) {
          const bRate = Number(s.baseInterestRate);
          setInterestRate(bRate > 5 ? Math.round((bRate / 12) * 100) / 100 : bRate);
        } else {
          setInterestRate(1);
        }
        if (Array.isArray(s.availableTenureMonths) && s.availableTenureMonths.length > 0) {
          setAvailableTenures(s.availableTenureMonths.map(Number).sort((a, b) => a - b));
        } else {
          setAvailableTenures([3, 6, 9]);
        }
      }
    } catch (err) {
      console.error('Error fetching loan settings:', err);
      setErrorMsg(err.message || 'Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Toggle a tenure month on or off
  const handleToggleTenure = (m) => {
    setAvailableTenures((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) {
          alert('At least one EMI month must be selected.');
          return prev;
        }
        return prev.filter((item) => item !== m);
      } else {
        return [...prev, m].sort((a, b) => a - b);
      }
    });
  };

  // Add custom month
  const handleAddCustom = () => {
    const m = parseInt(customTenure, 10);
    if (isNaN(m) || m <= 0 || m > 60) {
      alert('Please enter a valid month between 1 and 60.');
      return;
    }
    if (availableTenures.includes(m)) {
      alert(`${m} Months is already selected.`);
      return;
    }
    setAvailableTenures((prev) => [...prev, m].sort((a, b) => a - b));
    setCustomTenure('');
  };

  // Live calculated EMI breakdown for all selected months
  const emiBreakdowns = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const rate = Number(interestRate) || 0;
    const monthlyRate = rate / 100; // Rate is monthly

    return availableTenures.map((n) => {
      let emi = 0;
      let totalInterest = 0;
      if (P > 0 && n > 0) {
        if (monthlyRate > 0) {
          emi = Math.round(
            (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1)
          );
        } else {
          emi = Math.round(P / n);
        }
        totalInterest = Math.max(0, Math.round(emi * n - P));
      }
      return {
        months: n,
        monthlyEmi: emi,
        totalInterest,
        totalPayable: P + totalInterest,
      };
    });
  }, [loanAmount, interestRate, availableTenures]);

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const P = Number(loanAmount);
    if (isNaN(P) || P <= 0) {
      setErrorMsg('Please enter a valid loan amount (e.g. ₹10,000).');
      setSaving(false);
      return;
    }

    const rate = Number(interestRate);
    if (isNaN(rate) || rate < 0) {
      setErrorMsg('Please enter a valid monthly interest rate (e.g. 1% or 1.5%).');
      setSaving(false);
      return;
    }

    const tenures = availableTenures.map(Number).filter((n) => !isNaN(n) && n > 0).sort((a, b) => a - b);
    if (tenures.length === 0) {
      setErrorMsg('Please select at least one EMI month.');
      setSaving(false);
      return;
    }

    try {
      const annualEquivalent = Math.round(rate * 12 * 100) / 100;
      const payload = {
        defaultAmount: P,
        minAmount: P,
        maxAmount: P,
        isAmountFixed: true,
        allowedAmounts: [P],
        monthlyInterestRate: rate,
        baseInterestRate: annualEquivalent,
        highCibilInterestRate: annualEquivalent,
        standardCibilInterestRate: annualEquivalent,
        cibilThreshold: 600,
        interestRateDisplay: `${rate}% / month (${annualEquivalent}% p.a.)`,
        availableTenureMonths: tenures,
        defaultTenureMonths: tenures[0] || 3,
        emiCalculationMethod: 'reducing_balance',
        processingFeePercent: 1,
        processingFeeFixed: 0,
        aboutEmiNote: `EMI is calculated on monthly reducing balance at ${rate}% per month. Repayments are scheduled monthly following disbursement with zero prepayment penalty.`,
        repaymentGuidelines: [
          'Monthly installments are auto-debited or payable via direct UPI/IMPS.',
          'Grace period of 3 business days is provided before late charges apply.',
          'Timely repayments elevate your credit profile and unlock larger loan limits.',
        ],
        policyReference: 'Utkal Finance Statutory Member Credit Policy',
      };

      const res = await updateLoanSettingsApi(payload);
      setSuccessMsg('Loan policy updated successfully! Changes are live across the Member Dashboard.');

      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMsg(err.message || 'Failed to save loan policy settings.');
    } finally {
      setSaving(false);
    }
  };

  const commonMonths = [1, 2, 3, 6, 9, 12, 18, 24];
  const quickAmounts = [5000, 10000, 15000, 20000, 25000, 50000];
  const quickRates = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Admin Dashboard</span>
            <span>&gt;</span>
            <span>Loan Management</span>
            <span>&gt;</span>
            <span className="text-blue-600 font-bold">Loan &amp; EMI Policy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Set Loan Amount, Interest &amp; EMI Months
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Admin configuration directly reflected in the Member Dashboard during loan application.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/loan-dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Loan Dashboard</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Loading active policy settings from MongoDB...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2 COLUMNS: CORE 3 SETTINGS */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. LOAN AMOUNT */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      1. Loan Amount (₹)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      The statutory loan amount members receive when applying.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-black text-xl">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    min="1000"
                    step="500"
                    required
                    placeholder="e.g. 10000"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 font-black text-2xl text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-slate-50/50 hover:bg-white transition-all"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${Number(loanAmount) === amt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. MONTHLY INTEREST RATE */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      2. Monthly Interest Rate (% / Month)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      The monthly reducing percentage rate applied to member loans.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    placeholder="e.g. 1"
                    className="w-full pl-5 pr-28 py-3 rounded-2xl border border-slate-300 font-black text-2xl text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-slate-50/50 hover:bg-white transition-all"
                  />
                  <span className="absolute right-5 top-3.5 text-slate-400 font-black text-base">% / Month</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                  {quickRates.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInterestRate(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${Number(interestRate) === r
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {r}% / mo
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. EMI MONTHS (TENURES) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      3. Select EMI Months Offered to Members
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Click any month button below to enable or disable it for member applications.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {commonMonths.map((m) => {
                    const isSelected = availableTenures.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleToggleTenure(m)}
                        className={`px-4 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        <span>{m} Months</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Month */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <input
                    type="number"
                    placeholder="Other month (e.g. 5, 8, 10)..."
                    value={customTenure}
                    onChange={(e) => setCustomTenure(e.target.value)}
                    min="1"
                    max="60"
                    className="w-56 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Month</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE MEMBER PREVIEW */}
            <div className="space-y-6">
              <div className="bg-linear-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 sticky top-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Calculator className="w-5 h-5 text-cyan-300" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                      Live Member Panel Preview
                    </h4>
                    <p className="text-[11px] text-blue-200">
                      What members will see when applying for a loan:
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                    Sanctioned Terms
                  </span>
                  <div className="text-3xl font-black text-white tracking-tight">
                    ₹{Number(loanAmount).toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <span>{interestRate}% / Month ({Math.round(Number(interestRate || 0) * 12 * 10) / 10}% p.a.)</span>
                    <span>•</span>
                    <span className="text-emerald-300">Reducing Balance</span>
                  </div>
                </div>

                {/* Breakdown by Month */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200 block">
                    Monthly EMI Breakdown by Selected Months:
                  </span>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {emiBreakdowns.map((item) => (
                      <div
                        key={item.months}
                        className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between hover:bg-white/15 transition-all"
                      >
                        <div>
                          <span className="text-xs font-black text-white block">
                            {item.months} Months
                          </span>
                          <span className="text-[10px] text-blue-200 block">
                            Total Repay: ₹{item.totalPayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-400 block">
                            ₹{item.monthlyEmi.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-blue-300 block">per month</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-blue-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Updates immediately apply to all members applying for a loan.</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SUBMIT BAR */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Publishing will update the statutory loan parameters across the member portal immediately.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/loan-dashboard')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Policy...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Publish Loan Policy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default LoanPolicySettingsPage;
