import React from 'react';
import { ShieldCheck, UserCheck, UserX, MapPin } from 'lucide-react';

export function DistrictAdminSummaryCards({ summary, loading }) {
  const cards = [
    {
      title: 'TOTAL DISTRICT ADMINS',
      value: summary?.totalDistrictAdmins ?? 0,
      icon: ShieldCheck,
      subtext: 'Registered Nodal Officers',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'ACTIVE ADMINISTRATORS',
      value: summary?.activeDistrictAdmins ?? 0,
      icon: UserCheck,
      subtext: 'Operational Partner Accounts',
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'INACTIVE ACCOUNTS',
      value: summary?.inactiveDistrictAdmins ?? 0,
      icon: UserX,
      subtext: 'Suspended or Pending Access',
      iconColor: summary?.inactiveDistrictAdmins > 0 ? 'text-amber-600' : 'text-slate-400',
      bgColor: summary?.inactiveDistrictAdmins > 0 ? 'bg-amber-50/80' : 'bg-slate-50/80',
      borderColor: summary?.inactiveDistrictAdmins > 0 ? 'border-amber-100' : 'border-slate-200/80',
      badgeBg: summary?.inactiveDistrictAdmins > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700',
    },
    {
      title: 'ASSIGNED DISTRICTS',
      value: summary?.assignedDistricts ?? 0,
      icon: MapPin,
      subtext: 'Circles Covered',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all text-left space-y-3 select-none hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bgColor} ${card.borderColor}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md" />
                ) : (
                  card.value
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {card.subtext}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                  Live
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
