import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  IndianRupee,
  Percent,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  getLoanSettingsApi,
  updateLoanSettingsApi,
} from '../../../services/superAdminLoanService';

export function LoanPolicySettingsModal({ isOpen, onClose, onUpdated }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Core 3 settings requested by Admin
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(11);
  const [availableTenures, setAvailableTenures] = useState([3, 6, 9]);

  // Quick custom tenure input
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
        setInterestRate(Number(s.baseInterestRate) || 11);
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
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

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
    const monthlyRate = rate / 12 / 100;

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
      setErrorMsg('Please enter a valid interest rate (e.g. 11%).');
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
      const payload = {
        defaultAmount: P,
        minAmount: P,
        maxAmount: P,
        isAmountFixed: true,
        allowedAmounts: [P],
        baseInterestRate: rate,
        highCibilInterestRate: rate,
        standardCibilInterestRate: rate,
        cibilThreshold: 600,
        interestRateDisplay: `${rate}% p.a.`,
        availableTenureMonths: tenures,
        defaultTenureMonths: tenures[0] || 3,
        emiCalculationMethod: 'reducing_balance',
        processingFeePercent: 1,
        processingFeeFixed: 0,
        aboutEmiNote: `EMI is calculated on monthly reducing balance at ${rate}% p.a. Repayments are scheduled monthly following disbursement with zero prepayment penalty.`,
        repaymentGuidelines: [
          'Monthly installments are auto-debited or payable via direct UPI/IMPS.',
          'Grace period of 3 business days is provided before late charges apply.',
          'Timely repayments elevate your credit profile and unlock larger loan limits.',
        ],
        policyReference: 'Utkal Finance Statutory Member Credit Policy',
      };

      const res = await updateLoanSettingsApi(payload);
      setSuccessMsg('Loan amount, interest rate & EMI months published successfully!');

      if (typeof onUpdated === 'function') {
        onUpdated(res.settings);
      }

      setTimeout(() => {
        setSuccessMsg(null);
        if (typeof onClose === 'function') {
          onClose();
        }
      }, 1200);
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const commonMonths = [1, 2, 3, 6, 9, 12, 18, 24];
  const quickAmounts = [5000, 10000, 15000, 20000, 25000, 50000];
  const quickRates = [8, 10, 11, 12, 14, 15];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-left my-auto">
        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-blue-50/60 via-slate-50 to-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Set Loan Amount, Interest &amp; EMI Months
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              These dynamic values will instantly show in the member dashboard during loan application.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading current settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              {/* 1. LOAN AMOUNT */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                      1. Loan Amount (₹)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Amount offered to members for application
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-black text-base">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    min="1000"
                    step="500"
                    required
                    placeholder="e.g. 10000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-black text-lg text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Number(loanAmount) === amt
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. INTEREST RATE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                      2. Annual Interest Rate (% p.a.)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Annual percentage applied to member EMI calculation
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    required
                    placeholder="e.g. 11"
                    className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-300 font-black text-lg text-slate-900 focus:outline-none focus:border-blue-600 bg-white"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 font-black text-sm">% p.a.</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                  {quickRates.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInterestRate(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        Number(interestRate) === r
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {r}% p.a.
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. EMI MONTHS (TENURES) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                      3. Select EMI Months Offered to Members
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Click to select which month options appear in the member panel
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {commonMonths.map((m) => {
                    const isSelected = availableTenures.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleToggleTenure(m)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        <span>{m} Months</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add custom month if needed */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <input
                    type="number"
                    placeholder="Other month (e.g. 5, 8, 10)..."
                    value={customTenure}
                    onChange={(e) => setCustomTenure(e.target.value)}
                    min="1"
                    max="60"
                    className="w-48 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* LIVE EMI PREVIEW SUMMARY FOR MEMBER PANEL */}
              <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-blue-900 to-indigo-900 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-blue-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-300" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-200">
                      Live Member Panel Preview
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-blue-200">
                    ₹{Number(loanAmount).toLocaleString('en-IN')} @ {interestRate}% p.a.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {emiBreakdowns.map((item) => (
                    <div
                      key={item.months}
                      className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                          {item.months} Months
                        </span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          EMI / Mo.
                        </span>
                      </div>
                      <div className="text-base font-black text-emerald-400">
                        ₹{item.monthlyEmi.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-blue-200">
                        Total: ₹{item.totalPayable.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save &amp; Publish Policy</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoanPolicySettingsModal;
