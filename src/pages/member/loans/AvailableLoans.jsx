import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  Percent,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Info,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Clock,
  BadgeAlert,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchAvailableLoansApi } from '../../../services/memberLoanService';

/**
 * AvailableLoans Page (/member-dashboard/loans/available)
 * Displays verified loan schemes available to authenticated members, highlighting Tier 1 (₹10,000 @ 5%).
 */
export function AvailableLoans() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, application, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [applyModalLoan, setApplyModalLoan] = useState(null);

  const loadLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAvailableLoansApi(token);
      setLoans(data);
    } catch (err) {
      console.warn('Backend available-loans fetch failed, using fallback schemes:', err.message);
      setLoans([
        {
          id: 'member-loan-tier-1',
          title: 'First Member Term Loan',
          badge: 'FIRST LOAN OFFER',
          tier: 'Tier 1 (First Member Loan)',
          amount: 10000,
          formattedAmount: '₹10,000',
          interestRate: '11% / 12% (CIBIL-Linked)*',
          interestRateValue: 11,
          repaymentPeriod: '3, 6, or 9 Months',
          tenureMonths: 3,
          status: 'available',
          isLocked: false,
          category: 'Statutory Member Privilege',
          description:
            'Exclusive introductory loan facility of ₹10,000 designed for approved statutory members of New Utkal Finance Ltd.',
          eligibilityConditions: [
            'Approved statutory membership of New Utkal Finance Ltd.',
            'Active membership status with verified share capital contribution',
            'Completed KYC verification (Aadhaar Card, PAN Card, Photo and Signature on record)',
            'No delinquent or outstanding prior dues',
          ],
          repaymentGuidelines: [
            'Client interest policy: 11% (>600 CIBIL) / 12% (<=600 CIBIL)*',
            'Repayment timeline: Select 3 Months, 6 Months, or 9 Months tenure',
            'Approval & Disbursement: Loan evaluation, approval, and funds disbursement operate as separate formal stages',
            'Progression rule: The next loan tier is unlocked only after this first loan is fully repaid and verified',
          ],
        },
        {
          id: 'member-loan-tier-2',
          title: 'Tier 2 Member Expansion Loan',
          badge: 'LOCKED TIER',
          tier: 'Tier 2',
          amount: 25000,
          formattedAmount: '₹25,000',
          interestRate: '5%',
          interestRateValue: 5,
          repaymentPeriod: 'Within 3 - 6 Months',
          tenureMonths: 6,
          status: 'locked',
          isLocked: true,
          category: 'Statutory Member Privilege',
          description: 'Higher credit tier unlocked exclusively for members with flawless repayment records.',
          lockReason:
            'Unlocked only after your first loan of ₹10,000 has been fully repaid and verified within the required 2-month period.',
          eligibilityConditions: [
            '100% timely repayment of First Member Loan (₹10,000) within 2 months',
            'Ledger and audit reconciliation completed by branch administrator',
          ],
        },
        {
          id: 'member-loan-tier-3',
          title: 'Tier 3 Business & Personal Growth Loan',
          badge: 'LOCKED TIER',
          tier: 'Tier 3',
          amount: 50000,
          formattedAmount: '₹50,000',
          interestRate: '5%',
          interestRateValue: 5,
          repaymentPeriod: 'Within 6 - 12 Months',
          tenureMonths: 12,
          status: 'locked',
          isLocked: true,
          category: 'Statutory Member Privilege',
          description: 'Advanced credit tier for long-standing cooperative members.',
          lockReason:
            'Unlocked only upon successful completion and verification of Tier 1 and Tier 2 loans.',
          eligibilityConditions: [
            'Completion of Tier 1 & Tier 2 repayment cycles',
            'Minimum 6 months active cooperative membership',
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [token, memberUser?._id]);

  const memberId =
    memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';
  const memberName =
    memberUser?.name || memberDetails?.name || application?.applicantName || 'Valued Member';

  if (loading) {
    return (
      <div className="space-y-6">
        <MemberPageHeader
          title="Available Loans"
          description="Explore statutory credit schemes available to approved members."
          badge="LOAN CATALOG"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200/80 p-6" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <MemberPageHeader
          title="Available Loans"
          description="Explore statutory credit schemes available to approved members."
          badge="LOAN CATALOG"
        />
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">Failed to load available loans</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={loadLoans}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const firstLoan = loans.find((l) => !l.isLocked) || loans[0];
  const lockedLoans = loans.filter((l) => l.isLocked);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Available Loans"
        description="Statutory credit facilities authorized for registered members of New Utkal Finance Ltd. Review terms, tenure, and eligibility criteria."
        badge="LOAN CATALOG"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Available Loans' },
        ]}
      >
        <button
          type="button"
          onClick={() => navigate('/member-dashboard/loans/overview')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rotate-180 text-slate-500" />
          <span>Back to Loan Overview</span>
        </button>
      </MemberPageHeader>

      {/* ELIGIBILITY STATUS BANNER */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">
                Membership Verified: {memberId}
              </span>
              <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active Member
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              You are officially recognized as an approved statutory member eligible to apply for Tier 1 credit.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Eligible Starting Amount
          </span>
          <span className="text-lg font-black text-blue-700 block">
            {firstLoan?.formattedAmount || '₹10,000'}
          </span>
        </div>
      </div>

      {/* FEATURED: FIRST MEMBER LOAN CARD (STEP 3 CORE SPECIFICATION) */}
      {firstLoan && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Featured Initial Loan (Tier 1)
              </h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Available to Apply
            </span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-blue-600/30 shadow-md p-6 sm:p-8 relative overflow-hidden">
            {/* Top right gradient accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{firstLoan.tier}</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {firstLoan.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {firstLoan.description}
                  </p>
                </div>

                {/* Core Parameters Table / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <Coins className="w-4 h-4 text-blue-700" />
                      <span>Loan Amount</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {firstLoan.formattedAmount}
                    </div>
                    <span className="text-[10px] text-slate-400">Fixed statutory principal</span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span>Interest Rate</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                      {firstLoan.interestRate}
                    </div>
                    <span className="text-[10px] text-slate-400">Fixed statutory charge</span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Repayment Period</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      {firstLoan.repaymentPeriod}
                    </div>
                    <span className="text-[10px] text-slate-400">Within 2 calendar months</span>
                  </div>
                </div>

                {/* Application Eligibility Condition Section (Clearly stated as required by Step 3) */}
                <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200/70 space-y-2">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">
                    Application Eligibility Conditions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-900">
                    {firstLoan.eligibilityConditions?.map((cond, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="lg:w-64 shrink-0 flex flex-col justify-center space-y-3 pt-2 lg:pt-8">
                <button
                  type="button"
                  onClick={() => setApplyModalLoan(firstLoan)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all shadow-md shadow-blue-700/25 cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLoan(firstLoan)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>View Details</span>
                </button>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 leading-tight text-center">
                  Funds disbursement is executed following statutory loan committee signoff.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSEQUENT LOCKED TIERS SECTION (CLEAR ROADMAP & COOPERATIVE RULES) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Higher Loan Tiers (Progression Locked)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Unlocks sequentially
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white/80 rounded-2xl p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between opacity-90 hover:opacity-100 transition-opacity"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {loan.tier}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {loan.title}
                  </h3>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {loan.formattedAmount}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {loan.description}
                </p>

                {/* Unlock Requirement Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="text-slate-800 font-bold">Unlock Condition: </strong>
                    {loan.lockReason}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Tenure: {loan.repaymentPeriod}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLoan(loan)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span>View Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATUTORY RULES & PROCEDURAL NOTICES */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
          <BadgeAlert className="w-4 h-4 text-blue-700" />
          <span>Statutory Cooperative Member Lending Guidelines:</span>
        </div>

        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed pl-1">
          <li>
            <strong>First Loan Limit:</strong> All approved members commence at Tier 1 with an introductory loan amount of exactly <strong>₹10,000</strong> at a statutory <strong>5% interest rate</strong>.
          </li>
          <li>
            <strong>Mandatory Repayment Timeline:</strong> Full repayment must be accomplished strictly <strong>within two (2) calendar months</strong> from the date of loan disbursement.
          </li>
          <li>
            <strong>Sequential Unlock Rule:</strong> The next loan application is unlocked only after the first loan has been 100% repaid and all ledger entries have been verified within the required period.
          </li>
          <li>
            <strong>Procedural Separation:</strong> Application filing, loan approval, and funds disbursement operate as independent stages. Submitting an application does not confer automatic approval.
          </li>
        </ul>
      </div>

      {/* DETAIL MODAL (WHEN VIEW DETAILS IS CLICKED) */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-700" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedLoan.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Highlight card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Amount</span>
                  <span className="text-lg font-black text-slate-900 block mt-0.5">{selectedLoan.formattedAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Interest</span>
                  <span className="text-lg font-black text-emerald-600 block mt-0.5">{selectedLoan.interestRate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Tenure</span>
                  <span className="text-sm font-black text-slate-900 block mt-1">{selectedLoan.repaymentPeriod}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wide">
                  Eligibility Criteria:
                </h4>
                <div className="space-y-1.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/70">
                  {selectedLoan.eligibilityConditions?.map((cond, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedLoan.repaymentGuidelines && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wide">
                    Repayment & Regulatory Terms:
                  </h4>
                  <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {selectedLoan.repaymentGuidelines.map((guide, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-600 leading-snug">
                        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{guide}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLoan.isLocked && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Progression Locked: </strong>
                    {selectedLoan.lockReason}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              {!selectedLoan.isLocked && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLoan(null);
                    setApplyModalLoan(selectedLoan);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
                >
                  Apply for this Loan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPLY NOW MODAL (STEP 3 & 4 INFORMATIVE ONBOARDING) */}
      {applyModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Apply for First Member Loan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {applyModalLoan.formattedAmount} • {applyModalLoan.interestRate} • {applyModalLoan.repaymentPeriod}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalLoan(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Applicant Member</span>
                  <span className="font-black text-slate-900 capitalize">{memberName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Member ID</span>
                  <span className="font-mono font-bold text-blue-700">{memberId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Requested Principal</span>
                  <span className="font-black text-slate-900">{applyModalLoan.formattedAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Interest Rate</span>
                  <span className="font-black text-emerald-600">{applyModalLoan.interestRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Repayment Term</span>
                  <span className="font-black text-slate-900">{applyModalLoan.repaymentPeriod}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Statutory Notice:</strong> Online loan documentation submission is being prepared for immediate launch. In the meantime, you can review the loan requirements and our loan officer will coordinate your documentation review at the branch.
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setApplyModalLoan(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplyModalLoan(null);
                  navigate('/member-dashboard/loans/apply');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
              >
                <span>Proceed to Application Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableLoans;
