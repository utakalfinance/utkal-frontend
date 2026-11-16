import React from 'react';
import {
  Users,
  UserCheck,
  FileCheck,
  CreditCard,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export function InvestorStats({ stats = {}, activeFilter = 'all', onFilterChange }) {
  const {
    totalInvestors = 0,
    activeInvestors = 0,
    verifiedInvestors = stats.verifiedInvestors ?? activeInvestors,
    pendingKyc = 0,
    pendingPayment = stats.pendingPayment ?? 0,
    totalInvestmentReceived = stats.totalInvestmentReceived ?? (stats.totalInvestmentCollection || 0),
    outstandingLiabilities = stats.outstandingBalance ?? (stats.outstandingLiabilities || 0),
  } = stats;

  const cards = [
    {
      id: 'total',
      label: 'TOTAL INVESTORS',
      value: totalInvestors,
      icon: Users,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      filterKey: 'all',
      hoverBorder: 'hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/20 shadow-md -translate-y-0.5',
    },
    {
      id: 'verified',
      label: 'VERIFIED INVESTORS',
      value: verifiedInvestors,
      icon: UserCheck,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      filterKey: 'kyc_verified',
      hoverBorder: 'hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/20 shadow-md -translate-y-0.5',
    },
    {
      id: 'pending_kyc',
      label: 'PENDING KYC',
      value: pendingKyc,
      icon: FileCheck,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100',
      filterKey: 'kyc_pending',
      hoverBorder: 'hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/20 shadow-md -translate-y-0.5',
    },
    {
      id: 'pending_payment',
      label: 'PENDING PAYMENT VERIFICATION',
      value: pendingPayment,
      icon: CreditCard,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-100',
      filterKey: 'payment_pending',
      hoverBorder: 'hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-purple-600 ring-2 ring-purple-500/30 bg-purple-50/20 shadow-md -translate-y-0.5',
    },
    {
      id: 'total_investment',
      label: 'TOTAL VERIFIED INVESTMENT RECEIVED',
      value: `₹${Number(totalInvestmentReceived || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      filterKey: 'payment_verified',
      hoverBorder: 'hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20 shadow-md -translate-y-0.5',
    },
    {
      id: 'liabilities',
      label: 'OUTSTANDING CONTRACTUAL LIABILITIES',
      value: `₹${Number(outstandingLiabilities || 0).toLocaleString('en-IN')}`,
      icon: ShieldAlert,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50/80',
      borderColor: 'border-rose-100',
      filterKey: 'active_plans',
      hoverBorder: 'hover:border-rose-500 hover:shadow-md hover:-translate-y-0.5',
      activeClasses: 'border-rose-600 ring-2 ring-rose-500/30 bg-rose-50/20 shadow-md -translate-y-0.5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.filterKey;

        return (
          <div
            key={card.id}
            onClick={() => onFilterChange && onFilterChange(card.filterKey)}
            className={`p-4 rounded-2xl bg-white border shadow-xs transition-all duration-200 relative flex flex-col justify-between cursor-pointer group active:scale-[0.98] ${
              isActive
                ? card.activeClasses
                : `border-slate-200/90 ${card.hoverBorder}`
            }`}
            title={`Click to filter by ${card.label}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors leading-tight">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ml-2`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default InvestorStats;
