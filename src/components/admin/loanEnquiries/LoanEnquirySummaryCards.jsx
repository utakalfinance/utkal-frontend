import React from 'react';
import {
  Inbox,
  Sparkles,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export function LoanEnquirySummaryCards({ summary = {}, activeStatus = 'All', onSelectStatus }) {
  const cards = [
    {
      id: 'All',
      label: 'Total Enquiries',
      value: summary.total ?? 0,
      icon: Inbox,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      activeRing: 'ring-2 ring-blue-500 border-blue-500',
      subtext: 'All visitor submissions',
    },
    {
      id: 'New',
      label: 'New Enquiries',
      value: summary.new ?? 0,
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      activeRing: 'ring-2 ring-amber-500 border-amber-500',
      subtext: 'Awaiting first admin contact',
      highlight: (summary.new ?? 0) > 0,
    },
    {
      id: 'Contacted',
      label: 'Contacted',
      value: summary.contacted ?? 0,
      icon: PhoneCall,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      activeRing: 'ring-2 ring-purple-500 border-purple-500',
      subtext: 'Advisor has reached out',
    },
    {
      id: 'Converted',
      label: 'Converted',
      value: summary.converted ?? 0,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500',
      subtext: 'Enrolled for membership',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatus && onSelectStatus(card.id)}
            className={`bg-white rounded-2xl p-5 border shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
              isActive
                ? `${card.activeRing} shadow-sm bg-slate-50/50`
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.highlight && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  Action Required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default LoanEnquirySummaryCards;
