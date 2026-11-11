import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Coins,
  Sparkles,
  Info,
  Building,
  Calendar,
  Layers,
  Check,
  TrendingUp,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchNextLoanEligibilityApi } from '../../../services/customerLoanService';

/**
 * NextLoanEligibility Page (/member-dashboard/loans/next-eligibility)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Implements Section 7 requirements:
 * 1. Customer first takes ₹10,000 loan and completes repayment.
 * 2. After complete repayment verified by backend:
 *    - Unlocks eligibility for next loan level.
 *    - Displays message that customer is eligible to apply for next loan, subject to verification.
 *    - Shows next eligible amount ONLY when configured by Super Admin.
 *    - Does NOT automatically approve next loan.
 * 3. Shows 3-Tier credit progression ladder.
 */
export function NextLoanEligibility() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibilityData, setEligibilityData] = useState({
    isUnlocked: false,
    currentStage: 'First Member Loan (₹10,000)',
    message: '',
    nextLoanAmount: null,
    nextLoanAmountNotice: '',
    canApplyNext: false,
  });

  const initialEligibilityState = {
    isUnlocked: false,
    currentStage: 'First Member Loan (₹10,000)',
    message: '',
    nextLoanAmount: null,
    nextLoanAmountNotice: '',
    canApplyNext: false,
  };

  const loadEligibility = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setEligibilityData(initialEligibilityState);
    try {
      const data = await fetchNextLoanEligibilityApi(token);
      setEligibilityData(data);
    } catch (err) {
      console.warn('Error loading next loan eligibility:', err);
      setError(err.message || 'Unable to check next loan eligibility.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
  }, [token, memberUser?._id]);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Next Credit Tier Eligibility"
        description="Statutory credit progression under Utkal Finance bylaws. Higher credit limits unlock upon complete repayment of your First Member Loan (₹10,000) verified by backend audit."
        badge="CREDIT PROGRESSION"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Next Loan Eligibility' },
        ]}
      >
        <button
          onClick={loadEligibility}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          title="Refresh Eligibility"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Eligibility</span>
        </button>
      </MemberPageHeader>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Checking backend loan repayment audit...
          </p>
        </div>
      ) : eligibilityData.isUnlocked ? (
        /* UNLOCKED HERO BANNER */
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-emerald-800/60 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" />
                TIER 2 ELIGIBILITY UNLOCKED
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-400/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                FIRST LOAN FULLY REPAID
              </span>
            </div>

            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Qualified to Apply for Next Credit Level
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                {eligibilityData.message ||
                  'Your First Member Loan of ₹10,000 has been verified as 100% repaid and settled in full. You are now eligible to apply for an elevated credit facility, subject to routine district verification and Super Admin sanction.'}
              </p>
            </div>

            {/* Next Amount Box & Action Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Next Eligible Credit Limit
                </span>
                <div className="text-2xl font-black text-white">
                  {eligibilityData.nextLoanAmount
                    ? `₹${Number(eligibilityData.nextLoanAmount).toLocaleString('en-IN')}`
                    : 'Custom Limit Configured by Super Admin'}
                </div>
                <p className="text-[11px] text-emerald-100 leading-snug">
                  {eligibilityData.nextLoanAmountNotice ||
                    'Application requires branch underwriting and Super Admin approval. Not automatically approved.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/member-dashboard/loans/apply')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Apply for Next Loan
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* LOCKED STATE HERO BANNER */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  CURRENT STAGE: TIER 1
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                First Member Loan (₹10,000) Active or Awaiting Completion
              </h2>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Under Utkal Finance statutory credit policy, higher credit facilities are unlocked sequentially. Members must first take and completely repay the ₹10,000 First Member Loan.
              </p>
            </div>

            <button
              onClick={() => navigate('/member-dashboard/loans/overview')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors self-start sm:self-auto shrink-0"
            >
              Loan Overview &rarr;
            </button>
          </div>

          {/* Underwriting Notice Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-amber-900 text-xs">
                Sequential Underwriting Requirement
              </h4>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Higher credit limits are not automatically granted. Once all installments of your first loan are settled and verified via backend audit, this portal will automatically unlock Tier 2 eligibility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3-TIER CREDIT PROGRESSION LADDER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Utkal Finance Statutory Credit Progression Ladder
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear, transparent progression rules based on verified repayment discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: First Member Loan */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  STAGE 1 • ACTIVE / INITIAL
                </span>
                <span className="text-xs font-bold text-slate-400">Step 01</span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  First Member Loan
                </h4>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  ₹10,000
                </div>
                <span className="text-[10px] text-slate-500 block">
                  3, 6, or 9 Months Tenure Options
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Initial credit limit available to all admitted members holding 10 verified equity shares. Fixed amount by client policy.
              </p>
            </div>

            <div className="pt-3 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-900 font-bold">
              <span>Requirement:</span>
              <span>10 Shares Allotted</span>
            </div>
          </div>

          {/* Step 2: Advanced Member Loan */}
          <div className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
            eligibilityData.isUnlocked
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-slate-200 bg-slate-50/50 opacity-80'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  eligibilityData.isUnlocked
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-slate-500 bg-slate-200'
                }`}>
                  STAGE 2 • {eligibilityData.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
                <span className="text-xs font-bold text-slate-400">Step 02</span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  Advanced Member Facility
                </h4>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹20,000 – ₹25,000*
                </div>
                <span className="text-[10px] text-slate-500 block">
                  *Configured by Super Admin
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Requires 100% verified settlement of First Member Loan and satisfactory repayment history. Not automatically approved.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>Requirement:</span>
              <span>First Loan 100% Repaid</span>
            </div>
          </div>

          {/* Step 3: Preferred Member Credit */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 opacity-70 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
                  STAGE 3 • LOCKED
                </span>
                <span className="text-xs font-bold text-slate-400">Step 03</span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  Preferred Member Facility
                </h4>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  Higher Limits
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Subject to Board Sanction
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Extended credit limits for members with long-term spotless repayment discipline and active Nidhi shareholding.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>Requirement:</span>
              <span>Multi-Cycle Settlement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NextLoanEligibility;