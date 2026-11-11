import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
  LogIn,
  CreditCard,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react';

export function Loans() {
  const context = useOutletContext();
  const openApplyModal = context?.openApplyModal || (() => {});

  // The 6 steps of the first loan journey
  const journeySteps = [
    {
      step: '01',
      title: 'Complete Membership Registration',
      description: 'Submit your membership registration online with the required personal and contact details.',
      icon: UserPlus,
      highlight: 'Step 1',
    },
    {
      step: '02',
      title: 'Get Membership Approval from Admin',
      description: 'The administration reviews and verifies your submitted application to approve your official membership.',
      icon: ShieldCheck,
      highlight: 'Step 2',
    },
    {
      step: '03',
      title: 'Log In to Member Dashboard',
      description: 'Sign in securely to your dedicated Member Dashboard using your approved member credentials.',
      icon: LogIn,
      highlight: 'Step 3',
    },
    {
      step: '04',
      title: 'Apply for the First Loan of ₹10,000',
      description: 'As an approved member, apply for your starter loan of ₹10,000 directly from your dashboard.',
      icon: CreditCard,
      highlight: 'Step 4',
    },
    {
      step: '05',
      title: 'Repay Within Two Months',
      description: 'Repay the loan with the applicable 5% interest within the two-month repayment period.',
      icon: Clock,
      highlight: 'Step 5',
    },
    {
      step: '06',
      title: 'Eligible for the Next Loan',
      description: 'After successful full repayment, build trusted credit history and become eligible to apply for your next loan.',
      icon: TrendingUp,
      highlight: 'Step 6',
    },
  ];

  return (
    <div className="font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION WITH 4 INFORMATION CARDS */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-blue-50/30 border-b border-slate-200/80 py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Subtle decorative ambient lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl relative z-10">
          {/* Top Category Badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Utkal Finance • Loan Services</span>
          </span>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Start Your Loan Journey with Utkal Finance
          </h1>

          {/* Subtitle Description */}
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Eligible approved members can start with a first loan of ₹10,000. Build your credit trust with Utkal Finance through timely repayment and unlock higher loan eligibility for future financial requirements.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-12">
            <a
              href="#first-loan-journey"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 font-bold text-sm border border-slate-200/90 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Loans</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={() => openApplyModal()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Loan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Updated Information Cards (First-Loan Policy) */}
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-left">
            {/* Card 1: First Loan Amount */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                First Loan Amount
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-2 block">
                ₹10,000
              </span>
            </div>

            {/* Card 2: Interest Rate */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Interest Rate
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-2 block">
                5%
              </span>
            </div>

            {/* Card 3: Repayment Period */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Repayment Period
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-2 block">
                Within 2 Months
              </span>
            </div>

            {/* Card 4: Next Loan Eligibility */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Next Loan Eligibility
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 block leading-snug">
                After successful repayment of the first loan.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "YOUR FIRST LOAN JOURNEY" SECTION */}
      <section id="first-loan-journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Process Roadmap</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Your First Loan Journey
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Follow this clear 6-step roadmap from membership enrollment to starter loan disbursement and unlocking subsequent loans.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {journeySteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-black tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase">
                      {item.highlight}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 text-blue-700 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Step {idx + 1} of 6</span>
                  <span className="text-blue-600">Utkal Finance Policy</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Callout Card */}
        <div className="mt-12 sm:mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Important Membership &amp; Loan Notice
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1 max-w-2xl">
                A public visitor submitting this website's form creates a <strong>loan enquiry only</strong> for loan officer assistance. As per official policy, actual loan applications can only be submitted by approved members from within the secure Member Dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => openApplyModal()}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply for Loan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <span>Become a Member</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Loans;
