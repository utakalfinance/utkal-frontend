import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { HighlightStats } from '../components/home/HighlightStats';
import { NoticeTicker } from '../components/home/NoticeTicker';
import { BankingProducts } from '../components/home/BankingProducts';
import { EmiCalculator } from '../components/EmiCalculator';
import { ManagingDirector } from '../components/home/ManagingDirector';
import { FinancialInsights } from '../components/home/FinancialInsights';
import { ContactSection } from '../components/home/ContactSection';

export function Home() {
  const { openApplyModal } = useOutletContext();

  return (
    <div className="space-y-16 pb-16">
      <HeroCarousel />
      <HighlightStats />
      <NoticeTicker />
      <BankingProducts onApplyNow={openApplyModal} />

      {/* Interactive Financial Tools Section */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider mb-3 shadow-xs">
            INTERACTIVE FINANCIAL TOOLS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Count your path to <span className="text-blue-600">success!</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal">
            Plan with accurate bank-grade formulas. Calculate exact monthly EMIs or forecast deposit growth.
          </p>
        </div>
        <EmiCalculator onApplyNow={(loanData) => openApplyModal(loanData)} />
      </section>

      <ManagingDirector onApplyNow={openApplyModal} />
      <FinancialInsights />
      <ContactSection />
    </div>
  );
}
